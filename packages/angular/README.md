<div align="center">
  <h1>@desource/image-angular</h1>
  <p><strong>Angular image components, directives, provider configuration, Angular IMAGE_LOADER integration, and SSR middleware.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@desource/image-angular"><img src="https://img.shields.io/npm/v/@desource/image-angular?logo=angular&logoColor=white" alt="npm version"></a>
    <a href="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml"><img src="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="https://codecov.io/gh/DeSource-Labs/image"><img src="https://codecov.io/gh/DeSource-Labs/image/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://github.com/DeSource-Labs/image/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
  </p>
</div>

`@desource/image-angular` brings the shared Desource Image engine to Angular through standalone components, native-element directives, a callable service, `IMAGE_LOADER` integration, head preloads, placeholder lifecycle, and lazy IPX middleware for SSR.

The package supports Angular 19, 20, 21, and 22.

## Why use it?

Angular's `NgOptimizedImage` is a strong built-in directive for enforcing image best practices. It can prioritize LCP images, generate `srcset`, work with Angular image loaders, and warn about common layout problems.

Use Desource Image when your image layer needs more than a single `<img>` directive:

- You want Angular components and native-element directives from the same package.
- You need first-class `<picture>` output with AVIF/WebP sources and fallback control.
- You want the same provider, preset, alias, and validation model used by React and Svelte packages.
- You need a larger provider catalog, typed custom providers, or provider behavior inspired by `@nuxt/image`.
- You want local IPX middleware for Angular SSR instead of writing the optimizer route yourself.
- You want generated placeholders, preload links, and provider URLs from one config object.
- You still want to use `NgOptimizedImage`, but with Desource registered as Angular's `IMAGE_LOADER`.

If `NgOptimizedImage` plus one Angular loader already covers your app, keep it. Desource Image is for teams that need Angular-native rendering plus a portable provider model.

Reference: [Angular NgOptimizedImage guide](https://angular.dev/guide/image-optimization).

## Install

```sh
npm install @desource/image-angular
```

Install `ipx` only when the app serves local `/_ipx` transformations itself:

```sh
npm install ipx
```

Hosted providers such as Vercel, Netlify, Cloudinary, Imgix, Sanity, or ImageKit do not need the local optimizer. Add `@desource/image` as a direct dependency only when the application imports core helpers or provider factories directly.

## Configure Angular

Configuration is optional. With no explicit provider, the shared engine detects Vercel, Netlify, or AWS Amplify from the build environment and falls back to IPX.

Register defaults in `app.config.ts`:

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

`provideDsImage()` also registers Angular's `IMAGE_LOADER`, so the same configuration can power `NgOptimizedImage`:

```ts
import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

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
      (error)="onHeroError()"
    />
  `
})
export class HeroComponent {
  onHeroLoad(): void {}
  onHeroError(): void {}
}
```

The host component uses `display: contents`; the visible node is the generated native `<img>`. `alt` is required. Numeric and boolean template attributes are coerced. Signal inputs recompute output when source, modifiers, config, or native attributes change.

## Picture component

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsPictureComponent } from '@desource/image-angular';

@Component({
  standalone: true,
  imports: [DsPictureComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
  `
})
export class HeroPictureComponent {}
```

The component renders a native `<picture>` with ordered `<source>` elements and a fallback `<img>`. `format="avif,webp"`, `[format]="['avif', 'webp']"`, and the `legacyFormat` alias are supported.

## Directives for native markup

Use directives when the template should remain a regular `<img>` or `<picture>`:

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
      fallbackFormat="jpg"
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

Directive outputs use `(dsLoad)` and `(dsError)` so they do not collide with native DOM events. Component outputs use `(load)` and `(error)`.

A `dsPicture` element must contain one fallback `<img>`. The directive manages generated `<source>` elements around that fallback.

## Responsive images

`sizes` accepts a regular browser string, a breakpoint shorthand string, or an object:

```html
<ds-image src="/img/gallery.jpg" alt="Gallery" width="1200" sizes="100vw sm:50vw lg:600px" densities="1x 2x" />
```

```ts
sizes = { sm: '100vw', md: '50vw', lg: 600 };
```

The core engine deduplicates candidate widths, clamps them to provider-supported sizes where required, and generates deterministic `srcset` and `sizes` attributes.

## Placeholders and preloads

```html
<ds-image src="/img/hero.jpg" alt="Hero" width="1200" placeholder placeholderClass="blur" />
<ds-image src="/img/hero.jpg" alt="Hero" width="1200" [placeholder]="[48, 32, 25, 8]" />
<ds-image src="/img/hero.jpg" alt="Hero" width="1200" placeholder="data:image/png;base64,..." />
```

- `placeholder` generates a small transformed image.
- A tuple controls width, height, quality, and blur.
- A string can be a custom URL or data URL.
- The full image is preloaded off-screen and replaces the placeholder only after decode succeeds.
- `placeholderClass` is present only while the placeholder is visible.
- `preload` inserts a responsive `<link rel="preload" as="image">` into the document head.
- Identical preload links are reference-counted and removed during teardown.
- `priority` sets eager loading and high fetch priority. Use `preload` when a head link is also required.

SSR and initial hydration output use the same attributes.

## Native attributes

Components expose common native attributes directly, including `class`, `style`, `id`, `role`, ARIA labels, `referrerpolicy`, `crossorigin`, `usemap`, and `data-testid`.

Use `nativeAttrs` for arbitrary image attributes:

```html
<ds-image src="/img/hero.jpg" alt="Hero" [nativeAttrs]="{ 'data-track': 'hero', draggable: false }" />
```

For `<ds-picture>`, use `imgAttrs`, `imgClass`, and `imgStyle` for the fallback image. Generated attributes such as `src`, `srcset`, dimensions, loading, and decoding are owned by the directive/component and cannot be overridden accidentally.

## Callable helper service

```ts
import { inject } from '@angular/core';
import { DsImageService } from '@desource/image-angular';

const $img = inject(DsImageService).create();

const url = $img('/img/hero.jpg', {
  width: 800,
  format: 'webp',
  quality: 75
});

const attrs = $img.getAttrs({
  src: '/img/hero.jpg',
  alt: 'Hero',
  width: 800
});
```

The callable helper also exposes `getImage`, `getSizes`, `getMeta`, `getPicture`, `getPreloadLink`, and configured preset shortcuts.

## Providers and presets

Convenience providers are available for common deployment paths:

```ts
import { provideDsAwsAmplifyImage, provideDsIpxImage, provideDsVercelImage } from '@desource/image-angular';

provideDsIpxImage();
provideDsVercelImage();
provideDsAwsAmplifyImage();
```

Register built-in or custom providers from the core package:

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

Provider modules and custom-provider utilities are documented in [`@desource/image`](https://github.com/DeSource-Labs/image/tree/main/packages/core).

## Local IPX in Angular SSR

Place the image middleware before static-file and Angular SSR handlers:

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

The middleware loads `ipx` lazily and only handles requests under `/_ipx`. Local directories resolve from the server process. Remote optimization is denied by default; add trusted `domains`, or set `allowAllDomains: true` only for an intentionally public optimizer.

Hosted providers generate platform URLs and should be paired with that platform's image configuration. For example, use the Vercel provider with Vercel image settings, not with the IPX middleware.

## Package checks

```sh
pnpm --filter @desource/image-angular build
pnpm --filter @desource/image-angular typecheck
pnpm --filter @desource/image-angular test:unit:coverage
pnpm --filter @desource/image-angular test:e2e
pnpm --filter @desource/image-angular publish:check
```

## Links

- [Repository](https://github.com/DeSource-Labs/image)
- [Core package](https://github.com/DeSource-Labs/image/tree/main/packages/core)
- [React package](https://github.com/DeSource-Labs/image/tree/main/packages/react)
- [Svelte package](https://github.com/DeSource-Labs/image/tree/main/packages/svelte)
- [Security policy](https://github.com/DeSource-Labs/image/blob/main/SECURITY.md)

## License

MIT © 2026 DeSource Labs
