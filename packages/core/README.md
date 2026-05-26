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

Default provider factories are exported from `@desource/image-core`:

- `vercelProvider`
- `awsAmplifyProvider`
- `ipxProvider`
- `ipxStaticProvider`
- `netlifyProvider`
- `netlifyImageCdnProvider`
- `netlifyLargeMediaProvider`
- `noneProvider`

The full provider registry is exported from `@desource/image-core/providers`. Individual provider files are exported as `@desource/image-core/providers/<name>`:

- `BUILT_IN_PROVIDER_NAMES`
- `createBuiltInProviders`
- built-in providers including Cloudinary, Imgix, ImageKit, Cloudflare, Cloudflare Images, Contentful, Directus, Sanity, Storyblok, Uploadcare, Unsplash, and more
- `cloudinaryProvider`
- `imgixProvider`
- `imagekitProvider`
- `cloudflareProvider`

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

```ts
import { cloudinaryProvider } from '@desource/image-core/providers/cloudinary';
import { imgixProvider } from '@desource/image-core/providers/imgix';
```

By default this emits IPX-style URLs such as `/_ipx/w_2200&f_webp&q_75/img/hero.jpg`. The default provider is `auto`: local/non-detected runtimes use IPX, AWS Amplify runtimes use AWS Amplify, Vercel runtimes use Vercel, and Netlify runtimes use Netlify. Detection uses `std-env` first, plus framework-safe fallbacks for hydrated browser code.

For bundle size, `resolveImageConfig()` only registers the default/auto providers. Import individual provider factories for app-specific providers, or use `createBuiltInProviders()` when you explicitly want every built-in provider in a registry.
