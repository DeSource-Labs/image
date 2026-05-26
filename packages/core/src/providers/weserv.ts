import type { ImageProvider, ImageProviderResult } from '../types';
import { appendQuery, normalizeFormat } from '../utils';
import { isTransformable, sourceWithBase } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type WeservProviderOptions = GenericProviderOptions & { weservURL?: string };

export function weservProvider(options: WeservProviderOptions = {}): ImageProvider<WeservProviderOptions> {
  const defaults = {
    baseURL: options.baseURL,
    weservURL: options.weservURL ?? 'https://wsrv.nl'
  };
  return {
    name: 'weserv',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const options = { ...defaults, ...providerOptions };
      if (!options.baseURL && !input.src.startsWith('http')) {
        return { url: input.src, isOptimized: false };
      }
      const src = input.src.startsWith('http') ? input.src : sourceWithBase(input.src, options.baseURL);
      const filename = src.slice(src.lastIndexOf('/') + 1);
      return {
        url: appendQuery(options.weservURL ?? 'https://wsrv.nl', {
          url: src,
          filename,
          w: input.width,
          h: input.height,
          q: input.quality,
          output: normalizeFormat(input.format),
          fit: input.modifiers?.fit,
          bg: input.modifiers?.background,
          ...input.modifiers
        }),
        isOptimized: isTransformable(input)
      };
    }
  };
}
