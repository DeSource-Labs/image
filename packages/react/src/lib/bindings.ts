import type { ImageAttrs, ImageInput } from '@desource/image';
import { getImageAttrs, getPictureAttrs } from '@desource/image';
import { mergeClassNames, normalizeCrossorigin, pickImageInput, stripUndefined } from '@desource/image/kit';
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
  const nativeAttrs = filterNativeImageAttrs(options.attrs);

  return createImageElementProps(
    attrs,
    options,
    loaded,
    nativeAttrs,
    [nativeAttrs.className, options.className],
    options.style ?? nativeAttrs.style,
    'data-ds-image'
  );
}

export function getPictureProps(options: PictureBindingOptions, loaded = false): PictureElementProps {
  const picture = getPictureAttrs(toImageInput(options), resolveCachedConfig(options.config));
  const placeholder = Boolean(picture.img.placeholderSrc && !loaded);
  const pictureAttrs = filterPictureAttrs(options.pictureAttrs);
  const sharedImgAttrs = filterNativeImageAttrs(options.attrs);
  const explicitImgAttrs = filterNativeImageAttrs(options.imgAttrs);
  const nativeImgAttrs = { ...sharedImgAttrs, ...explicitImgAttrs } as NativeImageAttrs;

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
    imgProps: createImageElementProps(
      picture.img,
      options,
      loaded,
      nativeImgAttrs,
      [sharedImgAttrs.className, explicitImgAttrs.className, options.imgClassName],
      options.imgStyle ?? explicitImgAttrs.style ?? sharedImgAttrs.style,
      'data-ds-picture-img'
    ) as PictureElementProps['imgProps']
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
  return pickImageInput({
    ...options,
    fetchpriority: options.fetchpriority ?? options.fetchPriority
  });
}

export function imageSourceKey(attrs: ImageAttrs): string {
  return `${attrs.src}\n${attrs.srcset ?? ''}\n${attrs.sizes ?? ''}\n${attrs.placeholderSrc ?? ''}`;
}

function createImageElementProps(
  attrs: ImageAttrs,
  options: ImageBindingOptions,
  loaded: boolean,
  nativeAttrs: NativeImageAttrs,
  classNames: Array<string | undefined>,
  style: ReactImageAttrs['style'],
  dataAttribute: 'data-ds-image' | 'data-ds-picture-img'
): ReactImageAttrs {
  const placeholder = Boolean(attrs.placeholderSrc && !loaded);

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
    className: mergeClassNames(...classNames, placeholder ? attrs.placeholderClass : undefined),
    style,
    [dataAttribute]: ''
  }) as ReactImageAttrs;
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
