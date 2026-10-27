import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Provider detection mocks std-env and needs a fresh module graph.
const isolatedTests = ['test/unit/provider-detection.test.ts'];

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
    pool: 'threads',
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          isolate: false,
          include: ['test/unit/**/*.test.ts'],
          exclude: isolatedTests
        }
      },
      {
        extends: true,
        test: {
          name: 'provider-detection',
          isolate: true,
          include: isolatedTests
        }
      }
    ],
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
