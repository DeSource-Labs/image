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
- `createImage`

Provider factories:

- `vercelProvider`
- `awsAmplifyProvider`
- `ipxProvider`
- `cloudinaryProvider`
- `imgixProvider`
- `imagekitProvider`
- `cloudflareProvider`
- `netlifyProvider`
- `noneProvider`

## Example

```ts
import { createImage, getImageAttrs } from '@desource/image-core';

const attrs = getImageAttrs(
  {
    src: '/img/hero.jpg',
    quality: 75,
    sizes: '100vw md:1100px',
    format: 'webp',
    loading: 'lazy'
  }
);

const $img = createImage();
const url = $img('/img/hero.jpg', { width: 800, format: 'webp', quality: 75 });
const sizes = $img.getSizes('/img/hero.jpg', {
  sizes: '100vw md:1100px',
  modifiers: { format: 'webp', quality: 75 }
});
```

By default this emits Nuxt-like IPX URLs such as `/_ipx/w_2200&f_webp&q_75/img/hero.jpg`. The default provider is `auto`: local/non-detected runtimes use IPX, AWS Amplify runtimes use AWS Amplify, Vercel runtimes use Vercel, and Netlify runtimes use Netlify. Core functions are pure and do not depend on Angular, Svelte, Vercel, Sharp, or browser globals. Framework packages provide the local optimizer endpoint integration.
