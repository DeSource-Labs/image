import { withBase, parseURL } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

// https://www.contentful.com/developers/docs/references/images-api/
const contentfulCDN = 'https://images.ctfassets.net';

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    format: 'fm',
    width: 'w',
    height: 'h',
    focus: 'f',
    radius: 'r',
    quality: 'q',
    background: 'bg'
  },
  valueMap: {
    format: {
      jpeg: 'jpg'
    },
    fit: {
      cover: 'crop',
      contain: 'fill',
      fill: 'scale',
      thumbnail: 'thumb'
    }
  }
});

interface ContentfulOptions {
  baseURL?: string;
}

const providerSetup = defineProvider<ContentfulOptions>({
  getImage: (src, { modifiers, baseURL = contentfulCDN }) => {
    const operations = operationsGenerator(modifiers);

    const { pathname } = parseURL(src);
    const path = pathname + (operations ? '?' + operations : '');
    const url = withBase(path, baseURL);

    return {
      url
    };
  }
});

export type ContentfulProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function contentfulProvider(options: ContentfulProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'contentful');
}

export default providerSetup;
