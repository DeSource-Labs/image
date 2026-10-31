# @desource/image-svelte

## 0.5.0

### Minor Changes

- Core | Angular | React | Svelte Upgrades:
  - Added Appwrite Storage as a built-in image provider:
    - Exposed `appwriteProvider` and `AppwriteProviderOptions` through the provider registry and tree-shakable subpath imports.
    - Supported resizing, quality, JPEG, PNG, GIF, WebP, AVIF, HEIC, and native preview modifiers.
    - Converted Storage `/view` URLs to `/preview`, preserving custom hosts, encoded paths, access parameters, repeated query parameters, and fragments.
    - Supported relative sources through `baseURL` and a `projectId` fallback, with source projects and explicit modifiers taking precedence.
    - Validated dimensions from 0 to 4000, including source query parameters and responsive candidates.
    - Rejected invalid Storage paths, missing or invalid projects, unsupported output formats, and generic fit modifiers.
  - Added Filestack as a built-in image provider:
    - Exposed `filestackProvider` and `FilestackProviderOptions` through the provider registry and tree-shakable subpath imports.
    - Supported file handles, untransformed CDN URLs, custom CDN origins, external HTTP(S) images, and `src://` storage aliases.
    - Required a public `apiKey` for external images and storage aliases, preserving their full sources through UTF-8 URL-safe Base64 encoding.
    - Generated ordered resize and output tasks with quality, JPEG, PNG, WebP, and AVIF support.
    - Mapped `cover` to `crop`, `contain` to `clip`, `fill` to `scale`, and `inside` or `scale-down` to `max`, with native fit values also supported.
    - Supported default modifiers and a synchronous `signURL` callback for authorizing finalized responsive, picture, and placeholder URLs.
    - Validated dimensions from 1 to 10000 across responsive candidates and rejected invalid quality, unsupported formats or fits, incomplete crop or scale dimensions, and transformed or signed CDN inputs.
  - Added Appwrite and Filestack setup documentation, examples, demo listings, logos, and README provider entries.
  - Consolidated shared image logic:
    - Shared Angular image and picture inputs, coercion, placeholder loading, preload links, and native attribute handling.
    - Shared width selection and development warnings between Vercel and AWS Amplify.
    - Simplified Filestack fit validation.
  - Expanded and consolidated test coverage:
    - Added provider URL validation and local-server response tests for decoded dimensions, responsive candidates, placeholders, picture MIME types, and finalized URL signing.
    - Shared image response fixtures, query-preservation assertions, and Svelte image mocks.
    - Added Angular assertions for protected image alt attributes and picture fallback alt overrides.
  - Reduced unit-test overhead:
    - Used thread workers and disabled isolation for core suites except provider detection, with automatic restoration of mocks, environment variables, and globals.
    - Defaulted React unit tests to Node, retaining jsdom for DOM suites.
  - Updated core development and demo dependencies to stable IPX 4.0.0.
  - Updated the demo to SvelteKit 3.1.1 and adapter-vercel 7.0.2.
  - Updated Angular, React, Next.js, Svelte, Nuxt Image, Vite, Vitest, Playwright, linting, formatting, and supporting development dependencies.
  - Updated workspace dependency overrides, pinned the OXC parser's compatible WASM runtime, and removed the obsolete ng-packagr override.
  - Updated the Changesets configuration schema to 4.0.1.
  - Upgraded pnpm to 12.16.1.

### Patch Changes

- Updated dependencies []:
  - @desource/image@0.5.0

## 0.4.0

### Minor Changes

- Core | Angular | React | Svelte Upgrades:
  - Added support for IPX 4.0.0-beta.1 while preserving IPX 3 compatibility:
    - Supported the new Node and Fetch handler APIs alongside the existing server APIs.
    - Expanded optional IPX peer dependency ranges across Angular, React, and Svelte.
    - Updated the demo and core development dependency to IPX 4.0.0-beta.1.
    - Extended shared server tests to cover both IPX API shapes.
  - Migrated the demo to SvelteKit 3.0.1 and adapter-vercel 7.0.0.
  - Updated development, build, and CI dependencies.
  - Added Context7 and DeepWiki badges to repository and package READMEs and updated the repository license link.
  - Upgraded pnpm to 12.10.1.

### Patch Changes

- Updated dependencies []:
  - @desource/image@0.4.0

## 0.3.1

### Patch Changes

- Core | Angular | React | Svelte Upgrades:
  - Updated runtime, development, and CI dependencies:
    - Updated `std-env` to 4.3.0.
    - Updated Vite to 8.3.1 and Vitest with V8 coverage to 5.0.2.
    - Updated linting, formatting, type definitions, and supporting development tools.
  - Upgraded pnpm to 12.8.1.

- Updated dependencies []:
  - @desource/image@0.3.1

## 0.3.0

### Minor Changes

- Core | Angular | React | Svelte Upgrades:
  - Added Contentstack as a built-in image provider:
    - Exposed `contentstackProvider` and `ContentstackProviderOptions` through the provider registry and tree-shakable subpath imports.
    - Supported resizing, quality, JPEG, PNG, GIF, WebP, AVIF, and native Contentstack modifiers.
    - Mapped `cover` to `crop` and `contain` to `bounds`, with support for native `crop` and `bounds` fit values.
    - Preserved regional and custom delivery hosts, encoded asset paths, query parameters, and fragments while replacing explicit transformations.
    - Supported relative sources through `baseURL` and a configured environment fallback, with source environments and explicit modifiers taking precedence.
    - Removed conflicting `auto` negotiation when an explicit format was present to keep picture MIME types consistent.
    - Rejected missing or invalid environments, unsupported fit and format modifiers, and fit requests without both dimensions.
  - Added Contentstack setup documentation, demo listing, logo, and README provider entries.

### Patch Changes

- Updated dependencies []:
  - @desource/image@0.3.0

## 0.2.0

### Minor Changes

- Core | Angular | React | Svelte Upgrades:
  - Added KeyCDN as a built-in image provider:
    - Exposed `keycdnProvider` and `KeyCDNProviderOptions` through the provider registry and tree-shakable subpath imports.
    - Supported resizing, fit, position, background, quality, JPEG, PNG, WebP, and native KeyCDN modifiers.
    - Preserved source paths, query parameters, and fragments while replacing explicit transformations.
    - Rejected unsupported values with clear errors.
  - Added KeyCDN setup documentation.
  - Standardized README titles, badges, and provider descriptions.
  - Updated runtime and development dependencies.
  - Upgraded pnpm to 12.4.1.

### Patch Changes

- Updated dependencies []:
  - @desource/image@0.2.0

## 0.1.0

### Minor Changes

- Initial release of DeSource Image:
  - Generates responsive `srcset`, native `<picture>` output, placeholders, and preload metadata from one local or remote image.
  - Shares typed configuration, presets, aliases, source validation, and dozens of built-in providers with tree-shakable subpath imports.
  - Detects Vercel, Netlify, or AWS Amplify from the deployment environment, with explicit provider overrides and an IPX fallback.
  - Exposes native framework APIs through Angular components, directives, a service, and an `NgOptimizedImage` loader; React components, hooks, and a `next/image` loader; and Svelte components, actions, and attachments.
  - Generates the same URLs and attributes on the server and client so hydration does not rewrite image markup.
  - Serves local IPX transformations through Vite and Angular SSR middleware, Next.js App Router handlers, SvelteKit hooks, or generic Fetch and Node adapters.

### Patch Changes

- Updated dependencies []:
  - @desource/image@0.1.0
