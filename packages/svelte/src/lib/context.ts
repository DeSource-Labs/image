import { getContext, setContext } from 'svelte';
import {
  createImage,
  resolveImageConfig,
  type DesourceImage,
  type ImageConfig,
  type ResolvedImageConfig
} from '@desource/image';
import { createImageConfigCache } from '@desource/image/kit';

const IMAGE_CONFIG_KEY = Symbol('desource-image-config');
const configCache = createImageConfigCache({ resolveConfig: resolveImageConfig, createImage });

export function createImageConfig(config: ImageConfig = {}): ResolvedImageConfig {
  return resolveCachedConfig(config);
}

export function setImageConfig(config: ImageConfig | ResolvedImageConfig = {}): ResolvedImageConfig {
  const resolved = resolveCachedConfig(config);
  setContext(IMAGE_CONFIG_KEY, resolved);
  return resolved;
}

export function getImageConfig(): ResolvedImageConfig {
  return getContext<ResolvedImageConfig | undefined>(IMAGE_CONFIG_KEY) ?? configCache.defaultConfig;
}

export function useImage(): DesourceImage {
  return imageForConfig(getImageConfig());
}

export function resolveCachedConfig(config: ImageConfig | ResolvedImageConfig | undefined): ResolvedImageConfig {
  return configCache.resolve(config);
}

export function imageForConfig(config: ResolvedImageConfig): DesourceImage {
  return configCache.image(config);
}
