import type { ImageProvider, ImageProviderResult } from '../types.js';
import { providerBaseURL, sourceWithBase } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type Strapi5ProviderOptions = GenericProviderOptions;

export function strapi5Provider(options: Strapi5ProviderOptions = {}): ImageProvider<Strapi5ProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? 'http://localhost:1337/uploads' };
  return {
    name: 'strapi5',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const formats = input.modifiers?.formats;
      const breakpoint = input.modifiers?.breakpoint;
      if (formats && breakpoint && typeof formats === 'object' && !Array.isArray(formats)) {
        const entry = (formats as Record<string, { url?: string }>)[String(breakpoint)];
        if (entry?.url) {
          return {
            url: sourceWithBase(entry.url.replace(/^\/uploads\//, ''), providerBaseURL(providerOptions, defaults)),
            isOptimized: true
          };
        }
      }
      return {
        url: sourceWithBase(input.src.replace(/^\/uploads\//, ''), providerBaseURL(providerOptions, defaults)),
        isOptimized: Boolean(breakpoint)
      };
    }
  };
}
