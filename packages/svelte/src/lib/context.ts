import { getContext, setContext } from 'svelte';
import {
  createImage,
  resolveImageConfig,
  type DsImage,
  type ImageConfig,
  type ResolvedImageConfig
} from '@desource/image';
import { createImageConfigCache } from '@desource/image/kit';

const IMAGE_CONFIG_KEY = Symbol('ds-image-config');
const configCache = createImageConfigCache({ resolveConfig: resolveImageConfig, createImage });

export function createDsImageConfig(config: ImageConfig = {}): ResolvedImageConfig {
  return resolveCachedDsImageConfig(config);
}

export function setDsImageConfig(config: ImageConfig | ResolvedImageConfig = {}): ResolvedImageConfig {
  const resolved = resolveCachedDsImageConfig(config);
  setContext(IMAGE_CONFIG_KEY, resolved);
  return resolved;
}

export function getDsImageConfig(): ResolvedImageConfig {
  return getContext<ResolvedImageConfig | undefined>(IMAGE_CONFIG_KEY) ?? configCache.defaultConfig;
}

export function useDsImage(): DsImage {
  return dsImageForConfig(getDsImageConfig());
}

export function resolveCachedDsImageConfig(config: ImageConfig | ResolvedImageConfig | undefined): ResolvedImageConfig {
  return configCache.resolve(config);
}

export function dsImageForConfig(config: ResolvedImageConfig): DsImage {
  return configCache.image(config);
}
