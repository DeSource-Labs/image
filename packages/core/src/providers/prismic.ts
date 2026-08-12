import type { ImageProvider } from '../types';
import { createMappedQueryProvider, formatJpgValue } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type PrismicProviderOptions = GenericProviderOptions;

export function prismicProvider(options: PrismicProviderOptions = {}): ImageProvider<PrismicProviderOptions> {
  return createMappedQueryProvider(
    'prismic',
    { baseURL: options.baseURL ?? 'https://images.prismic.io' },
    {
      width: 'w',
      height: 'h',
      format: 'fm',
      quality: 'q'
    },
    {
      format: formatJpgValue
    }
  );
}
