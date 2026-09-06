import type { Snippet } from 'svelte';
import type { ClassValue, HTMLAttributes, HTMLImgAttributes } from 'svelte/elements';
import type { ImageConfig, ImageFormat, ImageInput, PictureSource, ResolvedImageConfig } from '@desource/image';

export type DsNativeImageAttrs = Omit<
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

export interface DsBaseImageProps extends Omit<ImageInput, 'alt' | 'formats' | 'fallbackFormat' | 'legacyFormat'> {
  alt: string;
  crossorigin?: boolean | '' | 'true' | 'anonymous' | 'use-credentials' | null;
  nonce?: string;
  onload?: (event: Event) => void;
  onerror?: (event: Event) => void;
}

export interface DsImageComponentProps extends DsBaseImageProps, DsNativeImageAttrs {
  custom?: boolean;
  children?: Snippet<[DsImageSlotProps]>;
}

type PictureForwardedImageAttrs = Pick<DsNativeImageAttrs, 'referrerpolicy' | 'usemap' | 'ismap'>;

export interface DsPictureComponentProps
  extends
    DsBaseImageProps,
    PictureForwardedImageAttrs,
    Omit<HTMLAttributes<HTMLPictureElement>, 'children' | 'onload' | 'onerror' | 'placeholder'> {
  formats?: readonly ImageFormat[];
  fallbackFormat?: ImageFormat;
  legacyFormat?: ImageFormat;
  imgAttrs?: DsNativeImageAttrs;
}

export interface DsImageSlotProps {
  imgAttrs: HTMLImgAttributes & { nonce?: string };
  isLoaded: boolean;
  src?: string;
}

export interface DsImageBindingOptions extends ImageInput {
  alt: string;
  config?: ImageConfig | ResolvedImageConfig;
  attrs?: DsNativeImageAttrs;
  class?: ClassValue | null;
  style?: string | null;
  crossorigin?: boolean | '' | 'true' | 'anonymous' | 'use-credentials' | null;
  nonce?: string;
  onload?: (event: Event) => void;
  onerror?: (event: Event) => void;
  /** Receives placeholder/full-image state changes from actions and attachments. */
  onStateChange?: (loaded: boolean) => void;
}

export interface DsPictureBindingOptions extends DsImageBindingOptions {
  pictureAttrs?: Omit<HTMLAttributes<HTMLPictureElement>, 'children'>;
  imgAttrs?: DsNativeImageAttrs;
}

export interface DsPictureElementProps {
  pictureAttrs: HTMLAttributes<HTMLPictureElement>;
  sources: PictureSource[];
  imgAttrs: HTMLImgAttributes & { nonce?: string };
}

export interface DsImageActionReturn<TOptions> {
  update(options: TOptions): void;
  destroy(): void;
}

export type DsImageAttachment<T extends EventTarget = Element> = (element: T) => void | (() => void);
