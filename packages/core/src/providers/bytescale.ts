import { parseURL, stringifyParsedURL, withBase, withQuery } from 'ufo';
import { configureProvider, defineProvider, mappedModifiers } from '../provider-utils.js';

// https://www.bytescale.com/docs/image-processing-api
export interface BytescaleProviderOptions {
  /** Bytescale delivery URL prefix for relative sources, including the account and /image or /raw. */
  baseURL?: string;
}

const fitMap: Record<string, string> = {
  cover: 'crop',
  contain: 'max',
  fill: 'stretch',
  inside: 'max',
  outside: 'min',
  'scale-down': 'shrink',
  crop: 'crop',
  max: 'max',
  min: 'min',
  shrink: 'shrink',
  'shrink-cover': 'shrink-cover',
  stretch: 'stretch',
  enlarge: 'enlarge',
  'enlarge-cover': 'enlarge-cover',
  width: 'width',
  height: 'height'
};

const providerSetup = defineProvider<BytescaleProviderOptions>({
  getImage: (src, { modifiers, baseURL = '' }) => {
    const source = parseURL(src.startsWith('//') ? src : withBase(src, baseURL));
    if (!/^\/[^/]+\/(?:raw|image)\/.+/.test(source.pathname)) {
      throw new Error(
        '[desource/image] [bytescale] Expected a Bytescale URL containing /{account}/raw/{file} or /{account}/image/{file}. Configure baseURL for relative file paths.'
      );
    }
    source.pathname = source.pathname.replace(/^(\/[^/]+)\/raw\//, '$1/image/');

    const query = mappedModifiers(
      {
        src,
        // Bytescale needs explicit false values, which the shared mapper otherwise omits.
        modifiers: Object.fromEntries(
          Object.entries(modifiers).map(([key, value]) => [key, typeof value === 'boolean' ? String(value) : value])
        )
      },
      { width: 'w', height: 'h', quality: 'q', format: 'f' },
      {
        fit: (value) => {
          if (typeof value !== 'string' || !Object.hasOwn(fitMap, value)) {
            throw new Error(
              '[desource/image] [bytescale] Unsupported fit. Use cover, contain, fill, inside, outside, scale-down, or a documented Bytescale fit mode.'
            );
          }
          return fitMap[value];
        },
        format: (value) => {
          if (typeof value !== 'string' || !['jpeg', 'jpg', 'png', 'gif', 'webp', 'avif'].includes(value)) {
            throw new Error(
              '[desource/image] [bytescale] Unsupported output format. Use jpeg, jpg, png, gif, webp, or avif.'
            );
          }
          return value === 'jpeg' ? 'jpg' : value;
        }
      },
      ['f']
    );

    // A format fallback could return bytes that disagree with a picture source's MIME type.
    if (query.f !== undefined) query.f2 = undefined;

    return { url: withQuery(stringifyParsedURL(source), query) };
  }
});

export function bytescaleProvider(options: BytescaleProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'bytescale');
}

export default providerSetup;
