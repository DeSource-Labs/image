import { joinURL } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator();

interface DirectusOptions {
  baseURL: string;
  modifiers?: {
    transforms?: string[];
    withoutEnlargement?: boolean;
  };
}

const providerSetup = defineProvider<DirectusOptions>({
  getImage: (src, { modifiers, baseURL }) => {
    // Separating the transforms from the rest of the modifiers
    const transforms =
      modifiers.transforms && Array.isArray(modifiers.transforms) && modifiers.transforms.length > 0
        ? JSON.stringify(
            Array.from(new Set(modifiers.transforms.map((obj) => JSON.stringify(obj)))).map((value) =>
              JSON.parse(value)
            )
          )
        : undefined;

    const operations = operationsGenerator({
      ...modifiers,
      transforms
    });
    return {
      url: joinURL(baseURL, src + (operations ? '?' + operations.replace(/=+$/, '') : ''))
    };
  }
});

export type DirectusProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function directusProvider(options: DirectusProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'directus');
}

export default providerSetup;
