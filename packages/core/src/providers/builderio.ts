import type { ImageProvider } from '../types';
import { createMappedQueryProvider } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type BuilderioProviderOptions = GenericProviderOptions;

export function builderioProvider(options: BuilderioProviderOptions = {}): ImageProvider<BuilderioProviderOptions> {
  return createMappedQueryProvider('builderio', options, {
    width: 'width',
    height: 'height',
    quality: 'quality',
    format: 'format',
    fit: 'fit',
    position: 'position'
  });
}
