import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const srcDir = resolve(import.meta.dirname, 'src');

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
        next: resolve(srcDir, 'next.ts'),
        server: resolve(srcDir, 'server.ts'),
        vite: resolve(srcDir, 'vite.ts')
      },
      formats: ['es']
    },
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0'),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js'
      }
    }
  }
});
