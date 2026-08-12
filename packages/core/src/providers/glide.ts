import type { ImageProvider } from '../types';
import { createMappedQueryProvider } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type GlideProviderOptions = GenericProviderOptions;

export function glideProvider(options: GlideProviderOptions = {}): ImageProvider<GlideProviderOptions> {
  return createMappedQueryProvider(
    'glide',
    { baseURL: options.baseURL ?? '/' },
    {
      orientation: 'or',
      width: 'w',
      height: 'h',
      quality: 'q',
      format: 'fm',
      background: 'bg'
    },
    {
      fit: {
        fill: 'fill',
        inside: 'max',
        outside: 'stretch',
        cover: 'crop',
        contain: 'contain'
      }
    }
  );
}
