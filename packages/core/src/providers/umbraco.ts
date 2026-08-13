import { createOperationsGenerator, type InferModifiers } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';
import { encodeQueryItem, joinURL } from 'ufo';
import { defu } from 'defu';

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    width: 'width',
    height: 'height',
    focalPointXY: 'rxy',
    format: 'format',
    quality: 'quality',
    fit: 'rmode',
    sampler: 'rsampler',
    anchorPosition: 'ranchor'
  },
  joinWith: '&',
  formatter: (key, value) => encodeQueryItem(key, value)
});
const defaultModifiers = {};

interface UmbracoImageOptions {
  baseURL?: string;
  modifiers?: InferModifiers<typeof operationsGenerator> & {
    fit?: 'boxpad' | 'crop' | 'manual' | 'max' | 'min' | 'pad' | 'stretch' | 'contain' | 'cover';
  } & {
    sampler?:
      | 'bicubic'
      | 'nearest'
      | 'box'
      | 'mitchell'
      | 'catmull'
      | 'lanczos2'
      | 'lanczos3'
      | 'lanczos5'
      | 'lanczos8'
      | 'welch'
      | 'robidoux'
      | 'robidouxsharp'
      | 'spline'
      | 'triangle'
      | 'hermite';
  } & {
    anchorPosition?:
      'bottom' | 'bottomleft' | 'bottomright' | 'center' | 'left' | 'right' | 'top' | 'topleft' | 'topright';
  };
}

const providerSetup = defineProvider<UmbracoImageOptions>({
  getImage: (src, { modifiers: _modifiers, baseURL = '' }) => {
    const modifiers = { ..._modifiers };
    // Map standard Nuxt Image fit values to ImageSharp resize modes
    if (modifiers.fit === 'contain') {
      modifiers.fit = 'max';
    } else if (modifiers.fit === 'cover') {
      modifiers.fit = 'crop';
    }

    const mergedModifiers = defu(modifiers, defaultModifiers);
    const operations = operationsGenerator(mergedModifiers);

    return {
      url: joinURL(baseURL, src + (operations ? '?' + operations : ''))
    };
  }
});

export type UmbracoProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function umbracoProvider(options: UmbracoProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'umbraco');
}

export default providerSetup;
