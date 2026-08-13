import { describe, expect, it } from 'vitest';
import type { DesourceImage, ImageAttrs, ImageConfig, ImageInput, PictureAttrs } from '@desource/image';
import { ipxProvider } from '@desource/image';

export interface ImageBehaviorAdapter {
  name: string;
  createImage(config?: ImageConfig): DesourceImage;
  getImageAttrs(input: ImageInput, config?: ImageConfig): ImageAttrs;
  getPictureAttrs(input: ImageInput, config?: ImageConfig): PictureAttrs;
}

export function testImageBehavior(adapter: ImageBehaviorAdapter): void {
  describe(`${adapter.name} shared image behavior`, () => {
    const ipxConfig: ImageConfig = {
      provider: 'ipx',
      providers: { ipx: ipxProvider() }
    };

    it('generates image attrs with priority and placeholders', () => {
      const attrs = adapter.getImageAttrs(
        {
          src: '/hero.png',
          alt: 'Hero',
          width: 800,
          height: 400,
          format: 'webp',
          priority: true,
          placeholder: true
        },
        ipxConfig
      );

      expect(attrs).toMatchObject({
        src: '/_ipx/f_webp&s_800x400/hero.png',
        fallbackSrc: '/hero.png',
        width: 800,
        height: 400,
        alt: 'Hero',
        loading: 'eager',
        fetchpriority: 'high',
        placeholderSrc: '/_ipx/blur_3&q_50&f_webp&s_10x10/hero.png',
        placeholderClass: 'ds-image-placeholder',
        isOptimized: true
      });
    });

    it('generates picture sources with the fallback format last', () => {
      const picture = adapter.getPictureAttrs(
        {
          src: '/hero.png',
          width: 800,
          height: 400,
          sizes: '100vw md:400px',
          format: 'avif,webp',
          legacyFormat: 'jpg'
        },
        {
          ...ipxConfig,
          providerSizes: [320, 400, 640, 800]
        }
      );

      expect(picture.sources.map((source) => source.type)).toEqual(['image/avif', 'image/webp']);
      expect(picture.sources[0]?.srcset).toContain('f_avif');
      expect(picture.sources[1]?.srcset).toContain('f_webp');
      expect(picture.img.src).toContain('f_jpg');
      expect(picture.img.sizes).toBe('(max-width: 767px) 100vw, 400px');
    });

    it('supports presets, aliases and the callable helper', () => {
      const $img = adapter.createImage({
        ...ipxConfig,
        alias: { unsplash: 'https://images.unsplash.com' },
        presets: { avatar: { width: 96, height: 96, quality: 80 } }
      });

      expect($img('/hero.png', { width: 320, format: 'webp' })).toBe('/_ipx/w_320&f_webp/hero.png');
      expect(($img.avatar as typeof $img)('/user.png')).toBe('/_ipx/q_80&s_96x96/user.png');
      expect($img('/unsplash/photo-id', { width: 640 })).toBe('/_ipx/w_640/unsplash/photo-id');
    });

    it('uses direct custom providers without framework glue', () => {
      const customProvider = {
        getImage(src: string, { modifiers }: { modifiers: { width?: number | string } }) {
          return { url: `/custom?src=${encodeURIComponent(src)}&w=${modifiers.width ?? ''}` };
        }
      };

      expect(
        adapter.getImageAttrs(
          { provider: 'custom', src: '/asset.png', width: 500 },
          { providers: { custom: customProvider } }
        ).src
      ).toBe('/custom?src=%2Fasset.png&w=500');
    });
  });
}
