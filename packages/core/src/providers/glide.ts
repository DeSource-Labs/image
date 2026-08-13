// https://glide.thephpleague.com/2.0/api/quick-reference/

import { joinURL, encodePath, withBase } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    orientation: 'or',
    flip: 'flip',
    crop: 'crop',
    width: 'w',
    height: 'h',
    fit: 'fit',
    dpr: 'dpr',
    bri: 'bri',
    con: 'con',
    gam: 'gam',
    sharp: 'sharp',
    blur: 'blur',
    pixel: 'pixel',
    filt: 'filt',
    mark: 'mark',
    markw: 'markw',
    markh: 'markh',
    markx: 'markx',
    marky: 'marky',
    markpad: 'markpad',
    markpos: 'markpos',
    markalpha: 'markalpha',
    background: 'bg',
    border: 'border',
    quality: 'q',
    format: 'fm'
  },
  valueMap: {
    fit: {
      fill: 'fill',
      inside: 'max',
      outside: 'stretch',
      cover: 'crop',
      contain: 'contain'
    }
  }
});

interface GlideOptions {
  baseURL?: string;
}

const providerSetup = defineProvider<GlideOptions>({
  getImage: (src, { modifiers, baseURL = '/' }) => {
    const params = operationsGenerator(modifiers);

    return {
      url: withBase(joinURL(encodePath(src) + (params ? '?' + params : '')), baseURL)
    };
  }
});

export type GlideProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function glideProvider(options: GlideProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'glide');
}

export default providerSetup;
