'use client';

import { forwardRef, useMemo } from 'react';
import type { NativeImageAttrs, PictureBindingOptions, PictureComponentProps } from './types.js';
import { usePictureProps } from './hooks.js';

export const Picture = forwardRef<HTMLPictureElement, PictureComponentProps>(function Picture(
  {
    src,
    alt,
    width,
    height,
    sizes,
    quality,
    format,
    formats,
    fallbackFormat,
    legacyFormat,
    fit,
    position,
    background,
    modifiers,
    provider,
    preset,
    densities,
    loading,
    decoding,
    fetchPriority,
    fetchpriority,
    priority = false,
    preload,
    placeholder,
    placeholderClass,
    imgAttrs,
    imgClassName,
    imgStyle,
    className,
    style,
    crossOrigin,
    crossorigin,
    nonce,
    onLoad,
    onError,
    referrerPolicy,
    referrerpolicy,
    useMap,
    usemap,
    isMap,
    ismap,
    children: _children,
    ...rest
  },
  ref
) {
  const options = useMemo<PictureBindingOptions>(() => {
    const nativeRecord = imgAttrs as Record<string, unknown> | undefined;
    return {
      src,
      alt,
      width,
      height,
      sizes,
      quality,
      format,
      formats,
      fallbackFormat,
      legacyFormat,
      fit,
      position,
      background,
      modifiers,
      provider,
      preset,
      densities,
      loading,
      decoding,
      fetchPriority,
      fetchpriority,
      priority,
      preload,
      placeholder,
      placeholderClass,
      pictureAttrs: rest,
      imgAttrs: {
        ...imgAttrs,
        referrerPolicy: referrerPolicy ?? imgAttrs?.referrerPolicy,
        referrerpolicy: referrerpolicy ?? nativeRecord?.['referrerpolicy'],
        useMap: useMap ?? imgAttrs?.useMap,
        usemap: usemap ?? nativeRecord?.['usemap'],
        isMap: isMap ?? (nativeRecord?.['isMap'] as boolean | undefined),
        ismap: ismap ?? nativeRecord?.['ismap']
      } as NativeImageAttrs,
      imgClassName,
      imgStyle,
      className,
      style,
      crossOrigin,
      crossorigin,
      nonce,
      onLoad,
      onError
    };
  }, [
    src,
    alt,
    width,
    height,
    sizes,
    quality,
    format,
    formats,
    fallbackFormat,
    legacyFormat,
    fit,
    position,
    background,
    modifiers,
    provider,
    preset,
    densities,
    loading,
    decoding,
    fetchPriority,
    fetchpriority,
    priority,
    preload,
    placeholder,
    placeholderClass,
    rest,
    imgAttrs,
    referrerPolicy,
    referrerpolicy,
    useMap,
    usemap,
    isMap,
    ismap,
    imgClassName,
    imgStyle,
    className,
    style,
    crossOrigin,
    crossorigin,
    nonce,
    onLoad,
    onError
  ]);
  const { pictureProps, sources, imgProps } = usePictureProps(options);

  return (
    <picture ref={ref} {...pictureProps}>
      {sources.map(({ key, ...source }) => (
        <source key={key} {...source} />
      ))}
      <img {...imgProps} alt={imgProps.alt} />
    </picture>
  );
});
