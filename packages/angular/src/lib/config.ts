import { IMAGE_LOADER, type ImageLoader, type ImageLoaderConfig } from '@angular/common';
import { InjectionToken, type EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import {
  awsAmplifyProvider,
  createImage,
  type ImageConfig,
  ipxProvider,
  type ResolvedImageConfig,
  resolveImageConfig,
  vercelProvider
} from '@desource/image';

export const DS_IMAGE_CONFIG = new InjectionToken<ResolvedImageConfig>('DS_IMAGE_CONFIG', {
  providedIn: 'root',
  factory: () => resolveImageConfig()
});

export function provideDsImage(config: ImageConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: DS_IMAGE_CONFIG,
      useFactory: () => resolveImageConfig(config)
    },
    {
      provide: IMAGE_LOADER,
      useFactory: (): ImageLoader => createAngularImageLoader(inject(DS_IMAGE_CONFIG))
    }
  ]);
}

export function createAngularImageLoader(config: ResolvedImageConfig): ImageLoader {
  const image = createImage(config);

  return ({ src, width, height, isPlaceholder, loaderParams = {} }: ImageLoaderConfig): string => {
    const { provider, preset, densities, sizes, modifiers: nestedModifiers, ...loaderModifiers } = loaderParams;
    return image(
      src,
      {
        ...loaderModifiers,
        ...(nestedModifiers && typeof nestedModifiers === 'object' ? nestedModifiers : {}),
        width: isPlaceholder ? 10 : width,
        height: isPlaceholder ? 10 : height,
        ...(isPlaceholder ? { quality: 50, blur: 3 } : {})
      },
      { provider, preset, densities, sizes }
    );
  };
}

export function provideDsIpxImage(config: ImageConfig = {}): EnvironmentProviders {
  return provideDsImage({
    ...config,
    provider: config.provider ?? 'ipx',
    providers: {
      ipx: ipxProvider(),
      ...config.providers
    }
  });
}

export function provideDsVercelImage(config: ImageConfig = {}): EnvironmentProviders {
  return provideDsImage({
    ...config,
    provider: config.provider ?? 'vercel',
    providers: {
      vercel: vercelProvider(),
      ...config.providers
    }
  });
}

export function provideDsAwsAmplifyImage(config: ImageConfig = {}): EnvironmentProviders {
  return provideDsImage({
    ...config,
    provider: config.provider ?? 'awsAmplify',
    providers: {
      awsAmplify: awsAmplifyProvider(),
      ...config.providers
    }
  });
}
