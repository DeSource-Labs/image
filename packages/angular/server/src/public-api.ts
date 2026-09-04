import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import {
  createDsImageServer,
  type DsImageNodeMiddleware as CoreDsImageNodeMiddleware,
  type DsImageServerOptions
} from '@desource/image/kit';

const server = createDsImageServer<IncomingMessage, ServerResponse>({
  defaultDirs: ['public', 'static'],
  cwd: () => process.cwd(),
  resolvePath: resolve,
  loadIpx: () => import('ipx')
});

export interface DsImageMiddlewareOptions extends Omit<DsImageServerOptions, 'root'> {}

export type DsImageMiddleware = CoreDsImageNodeMiddleware<IncomingMessage, ServerResponse>;

export function createDsImageMiddleware(options: DsImageMiddlewareOptions = {}): DsImageMiddleware {
  return server.createNodeMiddleware(options);
}
