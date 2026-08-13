import { joinURL } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { isDevelopment } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    height: 'h',
    fit: 'nf_resize',
    width: 'w'
  },
  valueMap: {
    fit: {
      fill: 'smartcrop',
      contain: 'fit'
    }
  }
});

interface NetlifyLargeMediaOptions {
  baseURL?: string;
}

// https://docs.netlify.com/large-media/transform-images/

const providerSetup = defineProvider<NetlifyLargeMediaOptions>({
  getImage: (src, { modifiers, baseURL = '/' }) => {
    if (modifiers.format) {
      // Not currently supported
      delete modifiers.format;
    }
    const hasTransformation = modifiers.height || modifiers.width;
    if (!modifiers.fit && hasTransformation) {
      // fit is required for resizing images
      modifiers.fit = 'contain';
    }
    if (hasTransformation && modifiers.fit !== 'contain' && !(modifiers.height && modifiers.width)) {
      // smartcrop is only supported with both height and width
      if (isDevelopment()) {
        console.warn(
          `Defaulting to fit=contain as smart cropping is only supported when providing both height and width. Warning originated from \`${src}\`.`
        );
      }
      modifiers.fit = 'contain';
    }
    const operations = operationsGenerator(modifiers);
    return {
      url: joinURL(baseURL, src + (operations ? '?' + operations : ''))
    };
  }
});

export type NetlifyLargeMediaProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function netlifyLargeMediaProvider(options: NetlifyLargeMediaProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'netlifyLargeMedia');
}

export default providerSetup;
