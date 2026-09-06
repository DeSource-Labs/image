<div align="center">
  <h1>DeSource Image - Optimized images for React and Next.js</h1>
  <p><strong>High-quality image optimization with responsive, provider-first and SSR-friendly workflow for React and Next.js.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@desource/image-react"><img src="https://img.shields.io/npm/v/@desource/image-react?logo=react" alt="npm version"></a>
    <a href="https://codecov.io/gh/DeSource-Labs/image"><img src="https://codecov.io/gh/DeSource-Labs/image/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://sonarcloud.io/summary/new_code?id=DeSource-Labs_image"><img src="https://sonarcloud.io/api/project_badges/measure?project=DeSource-Labs_image&metric=alert_status" alt="SonarCloud"></a>
    <a href="https://github.com/DeSource-Labs/image/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
  </p>
</div>

AI-assisted development moves ideas into working products quickly. DeSource Image keeps image preparation inside that development loop. Add one suitable local or remote source, then control its output with component props.

Keep `/img/hero.jpg` instead of exporting `hero-480.webp`, `hero-960.webp`, and `hero-1600.webp`. DeSource Image turns one image input into provider URLs, responsive `srcset`, `<picture>` sources, placeholders, preload metadata, presets, aliases, source validation, and local IPX routes.

For MVPs and everyday product development, image quality becomes a code edit. Change `quality={80}` to `quality={65}` and keep the same source file, component, and URL.

`@desource/image-react` provides components for common cases, hooks for application-owned markup, a loader for `next/image`, and server helpers for Vite and the Next.js App Router. Every API renders or supplies native `<img>` and `<picture>` markup.

Provider configuration is optional. On Vercel, Netlify, or AWS Amplify, DeSource Image selects the platform image service from the deployment environment. Everywhere else, it falls back to the built-in IPX path. An explicit provider always wins.

## Why DeSource Image for React?

React has no built-in image optimization layer. Next.js has a strong image pipeline for Next-only applications. DeSource Image adds deployment-aware provider selection, 46 provider modules, local IPX, and image rules that can also work outside Next.js.

- **Built for fast product iterations.** Change image quality, format, crop, or responsive sizes in JSX. Source files and filenames stay unchanged.
- **One source instead of exported variants.** Start with one suitable image and generate the widths and formats each screen needs.
- **Deployment-aware provider selection.** Leave `provider` on `auto`. DeSource Image detects Vercel, Netlify, or AWS Amplify and uses IPX for local or other environments.
- **Vite and Next.js use the same image model.** Keep the same inputs, presets, aliases, and providers across applications.
- **Native framework APIs.** Use `DsImage` and `DsPicture`, or spread hook results onto elements owned by a design system. Output remains native `<img>` and `<picture>` markup.
- **46 built-in provider modules.** Import one provider subpath, use the complete registry, or register a typed custom provider.
- **Built-in local optimizer.** Vite middleware and a Next.js App Router route handler serve IPX transformations without a separate image service.
- **`next/image` remains available.** `createNextImageLoader()` lets Next own rendering while DeSource Image owns provider URLs.

### How it compares

| Option                                                                     | Best fit                                                                         | How optimization is selected                                                                                                                                                                                       | Choose DeSource Image when                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React `<img>`                                                              | Native browser images when the application owns its markup and URLs              | No optimizer is selected. The browser requests `src` unchanged; deploying to Vercel, Netlify, or Amplify does not rewrite it.                                                                                      | You want to control responsive sizes, format, and quality in component code instead of exporting variants or maintaining `srcset` and `<picture>` markup. You also want placeholders, preloads, and an optimizer that follows the deployment. |
| [`next/image`](https://nextjs.org/docs/app/api-reference/components/image) | Next-only applications using the Next.js image pipeline                          | Next.js optimizer by default. Vercel, Netlify, and AWS Amplify integrate `next/image` with their hosting pipelines. For other image services, Next.js provides a custom-loader API rather than a provider catalog. | You want broader built-in provider support without replacing the component, or provider policy, presets, aliases, and source rules must remain stable across frameworks, hosts, and image services.                                           |
| [Unpic React](https://unpic.pics/img/react/)                               | Cross-framework responsive images already hosted on recognizable CDN or CMS URLs | Detects the provider from each `src` URL. Local or unknown sources need a fallback or explicit provider; the deployment itself is not the selection signal.                                                        | Vercel, Netlify, or AWS Amplify should choose the optimizer for every source, including relative paths, and you also need presets, aliases, source rules, `<picture>`, or server adapters.                                                    |

For a Next-only application, `next/image` remains the good candidate. DeSource Image is the stronger choice when that hosting-native workflow must extend beyond Next.js, or when provider policy, presets, aliases, and source rules must remain stable across frameworks, hosts, and image services.

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
        className="hero"
      />

      <DsPicture
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

Both components render native elements. `DsImage` forwards refs to the `<img>`; `DsPicture` forwards refs to the `<picture>`.

## Configure once

```tsx
import { DsImageProvider } from '@desource/image-react';
import { cloudinaryProvider } from '@desource/image/providers/cloudinary';

export function App() {
  return (
    <DsImageProvider
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
    </DsImageProvider>
  );
}
```

Configuration is optional. With no explicit provider, the shared runtime detects Vercel, Netlify, or AWS Amplify from the build environment and falls back to IPX.

## DsImage component

```tsx
import { DsImage } from '@desource/image-react';

export function Hero() {
  return (
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
      className="hero"
      onLoad={() => console.log('loaded')}
    />
  );
}
```

`alt` is required. React-native props such as `className`, `style`, `crossOrigin`, `fetchPriority`, `referrerPolicy`, `onLoad`, and `onError` are supported. Lowercase `fetchpriority` and `crossorigin` aliases are also accepted when sharing options across frameworks.

## DsPicture component

```tsx
import { DsPicture } from '@desource/image-react';

export function ResponsiveHero() {
  return (
    <DsPicture
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
import { useDsImageProps, useDsPictureProps } from '@desource/image-react';

function NativeImage() {
  const img = useDsImageProps({
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
  const picture = useDsPictureProps({
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
import { DsImage } from '@desource/image-react';

export function Figure() {
  return (
    <DsImage src="/img/hero.jpg" alt="Mountain lake" width={1200} placeholder custom>
      {({ imgProps, src, isLoaded }) => (
        <figure data-src={src} data-loaded={isLoaded}>
          <img {...imgProps} />
          <figcaption>Mountain lake</figcaption>
        </figure>
      )}
    </DsImage>
  );
}
```

## Callable helper

```tsx
import { useDsImage } from '@desource/image-react';

function Avatar({ src }: { src: string }) {
  const image = useDsImage();
  return <img src={image(src, { width: 96, height: 96, fit: 'cover' })} alt="" />;
}
```

The callable helper exposes `getImage`, `getSizes`, `getMeta`, `getAttrs`, `getPicture`, `getPreloadLink`, and configured preset shortcuts.

## Next.js

### Use DeSource Image components directly

The main package entry is a client entry because placeholders and head preloads use browser lifecycle APIs.

```tsx
'use client';

import { DsImage } from '@desource/image-react';

export function ProductImage() {
  return <DsImage src="/products/chair.jpg" alt="Oak chair" width={1200} height={900} format="webp" />;
}
```

For hosted providers, configure the provider as usual. For local IPX URLs, add an App Router route handler.

### Use DeSource Image with `next/image`

```ts
// ds-loader.ts
import { createNextImageLoader } from '@desource/image-react/next';

export const dsLoader = createNextImageLoader({
  provider: 'vercel'
});
```

```tsx
import NextImage from 'next/image';
import { dsLoader } from './ds-loader';

export function Hero() {
  return <NextImage loader={dsLoader} src="/img/hero.jpg" alt="Hero" width={1200} height={800} />;
}
```

This lets `next/image` keep its rendering behavior while DeSource Image owns the provider URL rules.

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
import { dsImage } from '@desource/image-react/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [dsImage({ dirs: ['public'] })]
});
```

The plugin serves `/_ipx` during Vite development and preview. It also bakes a deterministic provider into client and SSR bundles so hydration uses the same provider.

## Providers and presets

Register built-in or custom providers from the core package:

```tsx
import { DsImageProvider } from '@desource/image-react';
import { imagekitProvider } from '@desource/image/providers/imagekit';

export function App() {
  return (
    <DsImageProvider
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
      <DsImage preset="card" src="/products/chair.jpg" alt="Oak chair" />
    </DsImageProvider>
  );
}
```

Provider modules and custom-provider utilities are documented in [`@desource/image`](https://github.com/DeSource-Labs/image/tree/main/packages/core).

## Links

- [Repository](https://github.com/DeSource-Labs/image)
- [Core package](https://github.com/DeSource-Labs/image/tree/main/packages/core)
- [Angular package](https://github.com/DeSource-Labs/image/tree/main/packages/angular)
- [Svelte package](https://github.com/DeSource-Labs/image/tree/main/packages/svelte)
- [Next.js Image Optimization docs](https://nextjs.org/docs/app/getting-started/images)
- [Security policy](https://github.com/DeSource-Labs/image/blob/main/SECURITY.md)

## License

MIT © 2026 DeSource Labs
