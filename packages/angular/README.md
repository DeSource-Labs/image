<div align="center">
  <h1>DeSource Image - Optimized images for Angular</h1>
  <p><strong>High-quality image optimization with responsive, provider-first and SSR-friendly workflow for Angular.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@desource/image-angular"><img src="https://img.shields.io/npm/v/@desource/image-angular?logo=angular&logoColor=white" alt="npm version"></a>
    <a href="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml"><img src="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="https://codecov.io/gh/DeSource-Labs/image"><img src="https://codecov.io/gh/DeSource-Labs/image/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://github.com/DeSource-Labs/image/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
  </p>
</div>

AI-assisted development moves ideas into working products quickly. DeSource Image keeps image preparation inside that development loop. Add one suitable local or remote source, then control its output with component inputs.

Keep `/img/hero.jpg` instead of exporting `hero-480.webp`, `hero-960.webp`, and `hero-1600.webp`. DeSource Image turns one image input into provider URLs, responsive `srcset`, `<picture>` sources, placeholders, preload metadata, presets, aliases, source validation, and local IPX routes.

For MVPs and everyday product development, image quality becomes a template edit. Change `quality="80"` to `quality="65"` and keep the same source file, component, and URL.

`@desource/image-angular` provides standalone components, native-element directives, a callable service, and an `IMAGE_LOADER` for `NgOptimizedImage`. Every rendering API keeps native `<img>` and `<picture>` elements in the final output.

Provider configuration is optional. On Vercel, Netlify, or AWS Amplify, DeSource Image selects the platform image service from the deployment environment. Everywhere else, it falls back to the built-in IPX path. An explicit provider always wins.

The package supports Angular 19, 20, 21, and 22.

## Why DeSource Image for Angular?

Angular's `NgOptimizedImage` remains a strong built-in choice for performance checks and loading guidance on a native `<img>`. DeSource Image adds deployment-aware provider selection, native `<picture>` output, per-image providers, and local IPX for Angular SSR.

- **Built for fast product iterations.** Change image quality, format, crop, or responsive sizes in the template. Source files and filenames stay unchanged.
- **One source instead of exported variants.** Start with one suitable image and generate the widths and formats each screen needs.
- **Deployment-aware provider selection.** Leave `provider` on `auto`. DeSource Image detects Vercel, Netlify, or AWS Amplify and uses IPX for local or other environments.
- **`<picture>` is a first-class API.** Components and directives generate ordered AVIF/WebP sources with fallback control.
- **Native framework APIs.** Use standalone components and native-element directives. Output remains native `<img>` and `<picture>` markup.
- **46 built-in provider modules.** Import one provider subpath, use the complete registry, or register a typed custom provider.
- **Built-in local optimizer.** Angular SSR middleware can serve IPX transformations without a separate image service.
- **`NgOptimizedImage` still works.** `provideDsImage()` registers DeSource Image as Angular's `IMAGE_LOADER`.

### How it compares

| Option                                                             | Best fit                                                                         | How optimization is selected                                                                                                                                      | Choose DeSource Image when                                                                                                                                                                                  |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`NgOptimizedImage`](https://angular.dev/guide/image-optimization) | Angular performance checks, loading hints, and responsive `<img>` output         | Generic loader by default; a built-in or custom `IMAGE_LOADER` is selected in Angular configuration. Changing hosts does not select another loader automatically. | You want deployment auto-detection, local IPX, native `<picture>`, per-image providers instead of maintaining an `IMAGE_LOADER`, a broader provider catalog, or shared image configuration outside Angular. |
| [Unpic Angular](https://unpic.pics/img/angular/)                   | Cross-framework responsive images already hosted on recognizable CDN or CMS URLs | Detects the provider from each `src` URL. Local or unknown sources need a fallback or explicit provider; the deployment itself is not the selection signal.       | Vercel, Netlify, or AWS Amplify should choose the optimizer for every source, including relative paths, and you also need presets, aliases, source rules, `<picture>`, or server adapters.                  |

Use `NgOptimizedImage` when its performance guidance and one loader cover the application. Choose DeSource Image when the optimizer should follow the deployment, Angular needs native `<picture>` and local IPX, or the same provider policy must work outside Angular.

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

## DsImage component

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

## DsPicture component

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
