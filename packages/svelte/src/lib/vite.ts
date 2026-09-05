import { detectImageProvider } from '@desource/image';
import { createImageVitePlugin } from '@desource/image/kit';
import type { Plugin, ViteDevServer } from 'vite';
import { createDsImageNodeMiddleware, type DsImageNodeMiddleware, type DsImageServerOptions } from './server.js';

export interface DesourceImagePluginOptions extends DsImageServerOptions {
  /** Concrete provider baked into client and SSR bundles. */
  provider?: string;
}

type ViteMiddlewareServer = Pick<ViteDevServer, 'middlewares'>;

export function desourceImage(options: DesourceImagePluginOptions = {}): Plugin {
  return createImageVitePlugin({
    name: 'desource-image',
    options,
    defaultRoot: process.cwd(),
    detectProvider: () => options.provider ?? detectImageProvider(),
    createMiddleware: createDsImageNodeMiddleware,
    installMiddleware(server: ViteMiddlewareServer, middleware: DsImageNodeMiddleware) {
      server.middlewares.use((request, response, next) => {
        void middleware(request, response, next);
      });
    }
  });
}
