import { describe, expect, it } from 'vitest';
import { createImage, ipxProvider } from '@src/index';

describe('createImage', () => {
  it('creates a callable helper with preset methods and bound image operations', () => {
    const image = createImage({
      provider: 'ipx',
      providers: { ipx: ipxProvider() },
      presets: {
        avatar: {
          width: 96,
          height: 96,
          quality: 80
        }
      }
    });

    expect(image('/hero.png', { width: 320, format: 'webp' })).toBe('/_ipx/w_320&f_webp/hero.png');
    expect((image.avatar as typeof image)('/user.png')).toBe('/_ipx/q_80&s_96x96/user.png');
    expect(image.getImage('/hero.png', { modifiers: { width: 320 } }).url).toBe('/_ipx/w_320/hero.png');
    expect(image.getAttrs({ src: '/hero.png', width: 320 }).src).toBe('/_ipx/w_320/hero.png');
    expect(image.getPicture({ src: '/hero.png', width: 320, formats: ['webp'] }).sources).toHaveLength(1);
    expect(image.getPreloadLink({ src: '/hero.png', width: 320 })).toMatchObject({ rel: 'preload', as: 'image' });
  });
});
