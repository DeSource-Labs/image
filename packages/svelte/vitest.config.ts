import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

const workspace = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ['browser'],
    alias: [
      {
        find: '@desource/image/kit',
        replacement: `${workspace}/packages/core/src/kit.ts`
      },
      {
        find: /^@desource\/image$/,
        replacement: `${workspace}/packages/core/src/index.ts`
      }
    ]
  },
  test: {
    environment: 'node',
    include: ['./test/svelte.test.ts', './test/unit/**/*.test.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      all: true,
      include: ['src/lib/**/*.{ts,svelte}'],
      exclude: ['src/lib/index.ts'],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 95,
        branches: 80,
        functions: 95,
        lines: 95
      }
    }
  }
});
