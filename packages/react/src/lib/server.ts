import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import {
  createDsImageServer,
  type DsImageNodeMiddleware as CoreDsImageNodeMiddleware,
  type DsImageServerOptions as CoreDsImageServerOptions,
  type DsImageWebHandler
} from '@desource/image/kit';

const server = createDsImageServer<IncomingMessage, ServerResponse>({
  defaultDirs: ['public', 'static'],
  cwd: () => process.cwd(),
  resolvePath: resolve,
  loadIpx: () => import('ipx')
});

export type DsImageNodeMiddleware = CoreDsImageNodeMiddleware<IncomingMessage, ServerResponse>;
export type { DsImageWebHandler };

export interface DsImageServerOptions extends CoreDsImageServerOptions {
  /** Local asset directories. Defaults to `public` and `static`. */
  dirs?: readonly string[];
}

export function createDsImageNodeMiddleware(options: DsImageServerOptions = {}): DsImageNodeMiddleware {
  return server.createNodeMiddleware(options);
}

export function createDsImageWebHandler(options: DsImageServerOptions = {}): DsImageWebHandler {
  return server.createWebHandler(options);
}
