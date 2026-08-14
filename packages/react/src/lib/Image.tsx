'use client';

import { forwardRef, useMemo } from 'react';
import type { ImageBindingOptions, ImageComponentProps, ImageRenderProps } from './types.js';
import { useImageProps } from './hooks.js';

export const Image = forwardRef<HTMLImageElement, ImageComponentProps>(function Image(
  {
    src,
    alt,
    width,
    height,
    sizes,
    quality,
    format,
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
    custom = false,
    children,
    className,
    style,
    crossOrigin,
    crossorigin,
    nonce,
    onLoad,
    onError,
    ...rest
  },
  ref
) {
  const options = useMemo<ImageBindingOptions>(
    () => ({
      src,
      alt,
      width,
      height,
      sizes,
      quality,
      format,
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
      attrs: rest,
      className,
      style,
      crossOrigin,
      crossorigin,
      nonce,
      onLoad,
      onError
    }),
    [
      src,
      alt,
      width,
      height,
      sizes,
      quality,
      format,
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
      className,
      style,
      crossOrigin,
      crossorigin,
      nonce,
      onLoad,
      onError
    ]
  );
  const imgProps = useImageProps(options);
  const renderProps = useMemo<ImageRenderProps>(
    () => ({
      imgProps,
      isLoaded: !imgProps.className?.split(/\s+/).includes(placeholderClass ?? 'ds-image-placeholder'),
      src: typeof imgProps.src === 'string' ? imgProps.src : undefined
    }),
    [imgProps, placeholderClass]
  );

  if (custom && typeof children === 'function') {
    return <>{children(renderProps)}</>;
  }

  return <img ref={ref} {...imgProps} />;
});
