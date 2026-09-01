import { describe, expect, it, vi } from 'vitest';
import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';
import { createNextImageLoader, createNextImageRouteHandler, createNextImageRouteHandlers } from '@src/next';

const webHandler = vi.hoisted(() => vi.fn());
const createIPX = vi.hoisted(() => vi.fn((options: unknown) => options));
const createIPXWebServer = vi.hoisted(() => vi.fn(() => webHandler));
const ipxFSStorage = vi.hoisted(() => vi.fn((options: unknown) => ({ type: 'fs', options })));
const ipxHttpStorage = vi.hoisted(() => vi.fn((options: unknown) => ({ type: 'http', options })));

vi.mock('ipx', () => ({
  createIPX,
  createIPXWebServer,
  ipxFSStorage,
  ipxHttpStorage
}));

describe('Next.js helpers', () => {
  it('creates a next/image compatible loader from Desource Image config', () => {
    const loader = createNextImageLoader(imageComponentTestConfig);
    const url = loader({ src: '/hero.jpg', width: 828, quality: 74 });

    expect(url).toContain('/hero.jpg');
    expect(url).toContain('width=828');
    expect(url).toContain('quality=74');
  });

  it('creates App Router-compatible route handlers', async () => {
    webHandler.mockResolvedValueOnce(new Response('optimized'));
    const handler = createNextImageRouteHandler({ path: '/_ipx' });
    const response = await handler(new Request('https://example.com/_ipx/w_32/hero.jpg'));

    expect(await response.text()).toBe('optimized');
    expect(webHandler).toHaveBeenCalledOnce();

    await expect(handler(new Request('https://example.com/app.js'))).resolves.toMatchObject({ status: 404 });

    const handlers = createNextImageRouteHandlers();
    expect(handlers.GET).toBe(handlers.HEAD);
  });
});
