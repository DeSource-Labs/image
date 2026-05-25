import type { ImageModifiers, ImageProvider, ImageProviderInput, ImageProviderResult, ModifierValue } from './types.js';
import { appendQuery, encodeRemoteOrPath, joinURL, normalizeFormat, stableModifiers, stripLeadingSlash } from './utils.js';

export const BUILT_IN_PROVIDER_NAMES = [
  'aliyun',
  'awsAmplify',
  'bunny',
  'builderio',
  'caisy',
  'cloudflare',
  'cloudflareimages',
  'cloudimage',
  'cloudinary',
  'contentful',
  'directus',
  'fastly',
  'filerobot',
  'flyimg',
  'github',
  'glide',
  'gumlet',
  'hygraph',
  'imageengine',
  'imagekit',
  'imgix',
  'ipx',
  'ipxStatic',
  'netlify',
  'netlifyLargeMedia',
  'netlifyImageCdn',
  'picsum',
  'prepr',
  'none',
  'prismic',
  'sanity',
  'shopify',
  'storyblok',
  'strapi',
  'strapi5',
  'supabase',
  'twicpics',
  'umbraco',
  'unsplash',
  'uploadcare',
  'vercel',
  'wagtail',
  'weserv',
  'sirv'
] as const;

export type BuiltInProviderName = typeof BUILT_IN_PROVIDER_NAMES[number];

export interface GenericProviderOptions {
  baseURL?: string;
  path?: string;
  token?: string;
  cdnURL?: string;
  sourceURL?: string;
  accountHash?: string;
  variant?: string;
  projectName?: string;
  processType?: 'upload' | 'path';
  defaultParams?: Record<string, ModifierValue>;
}

export interface VercelProviderOptions {
  path?: string;
  defaultQuality?: number;
}

export interface AwsAmplifyProviderOptions {
  path?: string;
  defaultQuality?: number;
}

export interface IpxProviderOptions {
  path?: string;
}

export interface CloudinaryProviderOptions {
  cloudName?: string;
  baseURL?: string;
  deliveryType?: 'upload' | 'fetch';
}

export interface ImgixProviderOptions {
  baseURL?: string;
  defaultParams?: Record<string, ModifierValue>;
}

export interface ImageKitProviderOptions {
  endpoint?: string;
  transformationPosition?: 'query' | 'path';
}

export interface CloudflareProviderOptions {
  baseURL?: string;
  path?: string;
}

export interface NetlifyProviderOptions {
  path?: string;
}

export type AliyunProviderOptions = GenericProviderOptions;
export type BunnyProviderOptions = GenericProviderOptions;
export type BuilderioProviderOptions = GenericProviderOptions;
export type CaisyProviderOptions = GenericProviderOptions;
export type CloudflareImagesProviderOptions = GenericProviderOptions;
export type CloudimageProviderOptions = GenericProviderOptions;
export type ContentfulProviderOptions = GenericProviderOptions;
export type DirectusProviderOptions = GenericProviderOptions;
export type FastlyProviderOptions = GenericProviderOptions;
export type FilerobotProviderOptions = GenericProviderOptions;
export type FlyimgProviderOptions = GenericProviderOptions;
export type GithubProviderOptions = GenericProviderOptions;
export type GlideProviderOptions = GenericProviderOptions;
export type GumletProviderOptions = GenericProviderOptions;
export type HygraphProviderOptions = GenericProviderOptions;
export type ImageEngineProviderOptions = GenericProviderOptions;
export type IpxStaticProviderOptions = IpxProviderOptions;
export type NetlifyImageCdnProviderOptions = NetlifyProviderOptions;
export type NetlifyLargeMediaProviderOptions = GenericProviderOptions;
export type PicsumProviderOptions = GenericProviderOptions;
export type PreprProviderOptions = GenericProviderOptions;
export type PrismicProviderOptions = GenericProviderOptions;
export type SanityProviderOptions = GenericProviderOptions & { projectId?: string; dataset?: string };
export type ShopifyProviderOptions = GenericProviderOptions;
export type SirvProviderOptions = GenericProviderOptions;
export type StoryblokProviderOptions = GenericProviderOptions;
export type StrapiProviderOptions = GenericProviderOptions;
export type Strapi5ProviderOptions = GenericProviderOptions;
export type SupabaseProviderOptions = GenericProviderOptions;
export type TwicpicsProviderOptions = GenericProviderOptions;
export type UmbracoProviderOptions = GenericProviderOptions;
export type UnsplashProviderOptions = GenericProviderOptions;
export type UploadcareProviderOptions = GenericProviderOptions;
export type WagtailProviderOptions = GenericProviderOptions;
export type WeservProviderOptions = GenericProviderOptions & { weservURL?: string };

function isTransformable(input: ImageProviderInput): boolean {
  return Boolean(input.width || input.height || input.quality || input.format || (input.modifiers && Object.keys(input.modifiers).length > 0));
}

function withStandardParams(input: ImageProviderInput, aliases: Record<string, ModifierValue>): Record<string, ModifierValue> {
  return {
    ...aliases,
    w: input.width,
    h: input.height,
    q: input.quality,
    f: normalizeFormat(input.format)
  };
}

function appendProviderModifiers(params: Record<string, ModifierValue>, modifiers: ImageModifiers | undefined, reserved: readonly string[] = []): Record<string, ModifierValue> {
  const result = { ...params };
  const reservedSet = new Set(reserved);
  for (const [key, value] of stableModifiers(modifiers)) {
    if (!reservedSet.has(key)) {
      result[key] = value;
    }
  }

  return result;
}

type ModifierKeyMap = Record<string, string>;
type ModifierValueMap = Record<string, Record<string, ModifierValue> | ((value: Exclude<ModifierValue, undefined | null>) => ModifierValue)>;

function providerBaseURL<T extends GenericProviderOptions>(providerOptions: T | undefined, defaults: T): string {
  return providerOptions?.baseURL ?? defaults.baseURL ?? '';
}

function sourceWithBase(src: string, baseURL = ''): string {
  return baseURL && !src.startsWith('http') ? joinURL(baseURL, src) : src;
}

function joinURLParts(...parts: Array<string | number | undefined | null>): string {
  return parts
    .filter((part) => part !== undefined && part !== null && part !== '')
    .map(String)
    .reduce((url, part) => url ? joinURL(url, part) : part, '');
}

function sourcePath(src: string): string {
  try {
    return new URL(src).pathname;
  } catch {
    return src;
  }
}

function removeExtension(src: string): string {
  return src.replace(/\.[^/.]+$/, '');
}

function standardModifierObject(input: ImageProviderInput): Record<string, ModifierValue> {
  return {
    ...input.modifiers,
    width: input.width,
    height: input.height,
    quality: input.quality,
    format: normalizeFormat(input.format) ?? input.modifiers?.format ?? input.modifiers?.f
  };
}

function mappedModifiers(input: ImageProviderInput, keyMap: ModifierKeyMap = {}, valueMap: ModifierValueMap = {}, reserved: readonly string[] = []): Record<string, ModifierValue> {
  const result: Record<string, ModifierValue> = {};
  const reservedSet = new Set(reserved);

  for (const [key, rawValue] of stableModifiers(standardModifierObject(input))) {
    if (reservedSet.has(key)) {
      continue;
    }

    const mapper = valueMap[key];
    const value = typeof mapper === 'function'
      ? mapper(rawValue)
      : mapper && typeof rawValue === 'string'
        ? mapper[rawValue] ?? rawValue
        : rawValue;

    result[keyMap[key] ?? key] = value;
  }

  return result;
}

function mappedQueryURL(input: ImageProviderInput, options: GenericProviderOptions, keyMap: ModifierKeyMap = {}, valueMap: ModifierValueMap = {}): string {
  const src = sourceWithBase(input.src, options.baseURL);
  const params = {
    ...options.defaultParams,
    ...mappedModifiers(input, keyMap, valueMap)
  };
  return appendQuery(src, params);
}

function createMappedQueryProvider(name: BuiltInProviderName, defaults: GenericProviderOptions = {}, keyMap: ModifierKeyMap = {}, valueMap: ModifierValueMap = {}): ImageProvider<GenericProviderOptions> {
  return {
    name,
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const options = { ...defaults, ...providerOptions };
      return {
        url: mappedQueryURL(input, options, keyMap, valueMap),
        isOptimized: isTransformable(input)
      };
    }
  };
}

function pathOperations(input: ImageProviderInput, keyMap: ModifierKeyMap = {}, valueMap: ModifierValueMap = {}, formatter: (key: string, value: Exclude<ModifierValue, undefined | null>) => string = (key, value) => `${key}_${value}`, joinWith = ','): string {
  return stableModifiers(mappedModifiers(input, keyMap, valueMap))
    .map(([key, value]) => formatter(key, value))
    .join(joinWith);
}

function cleanColor(value: Exclude<ModifierValue, undefined | null>): ModifierValue {
  return typeof value === 'string' && value.startsWith('#') ? value.slice(1) : value;
}

const formatJpgValue = {
  jpeg: 'jpg'
};

const defaultFitValue = {
  cover: 'crop',
  contain: 'fill',
  fill: 'scale',
  inside: 'min',
  outside: 'max'
};

export function noneProvider(): ImageProvider {
  return {
    name: 'none',
    getImage(input): ImageProviderResult {
      return { url: input.src, isOptimized: false };
    }
  };
}

export function vercelProvider(options: VercelProviderOptions = {}): ImageProvider<VercelProviderOptions> {
  const defaults = {
    path: options.path ?? '/_vercel/image',
    defaultQuality: options.defaultQuality ?? 100
  };

  return {
    name: 'vercel',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const path = providerOptions.path ?? defaults.path;
      const quality = input.quality ?? providerOptions.defaultQuality ?? defaults.defaultQuality;
      if (!input.width) {
        return { url: input.src, isOptimized: false };
      }

      return {
        url: appendQuery(path, {
          url: input.src,
          w: input.width,
          q: quality
        }),
        isOptimized: true
      };
    }
  };
}

export function awsAmplifyProvider(options: AwsAmplifyProviderOptions = {}): ImageProvider<AwsAmplifyProviderOptions> {
  const defaults = {
    path: options.path ?? '/_amplify/image',
    defaultQuality: options.defaultQuality ?? 100
  };

  return {
    name: 'awsAmplify',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const path = providerOptions.path ?? defaults.path;
      const quality = input.quality ?? providerOptions.defaultQuality ?? defaults.defaultQuality;
      if (!input.width) {
        return { url: input.src, isOptimized: false };
      }

      const params = appendProviderModifiers(
        {
          url: input.src,
          w: input.width,
          h: input.height,
          q: quality,
          format: normalizeFormat(input.format),
          fit: input.modifiers?.fit,
          position: input.modifiers?.position,
          background: input.modifiers?.background
        },
        input.modifiers,
        ['fit', 'position', 'background', 'width', 'w', 'height', 'h', 'quality', 'q', 'format', 'f']
      );

      return {
        url: appendQuery(path, params),
        isOptimized: true
      };
    }
  };
}

export function ipxProvider(options: IpxProviderOptions = {}): ImageProvider<IpxProviderOptions> {
  const defaults = {
    path: options.path ?? '/_ipx'
  };

  return {
    name: 'ipx',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      if (!isTransformable(input)) {
        return { url: input.src, isOptimized: false };
      }

      const modifierSegment = ipxModifierSegment(input);
      const sourceSegment = encodeRemoteOrPath(stripLeadingSlash(input.src));
      const path = providerOptions.path ?? defaults.path;
      return {
        url: `${path.replace(/\/+$/, '')}/${modifierSegment}/${sourceSegment}`,
        isOptimized: true
      };
    }
  };
}

function ipxModifierSegment(input: ImageProviderInput): string {
  const reserved = new Set(['width', 'height', 'w', 'h', 'resize', 'quality', 'q', 'format', 'f', 'fit', 'position', 'background', 'blur']);
  const operations: Array<[string, Exclude<ModifierValue, undefined | null>]> = [];

  if (input.width && input.height) {
    operations.push(['s', `${input.width}x${input.height}`]);
  } else {
    if (input.width) {
      operations.push(['w', input.width]);
    }

    if (input.height) {
      operations.push(['h', input.height]);
    }
  }

  pushOperation(operations, 'f', normalizeFormat(input.format) ?? input.modifiers?.format ?? input.modifiers?.f);
  pushOperation(operations, 'q', input.quality ?? input.modifiers?.quality ?? input.modifiers?.q);
  pushOperation(operations, 'fit', input.modifiers?.fit);
  pushOperation(operations, 'pos', input.modifiers?.position);
  pushOperation(operations, 'b', input.modifiers?.background);
  pushOperation(operations, 'blur', input.modifiers?.blur);

  for (const [key, value] of stableModifiers(input.modifiers)) {
    if (!reserved.has(key)) {
      operations.push([key, value]);
    }
  }

  return operations.map(([key, value]) => `${encodeURIComponent(key)}_${encodeURIComponent(String(value))}`).join('&') || '_';
}

function pushOperation(operations: Array<[string, Exclude<ModifierValue, undefined | null>]>, key: string, value: ModifierValue): void {
  if (value !== undefined && value !== null && value !== false && value !== '') {
    operations.push([key, value]);
  }
}

export function cloudinaryProvider(options: CloudinaryProviderOptions = {}): ImageProvider<CloudinaryProviderOptions> {
  return {
    name: 'cloudinary',
    getImage(input, providerOptions = options): ImageProviderResult {
      const baseURL = providerOptions.baseURL ?? (providerOptions.cloudName ? `https://res.cloudinary.com/${providerOptions.cloudName}` : '');
      if (!baseURL) {
        return { url: input.src, isOptimized: false };
      }

      const deliveryType = providerOptions.deliveryType ?? (input.src.startsWith('http') ? 'fetch' : 'upload');
      const transforms = [
        input.format ? `f_${normalizeFormat(input.format)}` : undefined,
        input.quality ? `q_${input.quality}` : undefined,
        input.width ? `w_${input.width}` : undefined,
        input.height ? `h_${input.height}` : undefined,
        input.modifiers?.fit ? `c_${input.modifiers.fit}` : undefined,
        input.modifiers?.position ? `g_${input.modifiers.position}` : undefined,
        input.modifiers?.background ? `b_${input.modifiers.background}` : undefined,
        ...stableModifiers(input.modifiers)
          .filter(([key]) => !['fit', 'position', 'background'].includes(key))
          .map(([key, value]) => `${key}_${value}`)
      ].filter(Boolean).join(',');
      const source = deliveryType === 'fetch' ? encodeURIComponent(input.src) : stripLeadingSlash(input.src);
      return {
        url: `${baseURL.replace(/\/+$/, '')}/image/${deliveryType}/${transforms}/${source}`,
        isOptimized: true
      };
    }
  };
}

export function imgixProvider(options: ImgixProviderOptions = {}): ImageProvider<ImgixProviderOptions> {
  return {
    name: 'imgix',
    getImage(input, providerOptions = options): ImageProviderResult {
      const src = providerOptions.baseURL && !input.src.startsWith('http')
        ? joinURL(providerOptions.baseURL, input.src)
        : input.src;
      const params = appendProviderModifiers(
        withStandardParams(input, {
          fit: input.modifiers?.fit,
          crop: input.modifiers?.position,
          bg: input.modifiers?.background
        }),
        { ...providerOptions.defaultParams, ...input.modifiers },
        ['fit', 'position', 'background']
      );
      return {
        url: appendQuery(src, params),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function imagekitProvider(options: ImageKitProviderOptions = {}): ImageProvider<ImageKitProviderOptions> {
  return {
    name: 'imagekit',
    getImage(input, providerOptions = options): ImageProviderResult {
      const endpoint = providerOptions.endpoint ?? '';
      const source = endpoint && !input.src.startsWith('http') ? joinURL(endpoint, input.src) : input.src;
      const transformations = [
        input.width ? `w-${input.width}` : undefined,
        input.height ? `h-${input.height}` : undefined,
        input.quality ? `q-${input.quality}` : undefined,
        input.format ? `f-${normalizeFormat(input.format)}` : undefined,
        input.modifiers?.fit ? `c-${input.modifiers.fit}` : undefined,
        input.modifiers?.position ? `fo-${input.modifiers.position}` : undefined,
        input.modifiers?.background ? `bg-${input.modifiers.background}` : undefined,
        ...stableModifiers(input.modifiers)
          .filter(([key]) => !['fit', 'position', 'background'].includes(key))
          .map(([key, value]) => `${key}-${value}`)
      ].filter(Boolean).join(',');

      if (!transformations) {
        return { url: source, isOptimized: false };
      }

      if ((providerOptions.transformationPosition ?? 'query') === 'path') {
        return { url: joinURL(source, `tr:${transformations}`), isOptimized: true };
      }

      return { url: appendQuery(source, { tr: transformations }), isOptimized: true };
    }
  };
}

export function cloudflareProvider(options: CloudflareProviderOptions = {}): ImageProvider<CloudflareProviderOptions> {
  return {
    name: 'cloudflare',
    getImage(input, providerOptions = options): ImageProviderResult {
      if (!isTransformable(input)) {
        return { url: input.src, isOptimized: false };
      }

      const path = providerOptions.path ?? '/cdn-cgi/image';
      const base = providerOptions.baseURL ? providerOptions.baseURL.replace(/\/+$/, '') : '';
      const optionsSegment = stableModifiers(
        appendProviderModifiers(
          {
            width: input.width,
            height: input.height,
            quality: input.quality,
            format: normalizeFormat(input.format),
            fit: input.modifiers?.fit,
            gravity: input.modifiers?.position,
            background: input.modifiers?.background
          },
          input.modifiers,
          ['fit', 'position', 'background']
        )
      ).map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join(',');

      return {
        url: `${base}${path}/${optionsSegment}/${encodeRemoteOrPath(input.src)}`,
        isOptimized: true
      };
    }
  };
}

export function netlifyProvider(options: NetlifyProviderOptions = {}): ImageProvider<NetlifyProviderOptions> {
  const defaults = {
    path: options.path ?? '/.netlify/images'
  };

  return {
    name: 'netlify',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      if (!isTransformable(input)) {
        return { url: input.src, isOptimized: false };
      }

      const params = appendProviderModifiers(
        {
          url: input.src,
          w: input.width,
          h: input.height,
          q: input.quality,
          fm: normalizeFormat(input.format),
          fit: input.modifiers?.fit,
          position: input.modifiers?.position
        },
        input.modifiers,
        ['fit', 'position']
      );
      return {
        url: appendQuery(providerOptions.path ?? defaults.path, params),
        isOptimized: true
      };
    }
  };
}

export function netlifyImageCdnProvider(options: NetlifyImageCdnProviderOptions = {}): ImageProvider<NetlifyImageCdnProviderOptions> {
  return netlifyProvider(options);
}

export function netlifyLargeMediaProvider(options: NetlifyLargeMediaProviderOptions = {}): ImageProvider<NetlifyLargeMediaProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? '/' };
  return {
    name: 'netlifyLargeMedia',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const params = mappedModifiers(input, {
        height: 'h',
        width: 'w',
        fit: 'nf_resize'
      }, {
        fit: {
          contain: 'fit',
          fill: 'smartcrop',
          cover: 'smartcrop'
        }
      }, ['format']);

      if ((params.h || params.w) && !params.nf_resize) {
        params.nf_resize = 'fit';
      }

      return {
        url: appendQuery(sourceWithBase(input.src, providerBaseURL(providerOptions, defaults)), params),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function ipxStaticProvider(options: IpxStaticProviderOptions = {}): ImageProvider<IpxStaticProviderOptions> {
  return {
    ...ipxProvider(options),
    name: 'ipxStatic'
  };
}

export function aliyunProvider(options: AliyunProviderOptions = {}): ImageProvider<AliyunProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? '/' };
  return {
    name: 'aliyun',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const operations: string[] = [];
      if (input.width && input.height) {
        operations.push(`resize,fw_${input.width},fh_${input.height}`);
      } else if (input.width) {
        operations.push(`resize,w_${input.width}`);
      } else if (input.height) {
        operations.push(`resize,h_${input.height}`);
      }
      if (input.quality) {
        operations.push(`quality,Q_${input.quality}`);
      }
      for (const [key, value] of stableModifiers(input.modifiers)) {
        if (!['width', 'height', 'quality', 'format'].includes(key)) {
          operations.push(`${key},${value}`);
        }
      }
      const baseURL = providerBaseURL(providerOptions, defaults);
      const url = sourceWithBase(input.src, baseURL);
      return {
        url: operations.length ? appendQuery(url, { image_process: operations.join('/') }) : url,
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function bunnyProvider(options: BunnyProviderOptions = {}): ImageProvider<BunnyProviderOptions> {
  return createMappedQueryProvider('bunny', options, {
    aspectRatio: 'aspect_ratio',
    autoOptimize: 'auto_optimize',
    cropGravity: 'crop_gravity'
  });
}

export function builderioProvider(options: BuilderioProviderOptions = {}): ImageProvider<BuilderioProviderOptions> {
  return createMappedQueryProvider('builderio', options, {
    width: 'width',
    height: 'height',
    quality: 'quality',
    format: 'format',
    fit: 'fit',
    position: 'position'
  });
}

export function caisyProvider(options: CaisyProviderOptions = {}): ImageProvider<CaisyProviderOptions> {
  return createMappedQueryProvider('caisy', options, {
    width: 'w',
    height: 'h',
    quality: 'q'
  });
}

export function cloudflareImagesProvider(options: CloudflareImagesProviderOptions = {}): ImageProvider<CloudflareImagesProviderOptions> {
  const defaults = {
    baseURL: options.baseURL ?? 'https://imagedelivery.net',
    accountHash: options.accountHash,
    variant: options.variant
  };
  return {
    name: 'cloudflareimages',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const options = { ...defaults, ...providerOptions };
      const accountHash = options.accountHash ?? '';
      const variant = String(input.modifiers?.variant ?? options.variant ?? 'public');
      const rest = { ...input.modifiers };
      delete rest.variant;
      const hasTransforms = input.width || input.height || input.quality || input.format || Object.keys(rest).length > 0;
      const operations = hasTransforms
        ? pathOperations({ ...input, modifiers: rest }, {
            width: 'w',
            height: 'h',
            quality: 'q',
            format: 'f',
            gravity: 'g'
          }, {
            fit: {
              cover: 'cover',
              contain: 'contain',
              fill: 'pad',
              inside: 'scale-down',
              outside: 'crop'
            }
          }, (key, value) => `${key}=${encodeURIComponent(String(value))}`)
        : variant;
      return {
        url: joinURLParts(options.baseURL ?? '', accountHash, input.src, operations || variant),
        isOptimized: true
      };
    }
  };
}

export function cloudimageProvider(options: CloudimageProviderOptions = {}): ImageProvider<CloudimageProviderOptions> {
  const defaults = {
    baseURL: options.baseURL,
    token: options.token,
    cdnURL: options.cdnURL
  };
  return {
    name: 'cloudimage',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const options = { ...defaults, ...providerOptions };
      const cdnURL = options.cdnURL ?? (options.token ? `https://${options.token}.cloudimg.io` : '');
      const src = input.src.startsWith('http')
        ? joinURL(cdnURL, input.src)
        : joinURLParts(cdnURL, options.baseURL ?? '', input.src);
      return {
        url: appendQuery(src || input.src, mappedModifiers(input, {
          fit: 'func',
          format: 'force_format',
          quality: 'q'
        }, {
          fit: {
            cover: 'crop',
            contain: 'fit',
            fill: 'cover',
            inside: 'bound',
            outside: 'boundmin'
          }
        })),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function contentfulProvider(options: ContentfulProviderOptions = {}): ImageProvider<ContentfulProviderOptions> {
  return createMappedQueryProvider('contentful', { baseURL: options.baseURL ?? 'https://images.ctfassets.net' }, {
    format: 'fm',
    width: 'w',
    height: 'h',
    quality: 'q',
    background: 'bg',
    focus: 'f'
  }, {
    format: formatJpgValue,
    fit: {
      cover: 'crop',
      contain: 'fill',
      fill: 'scale',
      thumbnail: 'thumb'
    }
  });
}

export function directusProvider(options: DirectusProviderOptions = {}): ImageProvider<DirectusProviderOptions> {
  return createMappedQueryProvider('directus', options);
}

export function fastlyProvider(options: FastlyProviderOptions = {}): ImageProvider<FastlyProviderOptions> {
  return createMappedQueryProvider('fastly', { baseURL: options.baseURL ?? '/' }, {}, {
    fit: {
      fill: 'crop',
      inside: 'crop',
      outside: 'crop',
      cover: 'bounds',
      contain: 'bounds'
    }
  });
}

export function filerobotProvider(options: FilerobotProviderOptions = {}): ImageProvider<FilerobotProviderOptions> {
  return createMappedQueryProvider('filerobot', options, {
    fit: 'func',
    format: 'force_format',
    quality: 'q',
    width: 'w',
    height: 'h'
  }, {
    fit: {
      cover: 'crop',
      contain: 'fit',
      fill: 'cover',
      inside: 'bound',
      outside: 'boundmin'
    }
  });
}

export function flyimgProvider(options: FlyimgProviderOptions = {}): ImageProvider<FlyimgProviderOptions> {
  const defaults = {
    baseURL: options.baseURL,
    sourceURL: options.sourceURL,
    processType: options.processType ?? 'upload'
  };
  return {
    name: 'flyimg',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const options = { ...defaults, ...providerOptions };
      const src = input.src.startsWith('http') || !options.sourceURL ? input.src : joinURL(options.sourceURL, input.src);
      const operations = pathOperations(input, {
        width: 'w',
        height: 'h',
        quality: 'q',
        format: 'o',
        rotate: 'r',
        background: 'bg'
      }, {}, (key, value) => `${key}_${value}`) || '-';

      return {
        url: joinURL(options.baseURL ?? '/', `${options.processType ?? 'upload'}/${operations}/${src}`),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function githubProvider(options: GithubProviderOptions = {}): ImageProvider<GithubProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? 'https://avatars.githubusercontent.com' };
  return {
    name: 'github',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const requested = Math.max(input.width ?? 0, input.height ?? 0);
      const size = Math.min(Math.max(1, requested || 460), 460);
      return {
        url: appendQuery(sourceWithBase(input.src, providerBaseURL(providerOptions, defaults)), { v: 4, s: size }),
        isOptimized: true
      };
    }
  };
}

export function glideProvider(options: GlideProviderOptions = {}): ImageProvider<GlideProviderOptions> {
  return createMappedQueryProvider('glide', { baseURL: options.baseURL ?? '/' }, {
    orientation: 'or',
    width: 'w',
    height: 'h',
    quality: 'q',
    format: 'fm',
    background: 'bg'
  }, {
    fit: {
      fill: 'fill',
      inside: 'max',
      outside: 'stretch',
      cover: 'crop',
      contain: 'contain'
    }
  });
}

export function gumletProvider(options: GumletProviderOptions = {}): ImageProvider<GumletProviderOptions> {
  return createMappedQueryProvider('gumlet', { baseURL: options.baseURL ?? '/' }, {
    width: 'w',
    height: 'h',
    quality: 'q',
    backgroundColor: 'bg',
    rotate: 'rot',
    pixelDensity: 'dpr'
  }, {
    fit: {
      fill: 'scale',
      inside: 'max',
      outside: 'min',
      cover: 'crop',
      contain: 'fill'
    }
  });
}

export function hygraphProvider(options: HygraphProviderOptions = {}): ImageProvider<HygraphProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? '' };
  return {
    name: 'hygraph',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const transforms = [
        input.width ? `width:${input.width}` : undefined,
        input.height ? `height:${input.height}` : undefined,
        input.modifiers?.fit ? `fit:${input.modifiers.fit === 'contain' ? 'max' : input.modifiers.fit}` : undefined
      ].filter(Boolean).join(',');
      const format = input.format ? `output=format:${normalizeFormat(input.format)}` : 'auto_image';
      const quality = input.quality && input.format ? `quality=value:${input.quality}` : undefined;
      return {
        url: joinURLParts(providerBaseURL(providerOptions, defaults), transforms ? `resize=${transforms}` : '', quality ?? '', format, stripLeadingSlash(input.src)),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function imageEngineProvider(options: ImageEngineProviderOptions = {}): ImageProvider<ImageEngineProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? '/' };
  return {
    name: 'imageengine',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const operations = pathOperations(input, {
        width: 'w',
        height: 'h',
        quality: 'cmpr',
        format: 'f',
        fit: 'm'
      }, {
        quality(value) {
          return Math.min(99, Math.max(0, 100 - Number(value)));
        },
        fit: {
          cover: 'cropbox',
          contain: 'letterbox',
          fill: 'stretch',
          inside: 'box',
          outside: 'box'
        }
      }, (key, value) => `${key}_${value}`, '/');
      return {
        url: sourceWithBase(input.src + (operations ? `?imgeng=/${operations}` : ''), providerBaseURL(providerOptions, defaults)),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function picsumProvider(options: PicsumProviderOptions = {}): ImageProvider<PicsumProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? 'https://picsum.photos' };
  return {
    name: 'picsum',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const parts: string[] = [];
      const source = stripLeadingSlash(input.src);
      if (source.startsWith('id/') || source.startsWith('seed/')) {
        parts.push(source);
      }
      if (input.width) {
        parts.push(String(input.width));
      }
      if (input.height) {
        parts.push(String(input.height));
      }
      return {
        url: appendQuery(joinURL(providerBaseURL(providerOptions, defaults), parts.join('/')), mappedModifiers(input, {}, {}, ['width', 'height', 'quality', 'format', 'fit', 'background'])),
        isOptimized: true
      };
    }
  };
}

export function preprProvider(options: PreprProviderOptions = {}): ImageProvider<PreprProviderOptions> {
  const defaults = { projectName: options.projectName };
  return {
    name: 'prepr',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const projectName = providerOptions.projectName ?? '';
      const operations = pathOperations(input, {
        crop: 'c',
        format: 'format',
        height: 'h',
        quality: 'q',
        width: 'w'
      }, { format: formatJpgValue }, (key, value) => value === true ? key : `${key}_${value}`);
      const baseURL = projectName ? `https://${projectName}.stream.prepr.io` : '';
      return {
        url: joinURLParts(baseURL, operations, input.src),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function prismicProvider(options: PrismicProviderOptions = {}): ImageProvider<PrismicProviderOptions> {
  return createMappedQueryProvider('prismic', { baseURL: options.baseURL ?? 'https://images.prismic.io' }, {
    width: 'w',
    height: 'h',
    format: 'fm',
    quality: 'q'
  }, {
    format: formatJpgValue
  });
}

export function sanityProvider(options: SanityProviderOptions = {}): ImageProvider<SanityProviderOptions> {
  const defaults = {
    baseURL: options.baseURL ?? 'https://cdn.sanity.io/images',
    projectId: options.projectId,
    dataset: options.dataset ?? 'production'
  };
  return {
    name: 'sanity',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const options = { ...defaults, ...providerOptions };
      const asset = stripLeadingSlash(input.src);
      const parts = asset.split('-').slice(1);
      const extension = parts.pop();
      const filename = parts.length && extension ? `${parts.join('-')}.${extension}` : asset;
      const params = mappedModifiers(input, {
        format: 'fm',
        height: 'h',
        quality: 'q',
        width: 'w',
        background: 'bg',
        sharpen: 'sharp',
        orientation: 'or'
      }, {
        format: formatJpgValue,
        fit: defaultFitValue
      });
      if (!params.fm && input.format === 'auto') {
        params.auto = 'format';
      }
      return {
        url: appendQuery(joinURLParts(options.baseURL ?? '', options.projectId ?? '', options.dataset ?? 'production', filename), params),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function shopifyProvider(options: ShopifyProviderOptions = {}): ImageProvider<ShopifyProviderOptions> {
  return createMappedQueryProvider('shopify', options, {
    width: 'width',
    height: 'height',
    format: 'format',
    quality: 'quality',
    padColor: 'pad_color'
  });
}

export function sirvProvider(options: SirvProviderOptions = {}): ImageProvider<SirvProviderOptions> {
  return createMappedQueryProvider('sirv', { baseURL: options.baseURL ?? '/' }, {
    width: 'w',
    height: 'h',
    quality: 'q',
    fit: 'scale.option',
    webpFallback: 'webp-fallback'
  }, {
    fit: {
      contain: 'fit',
      fill: 'ignore',
      outside: 'fill',
      inside: 'fill',
      noUpscaling: 'noup'
    },
    format: formatJpgValue
  });
}

export function storyblokProvider(options: StoryblokProviderOptions = {}): ImageProvider<StoryblokProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? 'https://a.storyblok.com' };
  return {
    name: 'storyblok',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const width = input.width ?? '0';
      const height = input.height ?? '0';
      const filters = [
        input.format ? `format(${normalizeFormat(input.format)})` : undefined,
        input.quality ? `quality(${input.quality})` : undefined
      ].filter(Boolean).join(':');
      const optionsPath = joinURLParts(
        input.modifiers?.fit ? `fit-${input.modifiers.fit}` : '',
        width !== '0' || height !== '0' ? `${width}x${height}` : '',
        input.modifiers?.smart ? 'smart' : '',
        filters ? `filters:${filters}` : ''
      );
      const path = joinURLParts(sourcePath(input.src), optionsPath ? '/m/' : '', optionsPath);
      return {
        url: sourceWithBase(path, providerBaseURL(providerOptions, defaults)),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function strapiProvider(options: StrapiProviderOptions = {}): ImageProvider<StrapiProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? 'http://localhost:1337/uploads' };
  return {
    name: 'strapi',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const breakpoint = input.modifiers?.breakpoint ? `${input.modifiers.breakpoint}_` : '';
      return {
        url: sourceWithBase(`${breakpoint}${stripLeadingSlash(input.src)}`, providerBaseURL(providerOptions, defaults)),
        isOptimized: Boolean(breakpoint)
      };
    }
  };
}

export function strapi5Provider(options: Strapi5ProviderOptions = {}): ImageProvider<Strapi5ProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? 'http://localhost:1337/uploads' };
  return {
    name: 'strapi5',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const formats = input.modifiers?.formats;
      const breakpoint = input.modifiers?.breakpoint;
      if (formats && breakpoint && typeof formats === 'object' && !Array.isArray(formats)) {
        const entry = (formats as Record<string, { url?: string }>)[String(breakpoint)];
        if (entry?.url) {
          return {
            url: sourceWithBase(entry.url.replace(/^\/uploads\//, ''), providerBaseURL(providerOptions, defaults)),
            isOptimized: true
          };
        }
      }
      return {
        url: sourceWithBase(input.src.replace(/^\/uploads\//, ''), providerBaseURL(providerOptions, defaults)),
        isOptimized: Boolean(breakpoint)
      };
    }
  };
}

export function supabaseProvider(options: SupabaseProviderOptions = {}): ImageProvider<SupabaseProviderOptions> {
  return createMappedQueryProvider('supabase', options, {
    width: 'width',
    height: 'height',
    quality: 'quality',
    format: 'format',
    fit: 'resize'
  });
}

export function twicpicsProvider(options: TwicpicsProviderOptions = {}): ImageProvider<TwicpicsProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? '/' };
  return {
    name: 'twicpics',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const transforms: Record<string, ModifierValue> = mappedModifiers(input, {
        format: 'output',
        quality: 'quality',
        background: 'background',
        focus: 'focus',
        zoom: 'zoom'
      }, {
        background: cleanColor
      }, ['width', 'height', 'fit']);
      if (input.width || input.height) {
        const fit = input.modifiers?.fit === 'outside' ? 'contain' : input.modifiers?.fit ?? 'cover';
        transforms[String(fit)] = `${input.width ?? '-'}x${input.height ?? '-'}`;
      }
      const operations = stableModifiers(transforms).map(([key, value]) => `${key}=${value}`).join('/');
      return {
        url: sourceWithBase(input.src + (operations ? `?twic=v1/${operations}` : ''), providerBaseURL(providerOptions, defaults)),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function umbracoProvider(options: UmbracoProviderOptions = {}): ImageProvider<UmbracoProviderOptions> {
  return createMappedQueryProvider('umbraco', options, {
    width: 'width',
    height: 'height',
    focalPointXY: 'rxy',
    format: 'format',
    quality: 'quality',
    fit: 'rmode',
    sampler: 'rsampler',
    anchorPosition: 'ranchor'
  }, {
    fit: {
      contain: 'max',
      cover: 'crop'
    }
  });
}

export function unsplashProvider(options: UnsplashProviderOptions = {}): ImageProvider<UnsplashProviderOptions> {
  return createMappedQueryProvider('unsplash', { baseURL: options.baseURL ?? 'https://images.unsplash.com' }, {
    width: 'w',
    height: 'h',
    format: 'fm',
    quality: 'q'
  }, {
    format: formatJpgValue
  });
}

export function uploadcareProvider(options: UploadcareProviderOptions = {}): ImageProvider<UploadcareProviderOptions> {
  const defaults = { cdnURL: options.cdnURL ?? 'https://ucarecdn.com' };
  return {
    name: 'uploadcare',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const parts: string[] = [];
      if (input.width || input.height) {
        const operation = input.modifiers?.fit === 'cover' ? 'scale_crop' : 'resize';
        parts.push(`-/${operation}/${input.width ?? ''}x${input.height ?? ''}/`);
      }
      if (input.format) {
        parts.push(`-/format/${normalizeFormat(input.format)}/`);
      }
      if (input.quality) {
        parts.push(`-/quality/${input.quality}/`);
      }
      for (const [key, value] of stableModifiers(input.modifiers)) {
        if (!['fit', 'width', 'height', 'format', 'quality'].includes(key)) {
          parts.push(`-/${key}/${value}/`);
        }
      }
      const base = input.src.startsWith('http') ? '' : providerOptions.cdnURL ?? defaults.cdnURL;
      return {
        url: joinURLParts(base, input.src, parts.join('')),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function wagtailProvider(options: WagtailProviderOptions = {}): ImageProvider<WagtailProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? '' };
  return {
    name: 'wagtail',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const width = input.width ?? 0;
      const height = input.height ?? 0;
      const format = normalizeFormat(input.format) ?? 'webp';
      const quality = input.quality ?? 70;
      const suffix = `|format-${format}|${format}quality-${quality}`;
      const operation = width && height
        ? `fill-${width}x${height}-c0${suffix}`
        : width
          ? `width-${width}${suffix}`
          : height
            ? `height-${height}${suffix}`
            : `original${suffix}`;
      return {
        url: sourceWithBase(joinURL(input.src, operation), providerBaseURL(providerOptions, defaults)),
        isOptimized: true
      };
    }
  };
}

export function weservProvider(options: WeservProviderOptions = {}): ImageProvider<WeservProviderOptions> {
  const defaults = {
    baseURL: options.baseURL,
    weservURL: options.weservURL ?? 'https://wsrv.nl'
  };
  return {
    name: 'weserv',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const options = { ...defaults, ...providerOptions };
      if (!options.baseURL && !input.src.startsWith('http')) {
        return { url: input.src, isOptimized: false };
      }
      const src = input.src.startsWith('http') ? input.src : sourceWithBase(input.src, options.baseURL);
      const filename = src.slice(src.lastIndexOf('/') + 1);
      return {
        url: appendQuery(options.weservURL ?? 'https://wsrv.nl', {
          url: src,
          filename,
          w: input.width,
          h: input.height,
          q: input.quality,
          output: normalizeFormat(input.format),
          fit: input.modifiers?.fit,
          bg: input.modifiers?.background,
          ...input.modifiers
        }),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function createDefaultProviders(): Record<string, ImageProvider> {
  return {
    none: noneProvider(),
    ipx: ipxProvider(),
    ipxStatic: ipxStaticProvider(),
    awsAmplify: awsAmplifyProvider(),
    vercel: vercelProvider(),
    netlify: netlifyProvider(),
    netlifyImageCdn: netlifyImageCdnProvider(),
    netlifyLargeMedia: netlifyLargeMediaProvider()
  };
}

export function createBuiltInProviders(): Record<BuiltInProviderName, ImageProvider> {
  return {
    aliyun: aliyunProvider(),
    awsAmplify: awsAmplifyProvider(),
    bunny: bunnyProvider(),
    builderio: builderioProvider(),
    caisy: caisyProvider(),
    cloudflare: cloudflareProvider(),
    cloudflareimages: cloudflareImagesProvider(),
    cloudimage: cloudimageProvider(),
    cloudinary: cloudinaryProvider(),
    contentful: contentfulProvider(),
    directus: directusProvider(),
    fastly: fastlyProvider(),
    filerobot: filerobotProvider(),
    flyimg: flyimgProvider(),
    github: githubProvider(),
    glide: glideProvider(),
    gumlet: gumletProvider(),
    hygraph: hygraphProvider(),
    imageengine: imageEngineProvider(),
    imagekit: imagekitProvider(),
    imgix: imgixProvider(),
    ipx: ipxProvider(),
    ipxStatic: ipxStaticProvider(),
    netlify: netlifyProvider(),
    netlifyImageCdn: netlifyImageCdnProvider(),
    netlifyLargeMedia: netlifyLargeMediaProvider(),
    none: noneProvider(),
    picsum: picsumProvider(),
    prepr: preprProvider(),
    prismic: prismicProvider(),
    sanity: sanityProvider(),
    shopify: shopifyProvider(),
    storyblok: storyblokProvider(),
    strapi: strapiProvider(),
    strapi5: strapi5Provider(),
    supabase: supabaseProvider(),
    twicpics: twicpicsProvider(),
    umbraco: umbracoProvider(),
    unsplash: unsplashProvider(),
    uploadcare: uploadcareProvider(),
    vercel: vercelProvider(),
    wagtail: wagtailProvider(),
    weserv: weservProvider(),
    sirv: sirvProvider()
  };
}
