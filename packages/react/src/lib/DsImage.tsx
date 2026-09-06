'use client';

import { forwardRef, useMemo } from 'react';
import type { DsImageBindingOptions, DsImageComponentProps, DsImageRenderProps } from './types.js';
import { useDsImageProps } from './hooks.js';

export const DsImage = forwardRef<HTMLImageElement, DsImageComponentProps>(function DsImage(
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
  const options = useMemo<DsImageBindingOptions>(
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
  const imgProps = useDsImageProps(options);
  const renderProps = useMemo<DsImageRenderProps>(
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

  return <img ref={ref} {...imgProps} alt={imgProps.alt} />;
});
