<div align="center">
  <h1>@desource/image-react</h1>
  <p><strong>React image components, hooks, provider context, preload handling, Vite middleware, and Next.js helpers.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@desource/image-react"><img src="https://img.shields.io/npm/v/@desource/image-react?logo=react" alt="npm version"></a>
    <a href="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml"><img src="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="https://codecov.io/gh/DeSource-Labs/image"><img src="https://codecov.io/gh/DeSource-Labs/image/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://github.com/DeSource-Labs/image/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
  </p>
</div>

`@desource/image-react` brings the Desource Image provider engine to React and Next.js. It renders native `<img>` and `<picture>` markup, exposes hooks for application-owned elements, supports refs, manages placeholder decode and preload links, and ships optional helpers for Vite and Next.js.

## Why use it?

React itself does not include an image optimization layer. Next.js does, and `next/image` is a good default for Next-only apps that are happy with Next's image component, loader contract, and configuration model.

Use Desource Image when you need more than the built-in path:

- You want one image configuration across React, Next.js, Angular, and Svelte.
- You want a provider catalog and custom-provider API inspired by `@nuxt/image`, not a single framework-specific loader.
- You need first-class `<picture>` output with ordered formats and fallback control.
- You want presets, aliases, source validation, placeholders, and preload links from one config object.
- You want hooks that return native `<img>` / `<picture>` props for design-system components or existing markup.
- You use Vite, Next.js, or both, and want the same URL rules in each app.
- You still want to use `next/image`, but with a Desource-powered loader.

If your app is only Next.js, all images use Next-supported sources, and `next/image` already gives you the markup and provider behavior you need, keep using it. Desource Image is for projects where image rules need to live above one framework component.

Reference: [Next.js Image Optimization docs](https://nextjs.org/docs/app/getting-started/images).

## Install

```sh
npm install @desource/image-react
```

Install `ipx` only when the app serves local `/_ipx` transformations itself:

```sh
npm install ipx
```

`ipx`, `vite`, and `next` are optional peers. Hosted providers such as Vercel, Netlify, Cloudinary, Imgix, Sanity, or ImageKit do not need the local optimizer.

## Quick start

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
        className="hero"
      />

      <Picture
        src="/img/card.jpg"
        alt="Cabin under the stars"
        width={960}
        height={640}
        formats={['avif', 'webp']}
        fallbackFormat="jpg"
        imgAttrs={{ className: 'card-image' }}
      />
    </>
  );
}
```

Both components render native elements. `Image` forwards refs to the `<img>`; `Picture` forwards refs to the `<picture>`.

## Configure once

```tsx
import { ImageProvider } from '@desource/image-react';
import { cloudinaryProvider } from '@desource/image/providers/cloudinary';

export function App() {
  return (
    <ImageProvider
      config={{
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
      }}
    >
      <Gallery />
    </ImageProvider>
  );
}
```

Configuration is optional. With no explicit provider, the shared runtime detects Vercel, Netlify, or AWS Amplify from the build environment and falls back to IPX.

## Image component

```tsx
import { Image } from '@desource/image-react';

export function Hero() {
  return (
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
      className="hero"
      onLoad={() => console.log('loaded')}
    />
  );
}
```

`alt` is required. React-native props such as `className`, `style`, `crossOrigin`, `fetchPriority`, `referrerPolicy`, `onLoad`, and `onError` are supported. Lowercase `fetchpriority` and `crossorigin` aliases are also accepted when sharing options across frameworks.

## Picture component

```tsx
import { Picture } from '@desource/image-react';

export function ResponsiveHero() {
  return (
    <Picture
      src="/img/hero.jpg"
      alt="Responsive mountain landscape"
      width={1600}
      height={900}
      sizes="100vw md:50vw lg:800px"
      formats={['avif', 'webp']}
      fallbackFormat="jpg"
      className="hero-frame"
      imgAttrs={{ className: 'hero' }}
    />
  );
}
```

The component renders a native `<picture>` with ordered `<source>` elements and a fallback `<img>`. Comma-separated `format="avif,webp"`, array `format`, and the `legacyFormat` alias are supported.

## Hooks for native markup

Use hooks when a design-system component or application template must own the final DOM:

```tsx
import { useImageProps, usePictureProps } from '@desource/image-react';

function NativeImage() {
  const img = useImageProps({
    src: '/img/card.jpg',
    alt: 'A coastal village',
    width: 720,
    height: 480,
    placeholder: true,
    className: 'card-image'
  });

  return <img {...img} />;
}

function NativePicture() {
  const picture = usePictureProps({
    src: '/img/card.jpg',
    alt: 'A coastal village at sunset',
    width: 720,
    height: 480,
    formats: ['avif', 'webp'],
    fallbackFormat: 'jpg',
    imgAttrs: { className: 'card-image' }
  });

  return (
    <picture {...picture.pictureProps}>
      {picture.sources.map((source) => (
        <source key={`${source.type}:${source.srcSet}`} {...source} />
      ))}
      <img {...picture.imgProps} />
    </picture>
  );
}
```

The hooks handle placeholder preload/decode state, load/error forwarding, and head preload links with reference counting.

## Custom render

Use `custom` when generated image props should be rendered inside custom markup:

```tsx
import { Image } from '@desource/image-react';

export function Figure() {
  return (
    <Image src="/img/hero.jpg" alt="Mountain lake" width={1200} placeholder custom>
      {({ imgProps, src, isLoaded }) => (
        <figure data-src={src} data-loaded={isLoaded}>
          <img {...imgProps} />
          <figcaption>Mountain lake</figcaption>
        </figure>
      )}
    </Image>
  );
}
```

## Callable helper

```tsx
import { useImage } from '@desource/image-react';

function Avatar({ src }: { src: string }) {
  const image = useImage();
  return <img src={image(src, { width: 96, height: 96, fit: 'cover' })} alt="" />;
}
```

The callable helper exposes `getImage`, `getSizes`, `getMeta`, `getAttrs`, `getPicture`, `getPreloadLink`, and configured preset shortcuts.

## Next.js

### Use Desource components directly

The main package entry is a client entry because placeholders and head preloads use browser lifecycle APIs.

```tsx
'use client';

import { Image } from '@desource/image-react';

export function ProductImage() {
  return <Image src="/products/chair.jpg" alt="Oak chair" width={1200} height={900} format="webp" />;
}
```

For hosted providers, configure the provider as usual. For local IPX URLs, add an App Router route handler.

### Use Desource with `next/image`

```ts
// desource-loader.ts
import { createNextImageLoader } from '@desource/image-react/next';

export const desourceLoader = createNextImageLoader({
  provider: 'vercel'
});
```

```tsx
import NextImage from 'next/image';
import { desourceLoader } from './desource-loader';

export function Hero() {
  return <NextImage loader={desourceLoader} src="/img/hero.jpg" alt="Hero" width={1200} height={800} />;
}
```

This lets `next/image` keep its rendering behavior while Desource owns the provider URL rules.

### App Router IPX route

```ts
// app/_ipx/[...path]/route.ts
import { createNextImageRouteHandler } from '@desource/image-react/next';

export const GET = createNextImageRouteHandler({
  dirs: ['public'],
  domains: ['images.example.com'],
  maxAge: 60 * 60 * 24 * 30
});
```

Remote optimization is denied by default. Add trusted `domains`, or set `allowAllDomains: true` only for an intentionally public optimizer.

## Vite development optimizer

```ts
// vite.config.ts
import { desourceImage } from '@desource/image-react/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [desourceImage({ dirs: ['public'] })]
});
```

The plugin serves `/_ipx` during Vite development and preview. It also bakes a deterministic provider into client and SSR bundles so hydration uses the same provider.

## Providers and presets

Register built-in or custom providers from the core package:

```tsx
import { ImageProvider } from '@desource/image-react';
import { imagekitProvider } from '@desource/image/providers/imagekit';

export function App() {
  return (
    <ImageProvider
      config={{
        provider: 'imagekit',
        providers: {
          imagekit: imagekitProvider({ baseURL: 'https://ik.imagekit.io/demo' })
        },
        presets: {
          card: { width: 960, height: 640, sizes: '100vw md:480px', format: 'webp' }
        }
      }}
    >
      <Image preset="card" src="/products/chair.jpg" alt="Oak chair" />
    </ImageProvider>
  );
}
```

Provider modules and custom-provider utilities are documented in [`@desource/image`](https://github.com/DeSource-Labs/image/tree/main/packages/core).

## Package checks

```sh
pnpm --filter @desource/image-react build
pnpm --filter @desource/image-react typecheck
pnpm --filter @desource/image-react test:unit:coverage
pnpm --filter @desource/image-react test:e2e
pnpm --filter @desource/image-react publish:check
```

## Links

- [Repository](https://github.com/DeSource-Labs/image)
- [Core package](https://github.com/DeSource-Labs/image/tree/main/packages/core)
- [Angular package](https://github.com/DeSource-Labs/image/tree/main/packages/angular)
- [Svelte package](https://github.com/DeSource-Labs/image/tree/main/packages/svelte)
- [Next.js Image Optimization docs](https://nextjs.org/docs/app/getting-started/images)
- [Security policy](https://github.com/DeSource-Labs/image/blob/main/SECURITY.md)

## License

MIT © 2026 DeSource Labs
