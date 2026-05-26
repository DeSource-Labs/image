import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type DirectusProviderOptions = GenericProviderOptions;

export function directusProvider(options: DirectusProviderOptions = {}): ImageProvider<DirectusProviderOptions> {
  return createMappedQueryProvider('directus', options);
}
