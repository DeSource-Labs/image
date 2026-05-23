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
import { getImageAttrs, vercelProvider } from '@desource/image-core';

const attrs = getImageAttrs(
  {
    src: '/hero.png',
    width: 2200,
    height: 1200,
    sizes: '100vw md:1100px',
    format: 'webp',
    priority: true
  },
  {
    provider: 'vercel',
    providers: {
      vercel: vercelProvider()
    },
    quality: 75
  }
);
```

Core functions are pure and do not depend on Angular, Svelte, Vercel, Sharp, or browser globals.
