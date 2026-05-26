import type { ImageProvider } from '../types';
import { createMappedQueryProvider } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type BunnyProviderOptions = GenericProviderOptions;

export function bunnyProvider(options: BunnyProviderOptions = {}): ImageProvider<BunnyProviderOptions> {
  return createMappedQueryProvider('bunny', options, {
    aspectRatio: 'aspect_ratio',
    autoOptimize: 'auto_optimize',
    cropGravity: 'crop_gravity'
  });
}
