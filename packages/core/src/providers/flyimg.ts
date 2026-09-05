// https://docs.flyimg.io/url-options/

import { joinURL, hasProtocol } from 'ufo';
import { createOperationsGenerator, isDevelopment } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

/**
 * Flyimg URL format:
 * https://flyimg.example.com/{processType}/{image_options}/{path_to_image}
 *
 * Example:
 * https://demo.flyimg.io/upload/w_300,h_200,q_85/https://example.com/image.jpg
 */
const operationsGenerator = createOperationsGenerator({
  keyMap: {
    // Core dimensions
    width: 'w',
    height: 'h',
    quality: 'q',
    format: 'o',
    rotate: 'r',

    // Cropping
    crop: 'c',
    gravity: 'g',

    // WebP
    webpLossless: 'webpl',
    webpMethod: 'webpm',

    // JPEG XL
    jxlEffort: 'jxlef',
    jxlDecodingSpeed: 'jxlds',

    // Cache
    refresh: 'rf',
    version: 'v',

    // Text / Watermark
    text: 't',
    textColor: 'tc',
    textSize: 'ts',
    textBackground: 'tbg',

    // Image Processing
    background: 'bg',
    strip: 'st',
    autoOrient: 'ao',
    resize: 'rz',
    mozjpeg: 'moz',
    unsharp: 'unsh',
    sharpen: 'sh',
    blur: 'blr',
    filter: 'f',
    scale: 'sc',
    samplingFactor: 'sf',
    preserveAspectRatio: 'par',
    preserveNaturalSize: 'pns',

    // Advanced
    faceCrop: 'fc',
    faceCropPosition: 'fcp',
    faceBlur: 'fb',
    smartCrop: 'smc',
    colorspace: 'clsp',
    monochrome: 'mnchr',

    // PDF
    pdfPage: 'pdfp',
    density: 'dnst',

    // Video
    videoTime: 'tm',

    // Extract
    extract: 'e',
    extractTopX: 'p1x',
    extractTopY: 'p1y',
    extractBottomX: 'p2x',
    extractBottomY: 'p2y',

    // Other
    extent: 'ett',
    gifFrame: 'gf'
  },
  valueMap: {
    // Booleans become 0 / 1
    crop: Number,
    webpLossless: Number,
    refresh: Number,
    autoOrient: Number,
    resize: Number,
    scale: Number,
    faceCrop: Number,
    faceBlur: Number,
    smartCrop: Number,
    monochrome: Number,
    extract: Number,
    // Inverted-defaults (strip/mozjpeg/par/pns default ON on the server;
    // we only emit them when explicitly set to false — see getImage pre-processing)
    strip: Number,
    mozjpeg: Number,
    preserveAspectRatio: Number,
    preserveNaturalSize: Number,
    // Encode colours so # does not break the URL path segment
    background: (value: string) => (value.startsWith('#') ? value.replace('#', '%23') : value),
    textColor: (value: string) => (value.startsWith('#') ? value.replace('#', '%23') : value),
    textBackground: (value: string) => (value.startsWith('#') ? value.replace('#', '%23') : value),
    // Encode text watermarks
    text: (value: string) => encodeURIComponent(value)
  },
  joinWith: ',',
  formatter: (key, value) => `${key}_${value}`
});

interface FlyimgOptions {
  /**
   * Base URL of the Flyimg server.
   *
   * For the official Flyimg SaaS each instance gets a unique subdomain:
   * `https://img-abc123.flyimg.io`
   *
   * For self-hosted instances use the URL of your deployment,
   * e.g. `https://images.example.com`.
   */
  baseURL: string;

  /**
   * Public base URL of your website.
   *
   * Only applied to **relative** image paths (e.g. `/images/photo.jpg`) —
   * the value is prepended to produce an absolute URL that Flyimg can fetch.
   * Absolute `src` values (e.g. from a CDN) are passed through unchanged and
   * this option has no effect for those.
   *
   * Example: `https://www.example.com`
   */
  sourceURL?: string;

  /**
   * Flyimg process type.
   *
   * - `upload` (default): fetch, transform, cache and serve the image.
   * - `path`: same as upload but returns the path to the cached image as a
   *   plain-text response body instead of serving the image directly.
   *
   * @default 'upload'
   */
  processType?: 'upload' | 'path';
}

type FlyimgModifierValue = string | number | boolean;
type ResolvedFlyimgModifiers = Partial<Record<string, FlyimgModifierValue>>;

function isDisabled(value: unknown): boolean {
  return value === false || value === 0 || value === '0';
}

function applyFit(modifiers: ResolvedFlyimgModifiers, fit: unknown, preserveAspectRatio: unknown): void {
  // Flyimg default behaviour when width + height are given — no extra flags needed
  // so we don't need to handle 'inside' or 'contain' explicitly.
  switch (fit) {
    case 'cover':
      // Crop to fill the target rectangle (Flyimg: c_1)
      if (!modifiers.crop) modifiers.crop = true;
      break;
    case 'fill':
      // Stretch to fill — disable aspect-ratio preservation (Flyimg: par_0)
      if (preserveAspectRatio !== false) modifiers.preserveAspectRatio = false;
      break;
    case 'outside':
      if (isDevelopment()) {
        console.warn('[nuxt] [image] [flyimg] fit="outside" is not supported by Flyimg and will be ignored.');
      }
      break;
  }
}

/**
 * Strip / mozjpeg / preserveAspectRatio / preserveNaturalSize default to
 * 1 (enabled) in Flyimg, so we only need to emit them when explicitly
 * disabled. Treat boolean false, numeric 0, and string '0' as opt-out.
 */
function applyInvertedDefaults(
  modifiers: ResolvedFlyimgModifiers,
  values: Record<'strip' | 'mozjpeg' | 'preserveAspectRatio' | 'preserveNaturalSize', unknown>
): void {
  for (const [key, value] of Object.entries(values)) {
    if (value != null && isDisabled(value)) {
      modifiers[key] = false;
    }
  }
}

function resolveModifiers(rawModifiers: Record<string, unknown>): ResolvedFlyimgModifiers {
  const { fit, strip, mozjpeg, preserveAspectRatio, preserveNaturalSize, ...rest } = rawModifiers;
  const modifiers = { ...rest } as ResolvedFlyimgModifiers;

  applyFit(modifiers, fit, preserveAspectRatio);
  applyInvertedDefaults(modifiers, { strip, mozjpeg, preserveAspectRatio, preserveNaturalSize });
  return modifiers;
}

/**
 * Flyimg needs an absolute source URL.
 * If src is relative and sourceURL is configured, make it absolute.
 */
function resolveImageUrl(src: string, sourceURL: string | undefined): string {
  const isAbsolute = hasProtocol(src);
  if (isDevelopment() && !isAbsolute && !sourceURL) {
    console.warn(
      '[nuxt] [image] [flyimg] `src` is a relative path but `sourceURL` is not configured. Flyimg requires an absolute source URL. Set `image.flyimg.sourceURL` in your nuxt.config.'
    );
  }

  return !isAbsolute && sourceURL ? joinURL(sourceURL, src) : src;
}

const providerSetup = defineProvider<FlyimgOptions>({
  getImage: (src, options) => {
    const { modifiers: rawModifiers = {}, baseURL, sourceURL, processType = 'upload' } = options;

    if (isDevelopment() && !baseURL) {
      console.warn(
        '[nuxt] [image] [flyimg] `baseURL` is required. Set it in your nuxt.config under `image.flyimg.baseURL`.'
      );
    }

    const modifiers = resolveModifiers(rawModifiers as Record<string, unknown>);
    const imageUrl = resolveImageUrl(src, sourceURL);

    // --- Build Flyimg URL --------------------------------------------------
    const operations = operationsGenerator(modifiers as Partial<Record<string, string | number>>);
    const imageOptions = operations || '-';

    // Construct the path manually so that an absolute imageUrl is treated as a
    // literal path segment rather than a new base by ufo's joinURL.
    // Note: if reverse-proxied via nginx, set `merge_slashes off` to prevent
    // nginx from collapsing the `https://` embedded in this path. See docs.
    return {
      url: joinURL(baseURL || '/', `${processType}/${imageOptions}/${imageUrl}`)
    };
  }
});

export type FlyimgProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function flyimgProvider(options: FlyimgProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'flyimg');
}

export default providerSetup;
