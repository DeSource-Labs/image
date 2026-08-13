import { joinURL, hasProtocol } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { isDevelopment } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    fit: 'func',
    format: 'force_format',
    quality: 'q',
    width: 'w',
    height: 'h'
  },
  valueMap: {
    fit: {
      cover: 'crop',
      contain: 'fit',
      fill: 'cover',
      inside: 'bound',
      outside: 'boundmin'
    }
  }
});

interface FilerobotOptions {
  baseURL: string;
}

const providerSetup = defineProvider<FilerobotOptions>({
  getImage: (src, { modifiers, baseURL = '' }) => {
    const operations = operationsGenerator(modifiers);
    const query = operations ? '?' + operations : '';

    if (isDevelopment()) {
      if (!baseURL) {
        console.warn(`[fielrobot] <baseURL> is required to build image URL`);
      }
    }

    if (hasProtocol(src)) {
      return {
        url: joinURL(src) + query
      };
    }

    return {
      url: joinURL(baseURL, src) + query
    };
  }
});

export type FilerobotProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function filerobotProvider(options: FilerobotProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'filerobot');
}

export default providerSetup;
