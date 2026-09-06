import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { dsImage } from '../src/lib/vite.js';

export default defineConfig({
  root: import.meta.dirname,
  plugins: [
    dsImage({
      provider: 'ipx',
      dirs: ['../../svelte/demo/public'],
      allowAllDomains: false
    })
  ],
  resolve: {
    alias: {
      '@desource/image-react': resolve(import.meta.dirname, '../src/index.ts'),
      '@desource/image-react/vite': resolve(import.meta.dirname, '../src/vite.ts'),
      '@desource/image': resolve(import.meta.dirname, '../../core/src')
    }
  },
  esbuild: {
    jsx: 'automatic'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
