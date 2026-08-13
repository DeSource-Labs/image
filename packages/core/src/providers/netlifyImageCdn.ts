import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

// https://docs.netlify.com/image-cdn/overview/
const operationsGenerator = createOperationsGenerator({
  keyMap: {
    width: 'w',
    height: 'h',
    format: 'fm',
    quality: 'q',
    position: 'position',
    fit: 'fit'
  },
  valueMap: {
    fit: {
      fill: 'fill',
      cover: 'cover',
      contain: 'contain'
    },
    format: {
      avif: 'avif',
      gif: 'gif',
      jpg: 'jpg',
      jpeg: 'jpg',
      png: 'png',
      webp: 'webp'
    },
    position: {
      top: 'top',
      right: 'right',
      bottom: 'bottom',
      left: 'left',
      center: 'center'
    }
  }
});

interface NetlifyImageCDNOptions {
  baseURL: string;
}

const providerSetup = defineProvider<NetlifyImageCDNOptions>({
  getImage: (src, { modifiers, baseURL }) => {
    const operations = operationsGenerator({ ...modifiers, url: src });
    return {
      url: `${baseURL || '/.netlify/images'}?${operations}`
    };
  }
});

export interface NetlifyImageCdnProviderOptions extends Partial<ProviderOptionsOf<typeof providerSetup>> {
  path?: string;
}

export function netlifyImageCdnProvider(options: NetlifyImageCdnProviderOptions = {}) {
  const { path, ...defaults } = options;
  return configureProvider(providerSetup, { ...defaults, baseURL: defaults.baseURL ?? path }, 'netlifyImageCdn');
}

export default providerSetup;
