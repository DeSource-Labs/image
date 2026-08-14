import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    conditions: ['browser'],
    alias: {
      '@desource/image': fileURLToPath(new URL('../../packages/core/src', import.meta.url)),
      '@common': fileURLToPath(new URL('../../common', import.meta.url)),
      '@src': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/index', import.meta.url)),
      '@server': fileURLToPath(new URL('./src/server', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    include: ['./test/unit/**/*.test.ts', './test/unit/**/*.test.tsx'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 98,
        branches: 88,
        functions: 98,
        lines: 98
      }
    }
  }
});
