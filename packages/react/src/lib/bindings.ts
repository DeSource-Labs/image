import type { ImageAttrs, ImageInput } from '@desource/image';
import { getImageAttrs, getPictureAttrs } from '@desource/image';
import { mergeClassNames, normalizeCrossorigin, pickImageInput, stripUndefined } from '@desource/image/kit';
import { resolveCachedDsImageConfig } from './DsImageProvider.js';
import type {
  DsImageBindingOptions,
  DsNativeImageAttrs,
  DsPictureBindingOptions,
  DsPictureElementProps,
  DsReactImageAttrs,
  DsReactPictureAttrs,
  DsReactSourceAttrs
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

export function getDsImageProps(options: DsImageBindingOptions, loaded = false): DsReactImageAttrs {
  const attrs = getImageAttrs(toDsImageInput(options), resolveCachedDsImageConfig(options.config));
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

export function getDsPictureProps(options: DsPictureBindingOptions, loaded = false): DsPictureElementProps {
  const picture = getPictureAttrs(toDsImageInput(options), resolveCachedDsImageConfig(options.config));
  const placeholder = Boolean(picture.img.placeholderSrc && !loaded);
  const pictureAttrs = filterPictureAttrs(options.pictureAttrs);
  const sharedImgAttrs = filterNativeImageAttrs(options.attrs);
  const explicitImgAttrs = filterNativeImageAttrs(options.imgAttrs);
  const nativeImgAttrs = { ...sharedImgAttrs, ...explicitImgAttrs } as DsNativeImageAttrs;

  return {
    pictureProps: stripUndefined({
      ...pictureAttrs,
      className: mergeClassNames(pictureAttrs.className, options.className),
      style: options.style ?? pictureAttrs.style,
      'data-ds-picture': ''
    }) as DsReactPictureAttrs,
    sources: placeholder
      ? []
      : picture.sources.map<DsReactSourceAttrs>((source) => ({
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
    ) as DsPictureElementProps['imgProps']
  };
}

export function splitDsPictureAttributes(attributes: Record<string, unknown>): {
  pictureAttrs: Record<string, unknown>;
  imgAttrs: DsNativeImageAttrs;
} {
  const pictureAttrs: Record<string, unknown> = {};
  const imgAttrs: Record<string, unknown> = {};

  for (const [name, value] of Object.entries(attributes)) {
    if (pictureImageAttributeNames.has(name)) imgAttrs[name] = value;
    else pictureAttrs[name] = value;
  }

  return { pictureAttrs, imgAttrs: imgAttrs as DsNativeImageAttrs };
}

export function createDsImageBindings(config: DsImageBindingOptions['config']) {
  return {
    getDsImageProps: (options: Omit<DsImageBindingOptions, 'config'>, loaded = false) =>
      getDsImageProps({ ...options, config }, loaded),
    getDsPictureProps: (options: Omit<DsPictureBindingOptions, 'config'>, loaded = false) =>
      getDsPictureProps({ ...options, config }, loaded)
  };
}

export function toDsImageInput(options: DsImageBindingOptions): ImageInput {
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
  options: DsImageBindingOptions,
  loaded: boolean,
  nativeAttrs: DsNativeImageAttrs,
  classNames: Array<string | undefined>,
  style: DsReactImageAttrs['style'],
  dataAttribute: 'data-ds-image' | 'data-ds-picture-img'
): DsReactImageAttrs {
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
  }) as DsReactImageAttrs;
}

function filterNativeImageAttrs(attrs: DsNativeImageAttrs | undefined): DsNativeImageAttrs {
  if (!attrs) return {};
  const filtered: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(attrs)) {
    if (!generatedImageAttributeNames.has(name)) filtered[name] = value;
  }
  return filtered as DsNativeImageAttrs;
}

function filterPictureAttrs(attrs: DsReactPictureAttrs | undefined): DsReactPictureAttrs {
  if (!attrs) return {};
  const filtered: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(attrs)) {
    if (name !== 'children') filtered[name] = value;
  }
  return filtered as DsReactPictureAttrs;
}
