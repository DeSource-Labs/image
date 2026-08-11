import type {
  GeneratedSrcset,
  ImageAttrs,
  ImageConfig,
  ImageFormat,
  ImageInput,
  ImageModifiers,
  ImagePreloadLink,
  ImageProviderInput,
  ImageProviderResult,
  ImageProvider,
  ImagePreload,
  ImagePreset,
  SizesInput,
  PictureAttrs,
  PictureSource,
  ResolvedImageConfig
} from './types';
import { detectImageProvider, resolveImageConfig } from './config';
import { generateDensities, generateSizes, parseDensities } from './sizes';
import { resolveAlias, validateSource } from './source';
import { clampQuality, isRemoteSource, mergeModifiers, mimeForFormat, toNumber } from './utils';

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
  fallbackFormat?: ImageFormat;
  legacyFormat?: ImageFormat;
  provider: string;
  modifiers: ImageModifiers;
  densities?: ImageInput['densities'];
  loading?: ImageInput['loading'];
  decoding?: ImageInput['decoding'];
  fetchpriority?: ImageInput['fetchpriority'];
  priority?: boolean;
  preload?: ImagePreload;
  placeholder?: ImageInput['placeholder'];
  placeholderClass?: string;
}

export function resolvePreset(name: string | undefined, config: ImageConfig | ResolvedImageConfig = {}): ImagePreset | undefined {
  if (!name) {
    return undefined;
  }

  const resolved = 'providers' in config && 'providerOptions' in config
    ? config as ResolvedImageConfig
    : resolveImageConfig(config);
  const preset = resolved.presets[name];
  if (!preset) {
    throw new Error(`Unknown image preset "${name}". Register it in image config presets.`);
  }

  return preset;
}

export function getImage(input: ImageInput, config: ImageConfig | ResolvedImageConfig = {}): ImageProviderResult {
  const resolvedConfig = ensureConfig(config);
  const resolved = resolveInput(input, resolvedConfig);
  const providerName = resolveProviderName(resolved.provider);
  const { name, provider } = getProvider(providerName, resolvedConfig);
  const providerSrc = provider.supportsAlias ? resolved.src : resolveAlias(resolved.src, resolvedConfig.aliases);

  if (provider.validateDomains && !validateProviderRemoteSource(providerSrc, resolvedConfig)) {
    return { url: providerSrc, isOptimized: false };
  }

  const validation = allowsOpaqueSource(providerName, providerSrc)
    ? { valid: true }
    : validateSource(providerSrc, resolvedConfig);

  if (!validation.valid) {
    if (resolvedConfig.onInvalidSource === 'throw') {
      throw new Error(validation.reason);
    }

    if (resolvedConfig.onInvalidSource === 'warn') {
      warn(validation.reason);
    }

    return { url: providerSrc, isOptimized: false };
  }

  const providerInput = toProviderInput(resolved, resolvedConfig, name, providerSrc);
  return provider.getImage(providerInput, resolvedConfig.providerOptions[provider.name]);
}

export function generateSrcset(input: ImageInput, config: ImageConfig | ResolvedImageConfig = {}): GeneratedSrcset {
  const resolvedConfig = ensureConfig(config);
  const resolved = resolveInput(input, resolvedConfig);

  if (resolved.sizes) {
    const generated = generateSizes({
      width: resolved.width,
      sizes: resolved.sizes,
      screens: resolvedConfig.screens,
      providerSizes: resolvedConfig.providerSizes,
      densities: parseDensities(resolved.densities, resolvedConfig.densities)
    });
    const srcset = generated.widths
      .map((width) => {
        const height = scaledHeight(resolved.width, resolved.height, width);
        const url = getImage({ ...input, width, height, sizes: undefined }, resolvedConfig).url;
        return `${url} ${width}w`;
      })
      .join(', ');

    return {
      srcset: srcset || undefined,
      sizes: generated.sizes,
      widths: generated.widths,
      descriptor: 'w'
    };
  }

  if (resolved.width) {
    const densities = generateDensities({
      width: resolved.width,
      height: resolved.height,
      densities: resolved.densities,
      fallback: resolvedConfig.densities
    });
    const srcset = densities
      .map((entry) => {
        const url = getImage({ ...input, width: entry.width, height: entry.height, sizes: undefined }, resolvedConfig).url;
        return `${url} ${entry.density}x`;
      })
      .join(', ');

    return {
      srcset: srcset || undefined,
      widths: densities.map((entry) => entry.width).filter((value): value is number => value !== undefined),
      descriptor: 'x'
    };
  }

  return {
    widths: [],
    descriptor: 'x'
  };
}

export function generatePictureSources(input: ImageInput, config: ImageConfig | ResolvedImageConfig = {}): PictureSource[] {
  const resolvedConfig = ensureConfig(config);
  const resolved = resolveInput(input, resolvedConfig);

  if (originalFormat(input.src) === 'svg') {
    return [];
  }

  const formats = pictureFormats(input, resolved, resolvedConfig);

  return formats.map((format) => {
    const generated = generateSrcset({ ...input, format }, resolvedConfig);
    const fallbackUrl = generated.srcset ?? getImage({ ...input, format }, resolvedConfig).url;
    return {
      type: mimeForFormat(format),
      srcset: fallbackUrl,
      sizes: generated.sizes
    };
  });
}

export function getImageAttrs(input: ImageInput, config: ImageConfig | ResolvedImageConfig = {}): ImageAttrs {
  const resolvedConfig = ensureConfig(config);
  const resolved = resolveInput(input, resolvedConfig);
  const srcset = generateSrcset(input, resolvedConfig);
  const widthForSrc = srcset.descriptor === 'w' ? srcset.widths.at(-1) : resolved.width;
  const heightForSrc = scaledHeight(resolved.width, resolved.height, widthForSrc);
  const result = getImage({ ...input, width: widthForSrc, height: heightForSrc, sizes: undefined }, resolvedConfig);
  const priority = Boolean(resolved.priority);
  const placeholderSrc = resolvePlaceholder(resolved, resolvedConfig);

  return stripUndefined({
    src: result.url,
    srcset: srcset.srcset,
    sizes: srcset.sizes,
    fallbackSrc: result.url !== resolved.src ? resolved.src : undefined,
    width: resolved.width,
    height: resolved.height,
    alt: resolved.alt,
    loading: priority ? 'eager' : resolved.loading,
    decoding: priority ? 'sync' : (resolved.decoding ?? 'async'),
    fetchpriority: priority ? 'high' : resolved.fetchpriority,
    placeholderSrc,
    placeholderClass: placeholderSrc ? (resolved.placeholderClass ?? 'ds-image-placeholder') : undefined,
    isOptimized: result.isOptimized
  });
}

export function getPictureAttrs(input: ImageInput, config: ImageConfig | ResolvedImageConfig = {}): PictureAttrs {
  const resolvedConfig = ensureConfig(config);
  const resolved = resolveInput(input, resolvedConfig);

  if (originalFormat(input.src) === 'svg') {
    const priority = Boolean(resolved.priority);
    return {
      sources: [],
      img: stripUndefined({
        src: input.src,
        width: resolved.width,
        height: resolved.height,
        alt: resolved.alt,
        loading: priority ? 'eager' : resolved.loading,
        decoding: priority ? 'sync' : (resolved.decoding ?? 'async'),
        fetchpriority: priority ? 'high' : resolved.fetchpriority,
        isOptimized: false
      })
    };
  }

  const fallbackFormat = input.fallbackFormat ?? input.legacyFormat ?? defaultLegacyFormat(input.src);

  return {
    sources: generatePictureSources(input, resolvedConfig),
    img: getImageAttrs({ ...input, format: fallbackFormat, formats: undefined }, resolvedConfig)
  };
}

export function getImagePreloadLink(input: ImageInput, config: ImageConfig | ResolvedImageConfig = {}): ImagePreloadLink {
  const attrs = getImageAttrs({ ...input, priority: true }, config);
  return stripUndefined({
    rel: 'preload' as const,
    as: 'image' as const,
    href: attrs.src,
    imagesrcset: attrs.srcset,
    imagesizes: attrs.sizes,
    fetchpriority: attrs.fetchpriority
  });
}

function resolveInput(input: ImageInput, config: ResolvedImageConfig): ResolvedInput {
  const preset = resolvePreset(input.preset, config);
  const componentModifiers = input.modifiers;
  const modifierWidth = modifierNumber(componentModifiers, 'width', 'w');
  const modifierHeight = modifierNumber(componentModifiers, 'height', 'h');
  const modifierFormatValue = modifierFormat(componentModifiers);
  const modifiers = mergeModifiers(
    preset?.modifiers,
    componentModifiers,
    compactModifiers({
      fit: input.fit ?? preset?.fit,
      position: input.position ?? preset?.position,
      background: input.background ?? preset?.background
    })
  );
  const quality = clampQuality(input.quality)
    ?? modifierQuality(componentModifiers)
    ?? preset?.quality
    ?? modifierQuality(preset?.modifiers)
    ?? config.quality;
  const format = input.format ?? modifierFormatValue ?? preset?.format ?? modifierFormat(preset?.modifiers);
  const preload = input.preload ?? preset?.preload;

  return stripUndefined({
    src: input.src,
    originalSrc: input.src,
    alt: input.alt,
    width: toNumber(input.width) ?? modifierWidth ?? preset?.width ?? modifierNumber(preset?.modifiers, 'width', 'w'),
    height: toNumber(input.height) ?? modifierHeight ?? preset?.height ?? modifierNumber(preset?.modifiers, 'height', 'h'),
    sizes: input.sizes ?? preset?.sizes,
    quality,
    format,
    formats: input.formats,
    fallbackFormat: input.fallbackFormat,
    legacyFormat: input.legacyFormat,
    provider: input.provider ?? preset?.provider ?? config.provider,
    modifiers,
    densities: input.densities ?? preset?.densities,
    loading: input.loading ?? preset?.loading ?? 'lazy',
    decoding: input.decoding ?? preset?.decoding,
    fetchpriority: input.fetchpriority ?? preloadFetchPriority(preload) ?? preset?.fetchpriority,
    priority: input.priority ?? preset?.priority ?? Boolean(preload),
    preload,
    placeholder: input.placeholder ?? preset?.placeholder,
    placeholderClass: input.placeholderClass ?? preset?.placeholderClass
  });
}

function toProviderInput(input: ResolvedInput, config: ResolvedImageConfig, providerName: string, src = input.src): ImageProviderInput {
  const format = Array.isArray(input.format) ? input.format[0] : input.format;
  const width = widthForProvider(providerName, input.width, config);
  return stripUndefined({
    src,
    width,
    height: input.height,
    quality: input.quality,
    format,
    modifiers: input.modifiers
  });
}

function resolvePlaceholder(input: ResolvedInput, config: ResolvedImageConfig): string | undefined {
  const placeholder = input.placeholder;
  if (!placeholder) {
    return undefined;
  }

  if (typeof placeholder === 'string') {
    return placeholder;
  }

  const [width = 10, height = width, quality = 50, blur = 3] = Array.isArray(placeholder)
    ? placeholder
    : typeof placeholder === 'number'
      ? [placeholder]
      : [10, 10, 50, 3];
  return getImage({
    src: input.originalSrc,
    provider: input.provider,
    width,
    height,
    quality,
    format: Array.isArray(input.format) ? input.format[0] : input.format,
    modifiers: {
      ...input.modifiers,
      blur
    }
  }, config).url;
}

function pictureFormats(input: ImageInput, resolved: ResolvedInput, config: ResolvedImageConfig): ImageFormat[] {
  if (originalFormat(input.src) === 'svg') {
    return [];
  }

  const explicit = input.formats ?? splitFormats(input.format);
  const fromConfig = splitFormats(config.format);
  const fromResolved = splitFormats(resolved.format);
  const fallback = input.fallbackFormat ?? input.legacyFormat ?? defaultLegacyFormat(input.src);
  return [...new Set([...(explicit ?? fromResolved ?? fromConfig ?? ['webp'])])]
    .filter((format) => normalizeLegacyFormat(format) !== normalizeLegacyFormat(fallback));
}

function getProvider(name: string, config: ResolvedImageConfig): { name: string; provider: ImageProvider } {
  const providerName = resolveProviderName(name);
  const provider = config.providers[providerName];
  if (!provider) {
    throw new Error(`Unknown image provider "${providerName}". Register it in image config providers.`);
  }

  return { name: providerName, provider };
}

function resolveProviderName(name: string): string {
  return name === 'auto' ? detectImageProvider() : name;
}

function allowsOpaqueSource(providerName: string, src: string): boolean {
  if (src.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(src)) {
    return false;
  }

  return ['cloudflareimages', 'github', 'hygraph', 'picsum', 'sanity', 'uploadcare'].includes(providerName);
}

function widthForProvider(providerName: string, width: number | undefined, config: ResolvedImageConfig): number | undefined {
  if (!['awsAmplify', 'vercel'].includes(providerName)) {
    return width;
  }

  const validWidths = Object.values(config.screens)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const largestWidth = validWidths.at(-1);

  if (!width) {
    return largestWidth;
  }

  return validWidths.includes(width)
    ? width
    : validWidths.find((validWidth) => validWidth > width) ?? largestWidth;
}

function ensureConfig(config: ImageConfig | ResolvedImageConfig): ResolvedImageConfig {
  return isResolvedConfig(config)
    ? config
    : resolveImageConfig(config);
}

function isResolvedConfig(config: ImageConfig | ResolvedImageConfig): config is ResolvedImageConfig {
  return 'providerOptions' in config && 'providers' in config && 'providerSizes' in config;
}

function scaledHeight(originalWidth: number | undefined, originalHeight: number | undefined, width: number | undefined): number | undefined {
  if (!originalWidth || !originalHeight || !width) {
    return originalHeight;
  }

  return Math.round((originalHeight / originalWidth) * width);
}

function modifierQuality(modifiers: ImageModifiers | undefined): number | undefined {
  const value = modifiers?.quality ?? modifiers?.q;
  return typeof value === 'boolean' ? undefined : clampQuality(value);
}

function modifierFormat(modifiers: ImageModifiers | undefined): ImageFormat | undefined {
  const value = modifiers?.format ?? modifiers?.f;
  return typeof value === 'string' ? value as ImageFormat : undefined;
}

function modifierNumber(modifiers: ImageModifiers | undefined, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = modifiers?.[key];
    if (typeof value !== 'boolean') {
      const parsed = toNumber(value);
      if (parsed !== undefined) {
        return parsed;
      }
    }
  }
  return undefined;
}

function preloadFetchPriority(preload: ImagePreload | undefined): ImageInput['fetchpriority'] {
  return typeof preload === 'object' ? preload.fetchPriority : undefined;
}

function splitFormats(format: ImageFormat | readonly ImageFormat[] | undefined): ImageFormat[] | undefined {
  if (!format) {
    return undefined;
  }

  if (typeof format !== 'string') {
    return Array.from(format).flatMap((entry) => splitFormats(entry) ?? []);
  }

  return format
    .split(',')
    .map((entry: string) => entry.trim())
    .filter(Boolean) as ImageFormat[];
}

function defaultLegacyFormat(src: string): ImageFormat {
  const format = originalFormat(src);
  return !format || !['png', 'webp', 'gif', 'svg'].includes(format) ? 'jpeg' : 'png';
}

function originalFormat(src: string): string | undefined {
  return src.match(/^[^?#]+\.([a-z0-9]+)(?:$|[?#])/i)?.[1]?.toLowerCase();
}

function normalizeLegacyFormat(format: ImageFormat | undefined): string | undefined {
  return format === 'jpg' ? 'jpeg' : format;
}

function validateProviderRemoteSource(src: string, config: ResolvedImageConfig): boolean {
  if (!isRemoteSource(src)) {
    return true;
  }

  if (!config.domains?.length && !config.remotePatterns?.length) {
    return false;
  }

  return validateSource(src, config).valid;
}

function compactModifiers(modifiers: ImageModifiers): ImageModifiers {
  return Object.fromEntries(Object.entries(modifiers).filter(([, value]) => value !== undefined));
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

function warn(message: string | undefined): void {
  if (message && typeof console !== 'undefined') {
    console.warn(`[desource/image] ${message}`);
  }
}
