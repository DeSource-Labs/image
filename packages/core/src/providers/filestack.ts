import { configureProvider, defineProvider } from '../provider-utils.js';
import type { ImageModifiers, ModifierValue } from '../types.js';

const defaultBaseURL = 'https://cdn.filestackcontent.com';
const identifier = /^[\w-]+$/;

// https://www.filestack.com/docs/api/processing/
export interface FilestackProviderOptions {
  /** Filestack CDN origin or a configured custom domain. */
  baseURL?: string;
  /** Public application API key, required for external URLs and storage aliases. */
  apiKey?: string;
  /** Default transformations, overridden by per-image modifiers. */
  modifiers?: ImageModifiers;
  /** Server-only hook that authorizes the final URL, including every responsive variant. */
  signURL?: (url: string) => string;
}

const providerSetup = defineProvider<FilestackProviderOptions>({
  acceptsOpaqueSource: true,
  getImage: (src, { modifiers, baseURL = defaultBaseURL, apiKey, signURL }) => {
    const origin = parseBaseURL(baseURL);
    const source = parseSource(src, origin);
    const parts = [origin];
    if (source.external) {
      if (!apiKey || !identifier.test(apiKey)) {
        throw new Error(
          '[desource/image] [filestack] A valid public apiKey is required for external URLs and storage aliases.'
        );
      }
      parts.push(apiKey);
    }
    parts.push(...serializeTasks(modifiers), source.value);
    const url = parts.join('/');
    return { url: signURL ? signURL(url) : url };
  }
});

function parseBaseURL(baseURL: string): string {
  const url = parseHttpURL(baseURL);
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error(
      '[desource/image] [filestack] baseURL must be an HTTP(S) origin without a path, query, or fragment.'
    );
  }
  return url.origin;
}

function parseHttpURL(value: string): URL {
  let url: URL;
  try {
    url = new URL(value.startsWith('//') ? `https:${value}` : value);
  } catch {
    throw new Error('[desource/image] [filestack] Expected a valid HTTP(S) URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('[desource/image] [filestack] Expected an HTTP(S) URL without credentials.');
  }
  return url;
}

function parseSource(src: string, origin: string): { value: string; external: boolean } {
  if (/^https?:\/\//i.test(src) || src.startsWith('//')) {
    const url = parseHttpURL(src);
    if (url.origin === origin || url.hostname === 'cdn.filestackcontent.com') {
      const handle = url.pathname.slice(1);
      if (!identifier.test(handle) || url.search || url.hash) {
        throw new Error(
          '[desource/image] [filestack] Use an unsigned, untransformed CDN URL containing only a file handle. Authorize the final URL with signURL on the server.'
        );
      }
      return { value: handle, external: false };
    }
    return { value: encodeSource(src.startsWith('//') ? `https:${src}` : src), external: true };
  }
  if (/^src:\/\/[\w-]+(?:\/[^\s]*)?$/.test(src)) {
    return { value: encodeSource(src), external: true };
  }
  const handle = src.startsWith('/') ? src.slice(1) : src;
  if (!identifier.test(handle)) {
    throw new Error(
      '[desource/image] [filestack] Expected a file handle, an unsigned CDN URL, an external HTTP(S) URL, or a src:// storage alias.'
    );
  }
  return { value: handle, external: false };
}

function encodeSource(source: string): string {
  // Filestack's b64:// source syntax keeps embedded queries and task delimiters
  // separate from the outer transformation URL. Encode UTF-8 in browsers and Node.
  let binary = '';
  for (const byte of new TextEncoder().encode(source)) binary += String.fromCodePoint(byte);
  return `b64://${btoa(binary).replaceAll('+', '-').replaceAll('/', '_')}`;
}

const fitMap: Record<string, string> = {
  cover: 'crop',
  contain: 'clip',
  fill: 'scale',
  inside: 'max',
  'scale-down': 'max',
  clip: 'clip',
  crop: 'crop',
  scale: 'scale',
  max: 'max'
};

function serializeTasks(modifiers: ImageModifiers): string[] {
  const width = integerModifier(modifiers.width, 'width', 10000);
  const height = integerModifier(modifiers.height, 'height', 10000);
  const resize: string[] = [];
  if (width !== undefined) resize.push(`width:${width}`);
  if (height !== undefined) resize.push(`height:${height}`);
  if (modifiers.fit !== undefined && modifiers.fit !== null) {
    const fit = Object.hasOwn(fitMap, modifiers.fit) ? fitMap[modifiers.fit] : undefined;
    if (!fit)
      throw new Error(
        '[desource/image] [filestack] Unsupported fit. Use cover, contain, fill, inside, scale-down, clip, crop, scale, or max.'
      );
    if (!width && !height) throw new Error('[desource/image] [filestack] A fit requires width or height.');
    if ((fit === 'crop' || fit === 'scale') && (!width || !height)) {
      throw new Error('[desource/image] [filestack] Crop and scale fits require both width and height.');
    }
    resize.push(`fit:${fit}`);
  }

  const tasks: string[] = [];
  if (resize.length) tasks.push(`resize=${resize.join(',')}`);
  const output: string[] = [];
  const format = modifiers.format ?? modifiers.f;
  if (format !== undefined && format !== null) {
    if (typeof format !== 'string' || !['jpeg', 'jpg', 'png', 'webp', 'avif'].includes(format)) {
      throw new Error('[desource/image] [filestack] Unsupported output format. Use jpeg, jpg, png, webp, or avif.');
    }
    output.push(`format:${format === 'jpeg' ? 'jpg' : format}`);
  }
  const quality = modifiers.quality === 'input' ? 'input' : integerModifier(modifiers.quality, 'quality', 100);
  if (quality !== undefined) output.push(`quality:${quality}`);
  if (output.length) tasks.push(`output=${output.join(',')}`);
  return tasks;
}

function integerModifier(value: ModifierValue, name: string, max: number): number | undefined {
  if (value === undefined || value === null) return undefined;
  const number = typeof value === 'string' && value.trim() ? Number(value) : value;
  if (typeof number !== 'number' || !Number.isInteger(number) || number < 1 || number > max) {
    throw new RangeError(`[desource/image] [filestack] ${name} must be an integer between 1 and ${max}.`);
  }
  return number;
}

export function filestackProvider(options: FilestackProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'filestack');
}

export default providerSetup;
