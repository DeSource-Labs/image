import { desourceImage } from '@desource/svelte-image/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [desourceImage(), sveltekit()]
});
