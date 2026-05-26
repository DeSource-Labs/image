import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type BunnyProviderOptions = GenericProviderOptions;

export function bunnyProvider(options: BunnyProviderOptions = {}): ImageProvider<BunnyProviderOptions> {
  return createMappedQueryProvider('bunny', options, {
    aspectRatio: 'aspect_ratio',
    autoOptimize: 'auto_optimize',
    cropGravity: 'crop_gravity'
  });
}
