import type { IncomingMessage, ServerResponse } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDsImageNodeMiddleware, createDsImageWebHandler } from '@server';

const handledNodeUrls = vi.hoisted((): string[] => []);
const handledWebUrls = vi.hoisted((): string[] => []);
const nodeHandler = vi.hoisted(() =>
  vi.fn(async (request: IncomingMessage) => {
    handledNodeUrls.push(request.url ?? '');
  })
);
const webHandler = vi.hoisted(() =>
  vi.fn(async (request: Request) => {
    handledWebUrls.push(new URL(request.url).pathname + new URL(request.url).search);
    return new Response('ok');
  })
);
const createIPX = vi.hoisted(() => vi.fn((options: unknown) => options));
const createIPXNodeServer = vi.hoisted(() => vi.fn(() => nodeHandler));
const createIPXWebServer = vi.hoisted(() => vi.fn(() => webHandler));
const ipxFSStorage = vi.hoisted(() => vi.fn((options: unknown) => ({ type: 'fs', options })));
const ipxHttpStorage = vi.hoisted(() => vi.fn((options: unknown) => ({ type: 'http', options })));

vi.mock('ipx', () => ({
  createIPX,
  createIPXNodeServer,
  createIPXWebServer,
  ipxFSStorage,
  ipxHttpStorage
}));

describe('React image server helpers', () => {
  afterEach(() => {
    vi.clearAllMocks();
    handledNodeUrls.length = 0;
    handledWebUrls.length = 0;
  });

  it('passes through non-image Node requests', async () => {
    const middleware = createDsImageNodeMiddleware();
    const next = vi.fn();

    await middleware({} as IncomingMessage, {} as ServerResponse, next);
    await middleware({ url: '/app.js' } as IncomingMessage, {} as ServerResponse, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(nodeHandler).not.toHaveBeenCalled();
  });

  it('normalizes Node optimizer requests and restores the original URL', async () => {
    const middleware = createDsImageNodeMiddleware({
      path: 'images/',
      root: '/app',
      dirs: ['public'],
      domains: ['example.com'],
      allowAllDomains: true,
      maxAge: 90,
      alias: { assets: '/app/assets' }
    });
    const request = { url: '/images/w_32/hero.jpg?token=1' } as IncomingMessage;
    const next = vi.fn();

    await middleware(request, {} as ServerResponse, next);

    expect(next).not.toHaveBeenCalled();
    expect(handledNodeUrls).toEqual(['/w_32/hero.jpg?token=1']);
    expect(request.url).toBe('/images/w_32/hero.jpg?token=1');
    expect(createIPX).toHaveBeenCalledWith(expect.objectContaining({ maxAge: 90, alias: { assets: '/app/assets' } }));
    expect(ipxFSStorage).toHaveBeenCalledWith(expect.objectContaining({ maxAge: 90 }));
    expect(ipxHttpStorage).toHaveBeenCalledWith(
      expect.objectContaining({ allowAllDomains: true, domains: ['example.com'], maxAge: 90 })
    );
  });

  it('passes Node handler failures to next', async () => {
    const error = new Error('ipx failed');
    nodeHandler.mockRejectedValueOnce(error);
    const request = { url: '/_ipx/w_32/hero.jpg' } as IncomingMessage;
    const next = vi.fn();

    await createDsImageNodeMiddleware()(request, {} as ServerResponse, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(request.url).toBe('/_ipx/w_32/hero.jpg');
  });

  it('returns undefined for non-image Web requests and delegates matching requests', async () => {
    const handler = createDsImageWebHandler({ path: '/_image', root: '/app', dirs: ['public'] });

    await expect(handler(new Request('https://example.com/app.js'))).resolves.toBeUndefined();
    const response = await handler(new Request('https://example.com/_image/w_64/hero.jpg?x=1'));

    expect(await response?.text()).toBe('ok');
    expect(handledWebUrls).toEqual(['/w_64/hero.jpg?x=1']);
    expect(createIPXWebServer).toHaveBeenCalledOnce();
  });
});
