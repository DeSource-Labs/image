import { dsImage } from '@desource/image-svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [dsImage({ dirs: ['static'] }), sveltekit()]
});
