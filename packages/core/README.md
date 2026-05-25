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

- `BUILT_IN_PROVIDER_NAMES`
- `createBuiltInProviders`
- `vercelProvider`
- `awsAmplifyProvider`
- `ipxProvider`
- all Nuxt-compatible built-ins including Cloudinary, Imgix, ImageKit, Cloudflare, Cloudflare Images, Contentful, Directus, Sanity, Storyblok, Uploadcare, Unsplash, and more
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

By default this emits Nuxt-like IPX URLs such as `/_ipx/w_2200&f_webp&q_75/img/hero.jpg`. The default provider is `auto`: local/non-detected runtimes use IPX, AWS Amplify runtimes use AWS Amplify, Vercel runtimes use Vercel, and Netlify runtimes use Netlify. Detection uses `std-env` first, plus framework-safe fallbacks for hydrated browser code.

For bundle size, `resolveImageConfig()` only registers the default/auto providers. Import individual provider factories for app-specific providers, or use `createBuiltInProviders()` when you explicitly want every Nuxt-compatible built-in provider in a registry.
