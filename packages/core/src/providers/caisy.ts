import { joinURL } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    width: 'w',
    height: 'h',
    quality: 'q'
  }
});

const providerSetup = defineProvider({
  getImage: (src, { modifiers }) => {
    const operations = operationsGenerator(modifiers);
    return {
      url: joinURL(src + (operations ? '?' + operations : ''))
    };
  }
});

export type CaisyProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function caisyProvider(options: CaisyProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'caisy');
}

export default providerSetup;
