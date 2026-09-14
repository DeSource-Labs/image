# @desource/image-angular

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
