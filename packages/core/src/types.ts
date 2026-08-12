export type ImageFormat = 'avif' | 'webp' | 'jpg' | 'jpeg' | 'png' | 'gif' | 'auto' | (string & {});
export type ImageFit = 'cover' | 'contain' | 'fill' | 'inside' | 'outside' | 'scale-down' | (string & {});
export type ImageLoading = 'lazy' | 'eager';
export type ImageDecoding = 'async' | 'sync' | 'auto';
export type ImageFetchPriority = 'high' | 'low' | 'auto';
export type ImagePlaceholder = boolean | string | number | readonly [number, number?, number?, number?];
export type DensityInput = string | number | readonly number[];
export type SizesInput = string | Record<string, string | number>;
export type ModifierValue = string | number | boolean | null | undefined;
export type ImageModifiers = Record<string, ModifierValue>;
export type InvalidSourceStrategy = 'throw' | 'warn' | 'passthrough';
export type ImagePreload = boolean | { fetchPriority?: ImageFetchPriority };
export type OperationMapper<From, To> =
  Record<string | Extract<From, string | number>, To> | ((key?: From) => To | From | undefined);

export type OperationGeneratorConfig<Key extends string, Value, FinalKey, FinalValue> = {
  keyMap?: Partial<Record<Key, FinalKey>>;
  valueMap?: Partial<
    Record<Key, Partial<Record<Extract<Value, string>, FinalValue>> | ((key: Value) => Value | FinalValue | undefined)>
  >;
} & (
  | {
      formatter?: (key: FinalKey, value: FinalValue) => string;
      joinWith?: undefined;
    }
  | {
      formatter: (key: FinalKey, value: FinalValue) => string;
      joinWith: string;
    }
);

export interface RemotePattern {
  protocol?: 'http' | 'https' | string;
  hostname: string;
  port?: string;
  pathname?: string;
  search?: string;
}

export interface LocalPattern {
  pathname: string;
}

export interface ImageProviderInput {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
  modifiers?: ImageModifiers;
}

export interface ImageProviderResult {
  url: string;
  isOptimized?: boolean;
}

export interface ImageProvider<TOptions = unknown> {
  name: string;
  validateDomains?: boolean;
  supportsAlias?: boolean;
  getImage(input: Readonly<ImageProviderInput>, options?: TOptions): ImageProviderResult;
}

export interface ImagePreset {
  provider?: string;
  width?: number;
  height?: number;
  sizes?: SizesInput;
  densities?: DensityInput;
  quality?: number;
  format?: ImageFormat | readonly ImageFormat[];
  fit?: ImageFit;
  position?: string;
  background?: string;
  modifiers?: ImageModifiers;
  placeholder?: ImagePlaceholder;
  placeholderClass?: string;
  loading?: ImageLoading;
  decoding?: ImageDecoding;
  fetchpriority?: ImageFetchPriority;
  priority?: boolean;
  preload?: ImagePreload;
}

export interface ImageConfig {
  provider?: string;
  quality?: number;
  format?: ImageFormat | readonly ImageFormat[];
  screens?: Record<string, number>;
  densities?: readonly number[];
  domains?: readonly string[];
  remotePatterns?: readonly RemotePattern[];
  localPatterns?: readonly LocalPattern[];
  presets?: Record<string, ImagePreset>;
  alias?: Record<string, string>;
  aliases?: Record<string, string>;
  providers?: Record<string, ImageProvider>;
  providerOptions?: Record<string, unknown>;
  providerSizes?: readonly number[];
  onInvalidSource?: InvalidSourceStrategy;
}

export interface ResolvedImageConfig extends Required<
  Pick<
    ImageConfig,
    'provider' | 'screens' | 'densities' | 'presets' | 'aliases' | 'providers' | 'providerOptions' | 'onInvalidSource'
  >
> {
  quality?: number;
  format?: ImageFormat | readonly ImageFormat[];
  domains?: readonly string[];
  remotePatterns?: readonly RemotePattern[];
  localPatterns?: readonly LocalPattern[];
  providerSizes: readonly number[];
}

export interface ImageInput {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  sizes?: SizesInput;
  quality?: number | string;
  format?: ImageFormat | readonly ImageFormat[];
  formats?: readonly ImageFormat[];
  fallbackFormat?: ImageFormat;
  legacyFormat?: ImageFormat;
  fit?: ImageFit;
  position?: string;
  background?: string;
  modifiers?: ImageModifiers;
  provider?: string;
  preset?: string;
  densities?: DensityInput;
  loading?: ImageLoading;
  decoding?: ImageDecoding;
  fetchpriority?: ImageFetchPriority;
  priority?: boolean;
  preload?: ImagePreload;
  placeholder?: ImagePlaceholder;
  placeholderClass?: string;
}

export interface ParsedSizeEntry {
  screen?: string;
  minWidth?: number;
  size: string;
}

export interface ParsedSizes {
  input: SizesInput;
  entries: ParsedSizeEntry[];
  sizes: string;
}

export interface GeneratedSizes {
  sizes?: string;
  widths: number[];
}

export interface GeneratedDensity {
  density: number;
  width?: number;
  height?: number;
}

export interface GeneratedSrcset {
  srcset?: string;
  sizes?: string;
  widths: number[];
  descriptor: 'w' | 'x';
}

export interface ImageAttrs {
  src: string;
  srcset?: string;
  sizes?: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  alt?: string;
  loading?: ImageLoading;
  decoding?: ImageDecoding;
  fetchpriority?: ImageFetchPriority;
  placeholderSrc?: string;
  placeholderClass?: string;
  isOptimized?: boolean;
}

export interface PictureSource {
  type: string;
  srcset: string;
  sizes?: string;
}

export interface PictureAttrs {
  sources: PictureSource[];
  img: ImageAttrs;
}

export interface ImagePreloadLink {
  rel: 'preload';
  as: 'image';
  href: string;
  imagesrcset?: string;
  imagesizes?: string;
  fetchpriority?: ImageFetchPriority;
}

export interface SourceValidationResult {
  valid: boolean;
  reason?: string;
}

export interface ImageContext {
  config: ResolvedImageConfig;
  getImage(input: ImageInput): ImageProviderResult;
  getImageAttrs(input: ImageInput): ImageAttrs;
  getPictureAttrs(input: ImageInput): PictureAttrs;
  getPreloadLink(input: ImageInput): ImagePreloadLink;
}

export interface ImageOptions {
  provider?: string;
  preset?: string;
  densities?: DensityInput;
  modifiers?: ImageModifiers;
  sizes?: SizesInput;
}

export interface ImageSizes {
  srcset: string;
  sizes?: string;
  src?: string;
  widths: number[];
}

export interface DesourceImage {
  (source: string, modifiers?: ImageModifiers, options?: ImageOptions): string;
  options: ResolvedImageConfig;
  getImage(source: string, options?: ImageOptions): ImageProviderResult;
  getSizes(source: string, options?: ImageOptions): ImageSizes;
  getAttrs(input: ImageInput): ImageAttrs;
  getPicture(input: ImageInput): PictureAttrs;
  getPreloadLink(input: ImageInput): ImagePreloadLink;
  [preset: string]: unknown;
}
