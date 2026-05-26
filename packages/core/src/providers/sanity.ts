import type { ImageProvider, ImageProviderResult } from '../types.js';
import { appendQuery, stripLeadingSlash } from '../utils.js';
import { defaultFitValue, formatJpgValue, isTransformable, joinURLParts, mappedModifiers } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type SanityProviderOptions = GenericProviderOptions & { projectId?: string; dataset?: string };

export function sanityProvider(options: SanityProviderOptions = {}): ImageProvider<SanityProviderOptions> {
  const defaults = {
    baseURL: options.baseURL ?? 'https://cdn.sanity.io/images',
    projectId: options.projectId,
    dataset: options.dataset ?? 'production'
  };
  return {
    name: 'sanity',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const options = { ...defaults, ...providerOptions };
      const asset = stripLeadingSlash(input.src);
      const parts = asset.split('-').slice(1);
      const extension = parts.pop();
      const filename = parts.length && extension ? `${parts.join('-')}.${extension}` : asset;
      const params = mappedModifiers(input, {
        format: 'fm',
        height: 'h',
        quality: 'q',
        width: 'w',
        background: 'bg',
        sharpen: 'sharp',
        orientation: 'or'
      }, {
        format: formatJpgValue,
        fit: defaultFitValue
      });
      if (!params.fm && input.format === 'auto') {
        params.auto = 'format';
      }
      return {
        url: appendQuery(joinURLParts(options.baseURL ?? '', options.projectId ?? '', options.dataset ?? 'production', filename), params),
        isOptimized: isTransformable(input)
      };
    }
  };
}
