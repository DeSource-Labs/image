import { resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { desourceImage } from '../src/lib/vite.js';

export default defineConfig({
  root: import.meta.dirname,
  plugins: [
    svelte({ configFile: resolve(import.meta.dirname, '../svelte.config.js') }),
    desourceImage({
      provider: 'ipx',
      dirs: ['public'],
      allowAllDomains: false
    })
  ],
  resolve: {
    alias: {
      '@desource/image-svelte': resolve(import.meta.dirname, '../src/lib/index.ts')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
