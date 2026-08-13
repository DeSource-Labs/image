import type { IncomingMessage, ServerResponse } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDsImageMiddleware } from '../../server/src/public-api';

const handledUrls = vi.hoisted((): string[] => []);
const ipxHandler = vi.hoisted(() =>
  vi.fn(async (request: IncomingMessage) => {
    handledUrls.push(request.url ?? '');
  })
);
const createIPX = vi.hoisted(() => vi.fn((options: unknown) => options));
const createIPXNodeServer = vi.hoisted(() => vi.fn(() => ipxHandler));
const ipxFSStorage = vi.hoisted(() => vi.fn((options: unknown) => ({ type: 'fs', options })));
const ipxHttpStorage = vi.hoisted(() => vi.fn((options: unknown) => ({ type: 'http', options })));

vi.mock('ipx', () => ({
  createIPX,
  createIPXNodeServer,
  ipxFSStorage,
  ipxHttpStorage
}));

describe('Angular server public API', () => {
  afterEach(() => {
    vi.clearAllMocks();
    handledUrls.length = 0;
  });

  it('passes through requests without an optimizer URL', async () => {
    const middleware = createDsImageMiddleware();
    const next = vi.fn();

    await middleware({} as IncomingMessage, {} as ServerResponse, next);
    await middleware({ url: '/app.js' } as IncomingMessage, {} as ServerResponse, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(ipxHandler).not.toHaveBeenCalled();
  });

  it('normalizes matching optimizer requests, delegates to IPX and restores the original URL', async () => {
    const middleware = createDsImageMiddleware({
      path: 'images/',
      dirs: ['public'],
      domains: ['example.com'],
      allowAllDomains: true,
      maxAge: 90,
      alias: { assets: '/public/assets' }
    });
    const request = { url: '/images/w_32/hero.jpg?token=1' } as IncomingMessage;
    const response = {} as ServerResponse;
    const next = vi.fn();

    await middleware(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(ipxHandler).toHaveBeenCalledOnce();
    expect(handledUrls).toEqual(['/w_32/hero.jpg?token=1']);
    expect(request.url).toBe('/images/w_32/hero.jpg?token=1');
    expect(createIPX).toHaveBeenCalledWith(
      expect.objectContaining({
        maxAge: 90,
        alias: { assets: '/public/assets' }
      })
    );
    expect(ipxFSStorage).toHaveBeenCalledWith(expect.objectContaining({ maxAge: 90 }));
    expect(ipxHttpStorage).toHaveBeenCalledWith(
      expect.objectContaining({ allowAllDomains: true, domains: ['example.com'], maxAge: 90 })
    );
    expect(createIPXNodeServer).toHaveBeenCalledOnce();
  });

  it('passes IPX handler failures to next and still restores the URL', async () => {
    const error = new Error('ipx failed');
    ipxHandler.mockRejectedValueOnce(error);
    const middleware = createDsImageMiddleware({ path: '/_image' });
    const request = { url: '/_image/w_32/hero.jpg' } as IncomingMessage;
    const next = vi.fn();

    await middleware(request, {} as ServerResponse, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(request.url).toBe('/_image/w_32/hero.jpg');
  });
});
