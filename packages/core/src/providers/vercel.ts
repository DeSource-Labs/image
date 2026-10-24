import { stringifyQuery } from 'ufo';
import { configureProvider, defineProvider, resolveProviderWidth, type ProviderOptionsOf } from '../provider-utils.js';

// https://vercel.com/docs/build-output-api/v3/configuration#images

interface VercelOptions {
  baseURL?: string;
  formats?: readonly string[];
  modifiers?: {
    quality?: string | number;
  };
}

const providerSetup = defineProvider<VercelOptions>({
  validateDomains: true,
  getImage: (src, { modifiers, baseURL = '/_vercel/image' }, ctx) => {
    const width = resolveProviderWidth('vercel', src, modifiers?.width, ctx.options.screens);

    return {
      url:
        baseURL +
        '?' +
        stringifyQuery({
          url: src,
          w: String(width),
          q: String(modifiers?.quality || '100')
        })
    };
  }
});

export interface VercelProviderOptions extends Partial<ProviderOptionsOf<typeof providerSetup>> {
  path?: string;
  defaultQuality?: number;
}

export function vercelProvider(options: VercelProviderOptions = {}) {
  const { path, defaultQuality, ...defaults } = options;
  return configureProvider(
    providerSetup,
    {
      ...defaults,
      baseURL: defaults.baseURL ?? path,
      modifiers: { ...defaults.modifiers, quality: defaults.modifiers?.quality ?? defaultQuality }
    },
    'vercel'
  );
}

export default providerSetup;
