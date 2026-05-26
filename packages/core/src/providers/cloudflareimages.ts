import type { ImageProvider, ImageProviderResult } from '../types.js';
import { joinURLParts, pathOperations } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type CloudflareImagesProviderOptions = GenericProviderOptions;

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
