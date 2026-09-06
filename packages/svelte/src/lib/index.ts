import type { Component } from 'svelte';
import DsImageComponent from './DsImage.svelte';
import DsPictureComponent from './DsPicture.svelte';
import type { DsImageComponentProps, DsPictureComponentProps } from './types.js';

export const DsImage = DsImageComponent as unknown as Component<DsImageComponentProps>;
export const DsPicture = DsPictureComponent as unknown as Component<DsPictureComponentProps>;
export { createDsImageConfig, getDsImageConfig, setDsImageConfig, useDsImage } from './context.js';
export {
  createDsImageBindings,
  getDsImageProps,
  getDsPictureProps,
  dsImageAction,
  dsImageAttachment,
  dsPictureAction,
  dsPictureAttachment
} from './bindings.js';
export type {
  DsImageActionReturn,
  DsImageAttachment,
  DsImageBindingOptions,
  DsImageComponentProps,
  DsImageSlotProps,
  DsNativeImageAttrs,
  DsPictureBindingOptions,
  DsPictureComponentProps,
  DsPictureElementProps
} from './types.js';
