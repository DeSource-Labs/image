# @desource/svelte-image

Svelte 5 and SvelteKit components for Desource Image.

## Install

```sh
pnpm add @desource/svelte-image
```

Add the SvelteKit integration in `vite.config.ts`:

```ts
import { desourceImage } from '@desource/svelte-image/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [desourceImage(), sveltekit()]
});
```

This registers the local `/_ipx` optimizer for SvelteKit dev and preview. It is the SvelteKit equivalent of adding `@nuxt/image` to `nuxt.config`.

## Image

```svelte
<script lang="ts">
  import { Image } from '@desource/svelte-image';
</script>

<Image
  src="/img/hero.jpg"
  alt="Background"
  quality={75}
  sizes="100vw md:1100px"
  format="webp"
  loading="lazy"
/>
```

This produces a Nuxt-like local URL:

```txt
/_ipx/w_2200&f_webp&q_75/img/hero.jpg
```

`priority` or Nuxt-style `preload` sets `loading="eager"`, `fetchpriority="high"` when requested, and `decoding="sync"`.

No provider config is required for the common path. Add `setImageConfig(config)` in a root layout only when you need explicit providers, aliases, presets, validation rules, or global defaults.

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

Nuxt-style comma-separated formats are also supported:

```svelte
<Picture src="/hero.png" alt="Hero" format="avif,webp" legacyFormat="jpg" />
```

## useImage

```svelte
<script lang="ts">
  import { useImage } from '@desource/svelte-image';

  const $img = useImage();
  const hero = $img('/img/hero.jpg', { width: 800, format: 'webp', quality: 75 });
</script>
```

`useImage()` returns the Nuxt-style callable helper with `getImage`, `getSizes`, `getAttrs`, `getPicture`, `getPreloadLink`, and preset shortcut methods.

## SvelteKit on Vercel

Automatic provider detection uses Vercel when `VERCEL`, `VERCEL_URL`, `NEXT_PUBLIC_VERCEL_URL`, or a `.vercel.app` host is detected. `desourceImage()` bakes the detected provider into the client bundle so SSR and hydration agree even on custom domains. For stricter Vercel projects, ensure image config allows the widths, qualities, formats, local paths, and remote hosts you generate:

```json
{
  "images": {
    "sizes": [1, 2, 320, 640, 768, 1024, 1100, 1280, 1536, 2200],
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

## SvelteKit With IPX

The default provider emits IPX-style URLs. `desourceImage()` answers those URLs locally and returns transformed bytes, for example WebP output for `format="webp"`.

No `src/routes/_ipx` route is needed.

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
