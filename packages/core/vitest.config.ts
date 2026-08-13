import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const source = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@desource\/image$/, replacement: `${source}/index.ts` },
      { find: /^@desource\/image\/kit$/, replacement: `${source}/kit.ts` },
      { find: /^@desource\/image\/providers$/, replacement: `${source}/providers/index.ts` },
      { find: /^@desource\/image\/providers\/(.+)$/, replacement: `${source}/providers/$1.ts` },
      { find: '#imports', replacement: fileURLToPath(new URL('./test/nuxt-stubs.ts', import.meta.url)) }
    ]
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
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
