import { parseURL, stringifyParsedURL } from 'ufo';
import { configureProvider, defineProvider } from '../provider-utils.js';
import type { ImageModifiers, ModifierValue } from '../types.js';

const defaultBaseURL = 'https://img.imageboss.me';
const coverModes = new Set([
  'smart',
  'attention',
  'entropy',
  'face',
  'north',
  'northeast',
  'east',
  'southeast',
  'south',
  'southwest',
  'west',
  'northwest',
  'center',
  'contain',
  'inside'
]);

// https://imageboss.me/docs
export interface ImageBossProviderOptions {
  /** ImageBoss endpoint or a custom HTTP(S) endpoint. */
  baseURL?: string;
  /** Dashboard source name, required for relative image paths. */
  source?: string;
  /** Default transformations, overridden by per-image modifiers. */
  modifiers?: ImageModifiers;
}

const providerSetup = defineProvider<ImageBossProviderOptions>({
  getImage: (src, { modifiers, baseURL = defaultBaseURL, source }) => {
    const endpoint = parseURL(baseURL);
    if (
      !endpoint.host ||
      !['http:', 'https:'].includes(endpoint.protocol ?? '') ||
      endpoint.auth ||
      endpoint.search ||
      endpoint.hash
    ) {
      throw new Error(
        '[desource/image] [imageboss] baseURL must be an HTTP(S) endpoint without credentials, query, or fragment.'
      );
    }
    const input = parseURL(src);
    let prefix = endpoint.pathname.replace(/\/+$/, '');
    let path = input.pathname.replace(/^\/+/, '');
    let operation = 'cdn';
    let dimensions: string | undefined;
    let options: Record<string, ModifierValue> = {};
    let output = { ...endpoint, search: input.search, hash: input.hash };

    if (input.host) {
      if (input.auth || (input.protocol && !['http:', 'https:'].includes(input.protocol))) {
        throw new Error(
          '[desource/image] [imageboss] Expected an unsigned ImageBoss delivery URL or a relative image path.'
        );
      }
      if (input.host === 'img.imageboss.me') prefix = '';
      else if (input.host !== endpoint.host || !input.pathname.startsWith(`${prefix}/`)) {
        throw new Error(
          '[desource/image] [imageboss] Use a relative image path or a URL on the configured ImageBoss endpoint.'
        );
      }
      const parts = input.pathname.slice(prefix.length + 1).split('/');
      source = parts.shift();
      operation = parts.shift() ?? '';
      if (
        !/^(cdn|width|height|cover(?::[a-z]+)?)$/.test(operation) ||
        (operation.startsWith('cover:') && !coverModes.has(operation.slice(6)))
      ) {
        throw new Error(
          '[desource/image] [imageboss] Expected a delivery URL containing a source and a documented operation.'
        );
      }
      if (operation !== 'cdn') {
        dimensions = parts.shift();
        const pattern = operation.startsWith('cover') ? /^[1-9]\d*x[1-9]\d*$/ : /^[1-9]\d*$/;
        if (!dimensions || !pattern.test(dimensions)) {
          throw new Error('[desource/image] [imageboss] Invalid dimensions in the delivery URL.');
        }
      }
      if (/^[a-z][\w-]*:/i.test(parts[0] ?? '')) {
        options = Object.fromEntries(
          parts
            .shift()!
            .split(',')
            .map((option) => {
              const colon = option.indexOf(':');
              return [option.slice(0, colon), decodeURIComponent(option.slice(colon + 1))];
            })
        );
      }
      path = parts.join('/');
      output = input;
    }
    if (!source || !/^[\w-]+$/.test(source)) {
      throw new Error('[desource/image] [imageboss] Configure a valid source name for relative image paths.');
    }
    if (!path) throw new Error('[desource/image] [imageboss] An image path is required.');
    if (new URLSearchParams(input.search).has('bossToken')) {
      if (input.host && Object.values(modifiers).every((value) => value === undefined || value === null)) {
        return { url: src };
      }
      throw new Error(
        '[desource/image] [imageboss] Signed URLs cannot be transformed. Use an unsigned source and sign each final URL on the server.'
      );
    }

    const { width, height, fit, position, background, f, ...nativeOptions } = modifiers;
    const w = positiveInteger(width, 'width');
    const h = positiveInteger(height, 'height');
    if (w && h) {
      if (!operation.startsWith('cover')) operation = 'cover';
      dimensions = `${w}x${h}`;
    } else if (w) {
      operation = 'width';
      dimensions = String(w);
    } else if (h) {
      operation = 'height';
      dimensions = String(h);
    }

    if (fit != null && !['cover', 'contain', 'inside'].includes(fit)) {
      throw new Error('[desource/image] [imageboss] Unsupported fit. Use cover, contain, or inside.');
    }
    if (
      position != null &&
      (typeof position !== 'string' ||
        !coverModes.has(position.toLowerCase()) ||
        ['contain', 'inside'].includes(position.toLowerCase()))
    ) {
      throw new Error('[desource/image] [imageboss] Unsupported crop position. Use a documented cover mode.');
    }
    if (operation.startsWith('cover')) {
      if (fit === 'contain' || fit === 'inside') operation = `cover:${fit}`;
      else if (position != null) operation = `cover:${position.toLowerCase()}`;
      else if (fit === 'cover') operation = 'cover';
    }

    options = { ...options, ...nativeOptions };
    if (f != null && nativeOptions.format == null) options.format = f;
    if (background != null) options['fill-color'] = background;
    if (options['fill-color'] != null) {
      const color = String(options['fill-color']).replace(/^#/, '');
      if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(color)) {
        throw new Error('[desource/image] [imageboss] Background must be a three- or six-digit RGB hex color.');
      }
      options['fill-color'] = color.length === 3 ? color.replace(/./g, '$&$&') : color;
    }
    if (options.format != null) {
      if (
        typeof options.format !== 'string' ||
        !['auto', 'jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'].includes(options.format)
      ) {
        throw new Error(
          '[desource/image] [imageboss] Unsupported image format. Use auto, jpg, jpeg, png, webp, avif, tiff, or gif.'
        );
      }
      if (options.format === 'jpeg') options.format = 'jpg';
    }
    const serialized = Object.entries(options)
      .filter(([, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        if (
          !/^[a-z][\w-]*$/i.test(key) ||
          !['string', 'number', 'boolean'].includes(typeof value) ||
          (typeof value === 'number' && !Number.isFinite(value))
        ) {
          throw new Error('[desource/image] [imageboss] Options must have simple names and finite scalar values.');
        }
        return `${key}:${encodeURIComponent(String(value))}`;
      })
      .join(',');
    // Encode raw path characters without turning existing escapes into different file names.
    const encodedPath = path
      .split('/')
      .map((part) => encodeURIComponent(part).replace(/%25([\da-f]{2})/gi, '%$1'))
      .join('/');
    output.pathname = `${prefix}/${source}/${[operation, dimensions, serialized].filter(Boolean).join('/')}/${encodedPath}`;
    return { url: stringifyParsedURL(output) };
  }
});

function positiveInteger(value: ModifierValue, name: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  const number = typeof value === 'string' && value.trim() ? Number(value) : value;
  if (typeof number !== 'number' || !Number.isSafeInteger(number) || number < 1) {
    throw new Error(`[desource/image] [imageboss] ${name} must be a positive integer.`);
  }
  return number;
}

export function imagebossProvider(options: ImageBossProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'imageboss');
}

export default providerSetup;
