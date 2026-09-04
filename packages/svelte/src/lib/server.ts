import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import {
  createDsImageServer,
  type DsImageNodeMiddleware as CoreDsImageNodeMiddleware,
  type DsImageServerOptions as CoreDsImageServerOptions,
  type DsImageWebHandler
} from '@desource/image/kit';

const server = createDsImageServer<IncomingMessage, ServerResponse>({
  defaultDirs: ['static', 'public'],
  cwd: () => process.cwd(),
  resolvePath: resolve,
  loadIpx: () => import('ipx')
});

export type DsImageNodeMiddleware = CoreDsImageNodeMiddleware<IncomingMessage, ServerResponse>;
export type { DsImageWebHandler };

export interface DsImageServerOptions extends CoreDsImageServerOptions {
  /** Local asset directories. Defaults to `static` and `public`. */
  dirs?: readonly string[];
}

export interface SvelteKitHandleInput {
  event: { request: Request };
  resolve(event: { request: Request }): Response | Promise<Response>;
}

export function createDsImageNodeMiddleware(options: DsImageServerOptions = {}): DsImageNodeMiddleware {
  return server.createNodeMiddleware(options);
}

export function createDsImageWebHandler(options: DsImageServerOptions = {}): DsImageWebHandler {
  return server.createWebHandler(options);
}

/** Creates a SvelteKit `handle` hook for production and SSR deployments. */
export function createDsImageHandle(options: DsImageServerOptions = {}) {
  const imageHandler = createDsImageWebHandler(options);
  return async ({ event, resolve: resolveEvent }: SvelteKitHandleInput): Promise<Response> =>
    (await imageHandler(event.request)) ?? resolveEvent(event);
}
