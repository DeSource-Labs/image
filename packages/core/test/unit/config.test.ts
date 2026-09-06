import { describe, expect, it, vi } from 'vitest';
import { createImageContext, detectImageProvider, resolveImageConfig } from '@src/index';

describe('resolveImageConfig', () => {
  it('resolves defaults, aliases and provider detection without package-specific env variables', () => {
    vi.stubEnv('DS_IMAGE_PROVIDER', 'cloudinary');
    const config = resolveImageConfig({ alias: { cdn: 'https://cdn.example.com' } });

    expect(detectImageProvider()).toBe('ipx');
    expect(config.provider).toBe('ipx');
    expect(config.aliases).toEqual({ cdn: 'https://cdn.example.com' });
    expect(config.densities).toEqual([1, 2]);
    vi.unstubAllEnvs();
  });

  it('creates a context with resolved config and bound operations', () => {
    const context = createImageContext();

    expect(context.config.provider).toBe('ipx');
    expect(context.getImage({ src: '/photo.jpg', width: 320 }).url).toBe('/_ipx/w_320/photo.jpg');
    expect(context.getPreloadLink({ src: '/photo.jpg', width: 320 })).toMatchObject({ rel: 'preload', as: 'image' });
  });
});
