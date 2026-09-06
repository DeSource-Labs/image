import { createImageVitePlugin } from '@desource/image/kit';
import type { Plugin } from 'vite';
import { createDsImageNodeMiddleware, type DsImageServerOptions } from './server.js';

export interface DsImagePluginOptions extends DsImageServerOptions {
  /** Concrete provider baked into client and SSR bundles. */
  provider?: string;
}

export const dsImage: (options?: DsImagePluginOptions) => Plugin = createImageVitePlugin({
  name: 'ds-image-react',
  createMiddleware: createDsImageNodeMiddleware
});
