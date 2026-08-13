import type { Component } from 'svelte';
import ImageComponent from './Image.svelte';
import PictureComponent from './Picture.svelte';
import type { ImageComponentProps, PictureComponentProps } from './types.js';

export const Image = ImageComponent as unknown as Component<ImageComponentProps>;
export const Picture = PictureComponent as unknown as Component<PictureComponentProps>;
export { createImageConfig, getImageConfig, setImageConfig, useImage } from './context.js';
export {
  createImageBindings,
  getImageProps,
  getPictureProps,
  imageAction,
  imageAttachment,
  pictureAction,
  pictureAttachment
} from './bindings.js';
export type {
  ImageActionReturn,
  ImageAttachment,
  ImageBindingOptions,
  ImageComponentProps,
  ImageSlotProps,
  NativeImageAttrs,
  PictureBindingOptions,
  PictureComponentProps,
  PictureElementProps
} from './types.js';
