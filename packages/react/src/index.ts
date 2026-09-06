'use client';

export { DsImage } from './lib/DsImage.js';
export { DsPicture } from './lib/DsPicture.js';
export {
  DsImageProvider,
  createDsImageConfig,
  getDefaultDsImageConfig,
  dsImageForConfig,
  resolveCachedDsImageConfig,
  useDsImage,
  useDsImageConfig
} from './lib/DsImageProvider.js';
export {
  createDsImageBindings,
  getDsImageProps,
  getDsPictureProps,
  splitDsPictureAttributes,
  toDsImageInput,
  useDsImageProps,
  useDsPictureProps
} from './lib/hooks.js';
export { addDsImagePreloadLink } from './lib/head.js';
export type {
  DsBaseImageProps,
  DsImageBindingOptions,
  DsImageComponentProps,
  DsImageProviderProps,
  DsImageRenderProps,
  DsNativeImageAttrs,
  DsPictureBindingOptions,
  DsPictureComponentProps,
  DsPictureElementProps,
  DsReactImageAttrs,
  DsReactPictureAttrs,
  DsReactSourceAttrs
} from './lib/types.js';
