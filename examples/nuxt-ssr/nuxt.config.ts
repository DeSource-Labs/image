import type { NuxtConfig } from 'nuxt/schema';

const config: NuxtConfig = defineNuxtConfig({
  compatibilityDate: '2026-05-23',
  devtools: { enabled: false },
  modules: ['@nuxt/image']
});

export default config;
