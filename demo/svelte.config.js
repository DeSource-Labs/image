import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      runtime: 'nodejs24.x',
      images: {
        sizes: [640, 768, 1024, 1280, 1536],
        domains: [],
        minimumCacheTTL: 2678400,
        formats: ['image/avif', 'image/webp'],
        dangerouslyAllowSVG: false
      }
    })
  }
};
