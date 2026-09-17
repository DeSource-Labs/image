import { getQuery, withBase, withQuery } from 'ufo';
import { configureProvider, defineProvider, mappedModifiers } from '../provider-utils.js';

// https://www.contentstack.com/docs/developers/apis/image-delivery-api
export interface ContentstackProviderOptions {
  baseURL?: string;
  /** Used when the source URL does not already specify an environment. */
  environment?: string;
}

const providerSetup = defineProvider<ContentstackProviderOptions>({
  getImage: (src, { modifiers, baseURL = '', environment }) => {
    const source = withBase(src, baseURL);
    const query = mappedModifiers(
      { src, modifiers },
      {},
      {
        fit: (value) => {
          if (value === 'cover' || value === 'crop') return 'crop';
          if (value === 'contain' || value === 'bounds') return 'bounds';
          throw new Error(
            `[desource/image] [contentstack] Unsupported fit "${value}". Use cover, contain, crop, or bounds.`
          );
        },
        format: (value) => {
          if (typeof value !== 'string') {
            throw new TypeError(
              '[desource/image] [contentstack] Format must be a string. Use jpeg, jpg, png, gif, webp, or avif.'
            );
          }
          if (value === 'jpeg' || value === 'jpg') return 'jpg';
          if (value === 'png' || value === 'gif' || value === 'webp' || value === 'avif') return value;
          throw new Error(
            `[desource/image] [contentstack] Unsupported format "${value}". Use jpeg, jpg, png, gif, webp, or avif.`
          );
        }
      },
      ['f']
    );

    query.environment = query.environment ?? getQuery(source).environment ?? environment;
    if (typeof query.environment !== 'string' || !query.environment.trim()) {
      throw new Error(
        '[desource/image] [contentstack] An environment is required. Include it in the source URL or configure contentstackProvider({ environment }).'
      );
    }

    // Native auto negotiation overrides format, which would invalidate picture MIME types.
    if (query.format !== undefined) query.auto = undefined;

    return { url: withQuery(source, query) };
  }
});

export function contentstackProvider(options: ContentstackProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'contentstack');
}

export default providerSetup;
