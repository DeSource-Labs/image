import type {
  CSSProperties,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
  SourceHTMLAttributes,
  SyntheticEvent
} from 'react';
import type {
  ImageConfig,
  ImageFetchPriority,
  ImageFormat,
  ImageInput,
  PictureSource,
  ResolvedImageConfig
} from '@desource/image';

export type DsCrossOriginInput = boolean | '' | 'true' | 'anonymous' | 'use-credentials' | null;
export type DsImageEvent = Event | SyntheticEvent<HTMLImageElement>;

export type DsNativeImageAttrs = Omit<
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

export interface DsBaseImageProps extends Omit<ImageInput, 'alt' | 'formats' | 'fallbackFormat' | 'legacyFormat'> {
  alt: string;
  fetchPriority?: ImageFetchPriority;
  crossOrigin?: DsCrossOriginInput;
  crossorigin?: DsCrossOriginInput;
  nonce?: string;
  onLoad?: (event: DsImageEvent) => void;
  onError?: (event: DsImageEvent) => void;
}

export interface DsImageRenderProps {
  imgProps: DsReactImageAttrs;
  isLoaded: boolean;
  src?: string;
}

export interface DsImageComponentProps extends DsBaseImageProps, DsNativeImageAttrs {
  custom?: boolean;
  children?: ReactNode | ((props: DsImageRenderProps) => ReactNode);
}

export interface DsPictureComponentProps
  extends
    DsBaseImageProps,
    Omit<HTMLAttributes<HTMLPictureElement>, 'children' | 'onLoad' | 'onError' | 'placeholder'> {
  formats?: readonly ImageFormat[];
  fallbackFormat?: ImageFormat;
  legacyFormat?: ImageFormat;
  children?: never;
  imgAttrs?: DsNativeImageAttrs;
  imgClassName?: string;
  imgStyle?: CSSProperties;
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
  referrerpolicy?: string;
  useMap?: string;
  usemap?: string;
  isMap?: boolean;
  ismap?: boolean;
}

export interface DsImageProviderProps {
  config?: ImageConfig | ResolvedImageConfig;
  children?: ReactNode;
}

export interface DsImageBindingOptions extends ImageInput {
  alt: string;
  config?: ImageConfig | ResolvedImageConfig;
  attrs?: DsNativeImageAttrs;
  className?: string;
  style?: CSSProperties;
  crossOrigin?: DsCrossOriginInput;
  crossorigin?: DsCrossOriginInput;
  fetchPriority?: ImageFetchPriority;
  nonce?: string;
  onLoad?: (event: DsImageEvent) => void;
  onError?: (event: DsImageEvent) => void;
}

export interface DsPictureBindingOptions extends DsImageBindingOptions {
  pictureAttrs?: DsReactPictureAttrs;
  imgAttrs?: DsNativeImageAttrs;
  imgClassName?: string;
  imgStyle?: CSSProperties;
}

export type DsReactImageAttrs = ImgHTMLAttributes<HTMLImageElement> & {
  'data-ds-image'?: string;
  nonce?: string;
};

export type DsReactPictureAttrs = HTMLAttributes<HTMLPictureElement> & {
  'data-ds-picture'?: string;
};

export type DsReactSourceAttrs = SourceHTMLAttributes<HTMLSourceElement> & {
  key: string;
  srcSet: string;
  type: string;
  'data-ds-image-source'?: string;
};

export interface DsPictureElementProps {
  pictureProps: DsReactPictureAttrs;
  sources: DsReactSourceAttrs[];
  imgProps: DsReactImageAttrs & { 'data-ds-picture-img'?: string };
}

export interface DsPictureSourceWithKey extends PictureSource {
  key: string;
}
