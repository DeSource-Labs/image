'use client';

import { createContext, useContext, useMemo } from 'react';
import {
  createImage,
  resolveImageConfig,
  type DesourceImage,
  type ImageConfig,
  type ResolvedImageConfig
} from '@desource/image';
import { isResolvedImageConfig } from '@desource/image/kit';
import type { ImageProviderProps } from './types.js';

const ImageConfigContext = createContext<ResolvedImageConfig | undefined>(undefined);
const defaultConfig = resolveImageConfig();
const images = new WeakMap<ResolvedImageConfig, DesourceImage>();
const resolvedConfigs = new WeakMap<object, ResolvedImageConfig>();

export function ImageProvider({ config = defaultConfig, children }: ImageProviderProps) {
  const resolved = useMemo(() => resolveCachedConfig(config), [config]);
  return <ImageConfigContext.Provider value={resolved}>{children}</ImageConfigContext.Provider>;
}

export function createImageConfig(config: ImageConfig = {}): ResolvedImageConfig {
  return resolveCachedConfig(config);
}

export function getDefaultImageConfig(): ResolvedImageConfig {
  return defaultConfig;
}

export function useImageConfig(config?: ImageConfig | ResolvedImageConfig): ResolvedImageConfig {
  const contextConfig = useContext(ImageConfigContext);
  return config ? resolveCachedConfig(config) : (contextConfig ?? defaultConfig);
}

export function useImage(config?: ImageConfig | ResolvedImageConfig): DesourceImage {
  return imageForConfig(useImageConfig(config));
}

export function resolveCachedConfig(config: ImageConfig | ResolvedImageConfig | undefined): ResolvedImageConfig {
  if (!config) return defaultConfig;
  if (isResolvedImageConfig(config)) return config;

  const cached = resolvedConfigs.get(config);
  if (cached) return cached;
  const resolved = resolveImageConfig(config);
  resolvedConfigs.set(config, resolved);
  return resolved;
}

export function imageForConfig(config: ResolvedImageConfig): DesourceImage {
  let image = images.get(config);
  if (!image) {
    image = createImage(config);
    images.set(config, image);
  }
  return image;
}
