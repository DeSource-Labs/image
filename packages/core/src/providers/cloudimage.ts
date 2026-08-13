import { joinURL, hasProtocol } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { isDevelopment } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    fit: 'func',
    quality: 'q',
    format: 'force_format'
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

interface CloudimageOptions {
  token: string;
  apiVersion?: string;
  baseURL?: string;
  cdnURL?: string;
}

// https://docs.cloudimage.io/go/cloudimage-documentation-v7/en/introduction
const providerSetup = defineProvider<CloudimageOptions>({
  getImage: (src, { modifiers, baseURL, token = '', apiVersion = '', cdnURL = '' }, ctx) => {
    const operations = operationsGenerator(modifiers);
    const query = operations ? '?' + operations : '';

    if (isDevelopment()) {
      const warning = [];

      if (!token && !cdnURL) {
        warning.push('<token> or <cdnURL>');
      }

      if (warning.length > 0) {
        console.warn(`[cloudimage] ${warning.join(', ')} is required to build image URL`);
        return {
          url: joinURL('<token>', '<baseURL>', src) + query
        };
      }
    }

    if (!cdnURL) {
      cdnURL = `https://${token}.cloudimg.io/${apiVersion}`;
    }

    if (hasProtocol(src)) {
      return {
        url: joinURL(cdnURL, src) + query
      };
    }

    if (!baseURL) {
      baseURL = ctx.options.baseURL;
    }

    return {
      url: joinURL(cdnURL, baseURL, src) + query
    };
  }
});

export type CloudimageProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function cloudimageProvider(options: CloudimageProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'cloudimage');
}

export default providerSetup;
