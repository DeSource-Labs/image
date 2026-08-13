import { joinURL } from 'ufo';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';
import type { ImageModifiers, ModifierValue } from '../types.js';

const fitMap: Record<string, string> = {
  contain: '',
  cover: 'r',
  fill: '!',
  inside: '',
  outside: 'r'
};

interface EdgeOnePagesModifiers extends ImageModifiers {
  crop?: string;
  gravity?: string;
  dx?: number;
  dy?: number;
  iradius?: number;
  scrop?: string;
  rotate?: number;
  autoOrient?: boolean;
  sharpen?: number;
  strip?: boolean;
  interlace?: boolean | number;
  pad?: boolean | number;
}

interface EdgeOnePagesOptions {
  baseURL: string;
  modifiers?: Partial<EdgeOnePagesModifiers>;
}

function encodeColor(color: ModifierValue): string {
  const hex = String(color).startsWith('#') ? String(color).slice(1) : String(color);
  const bytes = new TextEncoder().encode(hex);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const providerSetup = defineProvider<EdgeOnePagesOptions>({
  getImage: (src, { modifiers = {}, baseURL }) => {
    if (!baseURL) {
      throw new Error('EdgeOne Pages provider requires baseURL to be set');
    }

    const {
      width,
      height,
      fit,
      quality,
      format,
      background,
      blur,
      crop,
      gravity,
      dx,
      dy,
      iradius,
      scrop,
      rotate,
      autoOrient,
      sharpen,
      strip,
      interlace,
      pad
    } = modifiers;
    const operations: string[] = [];

    if (width || height) {
      const w = width ?? '';
      const h = height ?? '';
      const fitSuffix = fit ? (fitMap[fit] ?? '') : '';
      if (fitSuffix === 'r') {
        operations.push(`thumbnail/!${w}x${h}r`);
      } else if (fitSuffix === '!') {
        operations.push(`thumbnail/${w}x${h}!`);
      } else {
        operations.push(`thumbnail/${w}x${h}`);
      }
    }

    if (pad || (background && (width || height))) {
      operations.push('pad/1');
      if (background) {
        operations.push(`color/${encodeColor(background)}`);
      }
    }
    if (crop) {
      operations.push(`crop/${crop}`);
      if (gravity) operations.push(`gravity/${gravity}`);
      if (typeof dx !== 'undefined') operations.push(`dx/${dx}`);
      if (typeof dy !== 'undefined') operations.push(`dy/${dy}`);
    }
    if (typeof iradius !== 'undefined') operations.push(`iradius/${iradius}`);
    if (scrop) operations.push(`scrop/${scrop}`);
    if (typeof rotate !== 'undefined') operations.push(`rotate/${rotate}`);
    if (autoOrient) operations.push('auto-orient');
    if (typeof quality !== 'undefined') operations.push(`quality/${quality}`);
    if (format) operations.push(`format/${format === 'jpeg' ? 'jpg' : format}`);
    if (typeof blur !== 'undefined' && blur) operations.push(`blur/${blur}x${blur}`);
    if (typeof sharpen !== 'undefined') operations.push(`sharpen/${sharpen}`);
    if (strip) operations.push('strip');
    if (interlace) operations.push(`interlace/${typeof interlace === 'number' ? interlace : 1}`);

    const query = operations.length ? `?imageMogr2/${operations.join('/')}` : '';
    return {
      url: joinURL(baseURL, src + query)
    };
  }
});

export type EdgeOnePagesProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function edgeonePagesProvider(options: EdgeOnePagesProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'edgeonePages');
}

export default providerSetup;
