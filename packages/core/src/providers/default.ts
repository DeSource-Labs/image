import type { ImageProvider, ImageProviderInput, ImageProviderResult, ModifierValue } from '../types';
import { appendQuery, encodeRemoteOrPath, normalizeFormat, stableModifiers, stripLeadingSlash } from '../utils';
import { appendProviderModifiers, isTransformable } from '../provider-utils';

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

export interface NetlifyProviderOptions {
  path?: string;
}

export interface NetlifyLargeMediaProviderOptions {
  baseURL?: string;
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

      return input.width
        ? { url: appendQuery(path, { url: input.src, w: input.width, q: quality }), isOptimized: true }
        : { url: input.src, isOptimized: false };
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

      return {
        url: appendQuery(path, appendProviderModifiers({
          url: input.src,
          w: input.width,
          h: input.height,
          q: quality,
          format: normalizeFormat(input.format),
          fit: input.modifiers?.fit,
          position: input.modifiers?.position,
          background: input.modifiers?.background
        }, input.modifiers, ['fit', 'position', 'background', 'width', 'w', 'height', 'h', 'quality', 'q', 'format', 'f'])),
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

export function ipxStaticProvider(options: IpxProviderOptions = {}): ImageProvider<IpxProviderOptions> {
  return {
    ...ipxProvider(options),
    name: 'ipxStatic'
  };
}

function ipxModifierSegment(input: ImageProviderInput): string {
  const reserved = new Set(['width', 'height', 'w', 'h', 'resize', 'quality', 'q', 'format', 'f', 'fit', 'position', 'background', 'blur']);
  const operations: Array<[string, Exclude<ModifierValue, undefined | null>]> = [];

  if (input.width && input.height) {
    operations.push(['s', `${input.width}x${input.height}`]);
  } else {
    pushOperation(operations, 'w', input.width);
    pushOperation(operations, 'h', input.height);
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

      return {
        url: appendQuery(providerOptions.path ?? defaults.path, appendProviderModifiers({
          url: input.src,
          w: input.width,
          h: input.height,
          q: input.quality,
          fm: normalizeFormat(input.format),
          fit: input.modifiers?.fit,
          position: input.modifiers?.position
        }, input.modifiers, ['fit', 'position'])),
        isOptimized: true
      };
    }
  };
}

export function netlifyImageCdnProvider(options: NetlifyProviderOptions = {}): ImageProvider<NetlifyProviderOptions> {
  return {
    ...netlifyProvider(options),
    name: 'netlifyImageCdn'
  };
}

export function netlifyLargeMediaProvider(options: NetlifyLargeMediaProviderOptions = {}): ImageProvider<NetlifyLargeMediaProviderOptions> {
  const defaults = {
    baseURL: options.baseURL ?? '/'
  };

  return {
    name: 'netlifyLargeMedia',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const params = appendProviderModifiers({
        w: input.width,
        h: input.height,
        nf_resize: input.modifiers?.fit
      }, input.modifiers, ['format', 'fit']);

      if ((params.h || params.w) && !params.nf_resize) {
        params.nf_resize = 'fit';
      }

      const baseURL = providerOptions.baseURL ?? defaults.baseURL;
      const src = baseURL && !input.src.startsWith('http') ? `${baseURL.replace(/\/+$/, '')}/${input.src.replace(/^\/+/, '')}` : input.src;
      return {
        url: appendQuery(src, params),
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
