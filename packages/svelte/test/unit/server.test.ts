import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createDsImageHandle, createDsImageNodeMiddleware, createDsImageWebHandler } from '@src/server';
import { desourceImage } from '@src/vite';

describe('SvelteKit and Vite server integrations', () => {
  it('passes unrelated Node and Web requests through without loading IPX', async () => {
    const next = vi.fn();
    await createDsImageNodeMiddleware()({ url: '/app.js' } as never, {} as never, next);
    expect(next).toHaveBeenCalledOnce();
    await createDsImageNodeMiddleware()({} as never, {} as never, next);
    expect(next).toHaveBeenCalledTimes(2);

    const response = await createDsImageWebHandler()(new Request('https://example.test/app.js'));
    expect(response).toBeUndefined();
  });

  it('composes as a SvelteKit handle hook', async () => {
    const resolveEvent = vi.fn(() => new Response('application'));
    const handle = createDsImageHandle();
    const response = await handle({
      event: { request: new Request('https://example.test/page') },
      resolve: resolveEvent
    });
    expect(await response.text()).toBe('application');
    expect(resolveEvent).toHaveBeenCalledOnce();
  });

  it('optimizes a local image through the production Web handler', async () => {
    const handler = createDsImageWebHandler({
      root: resolve(import.meta.dirname, '../../../../demo'),
      dirs: ['static'],
      allowAllDomains: false
    });
    const response = await handler(
      new Request('https://example.test/_ipx/w_24/img/hero.jpg', {
        headers: { accept: 'image/webp,image/*' }
      })
    );
    expect(response?.status).toBe(200);
    expect(response?.headers.get('content-type')).toContain('image/');
    expect((await response!.arrayBuffer()).byteLength).toBeGreaterThan(100);
  });

  it('optimizes a local image through the production Node middleware', async () => {
    const middleware = createDsImageNodeMiddleware({
      path: 'images/',
      root: resolve(import.meta.dirname, '../../../../demo'),
      dirs: ['static'],
      allowAllDomains: false
    });
    const server = createServer((request, response) => {
      void middleware(request, response, (error) => {
        response.statusCode = error ? 500 : 404;
        response.end(error instanceof Error ? error.message : 'not found');
      });
    });
    await new Promise<void>((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));

    try {
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Expected a TCP test server address');
      const response = await fetch(`http://127.0.0.1:${address.port}/images/w_24/img/hero.jpg`);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('image/');
      expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(100);
    } finally {
      await new Promise<void>((resolveClose, rejectClose) =>
        server.close((error) => (error ? rejectClose(error) : resolveClose()))
      );
    }
  });

  it('configures provider detection and both Vite middleware modes', async () => {
    const plugin = desourceImage({ provider: 'vercel', allowAllDomains: false });
    expect(plugin.name).toBe('desource-image');
    const config =
      typeof plugin.config === 'function' ? plugin.config.call({} as never, {} as never, {} as never) : undefined;
    expect(config).toMatchObject({
      define: { __DESOURCE_IMAGE_PROVIDER__: '"vercel"' }
    });
    expect(plugin.configureServer).toBeTypeOf('function');
    expect(plugin.configurePreviewServer).toBeTypeOf('function');

    if (typeof plugin.configResolved === 'function') {
      await plugin.configResolved.call({} as never, { root: '/custom-root' } as never);
    }
    const use = vi.fn();
    if (typeof plugin.configureServer === 'function') {
      plugin.configureServer.call({} as never, { middlewares: { use } } as never);
    }
    if (typeof plugin.configurePreviewServer === 'function') {
      plugin.configurePreviewServer.call({} as never, { middlewares: { use } } as never);
    }
    expect(use).toHaveBeenCalledTimes(2);
    const next = vi.fn();
    use.mock.calls[0]![0]({ url: '/app.js' }, {}, next);
    use.mock.calls[1]![0]({ url: '/preview.js' }, {}, next);
    await Promise.resolve();
    expect(next).toHaveBeenCalledTimes(2);
  });
});
