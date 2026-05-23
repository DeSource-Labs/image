import { getContext, setContext } from 'svelte';
import { resolveImageConfig, type ImageConfig, type ResolvedImageConfig } from '@desource/image-core';

const IMAGE_CONFIG_KEY = Symbol('desource-image-config');

export function createImageConfig(config: ImageConfig): ResolvedImageConfig {
  return resolveImageConfig(config);
}

export function setImageConfig(config: ImageConfig | ResolvedImageConfig): ResolvedImageConfig {
  const resolved = isResolvedImageConfig(config)
    ? config
    : resolveImageConfig(config);
  setContext(IMAGE_CONFIG_KEY, resolved);
  return resolved;
}

export function getImageConfig(): ResolvedImageConfig {
  return getContext<ResolvedImageConfig | undefined>(IMAGE_CONFIG_KEY) ?? resolveImageConfig();
}

function isResolvedImageConfig(config: ImageConfig | ResolvedImageConfig): config is ResolvedImageConfig {
  return 'providerOptions' in config && 'providers' in config && 'providerSizes' in config;
}
