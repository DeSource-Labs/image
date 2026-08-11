# @desource/image-angular

Angular components for Desource Image.

## Install

```sh
pnpm add @desource/image-angular
```

Add `@desource/image` too when your app imports core helpers or provider factories directly, such as custom Cloudinary/Imgix config.

Peer dependencies support Angular `^19.0.0 || ^20.0.0 || ^21.0.0`. The package is built with Angular 21.2.12 and uses standalone signal-input components.

For Angular SSR, install the optimizer middleware in `src/server.ts` before static files and SSR rendering:

```ts
import { createDsImageMiddleware } from '@desource/image-angular/server';

app.use(createDsImageMiddleware({
  dirs: [browserDistFolder]
}));
```

Also externalize the server subpath in `angular.json` so Angular does not bundle the Sharp-based optimizer into `server.mjs`:

```json
{
  "externalDependencies": ["@desource/image-angular/server"]
}
```

## Use

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsImageComponent } from '@desource/image-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DsImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-image
      src="/img/hero.jpg"
      alt="Background"
      quality="75"
      sizes="100vw md:1100px"
      format="webp"
      loading="lazy"
    />
  `
})
export class AppComponent {}
```

This produces an IPX-style local URL:

```txt
/_ipx/w_2200&f_webp&q_75/img/hero.jpg
```

`priority` or `preload` sets `loading="eager"`, `fetchpriority="high"` when requested, and `decoding="sync"`.

No image provider config is required for the common path. `provideDsImage(config)`, `provideDsAwsAmplifyImage(config)`, `provideDsVercelImage(config)`, and `provideDsIpxImage(config)` are optional when you want explicit providers, aliases, presets, or validation policy.

## Picture

```html
<ds-picture
  src="/hero.png"
  alt="Hero"
  [width]="2200"
  [height]="1200"
  sizes="100vw md:1100px"
  [format]="['avif', 'webp']"
/>
```

This renders `<source type="image/avif">`, `<source type="image/webp">`, and a fallback `<img>`.

Comma-separated formats and `legacyFormat` are also supported:

```html
<ds-picture src="/hero.png" alt="Hero" format="avif,webp" legacyFormat="jpg" />
```

## Helper Service

```ts
import { inject } from '@angular/core';
import { DsImageService } from '@desource/image-angular';

const $img = inject(DsImageService).create();
const hero = $img('/img/hero.jpg', { width: 800, format: 'webp', quality: 75 });
```

The helper matches the core callable API with `getImage`, `getSizes`, `getAttrs`, `getPicture`, `getPreloadLink`, and preset shortcut methods.

## Providers

Automatic provider detection uses `std-env` first, then keeps host/rendered-output fallbacks so SSR and hydration stay aligned:

- `awsAmplify` when `AWS_AMPLIFY`, `AWS_APP_ID`, an `.amplifyapp.com` host, or server-rendered AWS Amplify image URLs are detected.
- `vercel` when `VERCEL`, `VERCEL_ENV`, `NOW_BUILDER`, `VERCEL_URL`, `NEXT_PUBLIC_VERCEL_URL`, a `.vercel.app` host, or server-rendered Vercel image URLs are detected.
- `netlify` when `NETLIFY`, `NETLIFY_LOCAL`, a `.netlify.app` host, or server-rendered Netlify image URLs are detected.
- `ipx` otherwise.

`DESOURCE_IMAGE_PROVIDER`, `PUBLIC_DESOURCE_IMAGE_PROVIDER`, or `VITE_DESOURCE_IMAGE_PROVIDER` can override detection.

### AWS Amplify

```ts
import { provideDsAwsAmplifyImage } from '@desource/image-angular';

provideDsAwsAmplifyImage();
```

AWS Amplify output uses `/_amplify/image?url=%2Fimg%2Fhero.jpg&w=2200&q=75`.

### Vercel

```ts
import { provideDsVercelImage } from '@desource/image-angular';

provideDsVercelImage();
```

Vercel output uses `/_vercel/image?url=%2Fimg%2Fhero.jpg&w=<screen-width>&q=75`. Widths are normalized to the next configured screen width and remote URLs must match configured `domains` or `remotePatterns`. Vercel formats are selected from platform config and request headers, so the provider does not add an explicit `format` query parameter.

Vercel project config should include compatible `images.sizes`, `images.qualities`, `images.formats`, `images.localPatterns`, `images.remotePatterns` or `domains`, and `minimumCacheTTL`.

### Cloudinary

```ts
import { cloudinaryProvider } from '@desource/image/providers/cloudinary';

provideDsImage({
  provider: 'cloudinary',
  providers: {
    cloudinary: cloudinaryProvider({ cloudName: 'demo' })
  }
});
```

## Presets

```ts
provideDsImage({
  presets: {
    avatar: {
      width: 96,
      height: 96,
      fit: 'cover',
      quality: 80
    }
  }
});
```

```html
<ds-image preset="avatar" src="/user.png" alt="User" />
```

## Aliases

```ts
provideDsImage({
  aliases: {
    unsplash: 'https://images.unsplash.com'
  },
  domains: ['images.unsplash.com']
});
```

```html
<ds-image src="/unsplash/photo-id" alt="Remote image" width="800" />
```

## Placeholders

```html
<ds-image src="/hero.png" alt="Hero" width="1200" placeholder placeholderClass="blur" />
<ds-image src="/hero.png" alt="Hero" width="1200" [placeholder]="[48, 32, 25, 8]" />
<ds-image src="/hero.png" alt="Hero" width="1200" placeholder="data:image/png;base64,..." />
```

The placeholder is rendered as a deterministic background image until the real image load event fires on the client.

## Native Attributes

Common native attributes are inputs: `class`, `style`, `id`, `role`, `aria-label`, `aria-describedby`, `referrerpolicy`, `crossorigin`, `usemap`, and `data-testid`.

For arbitrary attributes use:

```html
<ds-image src="/hero.png" alt="Hero" [nativeAttrs]="{ 'data-track': 'hero' }" />
```

Angular components have a custom-element host, so the package sets `display: contents` on the host and forwards supported attributes to the inner `<img>`.

## SSR Notes

All URLs and attributes are computed from pure core helpers. Placeholder loaded state starts as not loaded on both server and client to avoid hydration mismatch. `createDsImageMiddleware()` serves the local `/_ipx` optimizer endpoint for Angular SSR. Automatic preload link injection is not implemented yet; use `getImagePreloadLink` from core for a custom Angular SSR integration.
