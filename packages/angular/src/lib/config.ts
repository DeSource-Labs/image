import { InjectionToken, type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { type ImageConfig, vercelProvider } from '@desource/image-core';

export const DS_IMAGE_CONFIG = new InjectionToken<ImageConfig>('DS_IMAGE_CONFIG', {
  providedIn: 'root',
  factory: () => ({})
});

export function provideDsImage(config: ImageConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: DS_IMAGE_CONFIG,
      useValue: config
    }
  ]);
}

export function provideDsVercelImage(config: ImageConfig = {}): EnvironmentProviders {
  return provideDsImage({
    provider: 'vercel',
    providers: {
      vercel: vercelProvider(),
      ...config.providers
    },
    ...config
  });
}
