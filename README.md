<div align="center">
  <h1>Desource Image</h1>
  <p><strong>Responsive images for Angular, React/Next.js, and Svelte/SvelteKit with one provider model.</strong></p>

  <p>
    <a href="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml"><img src="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="https://codecov.io/gh/DeSource-Labs/image"><img src="https://codecov.io/gh/DeSource-Labs/image/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://www.npmjs.com/package/@desource/image"><img src="https://img.shields.io/npm/v/@desource/image?logo=npm" alt="@desource/image"></a>
    <a href="https://www.npmjs.com/package/@desource/image-angular"><img src="https://img.shields.io/npm/v/@desource/image-angular?logo=angular&logoColor=white" alt="@desource/image-angular"></a>
    <a href="https://www.npmjs.com/package/@desource/image-react"><img src="https://img.shields.io/npm/v/@desource/image-react?logo=react" alt="@desource/image-react"></a>
    <a href="https://www.npmjs.com/package/@desource/image-svelte"><img src="https://img.shields.io/npm/v/@desource/image-svelte?logo=svelte" alt="@desource/image-svelte"></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
  </p>

  <p>
    <a href="#quick-start">Quick start</a> ·
    <a href="#packages">Packages</a> ·
    <a href="#features">Features</a> ·
    <a href="#providers">Providers</a> ·
    <a href="#local-optimization">Local optimization</a> ·
    <a href="#development">Development</a>
  </p>
</div>

---

Desource Image gives Angular, React, and Svelte applications the image workflow developers like in `@nuxt/image`, while keeping each framework's rendering API native.

One shared engine generates provider URLs, responsive `srcset`, `<picture>` sources, placeholders, preload metadata, presets, aliases, source validation, and local IPX routes. Framework packages own the rendering layer, so the output stays idiomatic: Angular components/directives, React components/hooks, and Svelte components/actions/attachments.

## What it solves

Images tend to leak into every layer of an app:

- CMS URLs need aliases, validation, and provider-specific modifiers.
- Responsive images need repeatable width and density candidates.
- Modern formats need ordered `<source>` elements and reliable fallbacks.
- Local development needs an optimizer endpoint when the production provider is not available.
- SSR needs deterministic attributes so hydration does not rewrite image markup.
- LCP images need preload links and fetch priority without hand-maintained `<head>` tags.

Desource Image keeps those rules in one config object and lets each framework render native markup.

## Why use it instead of the framework default?

Framework defaults are useful, and this package does not try to replace them in every app. Desource Image is for the cases where image rules need to outlive a single framework component or hosting provider.

| Stack                 | Default path                                                                                              | Use Desource Image when                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| React                 | React has no built-in optimizer.                                                                          | You want components, hooks, provider URLs, responsive attributes, placeholders, and local/hosted optimizers from one package.       |
| Next.js               | [`next/image`](https://nextjs.org/docs/app/getting-started/images) is a good default for Next-only apps.  | You need a portable provider model, first-class `<picture>`, presets, aliases, source validation, Vite support, or a custom loader. |
| Angular               | [`NgOptimizedImage`](https://angular.dev/guide/image-optimization) enforces Angular image best practices. | You need Angular components plus directives, `<picture>`, a provider catalog, custom providers, presets, aliases, and SSR IPX.      |
| SvelteKit             | [`@sveltejs/enhanced-img`](https://svelte.dev/docs/kit/images) works well for static local build assets.  | Images are dynamic, remote, CMS-backed, provider-backed, or need runtime optimization and Svelte components/actions/attachments.    |
| Multi-framework teams | Each framework owns different image rules.                                                                | One config can drive Angular, React, Svelte, server helpers, provider tests, and design-system APIs.                                |

In short: use the framework default when the app is simple and framework-specific. Use Desource Image when provider behavior, responsive rules, and server routes should be shared and typed.

## Packages

| Package                                                        | Use it for                                                                                                                   |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [`@desource/image`](./packages/core)                           | Framework-independent URL generation, responsive attributes, picture sources, config, presets, aliases, and provider tools.  |
| [`@desource/image-angular`](./packages/angular)                | Angular standalone components, native-element directives, `IMAGE_LOADER`, helper service, head preloads, and SSR middleware. |
| [`@desource/image-react`](./packages/react)                    | React components, hooks, provider context, head preloads, Vite middleware, and optional Next.js helpers.                     |
| [`@desource/image-svelte`](./packages/svelte)                  | Svelte 5 components, actions, Svelte 5.29+ attachments, SSR prop helpers, Vite integration, and SvelteKit handlers.          |
| [`@desource/image/providers/*`](./packages/core/src/providers) | Tree-shakable provider modules for Cloudinary, Imgix, Sanity, ImageKit, Vercel, Netlify, IPX, and more.                      |

Install only the framework package your app uses. Install `@desource/image` directly when you import core helpers or provider factories yourself.

## Quick start

### React

```sh
npm install @desource/image-react
```

```tsx
import { Image, Picture } from '@desource/image-react';

export function Gallery() {
  return (
    <>
      <Image
        src="/img/hero.jpg"
        alt="Mountain lake at sunrise"
        width={1600}
        height={1000}
        sizes="100vw md:760px"
        format="webp"
        quality={76}
        placeholder
        preload={{ fetchPriority: 'high' }}
      />

      <Picture
        src="/img/card.jpg"
        alt="Cabin under the stars"
        width={960}
        height={640}
        formats={['avif', 'webp']}
        fallbackFormat="jpg"
      />
    </>
  );
}
```

Use `@desource/image-react/next` when you want a `next/image` loader or an App Router IPX route handler.

### Angular

```sh
npm install @desource/image-angular
```

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsImageComponent, DsPictureDirective } from '@desource/image-angular';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [DsImageComponent, DsPictureDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-image
      src="/img/hero.jpg"
      alt="Mountain lake at sunrise"
      width="1600"
      height="1000"
      sizes="100vw md:760px"
      format="webp"
      quality="76"
      placeholder
      [preload]="{ fetchPriority: 'high' }"
    />

    <picture
      dsPicture="/img/card.jpg"
      alt="Cabin under the stars"
      width="960"
      height="640"
      [formats]="['avif', 'webp']"
      fallbackFormat="jpg"
    >
      <img alt="Cabin under the stars" />
    </picture>
  `
})
export class GalleryComponent {}
```

Angular applications can also use `provideDsImage()` to configure providers and register Angular's `IMAGE_LOADER`.

### SvelteKit

```sh
npm install @desource/image-svelte
```

```svelte
<script lang="ts">
  import { Image, Picture } from '@desource/image-svelte';
</script>

<Image
  src="/img/hero.jpg"
  alt="Mountain lake at sunrise"
  width={1600}
  height={1000}
  sizes="100vw md:760px"
  format="webp"
  quality={76}
  placeholder
  preload={{ fetchPriority: 'high' }}
/>

<Picture
  src="/img/card.jpg"
  alt="Cabin under the stars"
  width={960}
  height={640}
  formats={['avif', 'webp']}
  fallbackFormat="jpg"
/>
```

Use `@desource/image-svelte/vite` for Vite dev/preview IPX middleware and `@desource/image-svelte/server` for production SvelteKit IPX handlers.

### Core TypeScript

```sh
npm install @desource/image
```

```ts
import { createImage } from '@desource/image';

const image = createImage({
  quality: 76,
  presets: {
    avatar: { width: 96, height: 96, fit: 'cover', format: 'webp' }
  }
});

const url = image('/img/hero.jpg', { width: 800, format: 'webp' });

const attrs = image.getAttrs({
  src: '/img/hero.jpg',
  alt: 'Mountain lake',
  width: 1600,
  height: 1000,
  sizes: '100vw md:760px',
  placeholder: true
});

const picture = image.getPicture({
  src: '/img/hero.jpg',
  alt: 'Mountain lake',
  width: 1600,
  height: 1000,
  formats: ['avif', 'webp'],
  fallbackFormat: 'jpg'
});
```

## Features

- Native framework APIs: Angular components/directives, React components/hooks, and Svelte components/actions/attachments.
- Responsive images: width descriptors, density descriptors, breakpoint strings, object syntax, candidate deduplication, and provider-size normalization.
- Picture output: ordered AVIF/WebP/etc. `<source>` elements plus a fallback `<img>`.
- Placeholders: generated low-resolution provider URLs, custom URLs, custom `[width, height, quality, blur]` tuples, decode-before-swap behavior, and temporary classes.
- Head preloads: responsive `<link rel="preload" as="image">` generation with reference counting in framework packages.
- Providers: small default registry, complete provider catalog, tree-shakable subpath imports, and typed custom providers.
- Presets and aliases: reusable image defaults and clean source aliases for CMS or asset hosts.
- Source controls: `domains`, `localPatterns`, `remotePatterns`, and invalid-source policies.
- Server adapters: IPX middleware for Angular SSR, React/Vite, Next.js App Router, SvelteKit, Fetch API servers, and Connect/Express-style Node servers.
- Package validation: strict TypeScript, unit coverage gates, Playwright e2e, `publint`, and Are The Types Wrong checks.

## One image input model

The same core inputs work across all framework packages.

| Input                                      | Purpose                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `src`, `alt`                               | Source and accessible alternative text. Framework components require `alt`. |
| `width`, `height`                          | Intrinsic dimensions and aspect-ratio information.                          |
| `sizes`                                    | Browser sizes string or breakpoint shorthand such as `100vw md:760px`.      |
| `densities`                                | Density candidates such as `1x 2x`, `[1, 2]`, or `1`.                       |
| `format`, `formats`                        | Single output format or ordered picture formats.                            |
| `fallbackFormat`, `legacyFormat`           | Fallback `<img>` format for picture output.                                 |
| `quality`, `fit`, `position`, `background` | Common image modifiers promoted into provider input.                        |
| `modifiers`                                | Provider-specific recursive modifier values.                                |
| `provider`, `preset`                       | Per-image provider and preset overrides.                                    |
| `placeholder`, `placeholderClass`          | Low-resolution placeholder behavior and temporary class.                    |
| `priority`, `preload`                      | Loading hints and head preload generation.                                  |
| `loading`, `decoding`, `fetchpriority`     | Native browser image hints.                                                 |

## Configuration

Configuration is optional. With no explicit provider, `provider: 'auto'` uses deployment detection and falls back to IPX.

```ts
import { cloudinaryProvider } from '@desource/image/providers/cloudinary';

export const imageConfig = {
  provider: 'cloudinary',
  quality: 76,
  screens: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  },
  densities: [1, 2],
  aliases: {
    media: 'https://assets.example.com'
  },
  domains: ['assets.example.com'],
  localPatterns: [{ pathname: '/img/**' }],
  remotePatterns: [{ protocol: 'https', hostname: '*.example.com', pathname: '/media/**' }],
  presets: {
    card: {
      width: 960,
      height: 640,
      sizes: '100vw md:480px',
      format: 'webp'
    }
  },
  providers: {
    cloudinary: cloudinaryProvider({ cloudName: 'demo' })
  },
  onInvalidSource: 'warn'
} as const;
```

Provider setup is memoized. Framework packages resolve config once per Angular injector, React provider config object, or Svelte config object.

### Provider detection

When `provider` is omitted or set to `auto`, `std-env` is evaluated once.

| Runtime             | Provider            |
| ------------------- | ------------------- |
| Vercel              | `vercel`            |
| AWS Amplify         | `awsAmplify`        |
| Netlify             | `netlifyImageCdn`   |
| Netlify Large Media | `netlifyLargeMedia` |
| Other / local       | `ipx`               |

An explicit `provider` always wins. There are no package-specific environment-variable overrides or browser hostname heuristics.

## Providers

The default registry is intentionally small:

- `ipx`
- `ipxStatic`
- `vercel`
- `awsAmplify`
- `netlify`
- `netlifyImageCdn`
- `netlifyLargeMedia`
- `none`

Import the complete catalog only when needed:

```ts
import { BUILT_IN_PROVIDER_NAMES, createBuiltInProviders } from '@desource/image/providers';
```

Prefer provider subpaths for application code:

```ts
import { cloudinaryProvider } from '@desource/image/providers/cloudinary';
import { imgixProvider } from '@desource/image/providers/imgix';
import { sanityProvider } from '@desource/image/providers/sanity';
```

Supported provider modules:

`aliyun`, `awsAmplify`, `builderio`, `bunny`, `caisy`, `cloudflare`, `cloudflareimages`, `cloudimage`, `cloudinary`, `contentful`, `directus`, `edgeonePages`, `fastly`, `filerobot`, `flyimg`, `github`, `glide`, `gumlet`, `hygraph`, `imageengine`, `imagekit`, `imgix`, `imgproxy`, `ipx`, `ipxStatic`, `netlify`, `netlifyImageCdn`, `netlifyLargeMedia`, `none`, `picsum`, `prepr`, `prismic`, `sanity`, `shopify`, `sirv`, `storyblok`, `strapi`, `strapi5`, `supabase`, `twicpics`, `umbraco`, `unsplash`, `uploadcare`, `vercel`, `wagtail`, and `weserv`.

## Local optimization

The IPX provider generates URLs such as:

```text
/_ipx/w_800&f_webp&q_76/img/hero.jpg
```

URL generation does not transform bytes. The application must expose an optimizer route when using local IPX URLs.

| Stack                        | Integration                                                             |
| ---------------------------- | ----------------------------------------------------------------------- |
| Angular SSR                  | `createDsImageMiddleware()` from `@desource/image-angular/server`       |
| React + Vite                 | `desourceImage()` from `@desource/image-react/vite`                     |
| Next.js App Router           | `createNextImageRouteHandler()` from `@desource/image-react/next`       |
| SvelteKit dev/preview        | `desourceImage()` from `@desource/image-svelte/vite`                    |
| SvelteKit production         | `createDsImageHandle()` from `@desource/image-svelte/server`            |
| Fetch API server             | `createDsImageWebHandler()` from the React or Svelte server subpath     |
| Connect/Express-style server | `createDsImageNodeMiddleware()` from the React or Svelte server subpath |

Remote IPX requests are denied by default. Add trusted `domains`; use `allowAllDomains: true` only for an intentionally public optimizer.

Hosted providers such as Vercel, Netlify, Cloudinary, Imgix, Sanity, or ImageKit do not need the local IPX server unless you also use IPX URLs.

## Framework notes

### Angular

- Standalone components and directives.
- Signal inputs and `OnPush` change detection.
- Component outputs use `(load)` and `(error)`.
- Directive outputs use `(dsLoad)` and `(dsError)` to avoid recursive native event collisions.
- `provideDsImage()` also registers Angular's `IMAGE_LOADER`.
- Angular package output uses Angular Package Format.

### React and Next.js

- Components render native `<img>` and `<picture>` elements.
- Hooks return props for application-owned native markup.
- Components forward refs to the rendered DOM element.
- The main entry is a client entry; server-only Next helpers are available from `@desource/image-react/next`.
- Optional Vite middleware serves local IPX URLs in development and preview.

### Svelte and SvelteKit

- Components render native image markup without wrapper elements.
- Actions and Svelte 5.29+ attachments support native `<img>` and `<picture>` elements.
- `getImageProps()` and `getPictureProps()` support SSR and custom rendering.
- SvelteKit can use native platform image endpoints or the package IPX handle.

## Compatibility

- Node.js 22.18 or newer for development and server integrations
- Angular 19, 20, 21, or 22
- React 18.3 or 19
- Next.js 14, 15, or 16 for optional Next helpers
- Svelte 5; attachments require Svelte 5.29 or newer
- Vite 6, 7, or 8 for optional React and Svelte Vite integrations
- Modern ESM bundlers and Node ESM

## Documentation

- [Core package](./packages/core)
- [Angular package](./packages/angular)
- [React package](./packages/react)
- [Svelte package](./packages/svelte)
- [Contributing guide](./CONTRIBUTING.md)
- [Security policy](./SECURITY.md)

## Development

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm test:unit:coverage
pnpm test:e2e
pnpm validate:packages
```

Start the demo site:

```sh
pnpm dev:prepare
pnpm dev:demo
```

Run the full release gate:

```sh
pnpm check:release
```

That command runs formatting, linting, Changesets status, peer checks, production audit, package builds, demo builds, type checks, package metadata validation, unit coverage, and e2e tests.

For package changes intended for npm, add a changeset:

```sh
pnpm changeset
```

## Inspiration and scope

The provider catalog and modifier behavior are inspired by `@nuxt/image` and tested against a pinned Nuxt Image package where parity is useful. The framework integrations are separate implementations built for Angular, React, and Svelte. Nuxt applications should continue to use `@nuxt/image`.

## License

[MIT](./LICENSE) © 2026 DeSource Labs
