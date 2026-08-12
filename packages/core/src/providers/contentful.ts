import type { ImageProvider } from '../types';
import { createMappedQueryProvider, formatJpgValue } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type ContentfulProviderOptions = GenericProviderOptions;

export function contentfulProvider(options: ContentfulProviderOptions = {}): ImageProvider<ContentfulProviderOptions> {
  return createMappedQueryProvider(
    'contentful',
    { baseURL: options.baseURL ?? 'https://images.ctfassets.net' },
    {
      format: 'fm',
      width: 'w',
      height: 'h',
      quality: 'q',
      background: 'bg',
      focus: 'f'
    },
    {
      format: formatJpgValue,
      fit: {
        cover: 'crop',
        contain: 'fill',
        fill: 'scale',
        thumbnail: 'thumb'
      }
    }
  );
}
