import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import { detectImageProvider } from '@desource/image';
import type { Plugin } from 'vite';

export interface DesourceImagePluginOptions {
  /**
   * Concrete provider to bake into the client bundle. Defaults to deployment
   * auto-detection so SSR and hydrated output use the same provider.
   */
  provider?: string;
  /**
   * URL prefix used by the IPX provider.
   *
   * Keep this aligned with `ipxProvider({ path })` when customizing the core
   * provider path.
   */
  path?: string;
  /**
   * Local asset directories, relative to the SvelteKit project root.
   */
  dirs?: readonly string[];
  /**
   * Remote domains accepted by the local IPX optimizer.
   */
  domains?: readonly string[];
  /**
   * Allows remote optimization from any domain during local development.
   */
  allowAllDomains?: boolean;
  /**
   * Cache lifetime in seconds for optimized responses.
   */
  maxAge?: number;
  /**
   * IPX aliases used by local optimizer routes.
   */
  alias?: Record<string, string>;
}

type Next = (error?: unknown) => void;
type NodeImageHandler = (request: IncomingMessage, response: ServerResponse) => unknown | Promise<unknown>;

export function desourceImage(options: DesourceImagePluginOptions = {}): Plugin {
  const basePath = normalizeBasePath(options.path ?? '/_ipx');
  let root = process.cwd();
  let handler: Promise<NodeImageHandler> | undefined;

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
        void handleRequest(request, response, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        void handleRequest(request, response, next);
      });
    }
  };

  async function handleRequest(request: IncomingMessage, response: ServerResponse, next: Next): Promise<void> {
    const requestUrl = request.url;

    if (!requestUrl) {
      next();
      return;
    }

    const url = parseRequestPath(requestUrl);

    if (!isIpxRequest(url.pathname, basePath)) {
      next();
      return;
    }

    const originalUrl = request.url;
    request.url = `${url.pathname.slice(basePath.length) || '/'}${url.search}`;

    try {
      handler ??= createIpxHandler(root, options);
      await (await handler)(request, response);
    } catch (error) {
      next(error);
    } finally {
      request.url = originalUrl;
    }
  }
}

async function createIpxHandler(root: string, options: DesourceImagePluginOptions): Promise<NodeImageHandler> {
  const { createIPX, createIPXNodeServer, ipxFSStorage, ipxHttpStorage } = await import('ipx');
  const dirs = (options.dirs ?? ['static', 'public']).map((dir) => resolve(root, dir));
  const domains = options.domains ? [...options.domains] : undefined;

  return createIPXNodeServer(createIPX({
    maxAge: options.maxAge ?? 60,
    alias: options.alias,
    storage: ipxFSStorage({
      dir: dirs,
      maxAge: options.maxAge ?? 60
    }),
    httpStorage: ipxHttpStorage({
      allowAllDomains: options.allowAllDomains ?? !domains?.length,
      domains,
      maxAge: options.maxAge ?? 60
    })
  }));
}

function normalizeBasePath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.replace(/\/+$/, '') || '/_ipx';
}

function isIpxRequest(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function parseRequestPath(requestUrl: string): { pathname: string; search: string } {
  const queryIndex = requestUrl.indexOf('?');
  if (queryIndex === -1) {
    return { pathname: requestUrl, search: '' };
  }

  return {
    pathname: requestUrl.slice(0, queryIndex),
    search: requestUrl.slice(queryIndex)
  };
}
