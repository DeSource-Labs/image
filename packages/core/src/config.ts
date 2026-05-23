import type { ImageConfig, ImageContext, ImageInput, ImagePreloadLink, ImageProviderResult, PictureAttrs, ResolvedImageConfig } from './types.js';
import { createDefaultProviders } from './providers.js';
import { getImage, getImageAttrs, getImagePreloadLink, getPictureAttrs } from './image.js';

export const DEFAULT_SCREENS: Record<string, number> = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export const DEFAULT_PROVIDER_SIZES = [320, 480, 640, 768, 960, 1024, 1280, 1536, 1920, 2560, 3840] as const;

export function resolveImageConfig(config: ImageConfig = {}): ResolvedImageConfig {
  return {
    provider: config.provider ?? 'none',
    quality: config.quality,
    format: config.format,
    screens: { ...DEFAULT_SCREENS, ...config.screens },
    densities: config.densities ? [...config.densities] : [1, 2],
    domains: config.domains ? [...config.domains] : undefined,
    remotePatterns: config.remotePatterns ? [...config.remotePatterns] : undefined,
    localPatterns: config.localPatterns ? [...config.localPatterns] : undefined,
    presets: { ...config.presets },
    aliases: { ...config.aliases },
    providers: { ...createDefaultProviders(), ...config.providers },
    providerOptions: { ...config.providerOptions },
    providerSizes: config.providerSizes ? [...config.providerSizes] : [...DEFAULT_PROVIDER_SIZES],
    onInvalidSource: config.onInvalidSource ?? 'warn'
  };
}

export function createImageContext(config: ImageConfig = {}): ImageContext {
  const resolved = resolveImageConfig(config);
  return {
    config: resolved,
    getImage(input: ImageInput): ImageProviderResult {
      return getImage(input, resolved);
    },
    getImageAttrs(input: ImageInput) {
      return getImageAttrs(input, resolved);
    },
    getPictureAttrs(input: ImageInput): PictureAttrs {
      return getPictureAttrs(input, resolved);
    },
    getPreloadLink(input: ImageInput): ImagePreloadLink {
      return getImagePreloadLink(input, resolved);
    }
  };
}
