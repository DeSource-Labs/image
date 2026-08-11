import type { HTMLImgAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type {
  DensityInput,
  ImageDecoding,
  ImageFetchPriority,
  ImageFit,
  ImageFormat,
  ImageLoading,
  ImageModifiers,
  ImagePlaceholder,
  ImagePreload,
  SizesInput
} from '@desource/image';

type NativeImageAttrs = Omit<
  HTMLImgAttributes,
  | 'src'
  | 'srcset'
  | 'sizes'
  | 'width'
  | 'height'
  | 'alt'
  | 'loading'
  | 'decoding'
  | 'fetchpriority'
  | 'placeholder'
  | 'children'
>;

export interface ImageComponentProps extends NativeImageAttrs {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  sizes?: SizesInput;
  quality?: number | string;
  format?: ImageFormat | readonly ImageFormat[];
  fit?: ImageFit;
  position?: string;
  background?: string;
  modifiers?: ImageModifiers;
  provider?: string;
  preset?: string;
  densities?: DensityInput;
  loading?: ImageLoading;
  decoding?: ImageDecoding;
  fetchpriority?: ImageFetchPriority;
  priority?: boolean;
  preload?: ImagePreload;
  placeholder?: ImagePlaceholder;
  placeholderClass?: string;
  nonce?: string;
  custom?: boolean;
  children?: Snippet<[ImageSlotProps]>;
}

export interface PictureComponentProps extends ImageComponentProps {
  formats?: readonly ImageFormat[];
  fallbackFormat?: ImageFormat;
  legacyFormat?: ImageFormat;
  imgAttrs?: NativeImageAttrs;
}

export interface ImageSlotProps {
  imgAttrs: HTMLImgAttributes & { nonce?: string };
  isLoaded: boolean;
  src?: string;
}
