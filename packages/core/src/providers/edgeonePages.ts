import { joinURL } from 'ufo';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';
import type { ImageModifiers } from '../types.js';

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

function encodeColor(color: string): string {
  const hex = color.startsWith('#') ? color.slice(1) : color;
  const bytes = new TextEncoder().encode(hex);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte);
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function appendThumbnail(
  operations: string[],
  { width, height, fit }: Pick<EdgeOnePagesModifiers, 'width' | 'height' | 'fit'>
): void {
  if (!width && !height) {
    return;
  }

  const dimensions = `${width ?? ''}x${height ?? ''}`;
  const fitSuffix = fit ? (fitMap[fit] ?? '') : '';
  if (fitSuffix === 'r') {
    operations.push(`thumbnail/!${dimensions}r`);
  } else if (fitSuffix === '!') {
    operations.push(`thumbnail/${dimensions}!`);
  } else {
    operations.push(`thumbnail/${dimensions}`);
  }
}

function appendPadding(
  operations: string[],
  { pad, background, width, height }: Pick<EdgeOnePagesModifiers, 'pad' | 'background' | 'width' | 'height'>
): void {
  if (!pad && !(background && (width || height))) {
    return;
  }

  operations.push('pad/1');
  if (background) {
    operations.push(`color/${encodeColor(background)}`);
  }
}

function appendCrop(
  operations: string[],
  { crop, gravity, dx, dy }: Pick<EdgeOnePagesModifiers, 'crop' | 'gravity' | 'dx' | 'dy'>
): void {
  if (!crop) {
    return;
  }

  operations.push(`crop/${crop}`);
  if (gravity) operations.push(`gravity/${gravity}`);
  if (dx !== undefined) operations.push(`dx/${dx}`);
  if (dy !== undefined) operations.push(`dy/${dy}`);
}

function appendDefinedOperation(operations: string[], name: string, value: number | string | undefined): void {
  if (value !== undefined) {
    operations.push(`${name}/${value}`);
  }
}

function buildOperations(modifiers: Partial<EdgeOnePagesModifiers>): string[] {
  const operations: string[] = [];
  appendThumbnail(operations, modifiers);
  appendPadding(operations, modifiers);
  appendCrop(operations, modifiers);

  appendDefinedOperation(operations, 'iradius', modifiers.iradius);
  if (modifiers.scrop) operations.push(`scrop/${modifiers.scrop}`);
  appendDefinedOperation(operations, 'rotate', modifiers.rotate);
  if (modifiers.autoOrient) operations.push('auto-orient');
  appendDefinedOperation(operations, 'quality', modifiers.quality);
  if (modifiers.format) operations.push(`format/${modifiers.format === 'jpeg' ? 'jpg' : modifiers.format}`);
  if (modifiers.blur) operations.push(`blur/${modifiers.blur}x${modifiers.blur}`);
  appendDefinedOperation(operations, 'sharpen', modifiers.sharpen);
  if (modifiers.strip) operations.push('strip');
  if (modifiers.interlace) {
    operations.push(`interlace/${typeof modifiers.interlace === 'number' ? modifiers.interlace : 1}`);
  }

  return operations;
}

const providerSetup = defineProvider<EdgeOnePagesOptions>({
  getImage: (src, { modifiers = {}, baseURL }) => {
    if (!baseURL) {
      throw new Error('EdgeOne Pages provider requires baseURL to be set');
    }

    const operations = buildOperations(modifiers);
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
