import type { DesourceImage, ImageConfig, ImageInput, ResolvedImageConfig } from './types.js';

export interface ImageConfigCache {
  defaultConfig: ResolvedImageConfig;
  resolve(config?: ImageConfig | ResolvedImageConfig): ResolvedImageConfig;
  image(config: ResolvedImageConfig): DesourceImage;
}

export interface ImageVitePluginOptions {
  provider?: string;
  root?: string;
}

interface ImageVitePluginRuntime<TOptions extends ImageVitePluginOptions, TServer, TMiddleware> {
  name: string;
  options: TOptions;
  defaultRoot: string;
  detectProvider(): string;
  createMiddleware(options: TOptions): TMiddleware;
  installMiddleware(server: TServer, middleware: TMiddleware): void;
}

export {
  escapeCssSelectorValue,
  isPathUnderBasePath,
  normalizeBasePath,
  parseRequestPath,
  stringifyModifierValue,
  stripLeadingSlashes,
  stripTrailingSlashes,
  trimSlashes
} from './utils.js';

export {
  createDsImageServer,
  type DsImageNodeMiddleware,
  type DsImageNodeRequest,
  type DsImageServer,
  type DsImageServerOptions,
  type DsImageServerRuntime,
  type DsImageWebHandler
} from './server.js';

export type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | readonly ClassValue[]
  | Readonly<Record<string, boolean | null | undefined>>;

export function isResolvedImageConfig(config: ImageConfig | ResolvedImageConfig): config is ResolvedImageConfig {
  return (
    typeof config.provider === 'string' &&
    Array.isArray(config.densities) &&
    Array.isArray(config.providerSizes) &&
    typeof config.screens === 'object' &&
    config.screens !== null &&
    typeof config.providers === 'object' &&
    config.providers !== null &&
    typeof config.providerOptions === 'object' &&
    config.providerOptions !== null
  );
}

export function createImageConfigCache(runtime: {
  resolveConfig(config?: ImageConfig): ResolvedImageConfig;
  createImage(config: ResolvedImageConfig): DesourceImage;
}): ImageConfigCache {
  const defaultConfig = runtime.resolveConfig();
  const images = new WeakMap<ResolvedImageConfig, DesourceImage>();
  const resolvedConfigs = new WeakMap<object, ResolvedImageConfig>();

  return {
    defaultConfig,
    resolve(config) {
      if (!config) return defaultConfig;
      if (isResolvedImageConfig(config)) return config;

      const cached = resolvedConfigs.get(config);
      if (cached) return cached;
      const resolved = runtime.resolveConfig(config);
      resolvedConfigs.set(config, resolved);
      return resolved;
    },
    image(config) {
      let image = images.get(config);
      if (!image) {
        image = runtime.createImage(config);
        images.set(config, image);
      }
      return image;
    }
  };
}

export function createImageVitePlugin<TOptions extends ImageVitePluginOptions, TServer, TMiddleware>(
  runtime: ImageVitePluginRuntime<TOptions, TServer, TMiddleware>
) {
  let root = runtime.defaultRoot;
  let middleware: TMiddleware | undefined;

  const getMiddleware = (): TMiddleware => {
    middleware ??= runtime.createMiddleware({
      ...runtime.options,
      root: runtime.options.root ?? root
    });
    return middleware;
  };
  const installMiddleware = (server: TServer): void => runtime.installMiddleware(server, getMiddleware());

  return {
    name: runtime.name,
    config() {
      return {
        define: {
          __DESOURCE_IMAGE_PROVIDER__: JSON.stringify(runtime.detectProvider())
        }
      };
    },
    configResolved(config: { root: string }) {
      root = config.root;
    },
    configureServer: installMiddleware,
    configurePreviewServer: installMiddleware
  };
}

export function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

export function pickImageInput(options: ImageInput): ImageInput {
  return stripUndefined({
    src: options.src,
    alt: options.alt,
    width: options.width,
    height: options.height,
    sizes: options.sizes,
    quality: options.quality,
    format: options.format,
    formats: options.formats,
    fallbackFormat: options.fallbackFormat,
    legacyFormat: options.legacyFormat,
    fit: options.fit,
    position: options.position,
    background: options.background,
    modifiers: options.modifiers,
    provider: options.provider,
    preset: options.preset,
    densities: options.densities,
    loading: options.loading,
    decoding: options.decoding,
    fetchpriority: options.fetchpriority,
    priority: options.priority,
    preload: options.preload,
    placeholder: options.placeholder,
    placeholderClass: options.placeholderClass
  });
}

export function normalizeCrossorigin(value: unknown): 'anonymous' | 'use-credentials' | undefined {
  if (value === true || value === '' || value === 'true') {
    return 'anonymous';
  }

  return value === 'anonymous' || value === 'use-credentials' ? value : undefined;
}

export function mergeClassNames(...values: ClassValue[]): string | undefined {
  const classes: string[] = [];

  const visit = (value: ClassValue): void => {
    if (!value) return;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
      classes.push(value.toString());
      return;
    }
    if (typeof value === 'boolean') return;
    if (Array.isArray(value)) {
      for (const entry of value) visit(entry);
      return;
    }
    for (const [name, enabled] of Object.entries(value)) {
      if (enabled) classes.push(name);
    }
  };

  for (const value of values) visit(value);
  return classes.join(' ') || undefined;
}

export function styleWithPlaceholder(
  style: string | null | undefined,
  placeholderSrc: string | undefined,
  loaded: boolean
): string | undefined {
  if (!placeholderSrc || loaded) return style ?? undefined;

  const escaped = placeholderSrc.replaceAll('"', '%22');
  return [style, `background-image:url("${escaped}")`, 'background-size:cover', 'background-position:center']
    .filter(Boolean)
    .join(';');
}
