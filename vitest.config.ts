import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: [
      {
        find: /^@desource\/image-core$/,
        replacement: resolve(import.meta.dirname, 'packages/core/src/index.ts')
      },
      {
        find: /^@desource\/image-core\/providers$/,
        replacement: resolve(import.meta.dirname, 'packages/core/src/providers/index.ts')
      },
      {
        find: /^@desource\/image-core\/providers\/(.+)$/,
        replacement: `${resolve(import.meta.dirname, 'packages/core/src/providers')}/$1.ts`
      }
    ]
  },
  test: {
    include: ['test/**/*.test.ts', 'packages/*/test/**/*.test.ts'],
    globals: false
  }
});
