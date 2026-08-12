import type { ImageProvider } from '../types';
import { createMappedQueryProvider } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type FastlyProviderOptions = GenericProviderOptions;

export function fastlyProvider(options: FastlyProviderOptions = {}): ImageProvider<FastlyProviderOptions> {
  return createMappedQueryProvider(
    'fastly',
    { baseURL: options.baseURL ?? '/' },
    {},
    {
      fit: {
        fill: 'crop',
        inside: 'crop',
        outside: 'crop',
        cover: 'bounds',
        contain: 'bounds'
      }
    }
  );
}
