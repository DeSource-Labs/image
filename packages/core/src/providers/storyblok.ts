import type { ImageProvider, ImageProviderResult } from '../types.js';
import { normalizeFormat } from '../utils.js';
import { isTransformable, joinURLParts, providerBaseURL, sourcePath, sourceWithBase } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type StoryblokProviderOptions = GenericProviderOptions;

export function storyblokProvider(options: StoryblokProviderOptions = {}): ImageProvider<StoryblokProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? 'https://a.storyblok.com' };
  return {
    name: 'storyblok',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const width = input.width ?? '0';
      const height = input.height ?? '0';
      const filters = [
        input.format ? `format(${normalizeFormat(input.format)})` : undefined,
        input.quality ? `quality(${input.quality})` : undefined
      ].filter(Boolean).join(':');
      const optionsPath = joinURLParts(
        input.modifiers?.fit ? `fit-${input.modifiers.fit}` : '',
        width !== '0' || height !== '0' ? `${width}x${height}` : '',
        input.modifiers?.smart ? 'smart' : '',
        filters ? `filters:${filters}` : ''
      );
      const path = joinURLParts(sourcePath(input.src), optionsPath ? '/m/' : '', optionsPath);
      return {
        url: sourceWithBase(path, providerBaseURL(providerOptions, defaults)),
        isOptimized: isTransformable(input)
      };
    }
  };
}
