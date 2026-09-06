'use client';

import { createContext, useContext, useMemo } from 'react';
import {
  createImage,
  resolveImageConfig,
  type DsImage,
  type ImageConfig,
  type ResolvedImageConfig
} from '@desource/image';
import { createImageConfigCache } from '@desource/image/kit';
import type { DsImageProviderProps } from './types.js';

const DsImageConfigContext = createContext<ResolvedImageConfig | undefined>(undefined);
const configCache = createImageConfigCache({ resolveConfig: resolveImageConfig, createImage });

export function DsImageProvider({ config = configCache.defaultConfig, children }: Readonly<DsImageProviderProps>) {
  const resolved = useMemo(() => resolveCachedDsImageConfig(config), [config]);
  return <DsImageConfigContext.Provider value={resolved}>{children}</DsImageConfigContext.Provider>;
}

export function createDsImageConfig(config: ImageConfig = {}): ResolvedImageConfig {
  return resolveCachedDsImageConfig(config);
}

export function getDefaultDsImageConfig(): ResolvedImageConfig {
  return configCache.defaultConfig;
}

export function useDsImageConfig(config?: ImageConfig | ResolvedImageConfig): ResolvedImageConfig {
  const contextConfig = useContext(DsImageConfigContext);
  return config ? resolveCachedDsImageConfig(config) : (contextConfig ?? configCache.defaultConfig);
}

export function useDsImage(config?: ImageConfig | ResolvedImageConfig): DsImage {
  return dsImageForConfig(useDsImageConfig(config));
}

export function resolveCachedDsImageConfig(config: ImageConfig | ResolvedImageConfig | undefined): ResolvedImageConfig {
  return configCache.resolve(config);
}

export function dsImageForConfig(config: ResolvedImageConfig): DsImage {
  return configCache.image(config);
}
