import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type GlideProviderOptions = GenericProviderOptions;

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
