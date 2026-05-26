import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

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
