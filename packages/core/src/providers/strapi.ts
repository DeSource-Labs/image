import type { ImageProvider, ImageProviderResult } from '../types';
import { stripLeadingSlash } from '../utils';
import { providerBaseURL, sourceWithBase } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type StrapiProviderOptions = GenericProviderOptions;

export function strapiProvider(options: StrapiProviderOptions = {}): ImageProvider<StrapiProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? 'http://localhost:1337/uploads' };
  return {
    name: 'strapi',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const breakpoint = input.modifiers?.breakpoint ? `${input.modifiers.breakpoint}_` : '';
      return {
        url: sourceWithBase(`${breakpoint}${stripLeadingSlash(input.src)}`, providerBaseURL(providerOptions, defaults)),
        isOptimized: Boolean(breakpoint)
      };
    }
  };
}
