import { detectProvider as detectStdEnvProvider, provider as stdEnvProvider } from 'std-env';
import type { ImageConfig, ImageContext, ImageInput, ImagePreloadLink, ImageProviderResult, PictureAttrs, ResolvedImageConfig } from './types.js';
import { createDefaultProviders } from './providers/default.js';
import { getImage, getImageAttrs, getImagePreloadLink, getPictureAttrs } from './image.js';

declare const __DESOURCE_IMAGE_PROVIDER__: string | undefined;

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
    provider: config.provider ?? 'auto',
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

export function detectImageProvider(): string {
  const env = runtimeEnv();
  const forced = env['DESOURCE_IMAGE_PROVIDER']
    ?? env['PUBLIC_DESOURCE_IMAGE_PROVIDER']
    ?? env['VITE_DESOURCE_IMAGE_PROVIDER']
    ?? env['NUXT_IMAGE_PROVIDER'];

  if (forced) {
    return forced;
  }

  const stdDetected = normalizeStdEnvProvider(detectStdEnvProvider().name || stdEnvProvider);
  if (stdDetected) {
    return stdDetected;
  }

  const rendered = detectRenderedProvider();
  if (rendered) {
    return rendered;
  }

  if (env['AWS_AMPLIFY'] || env['AWS_APP_ID'] || isAwsAmplifyHost()) {
    return 'awsAmplify';
  }

  if (env['VERCEL'] || env['VERCEL_ENV'] || env['NOW_BUILDER'] || env['NEXT_PUBLIC_VERCEL_URL'] || env['VERCEL_URL'] || isVercelHost()) {
    return 'vercel';
  }

  if (env['NETLIFY'] || env['NETLIFY_LOCAL'] || isNetlifyHost()) {
    return 'netlify';
  }

  return 'ipx';
}

function normalizeStdEnvProvider(value: string | undefined): string | undefined {
  const providers: Record<string, string> = {
    aws_amplify: 'awsAmplify',
    netlify: 'netlify',
    vercel: 'vercel'
  };

  return value ? providers[value] : undefined;
}

function runtimeEnv(): Record<string, string | undefined> {
  const candidate = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };
  const compiled = compiledProvider();

  return {
    ...(candidate.process?.env ?? {}),
    ...(compiled ? { PUBLIC_DESOURCE_IMAGE_PROVIDER: compiled } : {})
  };
}

function compiledProvider(): string | undefined {
  try {
    return typeof __DESOURCE_IMAGE_PROVIDER__ === 'undefined' ? undefined : __DESOURCE_IMAGE_PROVIDER__;
  } catch {
    return undefined;
  }
}

function isVercelHost(): boolean {
  return typeof globalThis.location !== 'undefined' && /\.vercel\.app$/i.test(globalThis.location.hostname);
}

function isNetlifyHost(): boolean {
  return typeof globalThis.location !== 'undefined' && /\.netlify\.app$/i.test(globalThis.location.hostname);
}

function isAwsAmplifyHost(): boolean {
  return typeof globalThis.location !== 'undefined' && /\.amplifyapp\.com$/i.test(globalThis.location.hostname);
}

function detectRenderedProvider(): string | undefined {
  if (typeof globalThis.document === 'undefined') {
    return undefined;
  }

  const document = globalThis.document;
  if (document.querySelector('img[src^="/_vercel/image"],source[srcset^="/_vercel/image"]')) {
    return 'vercel';
  }

  if (document.querySelector('img[src^="/.netlify/images"],source[srcset^="/.netlify/images"]')) {
    return 'netlify';
  }

  if (document.querySelector('img[src^="/_amplify/image"],source[srcset^="/_amplify/image"]')) {
    return 'awsAmplify';
  }

  if (document.querySelector('img[src^="/_ipx/"],source[srcset^="/_ipx/"]')) {
    return 'ipx';
  }

  return undefined;
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
