import type { ImageProvider, ImageProviderResult, ModifierValue } from '../types.js';
import { appendQuery, joinURL } from '../utils.js';
import { appendProviderModifiers, isTransformable, withStandardParams } from '../provider-utils.js';

export interface ImgixProviderOptions {
  baseURL?: string;
  defaultParams?: Record<string, ModifierValue>;
}

export function imgixProvider(options: ImgixProviderOptions = {}): ImageProvider<ImgixProviderOptions> {
  return {
    name: 'imgix',
    getImage(input, providerOptions = options): ImageProviderResult {
      const src = providerOptions.baseURL && !input.src.startsWith('http')
        ? joinURL(providerOptions.baseURL, input.src)
        : input.src;
      const params = appendProviderModifiers(
        withStandardParams(input, {
          fit: input.modifiers?.fit,
          crop: input.modifiers?.position,
          bg: input.modifiers?.background
        }),
        { ...providerOptions.defaultParams, ...input.modifiers },
        ['fit', 'position', 'background']
      );
      return {
        url: appendQuery(src, params),
        isOptimized: isTransformable(input)
      };
    }
  };
}
