import { withBase, withQuery, getQuery } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    width: 'width',
    height: 'height',
    aspectRatio: 'aspect_ratio',
    quality: 'quality',
    sharpen: 'sharpen',
    blur: 'blur',
    crop: 'crop',
    cropGravity: 'crop_gravity',
    flip: 'flip',
    flop: 'flop',
    brightness: 'brightness',
    saturation: 'saturation',
    hue: 'hue',
    contrast: 'contrast',
    autoOptimize: 'auto_optimize',
    sepia: 'sepia'
  }
});

interface BunnyOptions {
  baseURL: string;
}

const providerSetup = defineProvider<BunnyOptions>({
  getImage: (src, { modifiers, baseURL }) => {
    const operations = operationsGenerator(modifiers);
    return {
      url: withQuery(withBase(src, baseURL), getQuery('?' + operations))
    };
  }
});

export type BunnyProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function bunnyProvider(options: BunnyProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'bunny');
}

export default providerSetup;
