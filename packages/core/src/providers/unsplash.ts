import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider, formatJpgValue } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type UnsplashProviderOptions = GenericProviderOptions;

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
