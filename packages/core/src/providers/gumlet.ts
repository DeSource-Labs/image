import type { ImageProvider } from '../types';
import { createMappedQueryProvider } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type GumletProviderOptions = GenericProviderOptions;

export function gumletProvider(options: GumletProviderOptions = {}): ImageProvider<GumletProviderOptions> {
  return createMappedQueryProvider('gumlet', { baseURL: options.baseURL ?? '/' }, {
    width: 'w',
    height: 'h',
    quality: 'q',
    backgroundColor: 'bg',
    rotate: 'rot',
    pixelDensity: 'dpr'
  }, {
    fit: {
      fill: 'scale',
      inside: 'max',
      outside: 'min',
      cover: 'crop',
      contain: 'fill'
    }
  });
}
