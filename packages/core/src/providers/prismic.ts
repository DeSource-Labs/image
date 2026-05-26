import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider, formatJpgValue } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type PrismicProviderOptions = GenericProviderOptions;

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
