import { withBase, withoutLeadingSlash } from 'ufo';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

// https://strapi.io/documentation/developer-docs/latest/development/plugins/upload.html#upload

interface StrapiOptions {
  baseURL?: string;
  modifiers?: {
    breakpoint?: string;
  };
}

const providerSetup = defineProvider<StrapiOptions>({
  validateDomains: true,
  getImage: (src, { modifiers, baseURL = 'http://localhost:1337/uploads' }) => {
    const breakpoint = modifiers?.breakpoint ?? '';

    if (!breakpoint) {
      return {
        url: withBase(src, baseURL)
      };
    }

    return {
      url: withBase(`${breakpoint}_${withoutLeadingSlash(src)}`, baseURL)
    };
  }
});

export type StrapiProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function strapiProvider(options: StrapiProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'strapi');
}

export default providerSetup;
