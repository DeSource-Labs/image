import type { ImageProvider } from '../types';
import { createMappedQueryProvider } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type DirectusProviderOptions = GenericProviderOptions;

export function directusProvider(options: DirectusProviderOptions = {}): ImageProvider<DirectusProviderOptions> {
  return createMappedQueryProvider('directus', options);
}
