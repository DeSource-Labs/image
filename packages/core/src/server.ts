import { isPathUnderBasePath, normalizeBasePath, parseRequestPath } from './utils.js';

export interface DsImageServerOptions {
  /** URL prefix used by the IPX provider. */
  path?: string;
  /** Project root used to resolve local asset directories. */
  root?: string;
  /** Local asset directories. */
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
type NodeHandler<NodeRequest, NodeResponse> = (request: NodeRequest, response: NodeResponse) => void;
type WebHandler = (request: Request) => Response | Promise<Response>;

interface IpxModule<NodeRequest, NodeResponse> {
  createIPX(options: {
    maxAge: number;
    alias: Record<string, string> | undefined;
    storage: unknown;
    httpStorage: unknown;
  }): unknown;
  createIPXNodeServer(ipx: unknown): NodeHandler<NodeRequest, NodeResponse>;
  createIPXWebServer(ipx: unknown): WebHandler;
  ipxFSStorage(options: { dir: string[]; maxAge: number }): unknown;
  ipxHttpStorage(options: { allowAllDomains: boolean; domains: string[] | undefined; maxAge: number }): unknown;
}

export interface DsImageServerRuntime {
  defaultDirs: readonly string[];
  cwd(): string;
  resolvePath(root: string, directory: string): string;
  loadIpx(): Promise<unknown>;
}

export interface DsImageNodeRequest {
  url?: string;
}

export interface DsImageServer<NodeRequest extends DsImageNodeRequest = DsImageNodeRequest, NodeResponse = unknown> {
  createNodeMiddleware(options?: DsImageServerOptions): DsImageNodeMiddleware<NodeRequest, NodeResponse>;
  createWebHandler(options?: DsImageServerOptions): DsImageWebHandler;
}

export type DsImageNodeMiddleware<
  NodeRequest extends DsImageNodeRequest = DsImageNodeRequest,
  NodeResponse = unknown
> = (request: NodeRequest, response: NodeResponse, next: Next) => Promise<void>;
export type DsImageWebHandler = (request: Request) => Promise<Response | undefined>;

export function createDsImageServer<
  NodeRequest extends DsImageNodeRequest = DsImageNodeRequest,
  NodeResponse = unknown
>(runtime: DsImageServerRuntime): DsImageServer<NodeRequest, NodeResponse> {
  return {
    createNodeMiddleware(options = {}) {
      const basePath = normalizeBasePath(options.path ?? '/_ipx');
      let handler: Promise<NodeHandler<NodeRequest, NodeResponse>> | undefined;

      return async (request, response, next) => {
        const requestUrl = request.url;
        if (!requestUrl) {
          next();
          return;
        }

        const parsed = parseRequestPath(requestUrl);
        if (!isPathUnderBasePath(parsed.pathname, basePath)) {
          next();
          return;
        }

        const originalUrl = request.url;
        request.url = `${parsed.pathname.slice(basePath.length) || '/'}${parsed.search}`;
        try {
          handler ??= createNodeHandler<NodeRequest, NodeResponse>(options, runtime);
          await (
            await handler
          )(request, response);
        } catch (error) {
          next(error);
        } finally {
          request.url = originalUrl;
        }
      };
    },
    createWebHandler(options = {}) {
      const basePath = normalizeBasePath(options.path ?? '/_ipx');
      let handler: Promise<WebHandler> | undefined;

      return async (request) => {
        const url = new URL(request.url);
        if (!isPathUnderBasePath(url.pathname, basePath)) return undefined;

        url.pathname = url.pathname.slice(basePath.length) || '/';
        handler ??= createWebHandler(options, runtime);
        return (await handler)(new Request(url, request));
      };
    }
  };
}

async function createNodeHandler<NodeRequest, NodeResponse>(
  options: DsImageServerOptions,
  runtime: DsImageServerRuntime
): Promise<NodeHandler<NodeRequest, NodeResponse>> {
  const ipx = (await runtime.loadIpx()) as IpxModule<NodeRequest, NodeResponse>;
  return ipx.createIPXNodeServer(createIpx(options, runtime, ipx));
}

async function createWebHandler(options: DsImageServerOptions, runtime: DsImageServerRuntime): Promise<WebHandler> {
  const ipx = (await runtime.loadIpx()) as IpxModule<unknown, unknown>;
  return ipx.createIPXWebServer(createIpx(options, runtime, ipx));
}

function createIpx<NodeRequest, NodeResponse>(
  options: DsImageServerOptions,
  runtime: DsImageServerRuntime,
  ipx: IpxModule<NodeRequest, NodeResponse>
): unknown {
  const root = options.root ?? runtime.cwd();
  const maxAge = options.maxAge ?? 60;
  const dirs = (options.dirs ?? runtime.defaultDirs).map((directory) => runtime.resolvePath(root, directory));
  return ipx.createIPX({
    maxAge,
    alias: options.alias,
    storage: ipx.ipxFSStorage({ dir: dirs, maxAge }),
    httpStorage: ipx.ipxHttpStorage({
      allowAllDomains: options.allowAllDomains ?? false,
      domains: options.domains ? [...options.domains] : undefined,
      maxAge
    })
  });
}
