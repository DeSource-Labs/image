<script lang="ts">
  import { setImageConfig } from '@desource/svelte-image';
  import { ipxProvider } from '@desource/image-core';

  setImageConfig({
    provider: 'ipx',
    providers: {
      ipx: ipxProvider({ path: '/_ipx' })
    },
    quality: 72,
    aliases: {
      unsplash: 'https://images.unsplash.com'
    },
    domains: ['images.unsplash.com'],
    presets: {
      cover: {
        sizes: '100vw md:1100px',
        fit: 'cover'
      }
    }
  });

  let { children } = $props();
</script>

{@render children()}
