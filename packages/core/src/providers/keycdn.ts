import { withBase, withQuery } from 'ufo';
import { cleanColor, configureProvider, defineProvider, mappedModifiers } from '../provider-utils.js';

// https://www.keycdn.com/support/image-processing
export interface KeyCDNProviderOptions {
  baseURL?: string;
}

const providerSetup = defineProvider<KeyCDNProviderOptions>({
  getImage: (src, { modifiers, baseURL = '' }) => {
    const query = mappedModifiers(
      {
        src,
        modifiers: Object.fromEntries(
          Object.entries(modifiers).map(([key, value]) => [key, typeof value === 'boolean' ? Number(value) : value])
        )
      },
      { background: 'bg' },
      {
        background: (value) => {
          const color = cleanColor(value);
          if (color === 'transparent') return '0,0,0,0';
          return typeof color === 'string' && /^[\da-f]{3}$/i.test(color) ? color.replace(/./g, '$&$&') : color;
        },
        format: (value) => {
          if (value === 'jpg') return 'jpeg';
          if (value !== 'jpeg' && value !== 'png' && value !== 'webp') {
            throw new Error(
              `[desource/image] [keycdn] Unsupported format "${String(value)}". Use jpeg, jpg, png, or webp.`
            );
          }
          return value;
        },
        position: (value) => (value === 'center' ? undefined : value)
      }
    );

    return { url: withQuery(withBase(src, baseURL), query) };
  }
});

export function keycdnProvider(options: KeyCDNProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'keycdn');
}

export default providerSetup;
