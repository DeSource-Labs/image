import { parseURL, stringifyParsedURL } from 'ufo';
import { configureProvider, defineProvider } from '../provider-utils.js';
import type { ImageModifiers, ModifierValue } from '../types.js';
import { stripTrailingSlashes } from '../utils.js';

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
    const image = parseSource(src, baseURL, source);
    if (!image.source || !/^[\w-]+$/.test(image.source)) {
      invalid('Configure a valid source name for relative image paths.');
    }
    const path = encodeImagePath(image.path);
    if (new URLSearchParams(image.output.search).has('bossToken')) {
      if (image.isDelivery && Object.values(modifiers).every((value) => value === undefined || value === null)) {
        return { url: src };
      }
      invalid('Signed URLs cannot be transformed. Use an unsigned source and sign each final URL on the server.');
    }

    const { width, height, fit, position, background, f, ...nativeOptions } = modifiers;
    const resize = selectOperation(image.operation, image.dimensions, width, height);
    const operation = coverOperation(resize.operation, fit, position);
    const options: Record<string, ModifierValue> = { ...image.options, ...nativeOptions };
    if (f != null && nativeOptions.format == null) options.format = f;
    if (background != null) options['fill-color'] = background;
    const serialized = serializeOptions(options);
    image.output.pathname = `${image.prefix}/${image.source}/${[operation, resize.dimensions, serialized].filter(Boolean).join('/')}/${path}`;
    return { url: stringifyParsedURL(image.output) };
  }
});

function parseEndpoint(baseURL: string) {
  const endpoint = parseURL(baseURL);
  if (
    !endpoint.host ||
    !['http:', 'https:'].includes(endpoint.protocol ?? '') ||
    endpoint.auth ||
    endpoint.search ||
    endpoint.hash
  ) {
    invalid('baseURL must be an HTTP(S) endpoint without credentials, query, or fragment.');
  }
  return endpoint;
}

function parseSource(src: string, baseURL: string, source?: string) {
  const endpoint = parseEndpoint(baseURL);
  const input = parseURL(src);
  let prefix = stripTrailingSlashes(endpoint.pathname);
  if (!input.host) {
    return {
      output: { ...endpoint, search: input.search, hash: input.hash },
      isDelivery: false,
      prefix,
      source,
      path: input.pathname.replace(/^\/+/, ''),
      operation: 'cdn',
      dimensions: undefined,
      options: {}
    };
  }
  if (input.auth || (input.protocol && !['http:', 'https:'].includes(input.protocol))) {
    invalid('Expected an unsigned ImageBoss delivery URL or a relative image path.');
  }
  if (input.host === 'img.imageboss.me') prefix = '';
  else if (input.host !== endpoint.host || !input.pathname.startsWith(`${prefix}/`)) {
    invalid('Use a relative image path or a URL on the configured ImageBoss endpoint.');
  }
  return { output: input, isDelivery: true, prefix, ...parseDeliveryPath(input.pathname.slice(prefix.length + 1)) };
}

function parseDeliveryPath(path: string) {
  const parts = path.split('/');
  const source = parts.shift();
  const operation = parts.shift() ?? '';
  if (
    !/^(cdn|width|height|cover(?::[a-z]+)?)$/.test(operation) ||
    (operation.startsWith('cover:') && !coverModes.has(operation.slice(6)))
  ) {
    invalid('Expected a delivery URL containing a source and a documented operation.');
  }
  let dimensions: string | undefined;
  if (operation !== 'cdn') {
    dimensions = parts.shift();
    const pattern = operation.startsWith('cover') ? /^[1-9]\d*x[1-9]\d*$/ : /^[1-9]\d*$/;
    if (!dimensions || !pattern.test(dimensions)) invalid('Invalid dimensions in the delivery URL.');
  }
  const options = /^[a-z][\w-]*:/i.test(parts[0] ?? '') ? parseOptions(parts.shift()!) : {};
  return { source, operation, dimensions, options, path: parts.join('/') };
}

function parseOptions(segment: string): Record<string, string> {
  return Object.fromEntries(
    segment.split(',').map((option): [string, string] => {
      const colon = option.indexOf(':');
      const key = option.slice(0, colon);
      if (colon < 1 || !/^[a-z][\w-]*$/i.test(key)) invalid('Invalid option in the delivery URL.');
      try {
        return [key, decodeURIComponent(option.slice(colon + 1))];
      } catch {
        invalid('Invalid option encoding in the delivery URL.');
      }
    })
  );
}

function encodeImagePath(path: string): string {
  if (!path) invalid('An image path is required.');
  return path
    .split('/')
    .map((part) => {
      if (/^(?:\.|%2e){1,2}$/i.test(part)) invalid('Image paths cannot contain dot segments.');
      // Preserve existing escapes so they still identify the same file.
      return encodeURIComponent(part).replace(/%25([\da-f]{2})/gi, '%$1');
    })
    .join('/');
}

function selectOperation(
  operation: string,
  dimensions: string | undefined,
  width: ModifierValue,
  height: ModifierValue
) {
  const w = positiveInteger(width, 'width');
  const h = positiveInteger(height, 'height');
  if (w && h) return { operation: operation.startsWith('cover') ? operation : 'cover', dimensions: `${w}x${h}` };
  if (w) return { operation: 'width', dimensions: String(w) };
  if (h) return { operation: 'height', dimensions: String(h) };
  return { operation, dimensions };
}

function coverOperation(operation: string, fit?: string, position?: string): string {
  if (fit != null && !['cover', 'contain', 'inside'].includes(fit)) {
    invalid('Unsupported fit. Use cover, contain, or inside.');
  }
  if (
    position != null &&
    (typeof position !== 'string' ||
      !coverModes.has(position.toLowerCase()) ||
      ['contain', 'inside'].includes(position.toLowerCase()))
  ) {
    invalid('Unsupported crop position. Use a documented cover mode.');
  }
  if (!operation.startsWith('cover')) return operation;
  if (fit === 'contain' || fit === 'inside') return `cover:${fit}`;
  if (position != null) return `cover:${position.toLowerCase()}`;
  return fit === 'cover' ? 'cover' : operation;
}

function serializeOptions(options: Record<string, ModifierValue>): string {
  if (options['fill-color'] != null) {
    const color = stringifyOption(options['fill-color']).replace(/^#/, '');
    if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(color)) {
      invalid('Background must be a three- or six-digit RGB hex color.');
    }
    options['fill-color'] = color.length === 3 ? color.replace(/./g, '$&$&') : color;
  }
  if (options.format != null) {
    if (
      typeof options.format !== 'string' ||
      !['auto', 'jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'].includes(options.format)
    ) {
      invalid('Unsupported image format. Use auto, jpg, jpeg, png, webp, avif, tiff, or gif.');
    }
    if (options.format === 'jpeg') options.format = 'jpg';
  }
  return Object.keys(options)
    .sort((a, b) => {
      // URL option order must not depend on the runtime locale.
      if (a < b) return -1;
      return a > b ? 1 : 0;
    })
    .flatMap((key) => {
      const value = options[key];
      if (value == null) return [];
      if (!/^[a-z][\w-]*$/i.test(key)) invalid('Options must have simple names and finite scalar values.');
      return `${key}:${encodeURIComponent(stringifyOption(value))}`;
    })
    .join(',');
}

function stringifyOption(value: ModifierValue): string {
  if (
    typeof value !== 'string' &&
    typeof value !== 'boolean' &&
    (typeof value !== 'number' || !Number.isFinite(value))
  ) {
    invalid('Options must have simple names and finite scalar values.');
  }
  return String(value);
}

function positiveInteger(value: ModifierValue, name: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  const number = typeof value === 'string' && value.trim() ? Number(value) : value;
  if (typeof number !== 'number' || !Number.isSafeInteger(number) || number < 1) {
    invalid(`${name} must be a positive integer.`);
  }
  return number;
}

function invalid(message: string): never {
  throw new Error(`[desource/image] [imageboss] ${message}`);
}

export function imagebossProvider(options: ImageBossProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'imageboss');
}

export default providerSetup;
