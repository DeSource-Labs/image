import { type ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideDsImage } from '@desource/angular-image';
import { vercelProvider } from '@desource/image-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideClientHydration(),
    provideDsImage({
      provider: 'vercel',
      providers: {
        vercel: vercelProvider()
      },
      quality: 75,
      format: ['avif', 'webp'],
      aliases: {
        unsplash: 'https://images.unsplash.com'
      },
      domains: ['images.unsplash.com'],
      presets: {
        avatar: {
          width: 96,
          height: 96,
          fit: 'cover',
          quality: 80,
          modifiers: { position: 'face' }
        },
        cover: {
          sizes: '100vw md:1100px',
          fit: 'cover',
          quality: 78
        }
      }
    })
  ]
};
