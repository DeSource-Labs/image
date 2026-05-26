import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type UmbracoProviderOptions = GenericProviderOptions;

export function umbracoProvider(options: UmbracoProviderOptions = {}): ImageProvider<UmbracoProviderOptions> {
  return createMappedQueryProvider('umbraco', options, {
    width: 'width',
    height: 'height',
    focalPointXY: 'rxy',
    format: 'format',
    quality: 'quality',
    fit: 'rmode',
    sampler: 'rsampler',
    anchorPosition: 'ranchor'
  }, {
    fit: {
      contain: 'max',
      cover: 'crop'
    }
  });
}
