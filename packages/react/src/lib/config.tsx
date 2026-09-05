'use client';

import { createContext, useContext, useMemo } from 'react';
import {
  createImage,
  resolveImageConfig,
  type DesourceImage,
  type ImageConfig,
  type ResolvedImageConfig
} from '@desource/image';
import { createImageConfigCache } from '@desource/image/kit';
import type { ImageProviderProps } from './types.js';

const ImageConfigContext = createContext<ResolvedImageConfig | undefined>(undefined);
const configCache = createImageConfigCache({ resolveConfig: resolveImageConfig, createImage });

export function ImageProvider({ config = configCache.defaultConfig, children }: ImageProviderProps) {
  const resolved = useMemo(() => resolveCachedConfig(config), [config]);
  return <ImageConfigContext.Provider value={resolved}>{children}</ImageConfigContext.Provider>;
}

export function createImageConfig(config: ImageConfig = {}): ResolvedImageConfig {
  return resolveCachedConfig(config);
}

export function getDefaultImageConfig(): ResolvedImageConfig {
  return configCache.defaultConfig;
}

export function useImageConfig(config?: ImageConfig | ResolvedImageConfig): ResolvedImageConfig {
  const contextConfig = useContext(ImageConfigContext);
  return config ? resolveCachedConfig(config) : (contextConfig ?? configCache.defaultConfig);
}

export function useImage(config?: ImageConfig | ResolvedImageConfig): DesourceImage {
  return imageForConfig(useImageConfig(config));
}

export function resolveCachedConfig(config: ImageConfig | ResolvedImageConfig | undefined): ResolvedImageConfig {
  return configCache.resolve(config);
}

export function imageForConfig(config: ResolvedImageConfig): DesourceImage {
  return configCache.image(config);
}
