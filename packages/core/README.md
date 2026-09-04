<div align="center">
  <h1>Desource Image Core - Framework-independent image optimization</h1>
  <p><strong><code>@desource/image</code> provides URL generation, responsive attributes, picture sources, configuration, presets, aliases, and provider tools for any JavaScript runtime.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@desource/image"><img src="https://img.shields.io/npm/v/@desource/image?logo=npm" alt="npm version"></a>
    <a href="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml"><img src="https://github.com/DeSource-Labs/image/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="https://codecov.io/gh/DeSource-Labs/image"><img src="https://codecov.io/gh/DeSource-Labs/image/branch/main/graph/badge.svg" alt="Coverage"></a>
    <a href="https://github.com/DeSource-Labs/image/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
  </p>
</div>

AI-assisted development moves ideas into working products quickly. Desource Image keeps image preparation inside that development loop. Add one suitable local or remote source, then control its output with typed image options.

Keep `/img/hero.jpg` instead of exporting `hero-480.webp`, `hero-960.webp`, and `hero-1600.webp`. The core engine generates provider URLs, responsive `srcset` data, `<picture>` sources, placeholders, and preload metadata, then applies presets, aliases, and source validation.

For MVPs and everyday product development, image quality becomes a code edit. Change `quality: 80` to `quality: 65` and keep the same source file, helper call, and URL in application code.

`@desource/image` powers the Angular, React, and Svelte packages, but it does not depend on a DOM or framework renderer. Use it anywhere that needs the same image URL and responsive-output rules: server templates, workers, metadata pipelines, emails, design systems, or custom components.

Provider configuration is optional. On Vercel, Netlify, or AWS Amplify, Desource Image selects the platform image service from the deployment environment. Everywhere else, it falls back to the built-in IPX path. An explicit provider always wins.

## Why use the core package directly?

Use `@desource/image` when image rules should live above a component:

- Change image quality, format, crop, or responsive sizes in code while the source and filename stay unchanged.
- Start with one suitable image and generate the widths and formats each screen needs.
- Generate one URL or complete `src`, `srcset`, `sizes`, `<picture>`, placeholder, and preload data.
- Let the deployment select Vercel, Netlify, or AWS Amplify, with IPX for local and other environments.
- Share deployment detection, provider config, presets, aliases, and source rules across Angular, React, Svelte, workers, and Node scripts.
- Create a callable `$img` helper for CSS, metadata, canvas, Open Graph images, email, or CMS previews.
- Build a custom renderer without reimplementing width candidates, density candidates, format fallbacks, or preload metadata.
- Author one typed provider and use it from every framework package.
- Validate local and remote sources before they reach a public optimizer endpoint.

If you only render images through one framework package, install that framework package first. It already depends on `@desource/image`.

## Install

```sh
npm install @desource/image
```

## Quick start

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

const url = image('/img/hero.jpg', {
  width: 800,
  format: 'webp'
});

const attrs = image.getAttrs({
  src: '/img/hero.jpg',
  alt: 'Mountain lake',
  width: 1600,
  height: 1000,
  sizes: '100vw md:760px',
  placeholder: true
});

const picture = image.getPicture({
  src: '/img/hero.jpg',
  alt: 'Mountain lake',
  width: 1600,
  height: 1000,
  formats: ['avif', 'webp'],
  fallbackFormat: 'jpg'
});

const avatarUrl = image.avatar('/people/ada.jpg');
```

The callable helper also exposes `getImage`, `getSizes`, `getMeta`, `getPreloadLink`, and one shortcut for every configured preset.

## What it generates

| API                     | Output                                                                  |
| ----------------------- | ----------------------------------------------------------------------- |
| `image(src, modifiers)` | Optimized URL string.                                                   |
| `getImage()`            | Provider result with URL and optimization metadata.                     |
| `getSizes()`            | Normalized `srcset`, `sizes`, candidate widths, and descriptor data.    |
| `getAttrs()`            | Native `<img>` attributes, placeholder URL, and placeholder class.      |
| `getPicture()`          | Native `<picture>` data: ordered sources plus fallback image attrs.     |
| `getPreloadLink()`      | Responsive `<link rel="preload" as="image">` attributes.                |
| `getMeta()`             | Image dimensions and metadata when a provider or runtime can load them. |

Stateless helpers are available when a callable helper is not needed:

```ts
import { getImageAttrs, getImagePreloadLink, getImageSizes, getPictureAttrs } from '@desource/image';

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
import { cloudinaryProvider } from '@desource/image/providers/cloudinary';

export const config: ImageConfig = {
  provider: 'cloudinary',
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
  remotePatterns: [{ protocol: 'https', hostname: '*.example.com', pathname: '/media/**' }],
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
};
```

`resolveImageConfig(config)` normalizes this once. `createImageContext(config)` returns the resolved config plus bound `getImage`, `getImageAttrs`, `getPictureAttrs`, `getPreloadLink`, and `getMeta` methods.

### Provider detection

`provider: 'auto'` is the default. Desource Image detects the deployment environment once and selects its image backend:

| Runtime             | Provider            |
| ------------------- | ------------------- |
| Vercel              | `vercel`            |
| AWS Amplify         | `awsAmplify`        |
| Netlify             | `netlifyImageCdn`   |
| Netlify Large Media | `netlifyLargeMedia` |
| Other / local       | `ipx`               |

An explicit provider bypasses detection. React and Svelte Vite integrations can compile the result into client and SSR bundles, preventing provider drift during hydration.

Detection is based on the deployment, not the source URL. This lets the same local path use the platform optimizer in production and IPX during local development. The package does not read environment variables specific to Desource Image or infer providers from browser hostnames.

### Source validation

Use source controls when an optimizer endpoint should only transform known sources:

```ts
const config: ImageConfig = {
  domains: ['images.example.com'],
  localPatterns: [{ pathname: '/img/**' }],
  remotePatterns: [{ protocol: 'https', hostname: '*.example.com', pathname: '/media/**' }],
  onInvalidSource: 'throw'
};
```

Invalid-source policies:

- `throw`: throw an error.
- `warn`: log a warning and pass the source through.
- `passthrough`: pass the source through without logging.

Patterns accept `*` for one path segment and `**` for recursive matches.

## Responsive output

Supported `sizes` forms:

```text
100vw
sm:100vw md:50vw lg:400px
100vw md:760px
```

Object syntax is also accepted:

```ts
{
  sm: '100vw',
  md: '50vw',
  lg: 600
}
```

With `sizes`, output uses width descriptors and provider-size candidates. Without `sizes`, a known width uses density descriptors. Duplicate final URLs are removed, which matters for providers that normalize requested widths to configured breakpoints.

## Placeholders and picture fallbacks

Placeholder values:

- `placeholder: true` → `[10, 10, 50, 3]`
- `placeholder: 24` → width and height `24`
- `placeholder: [24, 16, 40, 2]` → custom width, height, quality, blur
- `placeholder: 'data:…'` → use the string directly

Framework packages use the generated `placeholderSrc` and `placeholderClass` to show a small image until the full image decodes.

Picture output skips generated sources for SVG input, avoids duplicate formats, and keeps transparent-safe PNG fallback behavior.

## Providers

The main entry includes a small default registry:

- `ipx`
- `ipxStatic`
- `vercel`
- `awsAmplify`
- `netlify`
- `netlifyImageCdn`
- `netlifyLargeMedia`
- `none`

Import all 46 provider modules only when required:

```ts
import { BUILT_IN_PROVIDER_NAMES, createBuiltInProviders } from '@desource/image/providers';
```

Prefer provider subpaths for application code:

```ts
import { cloudinaryProvider } from '@desource/image/providers/cloudinary';
import { imgixProvider } from '@desource/image/providers/imgix';
import { sanityProvider } from '@desource/image/providers/sanity';
```

Provider modules:

`aliyun`, `awsAmplify`, `builderio`, `bunny`, `caisy`, `cloudflare`, `cloudflareimages`, `cloudimage`, `cloudinary`, `contentful`, `directus`, `edgeonePages`, `fastly`, `filerobot`, `flyimg`, `github`, `glide`, `gumlet`, `hygraph`, `imageengine`, `imagekit`, `imgix`, `imgproxy`, `ipx`, `ipxStatic`, `netlify`, `netlifyImageCdn`, `netlifyLargeMedia`, `none`, `picsum`, `prepr`, `prismic`, `sanity`, `shopify`, `sirv`, `storyblok`, `strapi`, `strapi5`, `supabase`, `twicpics`, `umbraco`, `unsplash`, `uploadcare`, `vercel`, `wagtail`, and `weserv`.

Provider behavior is parity-tested against a pinned Nuxt Image package where comparable behavior exists. The framework integrations remain native to Angular, React, and Svelte.

## Custom providers

The provider contract is Desource Image's own shape. It is intentionally small: a provider receives a normalized source, merged options, and an image context, then returns a URL.

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

Set `acceptsOpaqueSource: true` only for providers whose source is an asset ID rather than a path or URL. Set `validateDomains: true` when remote inputs must match configured `domains` or `remotePatterns`.

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

`@desource/image/kit` contains small helpers used by the framework packages:

```ts
import {
  isResolvedImageConfig,
  mergeClassNames,
  normalizeCrossorigin,
  stripUndefined,
  styleWithPlaceholder
} from '@desource/image/kit';
```

The subpath is limited to framework glue. Provider URL logic stays in the main package; rendering lifecycle stays in the framework packages.

## Security

This package validates strings and generates URLs; it does not fetch remote bytes. IPX server integrations live in the framework packages and deny all remote domains by default.

For public optimizer endpoints, keep `domains`, `remotePatterns`, provider width lists, and quality lists aligned with the deployment configuration. Use narrow patterns to avoid transformation abuse.

## Package checks

```sh
pnpm --filter @desource/image build
pnpm --filter @desource/image typecheck
pnpm --filter @desource/image test:unit:coverage
pnpm --filter @desource/image publish:check
```

The package is verified with strict TypeScript, provider parity tests, coverage thresholds, `publint`, and Are The Types Wrong checks for the root, `/kit`, `/providers`, and wildcard provider subpaths.

## Links

- [Repository](https://github.com/DeSource-Labs/image)
- [Angular package](https://github.com/DeSource-Labs/image/tree/main/packages/angular)
- [React package](https://github.com/DeSource-Labs/image/tree/main/packages/react)
- [Svelte package](https://github.com/DeSource-Labs/image/tree/main/packages/svelte)
- [Security policy](https://github.com/DeSource-Labs/image/blob/main/SECURITY.md)

## License

MIT © 2026 DeSource Labs
