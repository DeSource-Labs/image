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
    domains: ['images.unsplash.com'],
    presets: {
      avatar: {
        width: 96,
        height: 96,
        fit: 'cover',
        quality: 80
      },
      cover: {
        sizes: '100vw md:1100px',
        fit: 'cover',
        quality: 78
      }
    }
  });

  let { children } = $props();
</script>

{@render children()}
