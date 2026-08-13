import { fileURLToPath } from 'node:url';
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    angular({ tsconfig: fileURLToPath(new URL('../../packages/angular/tsconfig.spec.json', import.meta.url)) })
  ],
  resolve: {
    alias: {
      '@desource/image': fileURLToPath(new URL('../../packages/core/src', import.meta.url)),
      '@common': fileURLToPath(new URL('../../common', import.meta.url)),
      '@src': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/public-api', import.meta.url)),
      '@server': fileURLToPath(new URL('./server/src/public-api', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['./test/unit/**/*.test.ts', './test/server/**/*.test.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'server/src/**/*.ts'],
      exclude: ['src/public-api.ts'],
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
