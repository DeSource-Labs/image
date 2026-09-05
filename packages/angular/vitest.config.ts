import { fileURLToPath } from 'node:url';
import angular from '@analogjs/vite-plugin-angular';
import { defineFrameworkVitestConfig } from '../../common/test/config/vitest.js';

export default defineFrameworkVitestConfig({
  configUrl: import.meta.url,
  plugins: [...angular({ tsconfig: fileURLToPath(new URL('./tsconfig.spec.json', import.meta.url)) })],
  aliases: {
    '@src': './src/lib',
    '@lib': './src/public-api',
    '@server': './server/src/public-api'
  },
  environment: 'jsdom',
  setupFiles: ['./test/setup.ts'],
  include: ['./test/unit/**/*.test.ts', './test/server/**/*.test.ts'],
  coverage: {
    include: ['src/**/*.ts', 'server/src/**/*.ts'],
    exclude: ['src/public-api.ts'],
    thresholds: {
      statements: 95,
      branches: 80,
      functions: 95,
      lines: 95
    }
  }
});
