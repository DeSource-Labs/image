import type { ImageProvider } from '../types';
import { createMappedQueryProvider } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

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
