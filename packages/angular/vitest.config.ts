import { fileURLToPath } from 'node:url';
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

const workspace = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  plugins: [angular({ tsconfig: `${workspace}/packages/angular/tsconfig.spec.json` })],
  resolve: {
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
