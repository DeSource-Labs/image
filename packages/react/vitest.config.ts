import { defineFrameworkVitestConfig } from '../../common/test/config/vitest.js';

export default defineFrameworkVitestConfig({
  configUrl: import.meta.url,
  conditions: ['browser'],
  aliases: {
    '@src': './src/lib',
    '@lib': './src/index',
    '@server': './src/server'
  },
  environment: 'jsdom',
  setupFiles: ['./test/unit/setup-environment.ts'],
  include: ['./test/unit/**/*.test.ts', './test/unit/**/*.test.tsx'],
  coverage: {
    include: ['src/**/*.{ts,tsx}'],
    exclude: [],
    thresholds: {
      statements: 98,
      branches: 88,
      functions: 98,
      lines: 98
    }
  }
});
