import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const providerSetup = defineProvider({
  getImage: (url) => ({ url })
});

export type NoneProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function noneProvider(options: NoneProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'none');
}

export default providerSetup;
