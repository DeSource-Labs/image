# @desource/image-angular

Production-ready Angular components, directives, provider integration, and SSR middleware for responsive image optimization.

The package uses standalone components, signal inputs, `OnPush` change detection, and pure URL generation from [`@desource/image`](../core). It supports Angular 19, 20, and 21.

## Install

```sh
pnpm add @desource/image-angular
```

Install `ipx` when the application serves local `/_ipx` transformations itself:

```sh
pnpm add ipx
```

`ipx` is optional when every image uses a hosted provider such as Vercel, Netlify, Cloudinary, or Imgix. Add `@desource/image` as a direct dependency only when the application imports its provider factories or utilities directly.

## Configure Angular

Register the image configuration in `app.config.ts`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideDsImage } from '@desource/image-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDsImage({
      quality: 80,
      screens: { sm: 640, md: 768, lg: 1024 },
      domains: ['images.example.com']
    })
  ]
};
```

Configuration is optional. With no explicit provider, the shared runtime uses `std-env` to select AWS Amplify, Netlify, or Vercel when the build environment identifies one of those platforms, and falls back to IPX everywhere else. There are no Desource-specific environment variables or host/DOM heuristics.

`provideDsImage()` also registers Angular's `IMAGE_LOADER`, so the same provider can power `NgOptimizedImage`:

```ts
import { NgOptimizedImage } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgOptimizedImage],
  template: `<img ngSrc="/img/hero.jpg" alt="Mountain lake" width="1200" height="800" />`
})
export class HeroComponent {}
```

## Image component

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsImageComponent } from '@desource/image-angular';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [DsImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-image
      src="/img/hero.jpg"
      alt="Aurora above a mountain lake"
      width="1600"
      height="900"
      sizes="100vw md:50vw lg:800px"
      format="webp"
      quality="82"
      placeholder
      [preload]="{ fetchPriority: 'high' }"
      class="hero"
      (load)="onHeroLoad()"
    />
  `
})
export class HeroComponent {
  onHeroLoad(): void {}
}
```

The custom-element host uses `display: contents`; the visible element is the generated native `<img>`. `alt` is required. Numeric and boolean template attributes are coerced, and source changes recompute the output reactively.

## Picture component

```html
<ds-picture
  src="/img/hero.jpg"
  alt="Responsive mountain landscape"
  width="1600"
  height="900"
  sizes="100vw md:50vw lg:800px"
  [formats]="['avif', 'webp']"
  fallbackFormat="jpg"
  imgClass="hero"
/>
```

This renders a native `<picture>` with an ordered `<source>` for every format and a fallback `<img>`. `format="avif,webp"`, `[format]="['avif', 'webp']"`, and the Nuxt-compatible `legacyFormat` alias are also supported.

## Directives for native elements

Use the standalone directives when application markup should remain a regular `<img>` or `<picture>`:

```ts
import { Component } from '@angular/core';
import { DsImageDirective, DsPictureDirective } from '@desource/image-angular';

@Component({
  standalone: true,
  imports: [DsImageDirective, DsPictureDirective],
  template: `
    <img
      dsImage="/img/card.jpg"
      alt="A coastal village"
      width="720"
      height="480"
      densities="1x 2x"
      placeholder
      (dsLoad)="onImageLoad()"
      (dsError)="onImageError()"
    />

    <picture
      dsPicture="/img/card.jpg"
      alt="A coastal village at sunset"
      width="720"
      height="480"
      [formats]="['avif', 'webp']"
      (dsLoad)="onImageLoad()"
    >
      <img alt="A coastal village at sunset" />
    </picture>
  `
})
export class CardComponent {
  onImageLoad(): void {}
  onImageError(): void {}
}
```

Directive outputs intentionally use `(dsLoad)` and `(dsError)` so they do not recursively collide with native DOM events. Component outputs use `(load)` and `(error)`. A `dsPicture` element must contain one fallback `<img>`; generated `<source>` elements are managed around it.

## Responsive images

`sizes` accepts either Nuxt-style breakpoint syntax or a record:

```html
<ds-image src="/img/gallery.jpg" alt="Gallery" width="1200" sizes="100vw sm:50vw lg:600px" densities="1x 2x" />
```

```ts
sizes = { sm: '100vw', md: '50vw', lg: 600 };
```

The core engine deduplicates candidate widths, clamps them to provider-supported sizes where required, and generates deterministic `srcset` and `sizes` values for SSR and browser rendering.

## Placeholders and preloads

```html
<ds-image src="/img/hero.jpg" alt="Hero" width="1200" placeholder placeholderClass="blur" />
<ds-image src="/img/hero.jpg" alt="Hero" width="1200" [placeholder]="[48, 32, 25, 8]" />
<ds-image src="/img/hero.jpg" alt="Hero" width="1200" placeholder="data:image/png;base64,..." />
```

- `placeholder` generates a small transformed image; a tuple controls width, height, quality, and blur.
- A string can be a custom URL or data URL.
- The full image is preloaded off-screen and replaces the placeholder only after decode succeeds.
- `placeholderClass` is present only while the placeholder is visible.
- `preload` inserts a responsive `<link rel="preload" as="image">` into the document head. Identical links are reference-counted and removed during teardown.
- `priority` sets eager loading and high fetch priority. Use `preload` when a head link is also required.

Placeholder and preload state starts identically during SSR and hydration.

## Native attributes

The components expose common native attributes directly, including `class`, `style`, `id`, `role`, ARIA labels, `referrerpolicy`, `crossorigin`, `usemap`, and `data-testid`.

Use `nativeAttrs` for arbitrary image attributes:

```html
<ds-image src="/img/hero.jpg" alt="Hero" [nativeAttrs]="{ 'data-track': 'hero', draggable: false }" />
```

For `<ds-picture>`, use `imgAttrs`, `imgClass`, and `imgStyle` for its fallback image. Generated attributes such as `src`, `srcset`, dimensions, loading, and decoding cannot be overridden accidentally.

## Callable helper service

```ts
import { inject } from '@angular/core';
import { DsImageService } from '@desource/image-angular';

const $img = inject(DsImageService).create();
const url = $img('/img/hero.jpg', { width: 800, format: 'webp', quality: 75 });
const attrs = $img.getAttrs({ src: '/img/hero.jpg', alt: 'Hero', width: 800 });
```

The callable helper also exposes `getImage`, `getSizes`, `getMeta`, `getPicture`, `getPreloadLink`, and one shortcut for every configured preset.

## Providers and presets

Convenience providers are available for the most common deployment paths:

```ts
import { provideDsAwsAmplifyImage, provideDsIpxImage, provideDsVercelImage } from '@desource/image-angular';

provideDsIpxImage();
provideDsVercelImage();
provideDsAwsAmplifyImage();
```

Register any built-in or custom provider through the shared package:

```ts
import { cloudinaryProvider } from '@desource/image/providers/cloudinary';
import { provideDsImage } from '@desource/image-angular';

provideDsImage({
  provider: 'cloudinary',
  providers: {
    cloudinary: cloudinaryProvider({ cloudName: 'demo' })
  },
  presets: {
    avatar: { width: 96, height: 96, fit: 'cover', quality: 80 }
  }
});
```

```html
<ds-image preset="avatar" src="/users/ada.jpg" alt="Ada" />
```

The complete provider list and custom-provider contract are documented in [`@desource/image`](../core).

## Local IPX in Angular SSR

Place the image middleware before static-file and Angular SSR handlers in the server entry:

```ts
import { createDsImageMiddleware } from '@desource/image-angular/server';

app.use(
  createDsImageMiddleware({
    dirs: [browserDistFolder],
    domains: ['images.example.com'],
    maxAge: 60 * 60 * 24 * 30
  })
);
```

Keep the Sharp-based optimizer out of the Angular server bundle:

```json
{
  "projects": {
    "app": {
      "architect": {
        "build": {
          "options": {
            "externalDependencies": ["@desource/image-angular/server"]
          }
        }
      }
    }
  }
}
```

The middleware loads `ipx` lazily and only for requests under `/_ipx`. Local directories resolve from the server process, remote optimization is denied by default, and `domains` should contain every trusted remote host. Set `allowAllDomains: true` only for a deliberately open proxy.

Hosted providers generate URLs but do not emulate their platform endpoint. For example, use the Vercel provider with Vercel image configuration, not with the IPX middleware.

## Package checks

```sh
pnpm --filter @desource/image-angular build
pnpm --filter @desource/image-angular typecheck
pnpm --filter @desource/image-angular test:unit:coverage
pnpm --filter @desource/image-angular test:e2e
pnpm --filter @desource/image-angular publish:check
```

## License

MIT
