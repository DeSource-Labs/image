# @desource/image

Framework-independent image configuration, provider URLs, responsive candidates, picture sources, placeholders, preload metadata, validation, and provider-authoring utilities for Desource Image.

The package is ESM-only, has no DOM dependency for normal URL/attribute generation, and is shared by `@desource/image-angular` and `@desource/image-svelte`.

## Install

```sh
pnpm add @desource/image
```

## Callable image helper

```ts
import { createImage } from '@desource/image';

const image = createImage({
  quality: 76,
  screens: {
    sm: 640,
    md: 768,
    lg: 1024
  },
  presets: {
    avatar: {
      width: 96,
      height: 96,
      fit: 'cover',
      format: 'webp'
    }
  }
});

image('/img/hero.jpg', {
  width: 800,
  format: 'webp',
  quality: 76
});
// /_ipx/w_800&f_webp&q_76/img/hero.jpg

image.getImage('/img/hero.jpg', {
  modifiers: { width: 800 }
});

image.getSizes('/img/hero.jpg', {
  sizes: '100vw md:760px',
  modifiers: { width: 1600, height: 1000, format: 'webp' }
});

image.getAttrs({
  src: '/img/hero.jpg',
  alt: 'Mountain lake',
  width: 1600,
  height: 1000,
  sizes: '100vw md:760px',
  placeholder: true
});

image.getPicture({
  src: '/img/hero.jpg',
  width: 1600,
  height: 1000,
  formats: ['avif', 'webp'],
  fallbackFormat: 'jpg'
});

image.getPreloadLink({
  src: '/img/hero.jpg',
  width: 1600,
  preload: { fetchPriority: 'high' }
});

(image.avatar as typeof image)('/people/ada.jpg');
```

The helper also exposes `getMeta()`. A provider can return its own metadata loader; in a browser, the helper otherwise falls back to the native `Image` API.

## Stateless helpers

For renderers or metadata pipelines that do not need a callable helper:

```ts
import { getImage, getImageAttrs, getImagePreloadLink, getImageSizes, getPictureAttrs } from '@desource/image';

const attrs = getImageAttrs({
  src: '/img/hero.jpg',
  alt: 'Mountain lake',
  width: 1600,
  height: 1000,
  sizes: '100vw md:760px',
  format: 'webp',
  quality: 76
});
```

Other public generators include `generateSrcset`, `generatePictureSources`, `generateSizes`, `generateDensities`, `parseSizes`, and `parseDensities`.

## Configuration

```ts
import type { ImageConfig } from '@desource/image';

const config: ImageConfig = {
  provider: 'auto',
  baseURL: '/',
  quality: 76,
  format: 'webp',
  screens: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  },
  densities: [1, 2],
  providerSizes: [320, 480, 640, 768, 1024, 1280, 1536],
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
  providers: {},
  providerOptions: {},
  onInvalidSource: 'warn'
};
```

`resolveImageConfig(config)` normalizes this once. `createImageContext(config)` returns the resolved config plus bound `getImage`, `getImageAttrs`, `getPictureAttrs`, `getPreloadLink`, and `getMeta` methods.

Invalid-source policies are `throw`, `warn`, and `passthrough`. Local and remote patterns accept `*` for one path segment and `**` for recursive matches.

### Provider detection

`detectImageProvider()` uses `std-env` once:

| Runtime             | Provider            |
| ------------------- | ------------------- |
| Vercel              | `vercel`            |
| AWS Amplify         | `awsAmplify`        |
| Netlify             | `netlifyImageCdn`   |
| Netlify Large Media | `netlifyLargeMedia` |
| Other / local       | `ipx`               |

An explicit provider bypasses detection. The package does not read Desource-specific environment variables and does not infer providers from browser hostnames.

## Providers

The main entry includes only the small automatic registry:

- `ipx`
- `ipxStatic`
- `vercel`
- `awsAmplify`
- `netlify`
- `netlifyImageCdn`
- `netlifyLargeMedia`
- `none`

Import the complete registry only when required:

```ts
import { BUILT_IN_PROVIDER_NAMES, createBuiltInProviders } from '@desource/image/providers';
```

Prefer provider subpaths for the smallest application bundle:

```ts
import { cloudinaryProvider } from '@desource/image/providers/cloudinary';
import { imgixProvider } from '@desource/image/providers/imgix';
import { sanityProvider } from '@desource/image/providers/sanity';

const config = {
  provider: 'cloudinary',
  providers: {
    cloudinary: cloudinaryProvider({ cloudName: 'demo' })
  }
};
```

All provider files use stable ESM subpaths under `@desource/image/providers/*`. The catalog and default/alternate modifier behavior are parity-tested against the bundled Nuxt Image sources.

## Custom providers

### Nuxt-style contract

```ts
import { configureProvider, defineProvider } from '@desource/image';

interface AcmeOptions {
  baseURL: string;
  token?: string;
}

const setup = defineProvider<AcmeOptions>({
  validateDomains: true,
  getImage(src, { modifiers, baseURL, token }, context) {
    const query = new URLSearchParams({
      src,
      width: String(modifiers.width ?? ''),
      quality: String(modifiers.quality ?? '')
    });
    if (token) query.set('token', token);

    return {
      url: `${baseURL}?${query}`,
      isOptimized: true
    };
  }
});

export const acmeProvider = configureProvider(
  setup,
  {
    baseURL: 'https://images.example.com/transform'
  },
  'acme'
);
```

Provider setup is memoized. Per-config `providerOptions[name]` are merged over configured defaults, and standard width/height/quality/format modifiers are merged last. The context exposes resolved options and a memoized `$img` helper.

Set `acceptsOpaqueSource: true` only for providers whose source is an asset ID rather than a path or URL. Set `validateDomains: true` when remote inputs must match the configured `domains` or `remotePatterns`.

The original object-input `ImageProvider` contract remains supported.

### Provider-authoring utilities

The main entry exports reusable provider primitives:

- `defineProvider`, `configureProvider`, `resolveProviderRegistration`
- `createMappedQueryProvider`, `mappedQueryURL`, `mappedModifiers`
- `pathOperations`, `appendProviderModifiers`, `withStandardParams`
- `providerBaseURL`, `sourceWithBase`, `sourcePath`, `joinURLParts`
- `cleanColor`, `formatJpgValue`, `defaultFitValue`
- `createMapper`, `createOperationsGenerator`
- `appendQuery`, `stableModifiers`, `normalizeFormat`, `mimeForFormat`

## Framework integration kit

`@desource/image/kit` contains small helpers shared by framework renderers:

```ts
import {
  isResolvedImageConfig,
  mergeClassNames,
  normalizeCrossorigin,
  stripUndefined,
  styleWithPlaceholder
} from '@desource/image/kit';
```

The subpath is intentionally limited to framework glue; provider URL logic stays in the main package and rendering lifecycle remains in the framework packages.

## Responsive behavior

Supported size forms include:

```text
100vw
sm:100vw md:50vw lg:400px
100vw md:760px
```

and object syntax:

```ts
{
  '1px': '100vw',
  md: '760px'
}
```

With `sizes`, output uses width descriptors and provider-size candidates. Without `sizes`, a known width uses density descriptors. Duplicate final URLs are removed—important for providers such as Vercel that normalize arbitrary requested widths to configured screens.

## Placeholders and picture fallbacks

- `placeholder: true` → `[10, 10, 50, 3]`
- `placeholder: 24` → width and height `24`
- `placeholder: [24, 16, 40, 2]` → custom width, height, quality, blur
- `placeholder: 'data:…'` → use the string directly

SVG sources pass through without generated picture sources. Picture output excludes a modern format when it is the same as the normalized fallback and preserves transparent-safe PNG fallback behavior.

## Security

This package validates strings; it does not fetch remote bytes. The IPX server integrations live in the framework packages and deny all remote domains by default.

For platform providers that expose a public optimizer endpoint, keep `domains`, `remotePatterns`, provider width lists, and quality lists aligned with the deployment configuration. Use narrow patterns to prevent transformation abuse.

## Publishing guarantees

The package is verified with:

- TypeScript strict checks;
- provider parity and behavioral tests;
- enforced 95%+ statement/function/line coverage;
- `publint`;
- Are The Types Wrong across Node 10 resolution, Node 16 ESM/CJS resolution, and bundlers;
- explicit exports for the root, `/kit`, `/providers`, and wildcard provider subpaths.

## License

MIT © 2026 DeSource Labs
