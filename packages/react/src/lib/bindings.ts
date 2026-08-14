import type { ImageAttrs, ImageInput } from '@desource/image';
import { getImageAttrs, getPictureAttrs } from '@desource/image';
import { mergeClassNames, normalizeCrossorigin, stripUndefined } from '@desource/image/kit';
import { resolveCachedConfig } from './config.js';
import type {
  ImageBindingOptions,
  NativeImageAttrs,
  PictureBindingOptions,
  PictureElementProps,
  ReactImageAttrs,
  ReactPictureAttrs,
  ReactSourceAttrs
} from './types.js';

const generatedImageAttributeNames = new Set([
  'src',
  'srcset',
  'srcSet',
  'sizes',
  'width',
  'height',
  'alt',
  'loading',
  'decoding',
  'fetchpriority',
  'fetchPriority',
  'crossorigin',
  'crossOrigin',
  'nonce',
  'onLoad',
  'onError',
  'children',
  'placeholder'
]);

const pictureImageAttributeNames = new Set(['referrerpolicy', 'referrerPolicy', 'usemap', 'useMap', 'ismap', 'isMap']);

export function getImageProps(options: ImageBindingOptions, loaded = false): ReactImageAttrs {
  const attrs = getImageAttrs(toImageInput(options), resolveCachedConfig(options.config));
  const placeholder = Boolean(attrs.placeholderSrc && !loaded);
  const nativeAttrs = filterNativeImageAttrs(options.attrs);

  return stripUndefined({
    ...nativeAttrs,
    src: placeholder ? attrs.placeholderSrc : attrs.src,
    srcSet: placeholder ? undefined : attrs.srcset,
    sizes: placeholder ? undefined : attrs.sizes,
    width: attrs.width,
    height: attrs.height,
    alt: attrs.alt ?? options.alt,
    loading: attrs.loading,
    decoding: attrs.decoding,
    fetchPriority: attrs.fetchpriority,
    crossOrigin: normalizeCrossorigin(options.crossOrigin ?? options.crossorigin),
    nonce: options.nonce,
    className: mergeClassNames(
      nativeAttrs.className,
      options.className,
      placeholder ? attrs.placeholderClass : undefined
    ),
    style: options.style ?? nativeAttrs.style,
    'data-ds-image': ''
  }) as ReactImageAttrs;
}

export function getPictureProps(options: PictureBindingOptions, loaded = false): PictureElementProps {
  const picture = getPictureAttrs(toImageInput(options), resolveCachedConfig(options.config));
  const placeholder = Boolean(picture.img.placeholderSrc && !loaded);
  const pictureAttrs = filterPictureAttrs(options.pictureAttrs);
  const sharedImgAttrs = filterNativeImageAttrs(options.attrs);
  const explicitImgAttrs = filterNativeImageAttrs(options.imgAttrs);

  return {
    pictureProps: stripUndefined({
      ...pictureAttrs,
      className: mergeClassNames(pictureAttrs.className, options.className),
      style: options.style ?? pictureAttrs.style,
      'data-ds-picture': ''
    }) as ReactPictureAttrs,
    sources: placeholder
      ? []
      : picture.sources.map<ReactSourceAttrs>((source) => ({
          key: `${source.type}:${source.srcset}`,
          type: source.type,
          srcSet: source.srcset,
          sizes: source.sizes,
          'data-ds-image-source': ''
        })),
    imgProps: stripUndefined({
      ...sharedImgAttrs,
      ...explicitImgAttrs,
      src: placeholder ? picture.img.placeholderSrc : picture.img.src,
      srcSet: placeholder ? undefined : picture.img.srcset,
      sizes: placeholder ? undefined : picture.img.sizes,
      width: picture.img.width,
      height: picture.img.height,
      alt: picture.img.alt ?? options.alt,
      loading: picture.img.loading,
      decoding: picture.img.decoding,
      fetchPriority: picture.img.fetchpriority,
      crossOrigin: normalizeCrossorigin(options.crossOrigin ?? options.crossorigin),
      nonce: options.nonce,
      className: mergeClassNames(
        sharedImgAttrs.className,
        explicitImgAttrs.className,
        options.imgClassName,
        placeholder ? picture.img.placeholderClass : undefined
      ),
      style: options.imgStyle ?? explicitImgAttrs.style ?? sharedImgAttrs.style,
      'data-ds-picture-img': ''
    }) as PictureElementProps['imgProps']
  };
}

export function splitPictureAttributes(attributes: Record<string, unknown>): {
  pictureAttrs: Record<string, unknown>;
  imgAttrs: NativeImageAttrs;
} {
  const pictureAttrs: Record<string, unknown> = {};
  const imgAttrs: Record<string, unknown> = {};

  for (const [name, value] of Object.entries(attributes)) {
    if (pictureImageAttributeNames.has(name)) imgAttrs[name] = value;
    else pictureAttrs[name] = value;
  }

  return { pictureAttrs, imgAttrs: imgAttrs as NativeImageAttrs };
}

export function createImageBindings(config: ImageBindingOptions['config']) {
  return {
    getImageProps: (options: Omit<ImageBindingOptions, 'config'>, loaded = false) =>
      getImageProps({ ...options, config }, loaded),
    getPictureProps: (options: Omit<PictureBindingOptions, 'config'>, loaded = false) =>
      getPictureProps({ ...options, config }, loaded)
  };
}

export function toImageInput(options: ImageBindingOptions): ImageInput {
  return stripUndefined({
    src: options.src,
    alt: options.alt,
    width: options.width,
    height: options.height,
    sizes: options.sizes,
    quality: options.quality,
    format: options.format,
    formats: options.formats,
    fallbackFormat: options.fallbackFormat,
    legacyFormat: options.legacyFormat,
    fit: options.fit,
    position: options.position,
    background: options.background,
    modifiers: options.modifiers,
    provider: options.provider,
    preset: options.preset,
    densities: options.densities,
    loading: options.loading,
    decoding: options.decoding,
    fetchpriority: options.fetchpriority ?? options.fetchPriority,
    priority: options.priority,
    preload: options.preload,
    placeholder: options.placeholder,
    placeholderClass: options.placeholderClass
  });
}

export function imageSourceKey(attrs: ImageAttrs): string {
  return `${attrs.src}\n${attrs.srcset ?? ''}\n${attrs.sizes ?? ''}\n${attrs.placeholderSrc ?? ''}`;
}

function filterNativeImageAttrs(attrs: NativeImageAttrs | undefined): NativeImageAttrs {
  if (!attrs) return {};
  const filtered: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(attrs)) {
    if (!generatedImageAttributeNames.has(name)) filtered[name] = value;
  }
  return filtered as NativeImageAttrs;
}

function filterPictureAttrs(attrs: ReactPictureAttrs | undefined): ReactPictureAttrs {
  if (!attrs) return {};
  const filtered: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(attrs)) {
    if (name !== 'children') filtered[name] = value;
  }
  return filtered as ReactPictureAttrs;
}
