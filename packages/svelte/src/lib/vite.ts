import { createImageVitePlugin } from '@desource/image/kit';
import type { Plugin } from 'vite';
import { createDsImageNodeMiddleware, type DsImageServerOptions } from './server.js';

export interface DesourceImagePluginOptions extends DsImageServerOptions {
  /** Concrete provider baked into client and SSR bundles. */
  provider?: string;
}

export const desourceImage: (options?: DesourceImagePluginOptions) => Plugin = createImageVitePlugin({
  name: 'desource-image',
  createMiddleware: createDsImageNodeMiddleware
});
