import { joinURL, encodePath } from 'ufo';
import { operationsGenerator, type IPXOptions, type IpxProviderOptions } from './ipx.js';
import { configureProvider, defineProvider } from '../provider-utils.js';

const providerSetup = defineProvider<Partial<IPXOptions>>({
  validateDomains: true,
  supportsAlias: true,
  getImage(src, { modifiers, baseURL }, ctx) {
    if (modifiers.width && modifiers.height) {
      modifiers.resize = `${modifiers.width}x${modifiers.height}`;
      delete modifiers.width;
      delete modifiers.height;
    }

    const params = operationsGenerator(modifiers) || '_';

    if (!baseURL) {
      baseURL = joinURL(ctx.options.baseURL, '/_ipx');
    }

    return {
      url: joinURL(baseURL, params, encodePath(src).replace(/\/{2,}/g, '/'))
    };
  }
});

export type IpxStaticProviderOptions = IpxProviderOptions;

export function ipxStaticProvider(options: IpxStaticProviderOptions = {}) {
  const { path, ...defaults } = options;
  return configureProvider(providerSetup, { ...defaults, baseURL: defaults.baseURL ?? path }, 'ipxStatic');
}

export default providerSetup;
