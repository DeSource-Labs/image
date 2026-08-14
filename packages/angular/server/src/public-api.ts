import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';

export interface DsImageMiddlewareOptions {
  /** URL prefix used by the IPX provider. */
  path?: string;
  /** Local asset directories. Use the Angular browser output directory in SSR. */
  dirs?: readonly string[];
  /** Remote domains accepted by the local IPX optimizer. */
  domains?: readonly string[];
  /** Explicitly allows remote optimization from every domain. Defaults to false. */
  allowAllDomains?: boolean;
  /** Cache lifetime in seconds for optimized responses. */
  maxAge?: number;
  /** IPX aliases used by local optimizer routes. */
  alias?: Record<string, string>;
}

type Next = (error?: unknown) => void;
type NodeImageHandler = (request: IncomingMessage, response: ServerResponse) => void | Promise<void>;
export type DsImageMiddleware = (request: IncomingMessage, response: ServerResponse, next: Next) => Promise<void>;

export function createDsImageMiddleware(options: DsImageMiddlewareOptions = {}): DsImageMiddleware {
  const basePath = normalizeBasePath(options.path ?? '/_ipx');
  let handler: Promise<NodeImageHandler> | undefined;

  return (request: IncomingMessage, response: ServerResponse, next: Next) => handleRequest(request, response, next);

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
      await (
        await handler
      )(request, response);
    } catch (error) {
      next(error);
    } finally {
      request.url = originalUrl;
    }
  }
}

async function createIpxHandler(options: DsImageMiddlewareOptions): Promise<NodeImageHandler> {
  const { createIPX, createIPXNodeServer, ipxFSStorage, ipxHttpStorage } = await import('ipx');
  const maxAge = options.maxAge ?? 60;
  const dirs = (options.dirs ?? ['public', 'static']).map((dir) => resolve(dir));
  return createIPXNodeServer(
    createIPX({
      maxAge,
      alias: options.alias,
      storage: ipxFSStorage({ dir: dirs, maxAge }),
      httpStorage: ipxHttpStorage({
        allowAllDomains: options.allowAllDomains ?? false,
        domains: options.domains ? [...options.domains] : undefined,
        maxAge
      })
    })
  );
}

function normalizeBasePath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return stripTrailingSlashes(normalized) || '/_ipx';
}

function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === '/') end -= 1;
  return value.slice(0, end);
}

function isIpxRequest(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function parseRequestPath(requestUrl: string): { pathname: string; search: string } {
  const queryIndex = requestUrl.indexOf('?');
  return queryIndex === -1
    ? { pathname: requestUrl, search: '' }
    : { pathname: requestUrl.slice(0, queryIndex), search: requestUrl.slice(queryIndex) };
}
