import { joinURL, parseURL, withTrailingSlash } from 'ufo';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

type ImageOptimizations = {
  width?: number;
  height?: number;
  fit?: string | 'clip' | 'crop' | 'scale' | 'max';
  format?: string | 'jpg' | 'png' | 'webp' | 'avif' | 'auto_image';
  quality?: number | string;
};

function getImageFormat(format?: string) {
  let result = 'auto_image';

  if (format && format !== 'auto_image') {
    result = `output=format:${format}`;
  }

  return result;
}

function getTrailingSegment(value: string, includeTrailingSlash = false): string | undefined {
  const hasTrailingSlash = value.endsWith('/');
  const end = hasTrailingSlash ? value.length - 1 : value.length;
  if (end === 0 || value[end - 1] === '/') {
    return undefined;
  }

  const segment = value.slice(value.lastIndexOf('/', end - 1) + 1, end);
  return includeTrailingSlash && hasTrailingSlash ? `${segment}/` : segment;
}

function getCombinedIds(url: string): { baseId: string; imageId: string } | undefined {
  if (!url.startsWith('/') || url.endsWith('/')) {
    return undefined;
  }

  const segments = url.slice(1).split('/');
  const baseId = segments[0];
  const imageId = segments.at(-1);
  return segments.length >= 2 && baseId && imageId ? { baseId, imageId } : undefined;
}

function splitUpURL(baseURL: string, url: string) {
  /**
   * https://eu-central-1-shared-euc1-02.graphassets.com/cltsj3mii0pvd07vwb5cyh1ig/cltsrex89477t08unlckqx9ue
   *  - baseId: cltsj3mii0pvd07vwb5cyh1ig
   *  - imageId: cltsrex89477t08unlckqx9ue
   */
  const baseId = getTrailingSegment(parseURL(baseURL).pathname);

  if (!baseId) {
    // extract baseId from url instead
    url = url.replace(withTrailingSlash(baseURL), '/');

    const ids = getCombinedIds(url);
    if (!ids) {
      throw new TypeError('[nuxt] [image] [hygraph] Invalid image URL');
    }
    return ids;
  }

  const imageId = getTrailingSegment(url, true);

  if (!imageId) {
    throw new TypeError('[nuxt] [image] [hygraph] Invalid image URL');
  }

  // it's already in baseURL so we can omit it here
  return { baseId: '', imageId };
}

function optimizeHygraphImage(baseURL: string, url: string, optimizations: ImageOptimizations) {
  const { baseId, imageId } = splitUpURL(baseURL, url);
  const imageFormat = getImageFormat(optimizations.format);
  const optimBase = 'resize';
  const quality =
    optimizations.quality && imageFormat !== 'auto_image' ? `quality=value:${optimizations.quality}/` : '';

  const optimList: [string?] = [];
  for (const [key, value] of Object.entries(optimizations)) {
    if (key !== 'format' && key !== 'quality' && value !== undefined) {
      if (key === 'fit' && value === 'contain') {
        optimList.push('fit:max');
      } else {
        optimList.push(`${key}:${value}`);
      }
    }
  }

  if (optimList.length === 0) {
    return joinURL(baseURL, baseId, quality, imageFormat, imageId);
  }

  const optim = `${optimBase}=${optimList.join(',')}`;
  const result = joinURL(baseURL, baseId, optim, quality, imageFormat, imageId);

  return result;
}

interface HygraphOptions {
  baseURL: string;
}

const providerSetup = defineProvider<HygraphOptions>({
  getImage: (src, { modifiers, baseURL }) => {
    const { width, height, fit, format, quality } = modifiers;

    if (!baseURL) {
      throw new Error('No Hygraph image base URL provided.');
    }

    return {
      url: optimizeHygraphImage(baseURL, src, {
        width: Number(width) || undefined,
        height: Number(height) || undefined,
        fit: typeof fit === 'string' ? fit : undefined,
        format: typeof format === 'string' ? format : undefined,
        quality: typeof quality === 'string' || typeof quality === 'number' ? quality : undefined
      })
    };
  }
});

export type HygraphProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function hygraphProvider(options: HygraphProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'hygraph');
}

export default providerSetup;
