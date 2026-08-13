// https://unsplash.com/documentation#dynamically-resizable-images

import { getQuery, withBase, withQuery } from 'ufo';
import { operationsGenerator } from './imgix.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

export const unsplashCDN = 'https://images.unsplash.com/';

interface UnsplashOptions {
  baseURL?: string;
}

const providerSetup = defineProvider<UnsplashOptions>({
  getImage: (src, { modifiers, baseURL = unsplashCDN }) => {
    const operations = operationsGenerator(modifiers);
    // withQuery requires query parameters as an object, so I parse the modifiers into an object with getQuery
    return {
      url: withQuery(withBase(src, baseURL), getQuery('?' + operations))
    };
  }
});

export type UnsplashProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function unsplashProvider(options: UnsplashProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'unsplash');
}

export default providerSetup;
