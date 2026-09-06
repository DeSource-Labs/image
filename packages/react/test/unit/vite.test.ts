import { describe, expect, it, vi } from 'vitest';
import { dsImage } from '@src/vite';
import type { Plugin } from 'vite';

describe('React Vite plugin', () => {
  it('defines a deterministic provider and installs dev middleware', () => {
    const plugin = dsImage({ provider: 'ipx', dirs: ['public'] });
    const config = callHook(plugin.config, {}, { command: 'serve', mode: 'development' });
    const use = vi.fn();

    expect(plugin.name).toBe('ds-image-react');
    expect(config).toEqual({ define: { __DS_IMAGE_PROVIDER__: '"ipx"' } });

    callHook(plugin.configResolved, { root: '/fixture' });
    callHook(plugin.configureServer, { middlewares: { use } });
    callHook(plugin.configurePreviewServer, { middlewares: { use } });
    expect(use).toHaveBeenCalledTimes(2);

    const request = { url: '/app.js' };
    const response = {};
    const next = vi.fn();
    use.mock.calls[0]![0](request, response, next);
    use.mock.calls[1]![0](request, response, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('keeps an explicit optimizer root when one is configured', () => {
    const plugin = dsImage({ root: '/configured-root' });
    const use = vi.fn();

    callHook(plugin.config, {}, { command: 'serve', mode: 'development' });
    callHook(plugin.configResolved, { root: '/vite-root' });
    callHook(plugin.configureServer, { middlewares: { use } });
    use.mock.calls[0]![0]({ url: '/not-image' }, {}, vi.fn());

    expect(use).toHaveBeenCalledOnce();
  });
});

function callHook<TArgs extends unknown[], TResult>(
  hook: Plugin[keyof Plugin] | undefined,
  ...args: TArgs
): TResult | undefined {
  if (!hook) return undefined;
  if (typeof hook === 'function') return (hook as (...args: TArgs) => TResult)(...args);
  return (hook as { handler: (...args: TArgs) => TResult }).handler(...args);
}
