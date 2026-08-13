import { withBase } from 'ufo';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

interface StrapiOptions {
  baseURL?: string;
  modifiers?: {
    breakpoint?: string;
    breakpoints?: string[];
    formats?: Partial<Record<string, { url?: string }>>;
  };
}

const providerSetup = defineProvider<StrapiOptions>({
  getImage: (src: string, { modifiers, baseURL = 'http://localhost:1337/uploads' }) => {
    const breakpoint = modifiers?.breakpoint;
    const breakpoints = modifiers?.breakpoints || ['large', 'medium', 'small', 'thumbnail'];
    const formats = modifiers?.formats;
    const path = src.replace(/^\/uploads\//, '');

    if (!breakpoint || !formats) {
      return {
        url: withBase(path, baseURL)
      };
    }

    const startIndex = breakpoints.indexOf(breakpoint);
    for (const size of breakpoints.slice(startIndex)) {
      const format = formats[size as (typeof breakpoints)[number]];

      if (format?.url) {
        const formatPath = format.url.replace(/^\/uploads\//, '');

        return {
          url: withBase(formatPath, baseURL)
        };
      }
    }

    return {
      url: withBase(path, baseURL)
    };
  }
});

export type Strapi5ProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function strapi5Provider(options: Strapi5ProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'strapi5');
}

export default providerSetup;
