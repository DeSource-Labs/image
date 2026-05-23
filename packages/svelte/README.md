# @desource/svelte-image

Svelte 5 and SvelteKit components for Desource Image.

## Install

```sh
pnpm add @desource/svelte-image @desource/image-core
```

## Configure

Set config in a root Svelte/SvelteKit layout:

```svelte
<script lang="ts">
  import { setImageConfig } from '@desource/svelte-image';
  import { vercelProvider } from '@desource/image-core';

  setImageConfig({
    provider: 'vercel',
    providers: {
      vercel: vercelProvider()
    },
    quality: 75,
    format: ['avif', 'webp'],
    aliases: {
      unsplash: 'https://images.unsplash.com'
    },
    domains: ['images.unsplash.com']
  });

  let { children } = $props();
</script>

{@render children()}
```

## Image

```svelte
<script lang="ts">
  import { Image } from '@desource/svelte-image';
</script>

<Image
  src="/my_image.png"
  alt="Hero"
  width={2200}
  height={1200}
  quality={75}
  sizes="100vw md:1100px"
  format="webp"
  loading="eager"
  fetchpriority="high"
/>
```

`priority` sets `loading="eager"`, `fetchpriority="high"`, and `decoding="sync"`.

## Picture

```svelte
<script lang="ts">
  import { Picture } from '@desource/svelte-image';
</script>

<Picture
  src="/hero.png"
  alt="Hero"
  width={2200}
  height={1200}
  sizes="100vw md:1100px"
  formats={['avif', 'webp']}
/>
```

The component renders native `<picture>` and `<img>` elements with no wrapper.

## SvelteKit on Vercel

Use `vercelProvider()` and ensure Vercel image config allows the widths, qualities, formats, local paths, and remote hosts you generate:

```json
{
  "images": {
    "sizes": [320, 640, 768, 1024, 1280, 1536, 2200],
    "qualities": [50, 60, 70, 75, 80, 90],
    "formats": ["image/avif", "image/webp"],
    "localPatterns": [{ "pathname": "/**" }],
    "remotePatterns": [
      {
        "protocol": "https",
        "hostname": "images.unsplash.com",
        "pathname": "/**"
      }
    ],
    "minimumCacheTTL": 31536000
  }
}
```

The `examples/sveltekit-vercel` app includes this in `vercel.json`.

## SvelteKit Node with IPX URLs

```ts
import { ipxProvider } from '@desource/image-core';

setImageConfig({
  provider: 'ipx',
  providers: {
    ipx: ipxProvider({ path: '/_ipx' })
  }
});
```

This emits IPX-style URLs. The first pass does not include an optimizer endpoint; add a SvelteKit server route at `/_ipx/[...path]` and perform server-only image transformation there.

## Presets

```ts
setImageConfig({
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

```svelte
<Image preset="avatar" src="/user.png" alt="User" />
```

## Aliases

```ts
setImageConfig({
  aliases: {
    unsplash: 'https://images.unsplash.com'
  },
  domains: ['images.unsplash.com']
});
```

```svelte
<Image src="/unsplash/photo-id" alt="Remote image" width={800} />
```

## Placeholders

```svelte
<Image src="/hero.png" alt="Hero" width={1200} placeholder placeholderClass="blur" />
<Image src="/hero.png" alt="Hero" width={1200} placeholder={[48, 32, 25, 8]} />
<Image src="/hero.png" alt="Hero" width={1200} placeholder="data:image/png;base64,..." />
```

The placeholder is rendered as a deterministic background image until the real image load event fires on the client.

## SSR Notes

The components call pure core helpers during render and do not use browser-only APIs in the SSR path. Loaded state initializes as `false` on server and client, avoiding placeholder hydration mismatch. Native image attributes are passed through with Svelte rest props.
