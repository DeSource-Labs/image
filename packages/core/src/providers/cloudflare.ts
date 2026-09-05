import { encodeQueryItem, hasProtocol, joinURL } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    width: 'w',
    height: 'h',
    dpr: 'dpr',
    fit: 'fit',
    gravity: 'g',
    quality: 'q',
    format: 'f',
    sharpen: 'sharpen'
  },
  valueMap: {
    fit: {
      cover: 'cover',
      contain: 'contain',
      fill: 'scale-down',
      outside: 'crop',
      inside: 'pad'
    },
    gravity: {
      auto: 'auto',
      side: 'side'
    }
  },
  joinWith: ',',
  formatter: (key, value) => encodeQueryItem(key, value)
});

const defaultModifiers = {};

interface CloudflareOptions {
  baseURL?: string;
}

// https://developers.cloudflare.com/images/image-resizing/url-format/
const providerSetup = defineProvider<CloudflareOptions>({
  getImage: (src, { modifiers, baseURL = '/' }) => {
    const mergeModifiers = { ...defaultModifiers, ...modifiers };
    const operations = operationsGenerator(mergeModifiers as Parameters<typeof operationsGenerator>[0]);

    // https://<ZONE>/cdn-cgi/image/<OPTIONS>/<SOURCE-IMAGE>
    let url = hasProtocol(src) ? src : joinURL(baseURL, src);
    if (operations) {
      url = joinURL(baseURL, 'cdn-cgi/image', operations, src);
    }

    return {
      url
    };
  }
});

export type CloudflareProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function cloudflareProvider(options: CloudflareProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'cloudflare');
}

export default providerSetup;
