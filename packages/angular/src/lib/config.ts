import { InjectionToken, type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { awsAmplifyProvider, type ImageConfig, ipxProvider, vercelProvider } from '@desource/image-core';

export const DS_IMAGE_CONFIG = new InjectionToken<ImageConfig>('DS_IMAGE_CONFIG', {
  providedIn: 'root',
  factory: () => ({})
});

export function provideDsImage(config: ImageConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: DS_IMAGE_CONFIG,
      useValue: config
    }
  ]);
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
