<div align="center">
  <h1>DeSource Image - Optimized images for Svelte and SvelteKit</h1>
  <p><strong>High-quality image optimization with responsive, provider-first and SSR-friendly workflow for Svelte and SvelteKit.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@desource/image-svelte"><img src="https://img.shields.io/npm/v/@desource/image-svelte?logo=svelte" alt="npm version"></a>
    <a href="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml"><img src="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="https://codecov.io/gh/DeSource-Labs/image"><img src="https://codecov.io/gh/DeSource-Labs/image/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://github.com/DeSource-Labs/image/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
  </p>
</div>

AI-assisted development moves ideas into working products quickly. DeSource Image keeps image preparation inside that development loop. Add one suitable local or remote source, then control its output with component props.

Keep `/img/hero.jpg` instead of exporting `hero-480.webp`, `hero-960.webp`, and `hero-1600.webp`. DeSource Image turns one image input into provider URLs, responsive `srcset`, `<picture>` sources, placeholders, preload metadata, presets, aliases, source validation, and local IPX routes.

For MVPs and everyday product development, image quality becomes a code edit. Change `quality={80}` to `quality={65}` and keep the same source file, component, and URL.

`@desource/image-svelte` renders native image markup without wrapper elements and provides components, actions, Svelte 5.29+ attachments, SSR prop helpers, Vite dev/preview middleware, and production server handlers. Local paths and dynamic URLs use the same component API.

Provider configuration is optional. On Vercel, Netlify, or AWS Amplify, DeSource Image selects the platform image service from the deployment environment. Everywhere else, it falls back to the built-in IPX path. An explicit provider always wins.

The package requires Svelte 5.29 or newer when using attachments. Components and actions require Svelte 5.

## Why DeSource Image for Svelte?

SvelteKit's `@sveltejs/enhanced-img` is a strong build-time tool for imported local files. DeSource Image transforms local images on demand and accepts sources from a CMS, database, API, object store, CDN, or user upload through the same component API.

- **Built for fast product iterations.** Change image quality, format, crop, or responsive sizes in Svelte. Source files and filenames stay unchanged.
- **Local and dynamic sources.** Use a local path, CMS response, database value, API result, object-store URL, CDN URL, or user upload with the same component props.
- **Deployment-aware provider selection.** Leave `provider` on `auto`. DeSource Image detects Vercel, Netlify, or AWS Amplify and uses IPX for local or other environments.
- **Native framework APIs.** Use components, actions, Svelte 5 attachments, snippets, or SSR prop helpers. Output remains native `<img>` and `<picture>` markup.
- **46 built-in provider modules.** Import one provider subpath, use the complete registry, or register a typed custom provider.
- **Built-in local optimizer.** Vite middleware and SvelteKit server handlers can serve IPX transformations without a separate image service.
- **Responsive images and modern formats.** Generate width or density candidates, breakpoint-aware `sizes`, ordered AVIF/WebP sources, and a fallback image.

### How it compares

| Option                                                         | Best fit                                                                         | How optimization is selected                                                                                                                                | Choose DeSource Image when                                                                                                                                                                                                          |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@sveltejs/enhanced-img`](https://svelte.dev/docs/kit/images) | Static local assets transformed during the Vite build                            | Images are processed at build time. The deployment target does not switch them to its runtime image service.                                                | You want local images transformed on demand to save your time. Your images arrive from a CMS, database, API, object store, or CDN, or the same source should use IPX locally and the deployment platform's optimizer in production. |
| [Unpic Svelte](https://unpic.pics/img/svelte/)                 | Cross-framework responsive images already hosted on recognizable CDN or CMS URLs | Detects the provider from each `src` URL. Local or unknown sources need a fallback or explicit provider; the deployment itself is not the selection signal. | Vercel, Netlify, or AWS Amplify should choose the optimizer for every source, including relative paths, and you also need presets, aliases, source rules, `<picture>`, or server adapters.                                          |

Use `enhanced:img` when every image is imported at build time and you want all variants produced during that build with no runtime optimizer. Choose DeSource Image for local images transformed on demand, dynamic sources, or an optimizer that follows the deployment.

## Install

```sh
npm install @desource/image-svelte
```

Install `ipx` when the application serves local `/_ipx` transformations in development, preview, or production:

```sh
npm install ipx
```

Keep `ipx` in production dependencies when using the production server adapter. It is optional when every image uses a hosted provider. Add `@desource/image` as a direct dependency only when the application imports provider factories or utilities from it.

## Configure SvelteKit

Add the Vite integration after installing `ipx`:

```ts
// vite.config.ts
import { dsImage } from '@desource/image-svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [dsImage({ dirs: ['static'] }), sveltekit()]
});
```

The plugin serves `/_ipx` in Vite development and preview. It also bakes the detected provider into client and server bundles so hydration uses the same provider.

Set shared configuration once in a root layout when defaults, presets, aliases, or validation rules are needed:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { setDsImageConfig } from '@desource/image-svelte';
  import { cloudinaryProvider } from '@desource/image/providers/cloudinary';

  setDsImageConfig({
    provider: 'cloudinary',
    quality: 80,
    screens: { sm: 640, md: 768, lg: 1024 },
    domains: ['images.example.com'],
    providers: {
      cloudinary: cloudinaryProvider({ cloudName: 'demo' })
    },
    presets: {
      avatar: { width: 96, height: 96, fit: 'cover', format: 'webp' }
    }
  });

  let { children } = $props();
</script>

{@render children()}
```

Configuration is inherited through Svelte context and resolved once per config object. With no explicit provider, the shared runtime detects Vercel, Netlify, or AWS Amplify from the build environment and falls back to IPX.

## DsImage component

```svelte
<script lang="ts">
  import { DsImage } from '@desource/image-svelte';

  let loaded = $state(false);
</script>

<DsImage
  src="/img/hero.jpg"
  alt="Aurora above a mountain lake"
  width={1600}
  height={900}
  sizes="100vw md:50vw lg:800px"
  format="webp"
  quality={82}
  placeholder
  preload={{ fetchPriority: 'high' }}
  class="hero"
  onload={() => (loaded = true)}
/>
```

`alt` is required. Native image attributes and Svelte event properties pass through to the generated `<img>`.

## DsPicture component

```svelte
<script lang="ts">
  import { DsPicture } from '@desource/image-svelte';
</script>

<DsPicture
  src="/img/hero.jpg"
  alt="Responsive mountain landscape"
  width={1600}
  height={900}
  sizes="100vw md:50vw lg:800px"
  formats={['avif', 'webp']}
  fallbackFormat="jpg"
  class="hero-frame"
  imgAttrs={{ class: 'hero' }}
/>
```

This renders native `<picture>`, `<source>`, and `<img>` elements. Comma-separated `format="avif,webp"`, array `format`, and the `legacyFormat` alias are supported.

## Custom rendering snippet

Use `custom` with the `children` snippet when the image needs custom surrounding markup while retaining generated attributes and placeholder state:

```svelte
<DsImage src="/img/hero.jpg" alt="Hero" width={1200} placeholder custom>
  {#snippet children({ imgAttrs, src, isLoaded })}
    <figure data-src={src} data-loaded={isLoaded}>
      <img {...imgAttrs} />
      <figcaption>Mountain lake</figcaption>
    </figure>
  {/snippet}
</DsImage>
```

## Actions for native elements

Actions provide the same reactive behavior on regular elements:

```svelte
<script lang="ts">
  import { dsImageAction, dsPictureAction } from '@desource/image-svelte';

  let width = $state(720);
  const imageOptions = $derived({
    src: '/img/card.jpg',
    alt: 'A coastal village',
    width,
    height: 480,
    densities: '1x 2x',
    placeholder: true
  });
</script>

<img alt="A coastal village" use:dsImageAction={imageOptions} />

<picture
  use:dsPictureAction={{
    src: '/img/card.jpg',
    alt: 'A coastal village at sunset',
    width,
    height: 480,
    formats: ['avif', 'webp']
  }}
>
  <img alt="A coastal village at sunset" />
</picture>
```

The picture action requires one fallback `<img>` and manages generated `<source>` elements around it.

## Attachments for Svelte 5.29+

Attachments expose the same engine with Svelte's newer element lifecycle API:

```svelte
<script lang="ts">
  import { dsImageAttachment, dsPictureAttachment } from '@desource/image-svelte';
</script>

<img
  alt="Mountain lake"
  {@attach dsImageAttachment({
    src: '/img/hero.jpg',
    alt: 'Mountain lake',
    width: 960,
    format: 'webp'
  })}
/>

<picture
  {@attach dsPictureAttachment({
    src: '/img/hero.jpg',
    alt: 'Mountain lake',
    width: 960,
    formats: ['avif', 'webp']
  })}
>
  <img alt="Mountain lake" />
</picture>
```

Actions and attachments support updates, load/error callbacks, placeholder decoding, class cleanup, and `onStateChange`.

## Bind one configuration once

Use `createDsImageBindings()` when several native elements share an explicit configuration:

```svelte
<script lang="ts">
  import { createDsImageBindings, createDsImageConfig } from '@desource/image-svelte';

  const config = createDsImageConfig({ provider: 'ipx' });
  const { dsImageAction, dsImageAttachment, dsPictureAction, dsPictureAttachment } = createDsImageBindings(config);
</script>
```

The returned functions no longer need a `config` field in every options object.

## SSR prop helpers

`getDsImageProps()` and `getDsPictureProps()` generate typed native properties without mounting a component. They are useful in snippets, SSR output, and integrations:

```ts
import { getDsImageProps, getDsPictureProps } from '@desource/image-svelte';

const image = getDsImageProps({
  src: '/img/hero.jpg',
  alt: 'Hero',
  width: 800,
  format: 'webp'
});

const picture = getDsPictureProps({
  src: '/img/hero.jpg',
  alt: 'Hero',
  width: 800,
  formats: ['avif', 'webp']
});
```

Pass `true` as the second argument when the full image has already loaded and a configured placeholder should be skipped.

## Responsive images, placeholders, and preloads

`sizes` accepts breakpoint strings such as `100vw sm:50vw lg:600px` or a record. `densities` accepts strings, numbers, or arrays. Candidate widths are deduplicated and normalized for the selected provider.

```svelte
<DsImage src="/img/hero.jpg" alt="Hero" width={1200} placeholder placeholderClass="blur" />
<DsImage src="/img/hero.jpg" alt="Hero" width={1200} placeholder={[48, 32, 25, 8]} />
<DsImage src="/img/hero.jpg" alt="Hero" width={1200} placeholder="data:image/png;base64,..." />
```

- A boolean placeholder generates a small transformed image.
- A tuple controls width, height, quality, and blur.
- The full image replaces the placeholder only after decode succeeds.
- `placeholderClass` is present only while the placeholder is visible.
- `preload` inserts a responsive `<link rel="preload" as="image">` into the head and reference-counts duplicate links.
- `priority` sets eager loading and high fetch priority. Use `preload` when a head link is also required.

SSR and initial hydration output are deterministic.

## Callable image helper

```svelte
<script lang="ts">
  import { useDsImage } from '@desource/image-svelte';

  const $img = useDsImage();
  const hero = $img('/img/hero.jpg', { width: 800, format: 'webp', quality: 75 });
</script>
```

The callable helper exposes `getImage`, `getSizes`, `getMeta`, `getAttrs`, `getPicture`, `getPreloadLink`, and configured preset shortcuts.

## Providers and presets

Register built-in or custom providers in the shared configuration:

```svelte
<script lang="ts">
  import { cloudinaryProvider } from '@desource/image/providers/cloudinary';
  import { setDsImageConfig } from '@desource/image-svelte';

  setDsImageConfig({
    provider: 'cloudinary',
    providers: {
      cloudinary: cloudinaryProvider({ cloudName: 'demo' })
    },
    presets: {
      avatar: { width: 96, height: 96, fit: 'cover', quality: 80 }
    }
  });
</script>
```

```svelte
<DsImage preset="avatar" src="/users/ada.jpg" alt="Ada" />
```

Provider modules and custom-provider utilities are documented in [`@desource/image`](https://github.com/DeSource-Labs/image/tree/main/packages/core).

## Production deployment

The Vite plugin only supplies optimizer middleware to Vite development and preview servers. Production must use a platform image endpoint or install the IPX server adapter.

### Vercel native images

Configure `@sveltejs/adapter-vercel` so its Build Output API contains image settings:

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      images: {
        sizes: [640, 768, 1024, 1280, 1536],
        domains: ['images.example.com'],
        minimumCacheTTL: 2678400,
        formats: ['image/avif', 'image/webp'],
        dangerouslyAllowSVG: false
      }
    })
  }
};
```

When built on Vercel, automatic detection emits `/_vercel/image` URLs. Keep adapter image sizes and allowed remote domains aligned with the application configuration.

### SvelteKit with production IPX

Install `ipx` as a production dependency and add a server hook:

```ts
// src/hooks.server.ts
import { createDsImageHandle } from '@desource/image-svelte/server';

export const handle = createDsImageHandle({
  dirs: ['static'],
  domains: ['images.example.com'],
  maxAge: 60 * 60 * 24 * 30
});
```

`createDsImageWebHandler()` is available for other Fetch API servers, and `createDsImageNodeMiddleware()` is available for Connect/Express-style Node servers.

All IPX adapters load the optimizer lazily and only handle requests under the configured path. Remote optimization is denied by default. Add trusted `domains`, or set `allowAllDomains: true` only for an intentionally public optimizer.

## Package checks

```sh
pnpm --filter @desource/image-svelte build
pnpm --filter @desource/image-svelte typecheck
pnpm --filter @desource/image-svelte test:unit:coverage
pnpm --filter @desource/image-svelte test:e2e
pnpm --filter @desource/image-svelte publish:check
```

## Links

- [Repository](https://github.com/DeSource-Labs/image)
- [Core package](https://github.com/DeSource-Labs/image/tree/main/packages/core)
- [Angular package](https://github.com/DeSource-Labs/image/tree/main/packages/angular)
- [React package](https://github.com/DeSource-Labs/image/tree/main/packages/react)
- [SvelteKit image docs](https://svelte.dev/docs/kit/images)
- [Security policy](https://github.com/DeSource-Labs/image/blob/main/SECURITY.md)

## License

MIT © 2026 DeSource Labs
