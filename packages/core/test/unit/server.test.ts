import type { IncomingMessage, ServerResponse } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDsImageServer, type DsImageServerRuntime } from '@src/kit';

const nodeUrls: string[] = [];
const webUrls: string[] = [];
const ipx = {
  createIPX: vi.fn((options: unknown) => options),
  createIPXNodeServer: vi.fn(() => async (request: IncomingMessage) => {
    nodeUrls.push(request.url ?? '');
  }),
  createIPXWebServer: vi.fn(() => async (request: Request) => {
    const url = new URL(request.url);
    webUrls.push(url.pathname + url.search);
    return new Response('optimized');
  }),
  ipxFSStorage: vi.fn((options: unknown) => ({ type: 'fs', options })),
  ipxHttpStorage: vi.fn((options: unknown) => ({ type: 'http', options }))
};
const runtime: DsImageServerRuntime = {
  defaultDirs: ['public', 'static'],
  cwd: vi.fn(() => '/workspace'),
  resolvePath: vi.fn((root, directory) => `${root}/${directory}`),
  loadIpx: vi.fn(async () => ipx)
};
const server = createDsImageServer(runtime);

describe('shared image server', () => {
  afterEach(() => {
    vi.clearAllMocks();
    nodeUrls.length = 0;
    webUrls.length = 0;
  });

  it.each([undefined, '/app.js', '/_ipx-other/image.jpg'])('passes through Node URL %s', async (url) => {
    const next = vi.fn();
    await server.createNodeMiddleware()({ url } as IncomingMessage, {} as ServerResponse, next);
    expect(next).toHaveBeenCalledOnce();
    expect(runtime.loadIpx).not.toHaveBeenCalled();
  });

  it('normalizes Node requests, caches IPX, and restores each URL', async () => {
    const middleware = server.createNodeMiddleware({
      path: 'images/',
      root: '/app',
      dirs: ['public'],
      domains: ['example.com'],
      allowAllDomains: true,
      maxAge: 90,
      alias: { assets: '/app/assets' }
    });
    const firstRequest = { url: '/images/w_32/hero.jpg?token=1' } as IncomingMessage;
    const secondRequest = { url: '/images' } as IncomingMessage;
    const next = vi.fn();

    await middleware(firstRequest, {} as ServerResponse, next);
    await middleware(secondRequest, {} as ServerResponse, next);

    expect(next).not.toHaveBeenCalled();
    expect(nodeUrls).toEqual(['/w_32/hero.jpg?token=1', '/']);
    expect(firstRequest.url).toBe('/images/w_32/hero.jpg?token=1');
    expect(secondRequest.url).toBe('/images');
    expect(runtime.loadIpx).toHaveBeenCalledOnce();
    expect(ipx.createIPXNodeServer).toHaveBeenCalledOnce();
    expect(ipx.createIPX).toHaveBeenCalledWith(
      expect.objectContaining({ maxAge: 90, alias: { assets: '/app/assets' } })
    );
    expect(ipx.ipxFSStorage).toHaveBeenCalledWith({ dir: ['/app/public'], maxAge: 90 });
    expect(ipx.ipxHttpStorage).toHaveBeenCalledWith({
      allowAllDomains: true,
      domains: ['example.com'],
      maxAge: 90
    });
  });

  it('passes Node handler failures to next and restores the URL', async () => {
    const error = new Error('ipx failed');
    ipx.createIPXNodeServer.mockReturnValueOnce(async () => Promise.reject(error));
    const request = { url: '/_ipx/w_32/hero.jpg' } as IncomingMessage;
    const next = vi.fn();

    await server.createNodeMiddleware()(request, {} as ServerResponse, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(request.url).toBe('/_ipx/w_32/hero.jpg');
    expect(runtime.cwd).toHaveBeenCalledOnce();
    expect(ipx.ipxFSStorage).toHaveBeenCalledWith({
      dir: ['/workspace/public', '/workspace/static'],
      maxAge: 60
    });
    expect(ipx.ipxHttpStorage).toHaveBeenCalledWith({ allowAllDomains: false, domains: undefined, maxAge: 60 });
  });

  it('passes through unrelated Web requests and handles matching requests', async () => {
    const handler = server.createWebHandler({ path: '/_image', root: '/app', dirs: ['public'] });

    await expect(handler(new Request('https://example.com/app.js'))).resolves.toBeUndefined();
    const response = await handler(new Request('https://example.com/_image/w_64/hero.jpg?x=1'));
    await handler(new Request('https://example.com/_image'));

    expect(await response?.text()).toBe('optimized');
    expect(webUrls).toEqual(['/w_64/hero.jpg?x=1', '/']);
    expect(ipx.createIPXWebServer).toHaveBeenCalledOnce();
  });
});
