import { parseQuery, withBase, withQuery } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    width: 'width',
    height: 'height',
    format: 'format',
    quality: 'quality',
    padColor: 'pad_color',
    crop: 'crop',
    cropLeft: 'crop_left',
    cropTop: 'crop_top',
    cropWidth: 'crop_width',
    cropHeight: 'crop_height'
  },
  valueMap: {
    crop: {
      center: 'center',
      top: 'top',
      bottom: 'bottom',
      left: 'left',
      right: 'right',
      region: 'region'
    }
  }
});

interface ShopifyOptions {
  baseURL: string;
}

const providerSetup = defineProvider<ShopifyOptions>({
  getImage: (src, { modifiers, baseURL = '' }) => {
    const operations = operationsGenerator(modifiers);

    return {
      url: withBase(withQuery(src, parseQuery(operations)), baseURL)
    };
  }
});

export type ShopifyProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function shopifyProvider(options: ShopifyProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'shopify');
}

export default providerSetup;
