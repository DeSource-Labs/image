import { getQuery, parseURL, stringifyParsedURL, withBase, withQuery } from 'ufo';
import { configureProvider, defineProvider, mappedModifiers } from '../provider-utils.js';
import type { ModifierValue } from '../types.js';

// https://appwrite.io/docs/products/storage/images
export interface AppwriteProviderOptions {
  /** Appwrite URL prefix for relative sources, such as an API endpoint including /v1. */
  baseURL?: string;
  /** Used when the source URL does not already specify a project. */
  projectId?: string;
}

const providerSetup = defineProvider<AppwriteProviderOptions>({
  getImage: (src, { modifiers, baseURL = '', projectId }) => {
    const source = parseURL(src.startsWith('//') ? src : withBase(src, baseURL));
    if (!/\/storage\/buckets\/[^/]+\/files\/[^/]+\/(?:view|preview)\/?$/.test(source.pathname)) {
      throw new Error(
        '[desource/image] [appwrite] Expected a Storage file URL ending in /storage/buckets/{bucket}/files/{file}/view or /preview.'
      );
    }
    source.pathname = source.pathname.replace(/\/(?:view|preview)\/?$/, '/preview');
    const preview = stringifyParsedURL(source);

    if (modifiers.fit !== undefined && modifiers.fit !== null) {
      throw new Error(
        '[desource/image] [appwrite] The fit modifier is not supported. Use width, height, and the native gravity modifier to control cropping.'
      );
    }

    const query = {
      ...getQuery(preview),
      ...mappedModifiers({ src, modifiers }, {}, {}, ['format', 'f', 'position', 'blur'])
    };
    query.project ??= projectId;
    if (typeof query.project !== 'string' || !query.project.trim()) {
      throw new Error(
        '[desource/image] [appwrite] A project is required. Include it in the source URL or configure appwriteProvider({ projectId }).'
      );
    }

    normalizeDimensions(query);

    const output = modifiers.format ?? modifiers.f ?? query.output;
    if (output !== undefined && output !== null) {
      if (typeof output !== 'string' || !['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic'].includes(output)) {
        throw new Error(
          '[desource/image] [appwrite] Unsupported output format. Use jpeg, jpg, png, gif, webp, avif, or heic supported by your deployment.'
        );
      }
      query.output = output === 'jpeg' ? 'jpg' : output;
    }

    return { url: withQuery(preview, query) };
  }
});

function normalizeDimensions(query: Record<string, ModifierValue>): void {
  for (const dimension of ['width', 'height'] as const) {
    const value = query[dimension];
    if (value === undefined) continue;
    const number = typeof value === 'string' && value.trim() ? Number(value) : value;
    if (typeof number !== 'number' || !Number.isInteger(number) || number < 0 || number > 4000) {
      throw new RangeError(`[desource/image] [appwrite] ${dimension} must be an integer between 0 and 4000.`);
    }
    query[dimension] = number;
  }
}

export function appwriteProvider(options: AppwriteProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'appwrite');
}

export default providerSetup;
