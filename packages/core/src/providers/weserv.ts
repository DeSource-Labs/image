import { withBase } from 'ufo';
import { createOperationsGenerator, isDevelopment } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    format: 'output',
    width: 'w',
    height: 'h',
    quality: 'q',
    background: 'bg',
    pixelDensity: 'dpr',
    trimImage: 'trim',
    sharpen: 'sharp',
    brightness: 'mod',
    saturation: 'sat',
    hue: 'hue',
    filter: 'filt',
    gamma: 'gam',
    contrast: 'con',
    blur: 'blur',
    mirror: 'flop',
    rotate: 'ro',
    mask: 'mask',
    maskTrim: 'mtrim',
    maskBackground: 'mbg'
  },
  valueMap: {
    format: {
      jpeg: 'jpg',
      jpg: 'jpg',
      png: 'png',
      webp: 'webp'
    },
    fit: {
      cover: 'cover',
      contain: 'contain',
      fill: 'fill',
      inside: 'inside',
      outside: 'outside'
    },
    filter: {
      greyscale: 'greyscale',
      sepia: 'sepia',
      negative: 'negate',
      duotone: 'duotone'
    },
    mask: {
      circle: 'circle',
      ellipse: 'ellipse',
      triangle: 'triangle',
      'triangle-180': 'triangle-180',
      pentagon: 'pentagon',
      'pentagon-180': 'pentagon-180',
      hexagon: 'hexagon',
      square: 'square',
      star: 'star',
      heart: 'heart'
    }
  }
});

export interface WeservOptions {
  /**
   * The url of your site that is exposed to the internet.
   */
  baseURL: string;

  /**
   * The url of the weserv service.
   *
   * @default https://wsrv.nl
   */
  weservURL?: string;

  modifiers?: {
    background?: string;
    pixelDensity?: string;
    trimImage?: string;
    sharpen?: string;
    brightness?: string;
    saturation?: string;
    hue?: string;
    filter?: string;
    gamma?: string;
    contrast?: string;
    blur?: string;
    mirror?: string;
    rotate?: string;
    mask?: string;
    maskTrim?: string;
    maskBackground?: string;
  };
}

const providerSetup = defineProvider<WeservOptions>({
  getImage: (src, options) => {
    const filename = src.substring(src.lastIndexOf('/') + 1);

    if (typeof options.baseURL !== 'string' || options.baseURL.length === 0) {
      if (isDevelopment()) {
        console.warn('[desource/image] The weserv provider requires the public baseURL of your website.');
      }
      return { url: src };
    }

    // https://images.weserv.nl/docs/quick-reference.html
    const operations = operationsGenerator({
      filename,
      we: 'true',
      ...options.modifiers,
      url: withBase(src, options.baseURL)
    }).replace('=true', '');

    return {
      url: withBase(operations.length ? '?' + operations : '', options.weservURL ?? 'https://wsrv.nl')
    };
  }
});

export type WeservProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function weservProvider(options: WeservProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'weserv');
}

export default providerSetup;
