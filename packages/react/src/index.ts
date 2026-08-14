'use client';

export { Image } from './lib/Image.js';
export { Picture } from './lib/Picture.js';
export {
  ImageProvider,
  createImageConfig,
  getDefaultImageConfig,
  imageForConfig,
  resolveCachedConfig,
  useImage,
  useImageConfig
} from './lib/config.js';
export {
  createImageBindings,
  getImageProps,
  getPictureProps,
  splitPictureAttributes,
  toImageInput,
  useImageProps,
  usePictureProps
} from './lib/hooks.js';
export { addImagePreloadLink } from './lib/head.js';
export type {
  BaseImageProps,
  ImageBindingOptions,
  ImageComponentProps,
  ImageProviderProps,
  ImageRenderProps,
  NativeImageAttrs,
  PictureBindingOptions,
  PictureComponentProps,
  PictureElementProps,
  ReactImageAttrs,
  ReactPictureAttrs,
  ReactSourceAttrs
} from './lib/types.js';
