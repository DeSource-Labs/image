import { joinURL, encodePath, encodeParam } from 'ufo';
import type { ImageModifiers } from '../types.js';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

import type { HTTPStorageOptions, NodeFSSOptions, IPXOptions as CoreIPXOptions } from 'ipx';

export interface IPXRuntimeConfig extends Omit<CoreIPXOptions, 'storage' | 'httpStorage'> {
  http: HTTPStorageOptions;
  fs: NodeFSSOptions;
  baseURL: string;
}

// Reference: https://github.com/unjs/ipx?tab=readme-ov-file#modifiers
export interface IPXModifiers extends Omit<ImageModifiers, 'fit' | 'format' | 'blur'> {
  format: 'jpeg' | 'jpg' | 'png' | 'webp' | 'avif' | 'gif' | 'heif' | 'tiff' | 'auto' | (string & {});
  fit: 'contain' | 'cover' | 'fill' | 'inside' | 'outside' | (string & {});
  resize: string;
  quality: number | string;
  background: string;
  position: string;
  enlarge: true | 'true';
  kernel: 'nearest' | 'cubic' | 'mitchell' | 'lanczos2' | 'lanczos3' | (string & {});
  trim: number | string;
  extend: string;
  extract: string;
  crop: string;
  rotate: number | string;
  flip: true | 'true';
  flop: true | 'true';
  sharpen: number | string;
  median: number | string;
  blur: number | string;
  flatten: true | 'true';
  gamma: string;
  negate: true | 'true';
  normalize: true | 'true';
  threshold: number | string;
  modulate: string;
  tint: number | string;
  grayscale: true | 'true';
  animated: true | 'true';
}

export interface IPXOptions extends Omit<IPXRuntimeConfig, 'alias'> {
  modifiers: Partial<IPXModifiers>;
}

export const operationsGenerator = createOperationsGenerator({
  keyMap: {
    format: 'f',
    width: 'w',
    height: 'h',
    resize: 's',
    quality: 'q',
    background: 'b',
    position: 'pos'
  },
  formatter: (key, val: string | number | boolean) => encodeParam(key) + '_' + encodeParam(val.toString())
});

const providerSetup = defineProvider<Partial<IPXOptions>>({
  validateDomains: true,
  supportsAlias: true,
  getImage: (src, { modifiers, baseURL }, ctx) => {
    if (modifiers.width && modifiers.height) {
      modifiers.resize = `${modifiers.width}x${modifiers.height}`;
      delete modifiers.width;
      delete modifiers.height;
    }

    const params = operationsGenerator(modifiers) || '_';

    if (!baseURL) {
      baseURL = joinURL(ctx.options.baseURL, '/_ipx');
    }

    return {
      url: joinURL(baseURL, params, encodePath(src))
    };
  }
});

export interface IpxProviderOptions extends Partial<ProviderOptionsOf<typeof providerSetup>> {
  path?: string;
}

export function ipxProvider(options: IpxProviderOptions = {}) {
  const { path, ...defaults } = options;
  return configureProvider(providerSetup, { ...defaults, baseURL: defaults.baseURL ?? path }, 'ipx');
}

export default providerSetup;
