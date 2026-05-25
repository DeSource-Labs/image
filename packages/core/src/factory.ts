import { resolveImageConfig } from './config.js';
import { generateSrcset, getImage, getImageAttrs, getImagePreloadLink, getPictureAttrs } from './image.js';
import type { DesourceImage, ImageConfig, ImageInput, ImageModifiers, ImageOptions, ImageProviderResult, ImageSizes, ResolvedImageConfig } from './types.js';

export function createImage(config: ImageConfig | ResolvedImageConfig = {}): DesourceImage {
  const resolved = isResolvedConfig(config) ? config : resolveImageConfig(config);

  const image = ((source: string, modifiers?: ImageModifiers, options?: ImageOptions) => {
    return image.getImage(source, { ...options, modifiers: { ...options?.modifiers, ...modifiers } }).url;
  }) as DesourceImage;

  image.options = resolved;
  image.getImage = (source: string, options: ImageOptions = {}): ImageProviderResult => {
    return getImage(toImageInput(source, options), resolved);
  };
  image.getSizes = (source: string, options: ImageOptions = {}): ImageSizes => {
    const input = toImageInput(source, options);
    const srcset = generateSrcset(input, resolved);
    const attrs = getImageAttrs(input, resolved);
    return {
      srcset: srcset.srcset ?? '',
      sizes: srcset.sizes,
      src: attrs.src,
      widths: srcset.widths
    };
  };
  image.getAttrs = (input: ImageInput) => getImageAttrs(input, resolved);
  image.getPicture = (input: ImageInput) => getPictureAttrs(input, resolved);
  image.getPreloadLink = (input: ImageInput) => getImagePreloadLink(input, resolved);

  for (const preset of Object.keys(resolved.presets)) {
    image[preset] = (source: string, modifiers?: ImageModifiers, options?: ImageOptions) => {
      return image(source, modifiers, { ...options, preset: options?.preset ?? preset });
    };
  }

  return image;
}

function toImageInput(source: string, options: ImageOptions): ImageInput {
  const modifiers = options.modifiers;
  return {
    src: source,
    provider: options.provider,
    preset: options.preset,
    densities: options.densities,
    sizes: options.sizes,
    modifiers,
    width: modifierValue(modifiers, 'width', 'w'),
    height: modifierValue(modifiers, 'height', 'h'),
    quality: modifierValue(modifiers, 'quality', 'q'),
    format: formatValue(modifiers),
    fit: stringValue(modifiers, 'fit'),
    position: stringValue(modifiers, 'position', 'pos'),
    background: stringValue(modifiers, 'background', 'b')
  };
}

function modifierValue(modifiers: ImageModifiers | undefined, ...keys: string[]): number | string | undefined {
  for (const key of keys) {
    const value = modifiers?.[key];
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
  }
  return undefined;
}

function stringValue(modifiers: ImageModifiers | undefined, ...keys: string[]): string | undefined {
  const value = modifierValue(modifiers, ...keys);
  return value === undefined ? undefined : String(value);
}

function formatValue(modifiers: ImageModifiers | undefined): ImageInput['format'] {
  const value = stringValue(modifiers, 'format', 'f');
  return value as ImageInput['format'];
}

function isResolvedConfig(config: ImageConfig | ResolvedImageConfig): config is ResolvedImageConfig {
  return 'providerOptions' in config && 'providers' in config && 'providerSizes' in config;
}
