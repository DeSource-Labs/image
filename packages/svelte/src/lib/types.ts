import type { HTMLImgAttributes } from 'svelte/elements';
import type {
  DensityInput,
  ImageDecoding,
  ImageFetchPriority,
  ImageFit,
  ImageFormat,
  ImageLoading,
  ImageModifiers,
  ImagePlaceholder
} from '@desource/image-core';

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
>;

export interface ImageComponentProps extends NativeImageAttrs {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  sizes?: string;
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
  placeholder?: ImagePlaceholder;
  placeholderClass?: string;
}

export interface PictureComponentProps extends ImageComponentProps {
  formats?: readonly ImageFormat[];
  fallbackFormat?: ImageFormat;
}
