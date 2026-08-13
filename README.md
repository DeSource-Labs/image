# Desource Image

[![CI](https://github.com/DeSource-Labs/image/actions/workflows/ci.yml/badge.svg)](https://github.com/DeSource-Labs/image/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/DeSource-Labs/image/branch/main/graph/badge.svg)](https://codecov.io/gh/DeSource-Labs/image)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Production-grade image optimization for Angular and Svelte/SvelteKit, with the developer experience of Nuxt Image and rendering APIs that stay native to each framework.

One configuration powers responsive `srcset`, `<picture>` formats, presets, aliases, placeholders, preload links, source validation, custom providers, and more than 40 built-in image services. URL generation lives in a small framework-independent package; Angular and Svelte own their DOM and lifecycle behavior.

> Desource Image is an original Angular/Svelte implementation inspired by Nuxt Image's public behavior. Nuxt applications should continue to use Nuxt Image.

## Packages

| Package                                         | What it provides                                                                                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@desource/image`](./packages/core)            | Callable image helper, URL and responsive generation, config, provider authoring utilities, and tree-shakable providers.                       |
| [`@desource/image-angular`](./packages/angular) | Standalone signal-based components, native-element directives, Angular `IMAGE_LOADER`, helper service, head preloads, and Node SSR middleware. |
| [`@desource/image-svelte`](./packages/svelte)   | Svelte 5 components, actions, Svelte 5.29+ attachments, SSR prop helpers, SvelteKit production handler, and Vite dev/preview integration.      |

## Why it exists

Framework image tools tend to solve only one layer: native loading hints, build-time imports, or one hosting provider. Applications still end up translating CMS URLs, CDN modifier syntax, breakpoints, fallback formats, and preload metadata themselves.

Desource Image gives Angular and Svelte the same declarative image model:

- framework-native components plus lower-level native-element APIs;
- deterministic server output and hydration-safe placeholder state;
- width- and density-based `srcset` generation;
- AVIF/WebP picture sources with a legacy fallback;
- platform autodetection for Vercel, Netlify, and AWS Amplify;
- local IPX transformation endpoints for development and Node SSR;
- typed custom providers compatible with the Nuxt-style provider contract;
- strict remote-domain controls on server-side optimizers;
- per-provider imports so applications ship only what they configure.

## Quick start

### Angular

```sh
pnpm add @desource/image-angular
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
      [width]="1600"
      [height]="1000"
      sizes="100vw md:760px"
      format="webp"
      [quality]="76"
      [placeholder]="true"
      [preload]="true"
    />

    <picture
      dsPicture="/img/card.jpg"
      alt="Cabin under the stars"
      [width]="960"
      [height]="640"
      [formats]="['avif', 'webp']"
      fallbackFormat="jpg"
    >
      <img class="card-image" alt="Cabin under the stars" />
    </picture>
  `
})
export class GalleryComponent {}
```

No provider setup is required for URL generation. The default provider is `auto`, which resolves to the deployment platform or to `ipx`. An IPX URL still needs an optimizer endpoint; use the Angular SSR middleware shown below or configure a CDN provider.

See the [Angular package guide](./packages/angular/README.md) for directives, configuration, native attributes, events, Angular's `IMAGE_LOADER`, and SSR.

### SvelteKit

```sh
pnpm add @desource/image-svelte ipx
```

Enable the local optimizer in development and preview:

```ts
// vite.config.ts
import { desourceImage } from '@desource/image-svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [desourceImage(), sveltekit()]
});
```

Then render an image:

```svelte
<script lang="ts">
  import { Picture } from '@desource/image-svelte';
</script>

<Picture
  src="/img/hero.jpg"
  alt="Mountain lake at sunrise"
  width={1600}
  height={1000}
  sizes="100vw md:760px"
  format="avif,webp"
  legacyFormat="jpg"
  quality={76}
  placeholder
  preload
/>
```

On Vercel, platform detection emits `/_vercel/image` URLs and the adapter can publish matching image configuration. On another Node deployment, install the production SvelteKit handle from `@desource/image-svelte/server`.

See the [Svelte package guide](./packages/svelte/README.md) for actions, attachments, custom snippets, server hooks, and deployment examples.

## One image model

All three packages accept the same core inputs.

| Input                                      | Purpose                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| `src`, `alt`                               | Source and accessible alternative text. Framework renderers require `alt`. |
| `width`, `height`                          | Intrinsic dimensions and the aspect ratio used for responsive candidates.  |
| `sizes`                                    | Nuxt-style string such as `100vw md:760px`, or an object keyed by screen.  |
| `densities`                                | Density candidates such as `1x 2x`, `[1, 2]`, or `1`.                      |
| `format`, `formats`                        | Output format or ordered picture formats.                                  |
| `fallbackFormat`, `legacyFormat`           | Fallback `<img>` format for picture output.                                |
| `quality`, `fit`, `position`, `background` | Standard modifiers promoted into provider input.                           |
| `modifiers`                                | Provider-specific recursive modifier values.                               |
| `provider`, `preset`                       | Per-image provider and preset overrides.                                   |
| `placeholder`, `placeholderClass`          | Real low-resolution URL, custom URL, and transition class.                 |
| `priority`, `preload`                      | Loading hints and automatic head preload generation.                       |
| `loading`, `decoding`, `fetchpriority`     | Native image hints.                                                        |

A boolean placeholder generates a real provider URL at `10×10`, quality `50`, blur `3`. A tuple customizes `[width, height, quality, blur]`; a string is used as the placeholder URL directly. The full source is preloaded and decoded before it replaces the placeholder.

## Core helper

Install the core package directly when importing its APIs:

```sh
pnpm add @desource/image
```

```ts
import { createImage } from '@desource/image';

const image = createImage({
  presets: {
    avatar: {
      width: 96,
      height: 96,
      fit: 'cover',
      quality: 80
    }
  }
});

const url = image('/img/hero.jpg', {
  width: 800,
  format: 'webp',
  quality: 76
});

const attrs = image.getAttrs({
  src: '/img/hero.jpg',
  alt: 'Mountain lake',
  width: 1600,
  height: 1000,
  sizes: '100vw md:760px'
});

const picture = image.getPicture({
  src: '/img/hero.jpg',
  width: 1600,
  height: 1000,
  format: 'avif,webp',
  legacyFormat: 'jpg'
});
```

The callable helper also exposes `getImage`, `getSizes`, `getMeta`, `getPreloadLink`, and a callable shortcut for every configured preset.

## Configuration

```ts
import { cloudinaryProvider } from '@desource/image/providers/cloudinary';

const imageConfig = {
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
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.example.com',
      pathname: '/media/**'
    }
  ],
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
  providerOptions: {
    cloudinary: {
      modifiers: { quality: 'auto' }
    }
  },
  onInvalidSource: 'warn'
} as const;
```

Configuration is resolved once per Angular injector or Svelte config object. Provider setup functions are memoized, and the same callable helper is reused.

### Provider autodetection

When `provider` is omitted or set to `auto`, `std-env` is evaluated once:

- Vercel → `vercel`
- AWS Amplify → `awsAmplify`
- Netlify → `netlifyImageCdn`
- Netlify with Large Media → `netlifyLargeMedia`
- anything else → `ipx`

An explicit `provider` always wins. There are no package-specific environment-variable overrides or browser hostname heuristics. The Svelte Vite plugin bakes the detected provider into both client and SSR bundles so hydration uses the same result.

## Built-in providers

The default registry stays deliberately small: IPX, IPX Static, Vercel, AWS Amplify, Netlify Image CDN, Netlify Large Media, the Netlify selector, and passthrough.

The complete catalog is available from `@desource/image/providers`, and every provider has a tree-shakable subpath:

```ts
import { createBuiltInProviders } from '@desource/image/providers';
import { cloudinaryProvider } from '@desource/image/providers/cloudinary';
import { imgixProvider } from '@desource/image/providers/imgix';
```

Supported provider modules:

`aliyun`, `awsAmplify`, `builderio`, `bunny`, `caisy`, `cloudflare`, `cloudflareimages`, `cloudimage`, `cloudinary`, `contentful`, `directus`, `fastly`, `filerobot`, `flyimg`, `github`, `glide`, `gumlet`, `hygraph`, `imageengine`, `imagekit`, `imgix`, `ipx`, `ipxStatic`, `netlify`, `netlifyImageCdn`, `netlifyLargeMedia`, `none`, `picsum`, `prepr`, `prismic`, `sanity`, `shopify`, `sirv`, `storyblok`, `strapi`, `strapi5`, `supabase`, `twicpics`, `umbraco`, `unsplash`, `uploadcare`, `vercel`, `wagtail`, and `weserv`.

Provider behavior is tested against the bundled Nuxt Image provider source with standard, empty, and alternate modifier scenarios.

## Custom providers

Nuxt-style providers receive the normalized source, merged provider options, and an image context:

```ts
import { configureProvider, defineProvider } from '@desource/image';

const acmeSetup = defineProvider<{ baseURL: string }>({
  getImage(src, { modifiers, baseURL }, context) {
    const query = new URLSearchParams({
      src,
      width: String(modifiers.width ?? ''),
      quality: String(modifiers.quality ?? '')
    });

    // context.options contains resolved config.
    // context.$img is the memoized callable image helper.
    return { url: `${baseURL}?${query}` };
  }
});

export const acmeProvider = configureProvider(acmeSetup, { baseURL: 'https://images.example.com/transform' }, 'acme');
```

Register it normally:

```ts
{
  provider: 'acme',
  providers: { acme: acmeProvider }
}
```

The original object-input provider contract remains supported for backward compatibility. Public provider-authoring helpers include mapped query providers, modifier key/value maps, path operation generation, stable query helpers, color and format normalization, and setup configuration.

## Local IPX endpoints

The default IPX provider generates URLs such as:

```text
/_ipx/w_800&f_webp&q_76/img/hero.jpg
```

URL generation does not itself transform bytes. Use the framework integration that owns your server:

- SvelteKit dev/preview: `desourceImage()` from `@desource/image-svelte/vite`
- SvelteKit Node production: `createDsImageHandle()` from `@desource/image-svelte/server`
- Express-compatible Angular SSR: `createDsImageMiddleware()` from `@desource/image-angular/server`
- other Node servers: `createDsImageNodeMiddleware()` from `@desource/image-svelte/server`

Remote IPX requests are denied by default. Supply a narrow `domains` allow-list; use `allowAllDomains: true` only when the optimizer is intentionally public.

## Quality and publishing

The repository mirrors the release model used by DeSource Phone Mask:

- package-local Vitest and Playwright fixtures;
- shared contracts in `common/test/unit` and `common/test/e2e`;
- enforced package coverage floors and Codecov reporting;
- Angular Package Format and Svelte package builds;
- `publint` and Are The Types Wrong checks for every public entry point;
- fixed Changesets versions for all three packages;
- synchronized changelog content;
- one Git tag and one GitHub release per version.

```sh
pnpm install
pnpm verify
pnpm verify:all
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development and release details and [SECURITY.md](./SECURITY.md) for private vulnerability reporting.

## Compatibility

- Node.js 22.18 or newer for development and server integrations
- Angular 19, 20, or 21
- Svelte 5; attachments require Svelte 5.29 or newer
- Vite 6, 7, or 8 for the optional Svelte Vite integration
- modern ESM bundlers and Node ESM

## License

[MIT](./LICENSE) © 2026 DeSource Labs
