import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider, formatJpgValue } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type ContentfulProviderOptions = GenericProviderOptions;

export function contentfulProvider(options: ContentfulProviderOptions = {}): ImageProvider<ContentfulProviderOptions> {
  return createMappedQueryProvider('contentful', { baseURL: options.baseURL ?? 'https://images.ctfassets.net' }, {
    format: 'fm',
    width: 'w',
    height: 'h',
    quality: 'q',
    background: 'bg',
    focus: 'f'
  }, {
    format: formatJpgValue,
    fit: {
      cover: 'crop',
      contain: 'fill',
      fill: 'scale',
      thumbnail: 'thumb'
    }
  });
}
