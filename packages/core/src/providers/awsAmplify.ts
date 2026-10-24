import { encodeQueryItem, joinURL } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, resolveProviderWidth, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    width: 'w',
    height: 'h',
    quality: 'q',
    trim: 'trim',
    extend: 'extend',
    extract: 'extract',
    rotate: 'rotate',
    flip: 'flip',
    flop: 'flop',
    sharpen: 'sharpen',
    median: 'median',
    blur: 'blur',
    gamma: 'gamma',
    negate: 'negate',
    normalize: 'normalize',
    threshold: 'threshold',
    tint: 'tint',
    grayscale: 'grayscale'
  },
  valueMap: {
    format: {
      jpg: 'jpeg',
      jpeg: 'jpeg',
      webp: 'webp',
      avif: 'avif',
      png: 'png'
    },
    fit: {
      cover: 'cover',
      contain: 'contain',
      fill: 'fill',
      inside: 'inside',
      outside: 'outside'
    },
    position: {
      center: 'center',
      top: 'top',
      right: 'right',
      bottom: 'bottom',
      left: 'left'
    }
  }
});

interface AmplifyOptions {
  baseURL?: string;
  formats?: readonly string[];
  modifiers?: {
    quality?: string | number;
  };
}

const providerSetup = defineProvider<AmplifyOptions>({
  validateDomains: true,
  getImage: (src, { modifiers, baseURL = '/_amplify/image' }, ctx) => {
    const width = resolveProviderWidth('awsAmplify', src, modifiers?.width, ctx.options.screens);

    const operations = operationsGenerator({
      ...modifiers,
      width: String(width),
      quality: String(modifiers?.quality || '100')
    } as Parameters<typeof operationsGenerator>[0]);

    return {
      url: joinURL(baseURL + `?${encodeQueryItem('url', src)}` + (operations ? `&${operations}` : ''))
    };
  }
});

export interface AwsAmplifyProviderOptions extends Partial<ProviderOptionsOf<typeof providerSetup>> {
  path?: string;
  defaultQuality?: number;
}

export function awsAmplifyProvider(options: AwsAmplifyProviderOptions = {}) {
  const { path, defaultQuality, ...defaults } = options;
  return configureProvider(
    providerSetup,
    {
      ...defaults,
      baseURL: defaults.baseURL ?? path,
      modifiers: { ...defaults.modifiers, quality: defaults.modifiers?.quality ?? defaultQuality }
    },
    'awsAmplify'
  );
}

export default providerSetup;
