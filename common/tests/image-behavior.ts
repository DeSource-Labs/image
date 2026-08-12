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

    it('generates Nuxt-style image attrs with priority and placeholders', () => {
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
        src: '/_ipx/s_800x400&f_webp/hero.png',
        fallbackSrc: '/hero.png',
        width: 800,
        height: 400,
        alt: 'Hero',
        loading: 'eager',
        decoding: 'sync',
        fetchpriority: 'high',
        placeholderSrc: '/_ipx/s_10x10&f_webp&q_50&blur_3/hero.png',
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
      expect(picture.img.src).toContain('f_jpeg');
      expect(picture.img.sizes).toBe('(max-width: 767px) 100vw, 400px');
    });

    it('supports presets, singular alias config and the callable helper', () => {
      const $img = adapter.createImage({
        ...ipxConfig,
        alias: {
          unsplash: 'https://images.unsplash.com'
        },
        presets: {
          avatar: {
            width: 96,
            height: 96,
            quality: 80
          }
        }
      });

      expect($img('/hero.png', { width: 320, format: 'webp' })).toBe('/_ipx/w_320&f_webp/hero.png');
      expect(($img.avatar as typeof $img)('/user.png')).toBe('/_ipx/s_96x96&q_80/user.png');
      expect($img('/unsplash/photo-id', { width: 640 })).toBe('/_ipx/w_640/unsplash/photo-id');
    });

    it('uses custom providers without framework-specific glue', () => {
      const customProvider = {
        name: 'custom',
        getImage(input: { src: string; width?: number }) {
          return {
            url: `/custom?src=${encodeURIComponent(input.src)}&w=${input.width ?? ''}`,
            isOptimized: true
          };
        }
      };

      expect(
        adapter.getImageAttrs(
          {
            provider: 'custom',
            src: '/asset.png',
            width: 500
          },
          {
            providers: { custom: customProvider }
          }
        ).src
      ).toBe('/custom?src=%2Fasset.png&w=500');
    });
  });
}
