import type {
  DensityInput,
  DsImage,
  GeneratedSrcset,
  ImageAttrs,
  ImageConfig,
  ImageDecoding,
  ImageFetchPriority,
  ImageFormat,
  ImageInfo,
  ImageInput,
  ImageLoading,
  ImageModifiers,
  ImageOptions,
  ImagePlaceholder,
  ImagePreload,
  ImagePreloadLink,
  ImageProvider,
  ImageProviderContext,
  ImageProviderDefinition,
  ImageProviderInput,
  ImageProviderResult,
  ImagePreset,
  ImageSizes,
  PictureAttrs,
  PictureSource,
  ResolvedImageConfig,
  SizesInput
} from './types.js';
import { resolveImageConfig } from './config.js';
import { isResolvedImageConfig, stripUndefined } from './kit.js';
import { generateDensities, generateSizes, parseDensities } from './sizes.js';
import { normalizeImageSource, resolveAlias, validateSource } from './source.js';
import { checkDensities, clampQuality, isDataSource, isRemoteSource, mimeForFormat, toNumber } from './utils.js';

interface ResolvedInput {
  src: string;
  originalSrc: string;
  alt?: string;
  width?: number;
  height?: number;
  sizes?: SizesInput;
  quality?: number;
  format?: ImageFormat | readonly ImageFormat[];
  formats?: readonly ImageFormat[];
  provider: string;
  modifiers: ImageModifiers;
  densities?: DensityInput;
  loading?: ImageLoading;
  decoding?: ImageDecoding;
  fetchpriority?: ImageFetchPriority;
  priority?: boolean;
  preload?: ImagePreload;
  placeholder?: ImagePlaceholder;
  placeholderClass?: string;
}

const standardModifierKeys = new Set([
  'width',
  'w',
  'height',
  'h',
  'quality',
  'q',
  'format',
  'f',
  'fit',
  'position',
  'pos',
  'background',
  'b'
]);
const providerImages = new WeakMap<ResolvedImageConfig, DsImage>();

export function resolvePreset(
  name: string | undefined,
  config: ImageConfig | ResolvedImageConfig = {}
): ImagePreset | undefined {
  if (!name) {
    return undefined;
  }

  const resolved = ensureConfig(config);
  const preset = resolved.presets[name];
  if (!preset) {
    throw new Error(`Unknown image preset "${name}". Register it in image config presets.`);
  }

  return preset;
}

export function getImage(input: ImageInput, config: ImageConfig | ResolvedImageConfig = {}): ImageProviderResult {
  const resolvedConfig = ensureConfig(config);
  return invokeProvider(resolveInput(input, resolvedConfig), resolvedConfig);
}

export function generateSrcset(input: ImageInput, config: ImageConfig | ResolvedImageConfig = {}): GeneratedSrcset {
  const resolvedConfig = ensureConfig(config);
  return generateSrcsetResolved(resolveInput(input, resolvedConfig), resolvedConfig);
}

export function getImageSizes(input: ImageInput, config: ImageConfig | ResolvedImageConfig = {}): ImageSizes {
  const resolvedConfig = ensureConfig(config);
  const resolved = resolveInput(input, resolvedConfig);
  const generated = generateSrcsetResolved(resolved, resolvedConfig);
  const widthForSrc = generated.descriptor === 'w' ? generated.widths.at(-1) : resolved.width;
  const heightForSrc = scaledHeight(resolved.width, resolved.height, widthForSrc);
  const result = invokeProvider(
    { ...resolved, width: widthForSrc, height: heightForSrc, sizes: undefined },
    resolvedConfig
  );

  return stripUndefined({
    srcset: generated.srcset ?? '',
    sizes: generated.sizes,
    src: result.url,
    widths: generated.widths
  });
}

export function generatePictureSources(
  input: ImageInput,
  config: ImageConfig | ResolvedImageConfig = {}
): PictureSource[] {
  const resolvedConfig = ensureConfig(config);
  const resolved = resolveInput(input, resolvedConfig);

  if (originalFormat(input.src) === 'svg') {
    return [];
  }

  return pictureFormats(input, resolved, resolvedConfig).map((format) => {
    const formatted = { ...resolved, format };
    const generated = generateSrcsetResolved(formatted, resolvedConfig);
    const fallbackUrl = generated.srcset ?? invokeProvider(formatted, resolvedConfig).url;
    return {
      type: mimeForFormat(format),
      srcset: fallbackUrl,
      sizes: generated.sizes
    };
  });
}

export function getImageAttrs(input: ImageInput, config: ImageConfig | ResolvedImageConfig = {}): ImageAttrs {
  const resolvedConfig = ensureConfig(config);
  return getImageAttrsResolved(resolveInput(input, resolvedConfig), resolvedConfig);
}

export function getPictureAttrs(input: ImageInput, config: ImageConfig | ResolvedImageConfig = {}): PictureAttrs {
  const resolvedConfig = ensureConfig(config);
  const resolved = resolveInput(input, resolvedConfig);

  if (originalFormat(input.src) === 'svg') {
    return {
      sources: [],
      img: stripUndefined({
        src: normalizeImageSource(input.src),
        width: resolved.width,
        height: resolved.height,
        alt: resolved.alt,
        loading: resolved.priority ? 'eager' : resolved.loading,
        decoding: resolved.decoding,
        fetchpriority: resolved.priority ? 'high' : resolved.fetchpriority,
        isOptimized: false
      })
    };
  }

  const fallbackFormat = input.fallbackFormat ?? input.legacyFormat ?? defaultLegacyFormat(input.src);
  return {
    sources: generatePictureSources(input, resolvedConfig),
    img: getImageAttrsResolved({ ...resolved, format: fallbackFormat, formats: undefined }, resolvedConfig)
  };
}

export function getImagePreloadLink(
  input: ImageInput,
  config: ImageConfig | ResolvedImageConfig = {}
): ImagePreloadLink {
  const resolvedConfig = ensureConfig(config);
  const resolved = resolveInput(input, resolvedConfig);
  const attrs = getImageAttrsResolved(resolved, resolvedConfig);
  return stripUndefined({
    rel: 'preload' as const,
    as: 'image' as const,
    href: attrs.src,
    imagesrcset: attrs.srcset,
    imagesizes: attrs.sizes,
    fetchpriority: preloadFetchPriority(resolved.preload) ?? attrs.fetchpriority
  });
}

export async function getImageMeta(
  input: ImageInput,
  config: ImageConfig | ResolvedImageConfig = {}
): Promise<ImageInfo> {
  const resolvedConfig = ensureConfig(config);
  const result = invokeProvider(resolveInput(input, resolvedConfig), resolvedConfig);
  if (result.getMeta) {
    return result.getMeta();
  }

  const ImageConstructor = (
    globalThis as typeof globalThis & {
      Image?: new () => HTMLImageElement;
    }
  ).Image;
  if (!ImageConstructor) {
    throw new Error(
      `Image metadata is not available for "${result.url}". The provider did not expose getMeta() and no browser Image API exists.`
    );
  }

  return new Promise<ImageInfo>((resolve, reject) => {
    const image = new ImageConstructor();
    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      resolve({ width, height, ratio: height ? width / height : undefined });
    };
    image.onerror = () => reject(new Error(`Unable to load image metadata for "${result.url}".`));
    image.src = result.url;
  });
}

function getImageAttrsResolved(input: ResolvedInput, config: ResolvedImageConfig): ImageAttrs {
  const generated = generateSrcsetResolved(input, config);
  const widthForSrc = generated.descriptor === 'w' ? generated.widths.at(-1) : input.width;
  const heightForSrc = scaledHeight(input.width, input.height, widthForSrc);
  const result = invokeProvider({ ...input, width: widthForSrc, height: heightForSrc, sizes: undefined }, config);
  const placeholderSrc = resolvePlaceholder(input, config);

  return stripUndefined({
    src: result.url,
    srcset: generated.srcset,
    sizes: generated.sizes,
    fallbackSrc: result.url !== input.originalSrc ? normalizeImageSource(input.originalSrc) : undefined,
    width: input.width,
    height: input.height,
    alt: input.alt,
    loading: input.priority ? 'eager' : input.loading,
    decoding: input.decoding,
    fetchpriority: input.priority ? 'high' : input.fetchpriority,
    placeholderSrc,
    placeholderClass: placeholderSrc ? (input.placeholderClass ?? 'ds-image-placeholder') : undefined,
    isOptimized: result.isOptimized
  });
}

function generateSrcsetResolved(input: ResolvedInput, config: ResolvedImageConfig): GeneratedSrcset {
  if (!input.src || isDataSource(input.src)) {
    return { widths: [], descriptor: 'x' };
  }

  const densities = parseDensities(input.densities, config.densities);
  checkDensities(densities);

  if (input.sizes) {
    const generated = generateSizes({
      width: input.width,
      sizes: input.sizes,
      screens: config.screens,
      providerSizes: config.providerSizes,
      densities
    });
    const entries = dedupeCandidates(
      generated.widths.map((requestedWidth) => {
        const width = requestedWidth;
        const height = scaledHeight(input.width, input.height, width);
        return {
          url: invokeProvider({ ...input, width, height, sizes: undefined }, config).url,
          descriptor: width,
          width
        };
      })
    );

    return {
      srcset: entries.length ? entries.map((entry) => `${entry.url} ${entry.descriptor}w`).join(', ') : undefined,
      sizes: generated.sizes,
      widths: entries.map((entry) => entry.width),
      descriptor: 'w'
    };
  }

  if (input.width) {
    const generated = generateDensities({
      width: input.width,
      height: input.height,
      densities,
      fallback: config.densities
    });
    const entries = dedupeCandidates(
      generated.map((entry) => {
        const width = entry.width;
        const height = scaledHeight(input.width, input.height, width);
        return {
          url: invokeProvider({ ...input, width, height, sizes: undefined }, config).url,
          descriptor: entry.density,
          width
        };
      })
    );

    return {
      srcset: entries.length ? entries.map((entry) => `${entry.url} ${entry.descriptor}x`).join(', ') : undefined,
      widths: entries.map((entry) => entry.width).filter((width): width is number => width !== undefined),
      descriptor: 'x'
    };
  }

  return { widths: [], descriptor: 'x' };
}

function dedupeCandidates<T extends { url: string }>(entries: T[]): T[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) {
      return false;
    }
    seen.add(entry.url);
    return true;
  });
}

function resolveInput(input: ImageInput, config: ResolvedImageConfig): ResolvedInput {
  const preset = resolvePreset(input.preset, config);
  const componentModifiers = input.modifiers;
  const presetModifiers = preset?.modifiers;
  const width =
    toNumber(input.width) ??
    modifierNumber(componentModifiers, 'width', 'w') ??
    preset?.width ??
    modifierNumber(presetModifiers, 'width', 'w');
  const height =
    toNumber(input.height) ??
    modifierNumber(componentModifiers, 'height', 'h') ??
    preset?.height ??
    modifierNumber(presetModifiers, 'height', 'h');
  const quality =
    clampQuality(input.quality) ??
    modifierQuality(componentModifiers) ??
    preset?.quality ??
    modifierQuality(presetModifiers) ??
    config.quality;
  const format =
    input.format ?? modifierFormat(componentModifiers) ?? preset?.format ?? modifierFormat(presetModifiers);
  const fit =
    input.fit ?? modifierString(componentModifiers, 'fit') ?? preset?.fit ?? modifierString(presetModifiers, 'fit');
  const position =
    input.position ??
    modifierString(componentModifiers, 'position', 'pos') ??
    preset?.position ??
    modifierString(presetModifiers, 'position', 'pos');
  const background =
    input.background ??
    modifierString(componentModifiers, 'background', 'b') ??
    preset?.background ??
    modifierString(presetModifiers, 'background', 'b');
  const modifiers = stripStandardModifiers({ ...presetModifiers, ...componentModifiers });
  if (fit !== undefined) modifiers.fit = fit;
  if (position !== undefined) modifiers.position = position;
  if (background !== undefined) modifiers.background = background;
  const provider = input.provider ?? preset?.provider ?? config.provider;

  return stripUndefined({
    src: input.src,
    originalSrc: input.src,
    alt: input.alt,
    width,
    height,
    sizes: input.sizes ?? preset?.sizes,
    quality,
    format,
    formats: input.formats,
    provider: provider === 'auto' ? config.provider : provider,
    modifiers,
    densities: input.densities ?? preset?.densities,
    loading: input.loading ?? preset?.loading,
    decoding: input.decoding ?? preset?.decoding,
    fetchpriority: input.fetchpriority ?? preset?.fetchpriority,
    priority: input.priority ?? preset?.priority,
    preload: input.preload ?? preset?.preload,
    placeholder: input.placeholder ?? preset?.placeholder,
    placeholderClass: input.placeholderClass ?? preset?.placeholderClass
  });
}

function invokeProvider(input: ResolvedInput, config: ResolvedImageConfig): ImageProviderResult {
  const { name, provider } = getProvider(input.provider, config);
  let src = normalizeImageSource(input.src, provider.acceptsOpaqueSource);
  if (!provider.supportsAlias) {
    src = resolveAlias(src, config.aliases);
    src = normalizeImageSource(src, provider.acceptsOpaqueSource);
  }

  if (!src || isDataSource(src)) {
    return { url: src, isOptimized: false };
  }

  if (provider.validateDomains && isExternalSource(src) && !validateProviderRemoteSource(src, config)) {
    return { url: src, isOptimized: false };
  }

  const validation = validateForProvider(src, config, Boolean(provider.acceptsOpaqueSource));
  if (!validation.valid) {
    if (config.onInvalidSource === 'throw') {
      throw new Error(validation.reason);
    }
    if (config.onInvalidSource === 'warn') {
      warn(validation.reason);
    }
    return { url: src, isOptimized: false };
  }

  const providerInput = toProviderInput(input, src);
  const configured = asOptions(config.providerOptions[name]);
  const defaults = asOptions(provider.defaults);
  const context = createProviderContext(config);
  const defaultModifiers = asOptions(defaults.modifiers) as ImageModifiers;
  const configuredModifiers = asOptions(configured.modifiers) as ImageModifiers;
  const standardModifiers = stripUndefined({
    width: providerInput.width,
    height: providerInput.height,
    quality: providerInput.quality,
    format: providerInput.format
  });
  const options = {
    ...defaults,
    ...configured,
    modifiers: stripUndefined({
      ...defaultModifiers,
      ...configuredModifiers,
      ...providerInput.modifiers,
      ...standardModifiers
    })
  };
  return normalizeProviderResult(
    (provider as ImageProvider<Record<string, unknown>>).getImage(src, options, context),
    src,
    providerInput.format
  );
}

function normalizeProviderResult(
  result: ImageProviderResult,
  source: string,
  format: ImageFormat | undefined
): ImageProviderResult {
  return stripUndefined({
    ...result,
    format: result.format ?? format,
    isOptimized: result.isOptimized ?? result.url !== source
  });
}

function toProviderInput(input: ResolvedInput, src: string): ImageProviderInput {
  const format = Array.isArray(input.format) ? input.format[0] : input.format;
  return stripUndefined({
    src,
    width: input.width,
    height: input.height,
    quality: input.quality,
    format,
    modifiers: input.modifiers
  });
}

function createProviderContext(config: ResolvedImageConfig): ImageProviderContext {
  let image = providerImages.get(config);
  if (!image) {
    image = createProviderImage(config);
    providerImages.set(config, image);
  }
  return { options: config, $img: image };
}

function createProviderImage(config: ResolvedImageConfig): DsImage {
  const image = ((source: string, modifiers?: ImageModifiers, options?: ImageOptions) =>
    getImage(toFunctionalInput(source, { ...options, modifiers: { ...options?.modifiers, ...modifiers } }), config)
      .url) as DsImage;
  image.options = config;
  image.getImage = (source, options = {}) => getImage(toFunctionalInput(source, options), config);
  image.getSizes = (source, options = {}) => getImageSizes(toFunctionalInput(source, options), config);
  image.getMeta = (source, options = {}) => getImageMeta(toFunctionalInput(source, options), config);
  image.getAttrs = (input) => getImageAttrs(input, config);
  image.getPicture = (input) => getPictureAttrs(input, config);
  image.getPreloadLink = (input) => getImagePreloadLink(input, config);
  for (const preset of Object.keys(config.presets)) {
    image[preset] = (source: string, modifiers?: ImageModifiers, options?: ImageOptions) =>
      image!(source, modifiers, { ...options, preset: options?.preset ?? preset });
  }
  return image;
}

function toFunctionalInput(source: string, options: ImageOptions): ImageInput {
  const modifiers = options.modifiers;
  return {
    src: source,
    provider: options.provider,
    preset: options.preset,
    densities: options.densities,
    sizes: options.sizes,
    modifiers,
    width: modifierNumber(modifiers, 'width', 'w'),
    height: modifierNumber(modifiers, 'height', 'h'),
    quality: modifierNumber(modifiers, 'quality', 'q'),
    format: modifierFormat(modifiers),
    fit: modifierString(modifiers, 'fit'),
    position: modifierString(modifiers, 'position', 'pos'),
    background: modifierString(modifiers, 'background', 'b')
  };
}

function resolvePlaceholder(input: ResolvedInput, config: ResolvedImageConfig): string | undefined {
  const placeholder = input.placeholder;
  if (!placeholder) {
    return undefined;
  }
  if (typeof placeholder === 'string') {
    return placeholder;
  }

  const [width = 10, height = width, quality = 50, blur = 3] = placeholderDimensions(placeholder);
  return invokeProvider(
    {
      ...input,
      width,
      height,
      quality,
      sizes: undefined,
      format: Array.isArray(input.format) ? input.format[0] : input.format,
      modifiers: { ...input.modifiers, blur },
      placeholder: undefined
    },
    config
  ).url;
}

function pictureFormats(input: ImageInput, resolved: ResolvedInput, config: ResolvedImageConfig): ImageFormat[] {
  const explicit = input.formats ?? splitFormats(input.format);
  const fromConfig = splitFormats(config.format);
  const fromResolved = splitFormats(resolved.format);
  const fallback = input.fallbackFormat ?? input.legacyFormat ?? defaultLegacyFormat(input.src);
  return [...new Set(explicit ?? fromResolved ?? fromConfig ?? ['webp'])].filter(
    (format) => normalizeLegacyFormat(format) !== normalizeLegacyFormat(fallback)
  );
}

function getProvider(
  name: string,
  config: ResolvedImageConfig
): { name: string; provider: ImageProviderDefinition<Record<string, unknown>> } {
  const provider = config.providers[name] as ImageProviderDefinition<Record<string, unknown>> | undefined;
  if (!provider) {
    throw new Error(`Unknown image provider "${name}". Register it in image config providers.`);
  }
  return { name, provider };
}

function ensureConfig(config: ImageConfig | ResolvedImageConfig): ResolvedImageConfig {
  return isResolvedImageConfig(config) ? config : resolveImageConfig(config);
}

function scaledHeight(
  originalWidth: number | undefined,
  originalHeight: number | undefined,
  width: number | undefined
): number | undefined {
  if (!originalWidth || !originalHeight || !width) {
    return originalHeight;
  }
  return Math.round((originalHeight / originalWidth) * width);
}

function stripStandardModifiers(modifiers: ImageModifiers): ImageModifiers {
  return Object.fromEntries(
    Object.entries(modifiers).filter(([key, value]) => !standardModifierKeys.has(key) && value !== undefined)
  );
}

function modifierQuality(modifiers: ImageModifiers | undefined): number | undefined {
  const value = modifiers?.quality ?? modifiers?.q;
  return typeof value === 'boolean' || typeof value === 'object' ? undefined : clampQuality(value);
}

function modifierFormat(modifiers: ImageModifiers | undefined): ImageFormat | undefined {
  const value = modifiers?.format ?? modifiers?.f;
  return typeof value === 'string' ? (value as ImageFormat) : undefined;
}

function modifierNumber(modifiers: ImageModifiers | undefined, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = modifiers?.[key];
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = toNumber(value);
      if (parsed !== undefined) return parsed;
    }
  }
  return undefined;
}

function modifierString(modifiers: ImageModifiers | undefined, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = modifiers?.[key];
    if (typeof value === 'string' || typeof value === 'number') return value.toString();
  }
  return undefined;
}

function preloadFetchPriority(preload: ImagePreload | undefined): ImageInput['fetchpriority'] {
  return typeof preload === 'object' ? preload.fetchPriority : undefined;
}

function splitFormats(format: ImageFormat | readonly ImageFormat[] | undefined): ImageFormat[] | undefined {
  if (!format) return undefined;
  if (typeof format !== 'string') return Array.from(format).flatMap((entry) => splitFormats(entry) ?? []);
  return format
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean) as ImageFormat[];
}

function defaultLegacyFormat(src: string): ImageFormat {
  const format = originalFormat(src);
  return !format || !['png', 'webp', 'gif', 'svg'].includes(format) ? 'jpeg' : 'png';
}

function originalFormat(src: string): string | undefined {
  return /^[^?#]+\.([a-z0-9]+)(?:$|[?#])/i.exec(src)?.[1]?.toLowerCase();
}

function placeholderDimensions(
  placeholder: Exclude<ImagePlaceholder, false | string | undefined>
): readonly [number, number?, number?, number?] {
  if (Array.isArray(placeholder)) {
    return placeholder as readonly [number, number?, number?, number?];
  }

  if (typeof placeholder === 'number') {
    return [placeholder];
  }

  return [10, 10, 50, 3];
}

function normalizeLegacyFormat(format: ImageFormat | undefined): string | undefined {
  return format === 'jpg' ? 'jpeg' : format;
}

function validateProviderRemoteSource(src: string, config: ResolvedImageConfig): boolean {
  if (!isExternalSource(src)) return true;
  if (!config.domains?.length && !config.remotePatterns?.length) return false;
  return validateSource(src.startsWith('//') ? `https:${src}` : src, config).valid;
}

function validateForProvider(src: string, config: ResolvedImageConfig, acceptsOpaqueSource: boolean) {
  if (acceptsOpaqueSource && !src.startsWith('/') && !isExternalSource(src) && !isDataSource(src)) {
    return { valid: true };
  }
  const source = src.startsWith('//') ? `https:${src}` : src;
  const validationConfig = isExternalSource(src)
    ? { ...config, domains: undefined, remotePatterns: undefined }
    : config;
  return validateSource(source, validationConfig);
}

function isExternalSource(src: string): boolean {
  return isRemoteSource(src) || src.startsWith('//');
}

function asOptions(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function warn(message: string | undefined): void {
  if (message && typeof console !== 'undefined') console.warn(`[desource/image] ${message}`);
}
