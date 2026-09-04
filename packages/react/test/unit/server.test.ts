import type { IncomingMessage, ServerResponse } from 'node:http';
import { describe, expect, it, vi } from 'vitest';
import { createDsImageNodeMiddleware, createDsImageWebHandler } from '@server';

const ipxFSStorage = vi.fn((options: unknown) => options);
vi.mock('ipx', () => ({
  createIPX: vi.fn((options: unknown) => options),
  createIPXNodeServer: vi.fn(() => async () => {}),
  createIPXWebServer: vi.fn(() => async () => new Response('optimized')),
  ipxFSStorage,
  ipxHttpStorage: vi.fn((options: unknown) => options)
}));

describe('React image server helpers', () => {
  it('creates Node and Web handlers through the shared server', () => {
    expect(createDsImageNodeMiddleware()).toBeTypeOf('function');
    expect(createDsImageWebHandler()).toBeTypeOf('function');
  });

  it('resolves the default React asset directories against the project root', async () => {
    const middleware = createDsImageNodeMiddleware({ root: '/app' });
    await middleware({ url: '/_ipx/w_32/hero.jpg' } as IncomingMessage, {} as ServerResponse, vi.fn());

    expect(ipxFSStorage).toHaveBeenCalledWith(expect.objectContaining({ dir: ['/app/public', '/app/static'] }));
  });
});
