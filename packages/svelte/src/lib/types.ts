import type { Snippet } from 'svelte';
import type { ClassValue, HTMLAttributes, HTMLImgAttributes } from 'svelte/elements';
import type {
  DensityInput,
  ImageConfig,
  ImageDecoding,
  ImageFetchPriority,
  ImageFit,
  ImageFormat,
  ImageInput,
  ImageLoading,
  ImageModifiers,
  ImagePlaceholder,
  ImagePreload,
  PictureSource,
  ResolvedImageConfig,
  SizesInput
} from '@desource/image';

export type NativeImageAttrs = Omit<
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
  | 'crossorigin'
  | 'nonce'
  | 'onload'
  | 'onerror'
  | 'placeholder'
  | 'children'
>;

export interface BaseImageProps {
  src: string;
  alt: string;
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
  crossorigin?: boolean | '' | 'true' | 'anonymous' | 'use-credentials' | null;
  nonce?: string;
  onload?: (event: Event) => void;
  onerror?: (event: Event) => void;
}

export interface ImageComponentProps extends BaseImageProps, NativeImageAttrs {
  custom?: boolean;
  children?: Snippet<[ImageSlotProps]>;
}

type PictureForwardedImageAttrs = Pick<NativeImageAttrs, 'referrerpolicy' | 'usemap' | 'ismap'>;

export interface PictureComponentProps
  extends
    BaseImageProps,
    PictureForwardedImageAttrs,
    Omit<HTMLAttributes<HTMLPictureElement>, 'children' | 'onload' | 'onerror' | 'placeholder'> {
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

export interface ImageBindingOptions extends ImageInput {
  alt: string;
  config?: ImageConfig | ResolvedImageConfig;
  attrs?: NativeImageAttrs;
  class?: ClassValue | null;
  style?: string | null;
  crossorigin?: boolean | '' | 'true' | 'anonymous' | 'use-credentials' | null;
  nonce?: string;
  onload?: (event: Event) => void;
  onerror?: (event: Event) => void;
  /** Receives placeholder/full-image state changes from actions and attachments. */
  onStateChange?: (loaded: boolean) => void;
}

export interface PictureBindingOptions extends ImageBindingOptions {
  pictureAttrs?: Omit<HTMLAttributes<HTMLPictureElement>, 'children'>;
  imgAttrs?: NativeImageAttrs;
}

export interface PictureElementProps {
  pictureAttrs: HTMLAttributes<HTMLPictureElement>;
  sources: PictureSource[];
  imgAttrs: HTMLImgAttributes & { nonce?: string };
}

export interface ImageActionReturn<TOptions> {
  update(options: TOptions): void;
  destroy(): void;
}

export type ImageAttachment<T extends EventTarget = Element> = (element: T) => void | (() => void);
