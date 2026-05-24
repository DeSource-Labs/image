# @desource/image-core

Framework-agnostic image optimization primitives for Desource Image.

## Public API

Core exports typed helpers for:

- `resolveImageConfig`
- `resolvePreset`
- `resolveAlias`
- `validateSource`
- `parseSizes`
- `generateSizes`
- `generateSrcset`
- `generateDensities`
- `generatePictureSources`
- `getImage`
- `getImageAttrs`
- `getPictureAttrs`
- `getImagePreloadLink`
- `createImageContext`

Provider factories:

- `vercelProvider`
- `ipxProvider`
- `cloudinaryProvider`
- `imgixProvider`
- `imagekitProvider`
- `cloudflareProvider`
- `netlifyProvider`
- `noneProvider`

## Example

```ts
import { getImageAttrs } from '@desource/image-core';

const attrs = getImageAttrs(
  {
    src: '/img/hero.jpg',
    quality: 75,
    sizes: '100vw md:1100px',
    format: 'webp',
    loading: 'lazy'
  }
);
```

By default this emits Nuxt-like IPX URLs such as `/_ipx/w_2200&f_webp&q_75/img/hero.jpg`. The default provider is `auto`: local/non-detected runtimes use IPX, Vercel runtimes use Vercel, and Netlify runtimes use Netlify. Core functions are pure and do not depend on Angular, Svelte, Vercel, Sharp, or browser globals. Framework packages provide the local optimizer endpoint integration.
