import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';

export interface DsImageServerOptions {
  /** URL prefix used by the IPX provider. */
  path?: string;
  /** Project root used to resolve local asset directories. */
  root?: string;
  /** Local asset directories. Defaults to `static` and `public`. */
  dirs?: readonly string[];
  /** Remote domains accepted by the local optimizer. */
  domains?: readonly string[];
  /** Explicitly allows every remote domain. Defaults to false. */
  allowAllDomains?: boolean;
  /** Cache lifetime in seconds. */
  maxAge?: number;
  /** IPX aliases used by optimizer routes. */
  alias?: Record<string, string>;
}

type Next = (error?: unknown) => void;
type NodeHandler = (request: IncomingMessage, response: ServerResponse) => unknown | Promise<unknown>;
type WebHandler = (request: Request) => Response | Promise<Response>;

export type DsImageNodeMiddleware = (request: IncomingMessage, response: ServerResponse, next: Next) => Promise<void>;

export type DsImageWebHandler = (request: Request) => Promise<Response | undefined>;

export interface SvelteKitHandleInput {
  event: { request: Request };
  resolve(event: { request: Request }): Response | Promise<Response>;
}

export function createDsImageNodeMiddleware(options: DsImageServerOptions = {}): DsImageNodeMiddleware {
  const basePath = normalizeBasePath(options.path ?? '/_ipx');
  let handler: Promise<NodeHandler> | undefined;

  return async (request, response, next) => {
    if (!request.url) {
      next();
      return;
    }

    const parsed = parseRequestPath(request.url);
    if (!isImageRequest(parsed.pathname, basePath)) {
      next();
      return;
    }

    const originalUrl = request.url;
    request.url = `${parsed.pathname.slice(basePath.length) || '/'}${parsed.search}`;
    try {
      handler ??= createNodeHandler(options);
      await (
        await handler
      )(request, response);
    } catch (error) {
      next(error);
    } finally {
      request.url = originalUrl;
    }
  };
}

export function createDsImageWebHandler(options: DsImageServerOptions = {}): DsImageWebHandler {
  const basePath = normalizeBasePath(options.path ?? '/_ipx');
  let handler: Promise<WebHandler> | undefined;

  return async (request) => {
    const url = new URL(request.url);
    if (!isImageRequest(url.pathname, basePath)) return undefined;

    url.pathname = url.pathname.slice(basePath.length) || '/';
    handler ??= createWebHandler(options);
    return (await handler)(new Request(url, request));
  };
}

/** Creates a SvelteKit `handle` hook for production and SSR deployments. */
export function createDsImageHandle(options: DsImageServerOptions = {}) {
  const imageHandler = createDsImageWebHandler(options);
  return async ({ event, resolve: resolveEvent }: SvelteKitHandleInput): Promise<Response> =>
    (await imageHandler(event.request)) ?? resolveEvent(event);
}

async function createNodeHandler(options: DsImageServerOptions): Promise<NodeHandler> {
  const { createIPXNodeServer } = await import('ipx');
  return createIPXNodeServer(await createIpx(options));
}

async function createWebHandler(options: DsImageServerOptions): Promise<WebHandler> {
  const { createIPXWebServer } = await import('ipx');
  return createIPXWebServer(await createIpx(options));
}

async function createIpx(options: DsImageServerOptions) {
  const { createIPX, ipxFSStorage, ipxHttpStorage } = await import('ipx');
  const root = options.root ?? process.cwd();
  const maxAge = options.maxAge ?? 60;
  const dirs = (options.dirs ?? ['static', 'public']).map((directory) => resolve(root, directory));
  return createIPX({
    maxAge,
    alias: options.alias,
    storage: ipxFSStorage({ dir: dirs, maxAge }),
    httpStorage: ipxHttpStorage({
      allowAllDomains: options.allowAllDomains ?? false,
      domains: options.domains ? [...options.domains] : undefined,
      maxAge
    })
  });
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

function isImageRequest(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function parseRequestPath(requestUrl: string): { pathname: string; search: string } {
  const queryIndex = requestUrl.indexOf('?');
  return queryIndex === -1
    ? { pathname: requestUrl, search: '' }
    : { pathname: requestUrl.slice(0, queryIndex), search: requestUrl.slice(queryIndex) };
}
