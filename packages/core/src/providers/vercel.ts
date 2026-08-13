import { stringifyQuery } from 'ufo';
import { isDevelopment } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

// https://vercel.com/docs/build-output-api/v3/configuration#images

interface VercelOptions {
  baseURL?: string;
  formats?: readonly string[];
  modifiers?: {
    quality?: string | number;
  };
}

const providerSetup = defineProvider<VercelOptions>({
  validateDomains: true,
  getImage: (src, { modifiers, baseURL = '/_vercel/image' }, ctx) => {
    const validWidths = Object.values(ctx.options.screens || {}).sort((a, b) => a - b);
    const largestWidth = validWidths[validWidths.length - 1] || 0;
    let width = Number(modifiers?.width || 0);

    if (!width) {
      width = largestWidth;
      if (isDevelopment()) {
        console.warn(
          `A defined width should be provided to use the \`vercel\` provider. Defaulting to \`${largestWidth}\`. Warning originated from \`${src}\`.`
        );
      }
    } else if (!validWidths.includes(width)) {
      width = validWidths.find((validWidth) => validWidth > width) || largestWidth;
      if (isDevelopment()) {
        console.warn(
          `The width being used (\`${modifiers?.width}\`) should be added to \`image.screens\`. Defaulting to \`${width}\`. Warning originated from \`${src}\`.`
        );
      }
    }

    return {
      url:
        baseURL +
        '?' +
        stringifyQuery({
          url: src,
          w: String(width),
          q: String(modifiers?.quality || '100')
        })
    };
  }
});

export interface VercelProviderOptions extends Partial<ProviderOptionsOf<typeof providerSetup>> {
  path?: string;
  defaultQuality?: number;
}

export function vercelProvider(options: VercelProviderOptions = {}) {
  const { path, defaultQuality, ...defaults } = options;
  return configureProvider(
    providerSetup,
    {
      ...defaults,
      baseURL: defaults.baseURL ?? path,
      modifiers: { ...defaults.modifiers, quality: defaults.modifiers?.quality ?? defaultQuality }
    },
    'vercel'
  );
}

export default providerSetup;
