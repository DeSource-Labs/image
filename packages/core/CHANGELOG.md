# @desource/image

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

## 0.1.0

### Minor Changes

- Initial release of DeSource Image:
  - Generates responsive `srcset`, native `<picture>` output, placeholders, and preload metadata from one local or remote image.
  - Shares typed configuration, presets, aliases, source validation, and dozens of built-in providers with tree-shakable subpath imports.
  - Detects Vercel, Netlify, or AWS Amplify from the deployment environment, with explicit provider overrides and an IPX fallback.
  - Exposes native framework APIs through Angular components, directives, a service, and an `NgOptimizedImage` loader; React components, hooks, and a `next/image` loader; and Svelte components, actions, and attachments.
  - Generates the same URLs and attributes on the server and client so hydration does not rewrite image markup.
  - Serves local IPX transformations through Vite and Angular SSR middleware, Next.js App Router handlers, SvelteKit hooks, or generic Fetch and Node adapters.
