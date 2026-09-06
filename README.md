<div align="center">
  <h1>DeSource Image<br/>Optimized images for React, Angular, and Svelte</h1>
  <p><strong>High-quality image optimization with responsive, provider-first and SSR-friendly workflow for React/Next.js, Angular, and Svelte/SvelteKit.</strong></p>

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
    <a href="#why-desource-image">Why DeSource Image</a> ·
    <a href="#how-it-compares">Compare</a> ·
    <a href="#provider-detection">Provider detection</a> ·
    <a href="#providers">Providers</a> ·
    <a href="#local-optimization">Local optimization</a> ·
    <a href="#development">Development</a>
  </p>
</div>

---

AI-assisted development moves ideas into working products quickly. DeSource Image keeps image preparation inside that development loop. Add one suitable local or remote source, then control its output with component props.

Keep `/img/hero.jpg` instead of exporting `hero-480.webp`, `hero-960.webp`, and `hero-1600.webp`. DeSource Image turns one image input into provider URLs, responsive `srcset`, `<picture>` sources, placeholders, preload metadata, presets, aliases, source validation, and local IPX routes.

For MVPs and everyday product development, image quality becomes a code edit. Change `quality={80}` to `quality={65}` and keep the same source file, component, and URL.

Provider configuration is optional. On Vercel, Netlify, or AWS Amplify, DeSource Image selects the platform image service from the deployment environment. Everywhere else, it falls back to the built-in IPX path. An explicit provider always wins.

## Why DeSource Image

Framework defaults solve images inside one framework. DeSource Image handles image rules that must work across runtimes, providers, and deployment targets.

- **Built for fast product iterations.** Change image quality, format, crop, or responsive sizes in code. Source files and filenames stay unchanged.
- **One source instead of exported variants.** Start with one suitable image and generate the widths and formats each screen needs.
- **Deployment-aware provider selection.** Leave `provider` on `auto`. DeSource Image detects Vercel, Netlify, or AWS Amplify and uses IPX for local or other environments.
- **Simplest way to deal with image providers.** CMS URLs need aliases, validation, and provider-specific modifiers. DeSource Image handles provider selection, modifier translation, and URL generation for 46 built-in providers.
- **Native framework APIs.** Use Angular components and directives, React components and hooks, or Svelte components, actions, and attachments. Output remains native `<img>` and `<picture>` markup.
- **Built-in local optimizer.** React/Vite, Next.js, Angular SSR, and SvelteKit adapters can serve IPX transformations without a separate image service.
- **46 provider modules.** Use Cloudinary, Imgix, ImageKit, Sanity, Contentful, Shopify, Vercel, Netlify, or another built-in provider. Provider subpath imports remain **tree-shakable**.
- **Responsive images and modern formats.** Generate width or density candidates, breakpoint-aware `sizes`, ordered AVIF/WebP sources, and a fallback image from one input.
- **Placeholders and LCP controls.** Generate low-resolution placeholders, preload links, loading hints, and fetch priority without hand-maintained head tags.
- **SSR-friendly.** The same inputs generate the same URLs and attributes on the server and client, so hydration does not rewrite image markup.
- **One typed configuration.** Share breakpoints, presets, aliases, source rules, and provider behavior across React, Angular, Svelte, server code, and design systems.

## How it compares

With DeSource Image, the optimizer follows the deployment.

Leave `provider` unset or set it to `auto`. The same source can use Vercel Image Optimization on Vercel, Netlify Image CDN on Netlify, AWS Amplify Image Optimization on Amplify, and IPX during local development or on other hosts. An explicit provider always wins.

After adopting the package for your framework, image components need no host-specific provider code. DeSource Image detects the deployment, not a CDN signature in `src`, so relative paths such as `/images/hero.jpg` can use the image service available on the host.

| Option                                                                     | Best fit                                                                         | How optimization is selected                                                                                                                                                                                       | Choose DeSource Image when                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React `<img>`                                                              | Native browser images when the application owns its markup and URLs              | No optimizer is selected. The browser requests `src` unchanged; deploying to Vercel, Netlify, or Amplify does not rewrite it.                                                                                      | You want to keep one source image and control responsive sizes, format, and quality in component code instead of exporting variants or maintaining `srcset` and `<picture>` markup. You want placeholders, preloads, and an optimizer that follows the deployment. |
| [`next/image`](https://nextjs.org/docs/app/api-reference/components/image) | Next-only applications using the Next.js image pipeline                          | Next.js optimizer by default. Vercel, Netlify, and AWS Amplify integrate `next/image` with their hosting pipelines. For other image services, Next.js provides a custom-loader API rather than a provider catalog. | You want broader built-in provider support without replacing the component, or when provider policy, presets, aliases, and source rules must remain stable across frameworks, hosts, and image services.                                                           |
| [`NgOptimizedImage`](https://angular.dev/guide/image-optimization)         | Angular performance checks, loading hints, and responsive `<img>` output         | Generic loader by default; a built-in or custom `IMAGE_LOADER` is selected in Angular configuration. Changing hosts does not select another loader automatically.                                                  | You want deployment auto-detection, local IPX, native `<picture>`, per-image providers instead of maintaining an `IMAGE_LOADER`, a broader provider catalog, or shared image configuration outside Angular.                                                        |
| [`@sveltejs/enhanced-img`](https://svelte.dev/docs/kit/images)             | Static local assets transformed during the Vite build                            | Images are processed at build time. The deployment target does not switch them to its runtime image service.                                                                                                       | You want local images transformed on demand to save your time. Your images arrive from a CMS, database, API, object store, or CDN, or the same source should use IPX locally and the deployment platform’s optimizer in production.                                |
| [Unpic](https://unpic.pics/)                                               | Cross-framework responsive images already hosted on recognizable CDN or CMS URLs | Detects the provider from each `src` URL. Local or unknown sources need a fallback or explicit provider; the deployment itself is not the selection signal.                                                        | Vercel, Netlify, or AWS Amplify should choose the optimizer for every source, including relative paths, and you also need presets, aliases, source rules, `<picture>`, or server adapters.                                                                         |

DeSource Image combines deployment-aware selection and 46 provider modules under one configuration for React/Next.js, Angular, and Svelte/SvelteKit. Nuxt applications should continue to use [`@nuxt/image`](https://image.nuxt.com/).

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

One source file: `/public/img/hero.jpg`

One component:

```tsx
<DsImage
  src="/img/hero.jpg"
  alt="Product preview"
  width={1600}
  height={900}
  sizes="100vw md:760px"
  format="webp"
  quality={76}
/>
```

Need smaller files? Change `quality`. Need different breakpoints? Change `sizes`. No image re-export or filename update.

### React

```sh
npm install @desource/image-react
```

```tsx
import { DsImage, DsPicture } from '@desource/image-react';

export function Gallery() {
  return (
    <>
      <DsImage
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

      <DsPicture
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
  import { DsImage, DsPicture } from '@desource/image-svelte';
</script>

<DsImage
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

<DsPicture
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

- Deployment-aware defaults: Vercel, Netlify, and AWS Amplify detection with an IPX fallback and explicit overrides.
- Native framework APIs: Angular components/directives, React components/hooks, and Svelte components/actions/attachments.
- Responsive images: width descriptors, density descriptors, breakpoint strings, object syntax, candidate deduplication, and provider-size normalization.
- Picture output: ordered AVIF/WebP/etc. `<source>` elements plus a fallback `<img>`.
- Placeholders: generated low-resolution provider URLs, custom URLs, custom `[width, height, quality, blur]` tuples, decode-before-swap behavior, and temporary classes.
- Head preloads: responsive `<link rel="preload" as="image">` generation with reference counting in framework packages.
- Providers: 46 built-in modules, a small default registry, tree-shakable subpath imports, and typed custom providers.
- Presets and aliases: reusable image defaults and clean source aliases for CMS or asset hosts.
- Source controls: `domains`, `localPatterns`, `remotePatterns`, and invalid-source policies.
- Server adapters: IPX middleware for Angular SSR, React/Vite, Next.js App Router, SvelteKit, Fetch API servers, and Connect/Express-style Node servers.
- Tree-shakable nature: import what you need, and the rest is removed by bundlers.
- SSR support: deterministic attributes and URLs so hydration does not rewrite image markup.

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

When `provider` is omitted or set to `auto`, DeSource Image selects the optimizer available on the deployment:

| Runtime             | Provider            |
| ------------------- | ------------------- |
| Vercel              | `vercel`            |
| AWS Amplify         | `awsAmplify`        |
| Netlify             | `netlifyImageCdn`   |
| Netlify Large Media | `netlifyLargeMedia` |
| Other / local       | `ipx`               |

An explicit `provider` always wins. React and Svelte Vite integrations bake the detected value into client and SSR bundles, so both sides generate the same URLs during hydration.

This is deployment detection, not source-URL detection. A local source such as `/img/hero.jpg` can use Vercel Images on Vercel, Netlify Image CDN on Netlify, AWS Amplify on Amplify, and IPX during local development without changing component code. There are no DsImage-specific environment-variable overrides or browser hostname heuristics.

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

Import all 46 provider modules only when needed:

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
| React + Vite                 | `dsImage()` from `@desource/image-react/vite`                           |
| Next.js App Router           | `createNextImageRouteHandler()` from `@desource/image-react/next`       |
| SvelteKit dev/preview        | `dsImage()` from `@desource/image-svelte/vite`                          |
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
- `getDsImageProps()` and `getDsPictureProps()` support SSR and custom rendering.
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

The provider catalog and modifier behavior are inspired by [@nuxt/image](https://github.com/nuxt/image) and tested against a pinned Nuxt Image package. The framework integrations are separate implementations built for Angular, React, and Svelte. Nuxt applications should continue to use `@nuxt/image`.

## License

[MIT](./LICENSE) © 2026 DeSource Labs
