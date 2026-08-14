<div align="center">
  <h1>@desource/image-svelte</h1>
  <p><strong>Svelte 5 image components, actions, attachments, SSR prop helpers, Vite middleware, and SvelteKit server handlers.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@desource/image-svelte"><img src="https://img.shields.io/npm/v/@desource/image-svelte?logo=svelte" alt="npm version"></a>
    <a href="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml"><img src="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="https://codecov.io/gh/DeSource-Labs/image"><img src="https://codecov.io/gh/DeSource-Labs/image/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://github.com/DeSource-Labs/image/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
  </p>
</div>

`@desource/image-svelte` brings the Desource Image provider engine to Svelte 5 and SvelteKit. It renders native image markup without wrapper elements and offers every Svelte surface you are likely to need: components, actions, Svelte 5.29+ attachments, SSR prop helpers, Vite dev/preview middleware, and production server handlers.

The package requires Svelte 5.29 or newer when using attachments. Components and actions require Svelte 5.

## Why use it?

SvelteKit's `@sveltejs/enhanced-img` is a good fit for static local assets processed at build time. It can generate modern formats, dimensions, and responsive sources for images that live in the project.

Use Desource Image when your image layer is runtime-driven:

- Images come from a CMS, database, object storage, backend, or external media service.
- You need Cloudinary, Imgix, Sanity, ImageKit, Vercel, Netlify, IPX, or a custom provider from the same config model.
- You want components for common cases and actions/attachments for existing native `<img>` / `<picture>` markup.
- You need presets, aliases, remote source validation, placeholders, and preload links outside a build-time asset pipeline.
- You deploy the same design system across Svelte, React, and Angular.
- You want local IPX URLs in Vite dev/preview and a matching SvelteKit production handler.

If all images are static files imported from the repo and build-time optimization is enough, `@sveltejs/enhanced-img` may be the simpler choice. Desource Image is for dynamic and provider-backed image systems.

Reference: [SvelteKit image docs](https://svelte.dev/docs/kit/images).

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
import { desourceImage } from '@desource/image-svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [desourceImage({ dirs: ['static'] }), sveltekit()]
});
```

The plugin serves `/_ipx` in Vite development and preview. It also bakes the detected provider into client and server bundles so hydration uses the same provider.

Set shared configuration once in a root layout when defaults, presets, aliases, or validation rules are needed:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { setImageConfig } from '@desource/image-svelte';
  import { cloudinaryProvider } from '@desource/image/providers/cloudinary';

  setImageConfig({
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

## Image component

```svelte
<script lang="ts">
  import { Image } from '@desource/image-svelte';

  let loaded = $state(false);
</script>

<Image
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

## Picture component

```svelte
<script lang="ts">
  import { Picture } from '@desource/image-svelte';
</script>

<Picture
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
<Image src="/img/hero.jpg" alt="Hero" width={1200} placeholder custom>
  {#snippet children({ imgAttrs, src, isLoaded })}
    <figure data-src={src} data-loaded={isLoaded}>
      <img {...imgAttrs} />
      <figcaption>Mountain lake</figcaption>
    </figure>
  {/snippet}
</Image>
```

## Actions for native elements

Actions provide the same reactive behavior on regular elements:

```svelte
<script lang="ts">
  import { imageAction, pictureAction } from '@desource/image-svelte';

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

<img alt="A coastal village" use:imageAction={imageOptions} />

<picture
  use:pictureAction={{
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
  import { imageAttachment, pictureAttachment } from '@desource/image-svelte';
</script>

<img
  alt="Mountain lake"
  {@attach imageAttachment({
    src: '/img/hero.jpg',
    alt: 'Mountain lake',
    width: 960,
    format: 'webp'
  })}
/>

<picture
  {@attach pictureAttachment({
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

Use `createImageBindings()` when several native elements share an explicit configuration:

```svelte
<script lang="ts">
  import { createImageBindings, createImageConfig } from '@desource/image-svelte';

  const config = createImageConfig({ provider: 'ipx' });
  const { imageAction, imageAttachment, pictureAction, pictureAttachment } = createImageBindings(config);
</script>
```

The returned functions no longer need a `config` field in every options object.

## SSR prop helpers

`getImageProps()` and `getPictureProps()` generate typed native properties without mounting a component. They are useful in snippets, SSR output, and integrations:

```ts
import { getImageProps, getPictureProps } from '@desource/image-svelte';

const image = getImageProps({
  src: '/img/hero.jpg',
  alt: 'Hero',
  width: 800,
  format: 'webp'
});

const picture = getPictureProps({
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
<Image src="/img/hero.jpg" alt="Hero" width={1200} placeholder placeholderClass="blur" />
<Image src="/img/hero.jpg" alt="Hero" width={1200} placeholder={[48, 32, 25, 8]} />
<Image src="/img/hero.jpg" alt="Hero" width={1200} placeholder="data:image/png;base64,..." />
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
  import { useImage } from '@desource/image-svelte';

  const $img = useImage();
  const hero = $img('/img/hero.jpg', { width: 800, format: 'webp', quality: 75 });
</script>
```

The callable helper exposes `getImage`, `getSizes`, `getMeta`, `getAttrs`, `getPicture`, `getPreloadLink`, and configured preset shortcuts.

## Providers and presets

Register built-in or custom providers in the shared configuration:

```svelte
<script lang="ts">
  import { cloudinaryProvider } from '@desource/image/providers/cloudinary';
  import { setImageConfig } from '@desource/image-svelte';

  setImageConfig({
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
<Image preset="avatar" src="/users/ada.jpg" alt="Ada" />
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
