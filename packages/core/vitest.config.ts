import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@common': fileURLToPath(new URL('../../common', import.meta.url)),
      '@src': fileURLToPath(new URL('./src', import.meta.url)),
      '#imports': fileURLToPath(new URL('./test/unit/setup/nuxt-stubs.ts', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: ['test/unit/**/*.test.ts'],
    server: {
      deps: {
        inline: ['@nuxt/image']
      }
    },
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
      thresholds: {
        statements: 95,
        branches: 85,
        functions: 95,
        lines: 95
      }
    }
  }
});
