import type { ImageModifiers, ImageProvider, ImageProviderInput, ImageProviderResult, ModifierValue } from './types.js';
import { appendQuery, encodeRemoteOrPath, joinURL, normalizeFormat, stableModifiers, stripLeadingSlash } from './utils.js';

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

export function createDefaultProviders(): Record<string, ImageProvider> {
  return {
    none: noneProvider(),
    vercel: vercelProvider(),
    awsAmplify: awsAmplifyProvider(),
    ipx: ipxProvider(),
    cloudinary: cloudinaryProvider(),
    imgix: imgixProvider(),
    imagekit: imagekitProvider(),
    cloudflare: cloudflareProvider(),
    netlify: netlifyProvider()
  };
}
