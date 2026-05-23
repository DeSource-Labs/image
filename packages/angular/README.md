# @desource/angular-image

Angular components for Desource Image.

## Install

```sh
pnpm add @desource/angular-image @desource/image-core
```

Peer dependencies support Angular `^19.0.0 || ^20.0.0 || ^21.0.0`. The package is built with Angular 21.2.12 and uses standalone signal-input components.

## Configure

```ts
import { type ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideDsImage } from '@desource/angular-image';
import { vercelProvider } from '@desource/image-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideDsImage({
      provider: 'vercel',
      providers: {
        vercel: vercelProvider()
      },
      quality: 75,
      format: ['avif', 'webp'],
      screens: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536
      }
    })
  ]
};
```

`provideDsVercelImage(config)` is also available as a small convenience wrapper.

## Image

```html
<ds-image
  src="/my_image.png"
  alt="Hero"
  width="2200"
  height="1200"
  quality="75"
  sizes="100vw md:1100px"
  format="webp"
  loading="eager"
  fetchpriority="high"
/>
```

`priority` sets `loading="eager"`, `fetchpriority="high"`, and `decoding="sync"`.

## Picture

```html
<ds-picture
  src="/hero.png"
  alt="Hero"
  [width]="2200"
  [height]="1200"
  sizes="100vw md:1100px"
  [format]="['avif', 'webp']"
/>
```

This renders `<source type="image/avif">`, `<source type="image/webp">`, and a fallback `<img>`.

## Providers

### Vercel

```ts
provideDsImage({
  provider: 'vercel',
  providers: {
    vercel: vercelProvider()
  },
  domains: ['images.unsplash.com']
});
```

Vercel project config should include compatible `images.sizes`, `images.qualities`, `images.formats`, `images.localPatterns`, `images.remotePatterns` or `domains`, and `minimumCacheTTL`.

### Cloudinary

```ts
import { cloudinaryProvider } from '@desource/image-core';

provideDsImage({
  provider: 'cloudinary',
  providers: {
    cloudinary: cloudinaryProvider({ cloudName: 'demo' })
  }
});
```

## Presets

```ts
provideDsImage({
  presets: {
    avatar: {
      width: 96,
      height: 96,
      fit: 'cover',
      quality: 80
    }
  }
});
```

```html
<ds-image preset="avatar" src="/user.png" alt="User" />
```

## Aliases

```ts
provideDsImage({
  aliases: {
    unsplash: 'https://images.unsplash.com'
  },
  domains: ['images.unsplash.com']
});
```

```html
<ds-image src="/unsplash/photo-id" alt="Remote image" width="800" />
```

## Placeholders

```html
<ds-image src="/hero.png" alt="Hero" width="1200" placeholder placeholderClass="blur" />
<ds-image src="/hero.png" alt="Hero" width="1200" [placeholder]="[48, 32, 25, 8]" />
<ds-image src="/hero.png" alt="Hero" width="1200" placeholder="data:image/png;base64,..." />
```

The placeholder is rendered as a deterministic background image until the real image load event fires on the client.

## Native Attributes

Common native attributes are inputs: `class`, `style`, `id`, `role`, `aria-label`, `aria-describedby`, `referrerpolicy`, `crossorigin`, `usemap`, and `data-testid`.

For arbitrary attributes use:

```html
<ds-image src="/hero.png" alt="Hero" [nativeAttrs]="{ 'data-track': 'hero' }" />
```

Angular components have a custom-element host, so the package sets `display: contents` on the host and forwards supported attributes to the inner `<img>`.

## SSR Notes

All URLs and attributes are computed from pure core helpers. Placeholder loaded state starts as not loaded on both server and client to avoid hydration mismatch. Automatic preload link injection is not implemented yet; use `getImagePreloadLink` from core for a custom Angular SSR integration.
