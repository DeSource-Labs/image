import { getQuery, withBase, withQuery } from 'ufo';
import { operationsGenerator } from './imgix.js';
import unsplashProvider, { unsplashCDN } from './unsplash.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const prismicCDN = 'https://images.prismic.io/';

interface PrismicOptions {
  baseURL?: string;
}

const providerSetup = defineProvider<PrismicOptions>(() => {
  const { getImage: getUnsplashImage } = unsplashProvider();
  return {
    getImage: (src, { modifiers, baseURL = prismicCDN }, ctx) => {
      // Some images served by Prismic are from unsplash, so we use the unsplash provider for those
      if (src.startsWith(unsplashCDN)) {
        return getUnsplashImage(src, { modifiers }, ctx);
      }

      const operations = operationsGenerator(modifiers);
      // withQuery requires query parameters as an object, so I parse the modifiers into an object with getQuery
      return {
        url: withQuery(withBase(src, baseURL), getQuery('?' + operations))
      };
    }
  };
});

export type PrismicProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function prismicProvider(options: PrismicProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'prismic');
}

export default providerSetup;
