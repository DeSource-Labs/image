import { provider as stdEnvProvider } from 'std-env';
import type {
  ImageConfig,
  ImageContext,
  ImageInput,
  ImagePreloadLink,
  ImageProviderResult,
  PictureAttrs,
  ResolvedImageConfig
} from './types.js';
import { createDefaultProviders } from './providers/default.js';
import { getImage, getImageAttrs, getImageMeta, getImagePreloadLink, getPictureAttrs } from './image.js';
import { resolveProviderRegistration } from './provider-utils.js';

declare const __DS_IMAGE_PROVIDER__: string | undefined;

export const DEFAULT_SCREENS: Record<string, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export const DEFAULT_PROVIDER_SIZES = [320, 480, 640, 768, 960, 1024, 1280, 1536, 1920, 2560, 3840] as const;

export function resolveImageConfig(config: ImageConfig = {}): ResolvedImageConfig {
  const provider = detectImageProvider(config.provider);
  const registrations = { ...createDefaultProviders(), ...config.providers };
  const providers = Object.fromEntries(
    Object.entries(registrations).map(([name, registration]) => [name, resolveProviderRegistration(registration)])
  );

  return {
    provider,
    baseURL: config.baseURL ?? '/',
    quality: config.quality,
    format: config.format,
    screens: { ...DEFAULT_SCREENS, ...config.screens },
    densities: config.densities ? [...config.densities] : [1, 2],
    domains: config.domains,
    remotePatterns: config.remotePatterns ? [...config.remotePatterns] : undefined,
    localPatterns: config.localPatterns ? [...config.localPatterns] : undefined,
    presets: { ...config.presets },
    aliases: { ...config.alias, ...config.aliases },
    providers,
    providerOptions: { ...config.providerOptions },
    providerSizes: config.providerSizes ? [...config.providerSizes] : [...DEFAULT_PROVIDER_SIZES],
    onInvalidSource: config.onInvalidSource ?? 'warn'
  };
}

export function detectImageProvider(userInput = 'auto'): string {
  if (userInput && userInput !== 'auto') {
    return userInput;
  }

  const compiled = compiledProvider();
  if (compiled && compiled !== 'auto') {
    return compiled;
  }

  const stdDetected = normalizeStdEnvProvider(stdEnvProvider);
  if (stdDetected) {
    return stdDetected;
  }

  return 'ipx';
}

function normalizeStdEnvProvider(value: string | undefined): string | undefined {
  const providers: Record<string, string> = {
    aws_amplify: 'awsAmplify',
    netlify: isNetlifyLargeMedia() ? 'netlifyLargeMedia' : 'netlifyImageCdn',
    vercel: 'vercel'
  };

  return value ? providers[value] : undefined;
}

function compiledProvider(): string | undefined {
  try {
    return typeof __DS_IMAGE_PROVIDER__ === 'string' ? __DS_IMAGE_PROVIDER__ : undefined;
  } catch {
    return undefined;
  }
}

function isNetlifyLargeMedia(): boolean {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return Boolean(runtime.process?.env?.['NETLIFY_LFS_ORIGIN_URL']);
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
    },
    getMeta(input: ImageInput) {
      return getImageMeta(input, resolved);
    }
  };
}
