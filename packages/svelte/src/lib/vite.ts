import { detectImageProvider } from '@desource/image';
import type { Plugin } from 'vite';
import { createDsImageNodeMiddleware, type DsImageNodeMiddleware, type DsImageServerOptions } from './server.js';

export interface DesourceImagePluginOptions extends DsImageServerOptions {
  /** Concrete provider baked into client and SSR bundles. */
  provider?: string;
}

export function desourceImage(options: DesourceImagePluginOptions = {}): Plugin {
  let root = process.cwd();
  let middleware: DsImageNodeMiddleware | undefined;

  const getMiddleware = () =>
    (middleware ??= createDsImageNodeMiddleware({
      ...options,
      root: options.root ?? root
    }));

  return {
    name: 'desource-image',
    config() {
      return {
        define: {
          __DESOURCE_IMAGE_PROVIDER__: JSON.stringify(options.provider ?? detectImageProvider())
        }
      };
    },
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        void getMiddleware()(request, response, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        void getMiddleware()(request, response, next);
      });
    }
  };
}
