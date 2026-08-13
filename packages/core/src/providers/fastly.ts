import { parseQuery, withBase, withQuery } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  valueMap: {
    fit: {
      fill: 'crop',
      inside: 'crop',
      outside: 'crop',
      cover: 'bounds',
      contain: 'bounds'
    }
  }
});

interface FastlyOptions {
  baseURL?: string;
}

const providerSetup = defineProvider<FastlyOptions>({
  getImage: (src, { modifiers, baseURL = '/' }) => {
    const operations = operationsGenerator(modifiers);
    return {
      url: withBase(withQuery(src, parseQuery(operations)), baseURL)
    };
  }
});

export type FastlyProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function fastlyProvider(options: FastlyProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'fastly');
}

export default providerSetup;
