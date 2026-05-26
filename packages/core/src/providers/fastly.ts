import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type FastlyProviderOptions = GenericProviderOptions;

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
