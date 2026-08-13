import { getContext, setContext } from 'svelte';
import {
  createImage,
  resolveImageConfig,
  type DesourceImage,
  type ImageConfig,
  type ResolvedImageConfig
} from '@desource/image';
import { isResolvedImageConfig } from '@desource/image/kit';

const IMAGE_CONFIG_KEY = Symbol('desource-image-config');
const defaultConfig = resolveImageConfig();
const images = new WeakMap<ResolvedImageConfig, DesourceImage>();
const resolvedConfigs = new WeakMap<object, ResolvedImageConfig>();

export function createImageConfig(config: ImageConfig = {}): ResolvedImageConfig {
  return resolveCachedConfig(config);
}

export function setImageConfig(config: ImageConfig | ResolvedImageConfig = {}): ResolvedImageConfig {
  const resolved = resolveCachedConfig(config);
  setContext(IMAGE_CONFIG_KEY, resolved);
  return resolved;
}

export function getImageConfig(): ResolvedImageConfig {
  return getContext<ResolvedImageConfig | undefined>(IMAGE_CONFIG_KEY) ?? defaultConfig;
}

export function useImage(): DesourceImage {
  return imageForConfig(getImageConfig());
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
