import type { ImageProvider } from '../types';
import { createMappedQueryProvider, formatJpgValue } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type SirvProviderOptions = GenericProviderOptions;

export function sirvProvider(options: SirvProviderOptions = {}): ImageProvider<SirvProviderOptions> {
  return createMappedQueryProvider(
    'sirv',
    { baseURL: options.baseURL ?? '/' },
    {
      width: 'w',
      height: 'h',
      quality: 'q',
      fit: 'scale.option',
      webpFallback: 'webp-fallback'
    },
    {
      fit: {
        contain: 'fit',
        fill: 'ignore',
        outside: 'fill',
        inside: 'fill',
        noUpscaling: 'noup'
      },
      format: formatJpgValue
    }
  );
}
