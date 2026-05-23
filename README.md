# Desource Image

Desource Image is a cross-framework image optimization library inspired by Nuxt Image, built for Angular and Svelte/SvelteKit. It provides framework-native components backed by a pure TypeScript core for optimized URLs, responsive `srcset`, `<picture>` formats, provider adapters, aliases, presets, safety validation, and deterministic SSR output.

This is an original implementation. Nuxt Image is used as a product/API reference, not as copied source.

## Packages

| Package | Purpose |
| --- | --- |
| `@desource/image-core` | Framework-agnostic config, providers, URL generation, responsive sizes, placeholders, validation, and preload helpers. |
| `@desource/angular-image` | Standalone Angular components: `<ds-image>` and `<ds-picture>`. |
| `@desource/svelte-image` | Svelte 5/SvelteKit components: `<Image>` and `<Picture>`. |

## Feature Matrix

| Feature | Core | Angular | Svelte/SvelteKit |
| --- | --- | --- | --- |
| Provider URL generation | Yes | Via core | Via core |
| Vercel provider | Yes | Yes | Yes |
| IPX URL builder | Yes | Yes | Yes |
| Cloudinary, Imgix, ImageKit, Cloudflare, Netlify, none | Yes | Yes | Yes |
| Responsive `sizes` parser | Yes | Yes | Yes |
| Width `srcset` | Yes | Yes | Yes |
| Density `srcset` | Yes | Yes | Yes |
| `<picture>` AVIF/WebP sources | Yes | Yes | Yes |
| Presets and aliases | Yes | Yes | Yes |
| Domain/local source validation | Yes | Yes | Yes |
| Provider-generated placeholders | Yes | Yes | Yes |
| SSR deterministic output | Yes | Angular SSR compatible | SvelteKit SSR compatible |
| Automatic preload injection | Helper only | Extension point | Extension point |
| Server-side IPX transformer endpoint | Not included | Not included | Documented in example |

## Comparison

Nuxt Image provides deep Nuxt integration, IPX server routes, and Vue components. Desource Image focuses on the same developer ergonomics for Angular and Svelte while keeping the optimization logic framework-independent.

Next Image is tightly coupled to Next.js routing and runtime assumptions. Desource Image does not require Vercel or any single deployment target; Vercel is one provider.

Angular `NgOptimizedImage` improves native image loading behavior in Angular apps. Desource Image solves a different layer: provider URLs, formats, aliases, presets, and responsive source generation. The Angular package uses modern standalone/signal APIs and can coexist with Angular image best practices.

Svelte enhanced-img is build-time oriented. Desource Image is runtime/provider oriented, which is useful for CMS, CDN, remote image, and deployment-provider workflows.

Unpic is a strong cross-framework image component library. Desource Image is closer to Nuxt Image’s provider/preset/config model and includes a first-party core that both Angular and Svelte packages share.

## Install

```sh
pnpm add @desource/image-core
pnpm add @desource/angular-image
pnpm add @desource/svelte-image
```

Install the framework package you need. `@desource/image-core` is a peer dependency of both framework packages.

## Angular Quick Start

```ts
import { provideDsImage } from '@desource/angular-image';
import { vercelProvider } from '@desource/image-core';

export const appConfig = {
  providers: [
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
      domains: ['images.unsplash.com']
    })
  ]
};
```

```html
<ds-image
  src="/hero.png"
  alt="Hero"
  width="2200"
  height="1200"
  sizes="100vw md:1100px"
  quality="75"
  format="webp"
  priority
/>
```

## Svelte Quick Start

```svelte
<script lang="ts">
  import { setImageConfig } from '@desource/svelte-image';
  import { vercelProvider } from '@desource/image-core';

  setImageConfig({
    provider: 'vercel',
    providers: {
      vercel: vercelProvider()
    },
    quality: 75,
    format: ['avif', 'webp']
  });
</script>

<slot />
```

```svelte
<script lang="ts">
  import { Image } from '@desource/svelte-image';
</script>

<Image
  src="/hero.png"
  alt="Hero"
  width={2200}
  height={1200}
  sizes="100vw md:1100px"
  quality={75}
  format="webp"
  priority
/>
```

## Providers

Provider factories are exported from `@desource/image-core`:

```ts
import {
  vercelProvider,
  ipxProvider,
  cloudinaryProvider,
  imgixProvider,
  imagekitProvider,
  cloudflareProvider,
  netlifyProvider,
  noneProvider
} from '@desource/image-core';
```

Custom providers implement:

```ts
import type { ImageProvider } from '@desource/image-core';

export const myProvider: ImageProvider = {
  name: 'my-provider',
  getImage(input) {
    return {
      url: `/images?src=${encodeURIComponent(input.src)}&w=${input.width ?? ''}`,
      isOptimized: true
    };
  }
};
```

Register it in config:

```ts
{
  provider: 'my-provider',
  providers: {
    'my-provider': myProvider
  }
}
```

## Vercel Provider

The Vercel provider emits:

```txt
/_vercel/image?url=<encoded-source>&w=<width>&q=<quality>
```

Local public assets such as `/hero.png` and remote URLs are supported. Vercel requires a width, so `src` falls back to the original source if no width can be inferred.

Use matching Vercel image config:

```json
{
  "images": {
    "sizes": [320, 640, 768, 1024, 1280, 1536, 2200],
    "qualities": [50, 60, 70, 75, 80, 90],
    "formats": ["image/avif", "image/webp"],
    "localPatterns": [{ "pathname": "/**" }],
    "remotePatterns": [
      {
        "protocol": "https",
        "hostname": "images.unsplash.com",
        "pathname": "/**"
      }
    ],
    "minimumCacheTTL": 31536000
  }
}
```

`domains` can be used instead of `remotePatterns` for simple host allow-lists.

## IPX Provider

`ipxProvider({ path: '/_ipx' })` emits Nuxt/IPX-like URLs with modifiers:

```txt
/_ipx/f_webp,q_75,w_800/hero.png
```

This package currently ships the URL builder only. A real deployment must provide the server endpoint at the configured path and run the image transformation there. The `examples/sveltekit-node-ipx` README describes the expected endpoint wiring.

## Responsive Sizes

Supported syntax:

```txt
100vw
sm:100vw md:50vw lg:400px
100vw md:1100px
```

Default screens:

```ts
{
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}
```

When `sizes` is present, the library generates width descriptors. Without `sizes`, a known `width` generates density descriptors from `densities`.

## Quality Order

Quality is resolved in this order:

1. Component prop or component `modifiers.quality` / `modifiers.q`
2. Preset `quality` or preset modifiers
3. Global config `quality`
4. Provider default

## Presets and Aliases

```ts
{
  aliases: {
    unsplash: 'https://images.unsplash.com'
  },
  presets: {
    avatar: {
      width: 96,
      height: 96,
      fit: 'cover',
      quality: 80
    }
  }
}
```

Usage:

```html
<ds-image preset="avatar" src="/unsplash/photo-id" alt="Profile" />
```

```svelte
<Image preset="avatar" src="/unsplash/photo-id" alt="Profile" />
```

## Repository Scripts

```sh
pnpm install
pnpm build
pnpm test
pnpm --filter @desource/example-angular-ssr build
pnpm --filter @desource/example-sveltekit-vercel build
pnpm --filter @desource/example-sveltekit-node-ipx build
```
