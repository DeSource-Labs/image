import type { ImageProvider } from '../types';
import { createMappedQueryProvider } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type CaisyProviderOptions = GenericProviderOptions;

export function caisyProvider(options: CaisyProviderOptions = {}): ImageProvider<CaisyProviderOptions> {
  return createMappedQueryProvider('caisy', options, {
    width: 'w',
    height: 'h',
    quality: 'q'
  });
}
