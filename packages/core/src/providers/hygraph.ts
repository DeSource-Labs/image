import type { ImageProvider, ImageProviderResult } from '../types.js';
import { normalizeFormat, stripLeadingSlash } from '../utils.js';
import { isTransformable, joinURLParts, providerBaseURL } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type HygraphProviderOptions = GenericProviderOptions;

export function hygraphProvider(options: HygraphProviderOptions = {}): ImageProvider<HygraphProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? '' };
  return {
    name: 'hygraph',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const transforms = [
        input.width ? `width:${input.width}` : undefined,
        input.height ? `height:${input.height}` : undefined,
        input.modifiers?.fit ? `fit:${input.modifiers.fit === 'contain' ? 'max' : input.modifiers.fit}` : undefined
      ].filter(Boolean).join(',');
      const format = input.format ? `output=format:${normalizeFormat(input.format)}` : 'auto_image';
      const quality = input.quality && input.format ? `quality=value:${input.quality}` : undefined;
      return {
        url: joinURLParts(providerBaseURL(providerOptions, defaults), transforms ? `resize=${transforms}` : '', quality ?? '', format, stripLeadingSlash(input.src)),
        isOptimized: isTransformable(input)
      };
    }
  };
}
