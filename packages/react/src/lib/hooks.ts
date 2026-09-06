'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getImageAttrs, getImagePreloadLink, getPictureAttrs } from '@desource/image';
import { normalizeCrossorigin } from '@desource/image/kit';
import { getDsImageProps, getDsPictureProps, imageSourceKey, toDsImageInput } from './bindings.js';
import { useDsImageConfig } from './DsImageProvider.js';
import { useHeadPreload } from './head.js';
import type {
  DsImageBindingOptions,
  DsImageEvent,
  DsPictureBindingOptions,
  DsPictureElementProps,
  DsReactImageAttrs
} from './types.js';

export {
  createDsImageBindings,
  getDsImageProps,
  getDsPictureProps,
  splitDsPictureAttributes,
  toDsImageInput
} from './bindings.js';

export function useDsImageProps(options: DsImageBindingOptions): DsReactImageAttrs {
  const config = useDsImageConfig(options.config);
  const imageInput = useMemo(() => toDsImageInput(options), [options]);
  const attrs = useMemo(() => getImageAttrs(imageInput, config), [config, imageInput]);
  const crossOrigin = normalizeCrossorigin(options.crossOrigin ?? options.crossorigin);
  const loaded = useDecodedImage(attrs, crossOrigin, options.onError);
  const props = useMemo(() => getDsImageProps({ ...options, config }, loaded), [config, loaded, options]);

  useHeadPreload(
    options.preload ? getImagePreloadLink(imageInput, config) : undefined,
    { crossorigin: crossOrigin, nonce: options.nonce },
    Boolean(options.preload)
  );

  const onLoad = options.onLoad;
  const onError = options.onError;
  const placeholderActive = Boolean(attrs.placeholderSrc && !loaded);

  const handleLoad = useCallback(
    (event: DsImageEvent) => {
      if (placeholderActive) return;
      onLoad?.(event);
    },
    [onLoad, placeholderActive]
  );

  const handleError = useCallback(
    (event: DsImageEvent) => {
      if (!placeholderActive) onError?.(event);
    },
    [onError, placeholderActive]
  );

  return {
    ...props,
    onLoad: handleLoad,
    onError: handleError
  };
}

export function useDsPictureProps(options: DsPictureBindingOptions): DsPictureElementProps {
  const config = useDsImageConfig(options.config);
  const imageInput = useMemo(() => toDsImageInput(options), [options]);
  const picture = useMemo(() => getPictureAttrs(imageInput, config), [config, imageInput]);
  const crossOrigin = normalizeCrossorigin(options.crossOrigin ?? options.crossorigin);
  const loaded = useDecodedImage(picture.img, crossOrigin, options.onError);
  const props = useMemo(() => getDsPictureProps({ ...options, config }, loaded), [config, loaded, options]);
  const basePreload = options.preload ? getImagePreloadLink(imageInput, config) : undefined;
  const preloadSource = picture.sources[0];

  useHeadPreload(
    basePreload
      ? {
          ...basePreload,
          imagesrcset: preloadSource?.srcset ?? basePreload.imagesrcset,
          imagesizes: preloadSource?.sizes ?? basePreload.imagesizes
        }
      : undefined,
    { crossorigin: crossOrigin, nonce: options.nonce },
    Boolean(options.preload)
  );

  const onLoad = options.onLoad;
  const onError = options.onError;
  const placeholderActive = Boolean(picture.img.placeholderSrc && !loaded);

  const handleLoad = useCallback(
    (event: DsImageEvent) => {
      if (placeholderActive) return;
      onLoad?.(event);
    },
    [onLoad, placeholderActive]
  );

  const handleError = useCallback(
    (event: DsImageEvent) => {
      if (!placeholderActive) onError?.(event);
    },
    [onError, placeholderActive]
  );

  return {
    ...props,
    imgProps: {
      ...props.imgProps,
      onLoad: handleLoad,
      onError: handleError
    }
  };
}

function useDecodedImage(
  attrs: Parameters<typeof imageSourceKey>[0],
  crossOrigin: string | undefined,
  onError: ((event: DsImageEvent) => void) | undefined
): boolean {
  const sourceKey = imageSourceKey(attrs);
  const [state, setState] = useState({ key: sourceKey, loaded: false });
  const visibleLoaded = state.key === sourceKey && state.loaded;

  useEffect(() => {
    if (!attrs.placeholderSrc || typeof Image === 'undefined') return undefined;

    const image = new Image();
    let active = true;
    let settled = false;
    if (crossOrigin) image.crossOrigin = crossOrigin;
    if (attrs.sizes) image.sizes = attrs.sizes;
    if (attrs.srcset) image.srcset = attrs.srcset;

    const ready = () => {
      if (!active || settled) return;
      settled = true;
      const decoded = typeof image.decode === 'function' ? image.decode() : Promise.resolve();
      void decoded.then(
        () => {
          if (active) setState({ key: sourceKey, loaded: true });
        },
        () => {
          if (active) onError?.(new Event('error'));
        }
      );
    };

    image.onload = ready;
    image.onerror = (event) => {
      if (!active || settled) return;
      settled = true;
      onError?.(typeof event === 'string' ? new Event('error') : event);
    };
    image.src = attrs.src;
    if (image.complete && image.naturalWidth > 0) ready();

    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [attrs.placeholderSrc, attrs.sizes, attrs.src, attrs.srcset, crossOrigin, onError, sourceKey]);

  return visibleLoaded;
}
