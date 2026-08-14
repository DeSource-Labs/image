import type {
  CSSProperties,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
  SourceHTMLAttributes,
  SyntheticEvent
} from 'react';
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

export type CrossOriginInput = boolean | '' | 'true' | 'anonymous' | 'use-credentials' | null | undefined;
export type ImageEvent = Event | SyntheticEvent<HTMLImageElement>;

export type NativeImageAttrs = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  | 'src'
  | 'srcSet'
  | 'srcset'
  | 'sizes'
  | 'width'
  | 'height'
  | 'alt'
  | 'loading'
  | 'decoding'
  | 'fetchPriority'
  | 'fetchpriority'
  | 'crossOrigin'
  | 'crossorigin'
  | 'nonce'
  | 'onLoad'
  | 'onError'
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
  fetchPriority?: ImageFetchPriority;
  fetchpriority?: ImageFetchPriority;
  priority?: boolean;
  preload?: ImagePreload;
  placeholder?: ImagePlaceholder;
  placeholderClass?: string;
  crossOrigin?: CrossOriginInput;
  crossorigin?: CrossOriginInput;
  nonce?: string;
  onLoad?: (event: ImageEvent) => void;
  onError?: (event: ImageEvent) => void;
}

export interface ImageRenderProps {
  imgProps: ReactImageAttrs;
  isLoaded: boolean;
  src?: string;
}

export interface ImageComponentProps extends BaseImageProps, NativeImageAttrs {
  custom?: boolean;
  children?: ReactNode | ((props: ImageRenderProps) => ReactNode);
}

export interface PictureComponentProps
  extends BaseImageProps, Omit<HTMLAttributes<HTMLPictureElement>, 'children' | 'onLoad' | 'onError' | 'placeholder'> {
  formats?: readonly ImageFormat[];
  fallbackFormat?: ImageFormat;
  legacyFormat?: ImageFormat;
  children?: never;
  imgAttrs?: NativeImageAttrs;
  imgClassName?: string;
  imgStyle?: CSSProperties;
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
  referrerpolicy?: string;
  useMap?: string;
  usemap?: string;
  isMap?: boolean;
  ismap?: boolean;
}

export interface ImageProviderProps {
  config?: ImageConfig | ResolvedImageConfig;
  children?: ReactNode;
}

export interface ImageBindingOptions extends ImageInput {
  alt: string;
  config?: ImageConfig | ResolvedImageConfig;
  attrs?: NativeImageAttrs;
  className?: string;
  style?: CSSProperties;
  crossOrigin?: CrossOriginInput;
  crossorigin?: CrossOriginInput;
  fetchPriority?: ImageFetchPriority;
  nonce?: string;
  onLoad?: (event: ImageEvent) => void;
  onError?: (event: ImageEvent) => void;
}

export interface PictureBindingOptions extends ImageBindingOptions {
  formats?: readonly ImageFormat[];
  fallbackFormat?: ImageFormat;
  legacyFormat?: ImageFormat;
  pictureAttrs?: ReactPictureAttrs;
  imgAttrs?: NativeImageAttrs;
  imgClassName?: string;
  imgStyle?: CSSProperties;
}

export type ReactImageAttrs = ImgHTMLAttributes<HTMLImageElement> & {
  'data-ds-image'?: string;
  nonce?: string;
};

export type ReactPictureAttrs = HTMLAttributes<HTMLPictureElement> & {
  'data-ds-picture'?: string;
};

export type ReactSourceAttrs = SourceHTMLAttributes<HTMLSourceElement> & {
  key: string;
  srcSet: string;
  type: string;
  'data-ds-image-source'?: string;
};

export interface PictureElementProps {
  pictureProps: ReactPictureAttrs;
  sources: ReactSourceAttrs[];
  imgProps: ReactImageAttrs & { 'data-ds-picture-img'?: string };
}

export interface PictureSourceWithKey extends PictureSource {
  key: string;
}
