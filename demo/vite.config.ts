import { dsImage } from '@desource/image-svelte/vite';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    dsImage({ dirs: ['static'] }),
    sveltekit({
      preprocess: vitePreprocess(),
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
    })
  ]
});
