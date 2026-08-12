import type { ImageProvider } from '../types';
import { createMappedQueryProvider, formatJpgValue } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type UnsplashProviderOptions = GenericProviderOptions;

export function unsplashProvider(options: UnsplashProviderOptions = {}): ImageProvider<UnsplashProviderOptions> {
  return createMappedQueryProvider(
    'unsplash',
    { baseURL: options.baseURL ?? 'https://images.unsplash.com' },
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
