# Desource Image

Desource Image is a cross-framework image optimization library for Angular and Svelte/SvelteKit. It provides framework-native components backed by a pure TypeScript core for optimized URLs, responsive `srcset`, `<picture>` formats, provider adapters, aliases, presets, safety validation, and deterministic SSR output.

The developer experience is intentionally familiar to teams that have used Nuxt Image, but this is an original implementation for Angular and Svelte. Nuxt projects should continue to use Nuxt Image.

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
| AWS Amplify provider | Yes | Yes | Yes |
| IPX URL builder | Yes | Yes | Yes |
| Built-in provider factories | Yes | Via core | Via core |
| Responsive `sizes` parser | Yes | Yes | Yes |
| Width `srcset` | Yes | Yes | Yes |
| Density `srcset` | Yes | Yes | Yes |
| `<picture>` AVIF/WebP sources | Yes | Yes | Yes |
| Presets and aliases | Yes | Yes | Yes |
| Domain/local source validation | Yes | Yes | Yes |
| Provider-generated placeholders | Yes | Yes | Yes |
| SSR deterministic output | Yes | Angular SSR compatible | SvelteKit SSR compatible |
| Automatic preload injection | Helper only | Extension point | Extension point |
| Auto provider selection | Yes | Yes | Yes |
| Local IPX optimizer endpoint | URL builder only | SSR middleware | Vite dev/preview plugin |

## Comparison

Nuxt Image provides deep Nuxt integration, IPX server routes, and Vue components. Desource Image focuses on comparable ergonomics for Angular and Svelte while keeping the optimization logic framework-independent.

Next Image is tightly coupled to Next.js routing and runtime assumptions. Desource Image does not require Vercel or any single deployment target; Vercel is one provider.

Angular `NgOptimizedImage` improves native image loading behavior in Angular apps. Desource Image solves a different layer: provider URLs, formats, aliases, presets, and responsive source generation. The Angular package uses modern standalone/signal APIs and can coexist with Angular image best practices.

Svelte enhanced-img is build-time oriented. Desource Image is runtime/provider oriented, which is useful for CMS, CDN, remote image, and deployment-provider workflows.

Unpic is a strong cross-framework image component library. Desource Image emphasizes provider, preset, alias, and deployment-target workflows through a first-party core that both Angular and Svelte packages share.

## Install

```sh
pnpm add @desource/angular-image
# or
pnpm add @desource/svelte-image
```

Install the framework package you need. If your app imports core helpers or provider factories directly, add `@desource/image-core` as an explicit dependency as well. This matters for strict package managers such as pnpm.

## Angular Quick Start

Add the dependency:

```sh
pnpm add @desource/angular-image
```

For Angular SSR, install the image middleware in `src/server.ts`:

```ts
import { CommonEngine, createNodeRequestHandler, isMainModule } from '@angular/ssr/node';
import { createDsImageMiddleware } from '@desource/angular-image/server';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server.js';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');
const app = express();
const commonEngine = new CommonEngine();

app.use(createDsImageMiddleware({ dirs: [browserDistFolder] }));
app.use(express.static(browserDistFolder, { maxAge: '0', index: false, redirect: false }));
```

Then use the component:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsImageComponent } from '@desource/angular-image';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DsImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-image
      src="/img/hero.jpg"
      alt="Background"
      quality="75"
      sizes="100vw md:1100px"
      format="webp"
      loading="lazy"
    />
  `
})
export class AppComponent {}
```

Default local output is IPX-style:

```txt
/_ipx/w_2200&f_webp&q_75/img/hero.jpg
```

## Svelte Quick Start

Add the dependency:

```sh
pnpm add @desource/svelte-image
```

Add the SvelteKit/Vite integration:

```ts
import { desourceImage } from '@desource/svelte-image/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [desourceImage(), sveltekit()]
});
```

Then use the component:

```svelte
<script lang="ts">
  import { Image } from '@desource/svelte-image';
</script>

<Image
  src="/img/hero.jpg"
  alt="Background"
  quality={75}
  sizes="100vw md:1100px"
  format="webp"
  loading="lazy"
/>
```

Svelte components also default to the same IPX-like output.

Provider selection is automatic and uses `std-env` first:

- Local/non-detected runtime: `ipx`
- AWS Amplify runtime or `.amplifyapp.com` host: `awsAmplify`
- Vercel runtime (`VERCEL`, `VERCEL_ENV`, `NOW_BUILDER`, `VERCEL_URL`) or `.vercel.app` host: `vercel`
- Netlify runtime (`NETLIFY`, `NETLIFY_LOCAL`) or `.netlify.app` host: `netlify`
- Explicit override: `DESOURCE_IMAGE_PROVIDER`, `PUBLIC_DESOURCE_IMAGE_PROVIDER`, `VITE_DESOURCE_IMAGE_PROVIDER`, or `NUXT_IMAGE_PROVIDER`

Local development uses the first-party IPX integration above. AWS Amplify, Vercel, and Netlify deployments automatically switch to their platform image providers when their environment variables or hostnames are present.

## Image Helper

Core exports a callable helper:

```ts
import { createImage } from '@desource/image-core';

const $img = createImage({
  presets: {
    avatar: {
      width: 96,
      height: 96,
      quality: 80
    }
  }
});

$img('/img/hero.jpg', { width: 800, format: 'webp', quality: 75 });
$img.getSizes('/img/hero.jpg', {
  sizes: '100vw md:1100px',
  modifiers: { format: 'webp', quality: 75 }
});
($img.avatar as typeof $img)('/user.png');
```

Svelte exposes this as `useImage()`. Angular exposes the same helper through `DsImageService.create()`.

## Providers

Default provider factories are exported from `@desource/image-core`. The default registry is intentionally small for bundle size: `ipx`, `awsAmplify`, `vercel`, `netlify`, and `none`. The full provider registry is available from `@desource/image-core/providers`; individual provider files are available as `@desource/image-core/providers/<name>` for better tree shaking.

```ts
import {
  awsAmplifyProvider,
  ipxProvider,
  vercelProvider
} from '@desource/image-core';
import { cloudinaryProvider } from '@desource/image-core/providers/cloudinary';
import {
  BUILT_IN_PROVIDER_NAMES,
  createBuiltInProviders
} from '@desource/image-core/providers';
```

Built-in provider names include `aliyun`, `awsAmplify`, `bunny`, `builderio`, `caisy`, `cloudflare`, `cloudflareimages`, `cloudimage`, `cloudinary`, `contentful`, `directus`, `fastly`, `filerobot`, `flyimg`, `github`, `glide`, `gumlet`, `hygraph`, `imageengine`, `imagekit`, `imgix`, `ipx`, `ipxStatic`, `netlify`, `netlifyLargeMedia`, `netlifyImageCdn`, `picsum`, `prepr`, `none`, `prismic`, `sanity`, `shopify`, `storyblok`, `strapi`, `strapi5`, `supabase`, `twicpics`, `umbraco`, `unsplash`, `uploadcare`, `vercel`, `wagtail`, `weserv`, and `sirv`.

To opt into the complete registry:

```ts
import { createBuiltInProviders } from '@desource/image-core/providers';

provideDsImage({
  providers: createBuiltInProviders()
});
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

Local public assets such as `/hero.png` and remote URLs are supported. Missing width falls back to the largest configured screen and missing quality falls back to `100`. Vercel chooses AVIF/WebP from deployment config and request headers, so the provider intentionally does not add an explicit format query parameter.

For stricter Vercel projects, use matching Vercel image config:

```json
{
  "images": {
    "sizes": [320, 640, 768, 1024, 1280, 1536, 2200],
    "qualities": [50, 60, 70, 75, 80, 90, 100],
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

## AWS Amplify Provider

The AWS Amplify provider emits:

```txt
/_amplify/image?url=<encoded-source>&w=<width>&q=<quality>
```

It is selected automatically when `AWS_AMPLIFY`, `AWS_APP_ID`, or an `.amplifyapp.com` host is detected. Missing width falls back to the largest configured screen and missing quality falls back to `100`. It can also be forced with `NUXT_IMAGE_PROVIDER=awsAmplify` or `DESOURCE_IMAGE_PROVIDER=awsAmplify`.

## IPX Provider

`ipxProvider({ path: '/_ipx' })` emits IPX-style URLs with modifiers:

```txt
/_ipx/w_2200&f_webp&q_75/img/hero.jpg
```

The framework packages include first-party integration points for this endpoint:

- SvelteKit: `desourceImage()` in `vite.config.ts` registers the dev/preview optimizer.
- Angular SSR: `createDsImageMiddleware()` registers the optimizer in the SSR server.

Production deployments on AWS Amplify, Vercel, or Netlify can use automatic provider detection instead of IPX. A custom Node deployment that wants IPX in production should install the same middleware in its HTTP server.

## Responsive Sizes

Supported syntax:

```txt
100vw
sm:100vw md:50vw lg:400px
100vw md:1100px
```

Object syntax is also supported:

```ts
{ '1px': '100vw', md: '1100px' }
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

When `sizes` is present, breakpoints become max-width media conditions and candidate widths are multiplied by configured densities. Without `sizes`, a known `width` generates density descriptors from `densities`.

Standard modifiers are promoted automatically:

```ts
$img('/hero.png', { width: 800, format: 'webp', quality: 75 });
```

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
pnpm --filter @desource/example-sveltekit build
```
