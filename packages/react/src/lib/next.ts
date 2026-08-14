import { createImage, resolveImageConfig, type ImageConfig, type ResolvedImageConfig } from '@desource/image';
import { isResolvedImageConfig } from '@desource/image/kit';
import { createDsImageWebHandler, type DsImageServerOptions } from './server.js';

export interface NextImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export type NextImageLoader = (props: NextImageLoaderProps) => string;

export interface NextImageRouteHandlers {
  GET(request: Request): Promise<Response>;
  HEAD(request: Request): Promise<Response>;
}

export function createNextImageLoader(config: ImageConfig | ResolvedImageConfig = {}): NextImageLoader {
  const image = createImage(isResolvedImageConfig(config) ? config : resolveImageConfig(config));
  return ({ src, width, quality }) => image(src, { width, quality });
}

export function createNextImageRouteHandler(options: DsImageServerOptions = {}) {
  const webHandler = createDsImageWebHandler(options);
  return async (request: Request): Promise<Response> => {
    const response = await webHandler(request);
    return response ?? new Response('Not found', { status: 404 });
  };
}

export function createNextImageRouteHandlers(options: DsImageServerOptions = {}): NextImageRouteHandlers {
  const handler = createNextImageRouteHandler(options);
  return {
    GET: handler,
    HEAD: handler
  };
}
