import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineFrameworkVitestConfig } from '../../common/test/config/vitest.js';

export default defineFrameworkVitestConfig({
  configUrl: import.meta.url,
  plugins: [svelte()],
  conditions: ['browser'],
  aliases: {
    '@src': './src/lib'
  },
  environment: 'node',
  include: ['./test/unit/**/*.test.ts'],
  coverage: {
    include: ['src/lib/**/*.{ts,svelte}'],
    exclude: ['src/lib/index.ts'],
    thresholds: {
      statements: 95,
      branches: 80,
      functions: 95,
      lines: 95
    }
  }
});
