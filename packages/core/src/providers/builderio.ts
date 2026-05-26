import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

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
