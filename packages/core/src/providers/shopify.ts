import type { ImageProvider } from '../types';
import { createMappedQueryProvider } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type ShopifyProviderOptions = GenericProviderOptions;

export function shopifyProvider(options: ShopifyProviderOptions = {}): ImageProvider<ShopifyProviderOptions> {
  return createMappedQueryProvider('shopify', options, {
    width: 'width',
    height: 'height',
    format: 'format',
    quality: 'quality',
    padColor: 'pad_color'
  });
}
