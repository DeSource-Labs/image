# Contributing to Desource Image

Thanks for helping make high-quality image optimization feel native in Angular and Svelte.

By participating, you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md). Report security issues privately as described in [SECURITY.md](./SECURITY.md).

## Before opening an issue

Search existing issues and include a minimal reproduction. Image behavior depends on the framework, rendering mode, provider, source URL, and generated markup, so include all five when relevant.

Provider bugs should include the input source, configuration, modifiers, expected URL, actual URL, and a link to the provider's authoritative documentation.

## Development setup

Requirements:

- Node.js 22.18 or newer
- pnpm 10.33 or newer

```sh
pnpm install
pnpm build
pnpm verify
```

Use the package demos for focused development and the root SvelteKit app for documentation and integration work:

```sh
pnpm --filter @desource/image-angular dev
pnpm --filter @desource/image-svelte dev
pnpm dev:demo
```

## Repository structure

```text
packages/core       Framework-agnostic runtime, kit utilities, and providers
packages/angular    Angular components, directives, SSR adapter, tests, and fixture
packages/svelte     Svelte components, action, attachment, Vite adapter, tests, and fixture
common/test         Shared behavioral contracts and browser-test helpers
demo                SSR SvelteKit documentation and interactive examples
scripts             Coverage and release automation
```

Framework-neutral behavior belongs in core. Reusable framework glue belongs in `@desource/image/kit`; DOM rendering and lifecycle behavior stay in the Angular or Svelte package.

## Quality expectations

Before submitting a pull request:

```sh
pnpm lint
pnpm format:check
pnpm typecheck
pnpm build
pnpm build:fixtures
pnpm build:demo
pnpm test:unit
pnpm test:e2e
pnpm publish:check
```

Add focused tests for behavior changes. Shared API behavior should use the contracts in `common/test`; framework-specific rendering and lifecycle behavior should remain in the owning package. Avoid tests that merely repeat TypeScript or implementation details.

For provider changes, compare against the bundled `nuxt_image` reference and add URL-generation cases covering provider options and non-default modifiers.

## Pull requests

Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `perf:`, `test:`, or `chore:`). Keep changes scoped, update public documentation, and add a changeset for changes that affect published packages:

```sh
pnpm changeset
```

All three public packages are released as a fixed group. Select every package and use the same summary so their versions and changelog entries stay aligned.

## Release process

Maintainers run:

```sh
pnpm changeset:version
pnpm verify:release
```

A release pull request uses the commit title `chore: Release packages`. After merge, the release workflow publishes all packages without package-specific Git tags, then creates one `X.Y.Z` Git tag and one GitHub release from the shared changelog entry.
