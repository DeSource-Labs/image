import { readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { defineConfig } from 'vite';

const srcDir = resolve(import.meta.dirname, 'src');
const providersDir = resolve(srcDir, 'providers');
const providerEntries = Object.fromEntries(
  readdirSync(providersDir)
    .filter((file) => file.endsWith('.ts'))
    .map((file) => [`providers/${basename(file, '.ts')}`, resolve(providersDir, file)])
);

export default defineConfig({
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    copyPublicDir: false,
    lib: {
      entry: {
        index: resolve(srcDir, 'index.ts'),
        ...providerEntries
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['std-env'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js'
      }
    }
  }
});
