import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type CaisyProviderOptions = GenericProviderOptions;

export function caisyProvider(options: CaisyProviderOptions = {}): ImageProvider<CaisyProviderOptions> {
  return createMappedQueryProvider('caisy', options, {
    width: 'w',
    height: 'h',
    quality: 'q'
  });
}
