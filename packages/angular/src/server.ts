import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';

export interface DsImageMiddlewareOptions {
  /**
   * URL prefix used by the IPX provider.
   */
  path?: string;
  /**
   * Local asset directories. Use the Angular browser output directory in SSR.
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
}

type Next = (error?: unknown) => void;
type NodeImageHandler = (request: IncomingMessage, response: ServerResponse) => unknown | Promise<unknown>;

export function createDsImageMiddleware(options: DsImageMiddlewareOptions = {}) {
  const basePath = normalizeBasePath(options.path ?? '/_ipx');
  let handler: Promise<NodeImageHandler> | undefined;

  return (request: IncomingMessage, response: ServerResponse, next: Next): void => {
    void handleRequest(request, response, next);
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
      handler ??= createIpxHandler(options);
      await (await handler)(request, response);
    } catch (error) {
      next(error);
    } finally {
      request.url = originalUrl;
    }
  }
}

async function createIpxHandler(options: DsImageMiddlewareOptions): Promise<NodeImageHandler> {
  const { createIPX, createIPXNodeServer, ipxFSStorage, ipxHttpStorage } = await import('ipx');
  const dirs = (options.dirs ?? ['public', 'static']).map((dir) => resolve(dir));
  const domains = options.domains ? [...options.domains] : undefined;

  return createIPXNodeServer(createIPX({
    maxAge: options.maxAge ?? 60,
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
