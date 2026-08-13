import { describe, expect, it, vi } from 'vitest';
import {
  configureProvider,
  createImage,
  createImageContext,
  createMapper,
  createOperationsGenerator,
  defineProvider,
  generatePictureSources,
  generateSrcset,
  getImage,
  getImageAttrs,
  getImageMeta,
  getImagePreloadLink,
  getPictureAttrs,
  ipxProvider,
  parseSize,
  vercelProvider,
  type ImageConfig,
  type ImageProvider
} from '@src/index';

describe('core image behavior', () => {
  const ipxConfig: ImageConfig = {
    provider: 'ipx',
    providers: { ipx: ipxProvider() }
  };

  it('generates image attrs with priority and placeholders', () => {
    const attrs = getImageAttrs(
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
    const picture = getPictureAttrs(
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
    const $img = createImage({
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
      getImageAttrs({ provider: 'custom', src: '/asset.png', width: 500 }, { providers: { custom: customProvider } })
        .src
    ).toBe('/custom?src=%2Fasset.png&w=500');
  });
});

describe('attrs and picture output', () => {
  it('generates image attrs with responsive srcset and placeholder', () => {
    const attrs = getImageAttrs(
      {
        src: '/hero.png',
        width: 1100,
        height: 600,
        sizes: '100vw md:1100px',
        format: 'webp',
        priority: true,
        placeholder: [32, 18, 20, 6]
      },
      {
        provider: 'vercel',
        providers: { vercel: vercelProvider() },
        providerSizes: [320, 640, 768, 1024, 1280]
      }
    );

    expect(attrs.src).toBe('/_vercel/image?url=%2Fhero.png&w=1536&q=100');
    expect(attrs.srcset).toContain('1100w');
    expect(attrs.sizes).toBe('(max-width: 767px) 100vw, 1100px');
    expect(attrs.loading).toBe('eager');
    expect(attrs.fetchpriority).toBe('high');
    expect(attrs.placeholderSrc).toBe('/_vercel/image?url=%2Fhero.png&w=640&q=20');
  });

  it('supports the preload alias', () => {
    const attrs = getImageAttrs(
      {
        src: '/hero.png',
        width: 800,
        preload: { fetchPriority: 'high' }
      },
      {
        provider: 'ipx',
        providers: { ipx: ipxProvider() }
      }
    );

    expect(attrs.loading).toBeUndefined();
    expect(attrs.fetchpriority).toBeUndefined();
    expect(attrs.decoding).toBeUndefined();
    expect(
      getImagePreloadLink(
        { src: '/hero.png', width: 800, preload: { fetchPriority: 'high' } },
        { provider: 'ipx', providers: { ipx: ipxProvider() } }
      ).fetchpriority
    ).toBe('high');
  });

  it('uses placeholder defaults', () => {
    const attrs = getImageAttrs(
      {
        src: '/hero.png',
        width: 800,
        placeholder: true
      },
      {
        provider: 'ipx',
        providers: { ipx: ipxProvider() }
      }
    );

    expect(attrs.placeholderSrc).toBe('/_ipx/blur_3&q_50&s_10x10/hero.png');
  });

  it('generates picture sources for avif and webp with fallback img', () => {
    const picture = getPictureAttrs(
      {
        src: '/hero.png',
        width: 800,
        height: 400,
        sizes: '100vw',
        format: ['avif', 'webp']
      },
      {
        provider: 'vercel',
        providers: { vercel: vercelProvider() },
        providerSizes: [320, 640, 800]
      }
    );

    expect(picture.sources.map((source) => source.type)).toEqual(['image/avif', 'image/webp']);
    expect(picture.sources[0]?.srcset).toContain('320w');
    expect(picture.img.src).toBe('/_vercel/image?url=%2Fhero.png&w=1536&q=100');
  });

  it('supports comma-separated picture formats and legacyFormat alias', () => {
    const picture = getPictureAttrs(
      {
        src: '/hero.png',
        width: 800,
        sizes: '100vw',
        format: 'avif,webp',
        legacyFormat: 'jpg'
      },
      {
        provider: 'ipx',
        providers: { ipx: ipxProvider() },
        providerSizes: [320, 800]
      }
    );

    expect(picture.sources.map((source) => source.type)).toEqual(['image/avif', 'image/webp']);
    expect(picture.img.src).toContain('f_jpg');
  });

  it('generates picture sources directly', () => {
    const sources = generatePictureSources(
      {
        src: '/hero.png',
        width: 800,
        format: ['avif', 'webp']
      },
      {
        provider: 'vercel',
        providers: { vercel: vercelProvider() }
      }
    );

    expect(sources).toHaveLength(2);
  });

  it('does not apply global picture formats to fallback img', () => {
    const picture = getPictureAttrs(
      {
        src: '/hero.png',
        width: 800,
        sizes: '100vw'
      },
      {
        provider: 'ipx',
        providers: { ipx: ipxProvider() },
        format: ['avif', 'webp'],
        providerSizes: [320, 800]
      }
    );

    expect(picture.sources[0]?.srcset).toContain('f_avif');
    expect(picture.sources[1]?.srcset).toContain('f_webp');
    expect(picture.img.src).not.toContain('f_avif');
    expect(picture.img.src).not.toContain('f_webp');
    expect(picture.img.src).toContain('f_png');
  });

  it('keeps global picture formats out of plain image URLs', () => {
    const attrs = getImageAttrs(
      {
        src: '/hero.png',
        width: 800
      },
      {
        provider: 'ipx',
        providers: { ipx: ipxProvider() },
        format: ['avif', 'webp']
      }
    );

    expect(attrs.src).toBe('/_ipx/w_800/hero.png');
  });

  it('uses picture fallbacks and SVG passthrough', () => {
    expect(
      getPictureAttrs({
        src: '/hero.jpg',
        width: 800,
        format: ['avif', 'webp']
      }).img.src
    ).toContain('f_jpeg');

    const svg = getPictureAttrs({
      src: '/logo.svg',
      width: 1200
    });

    expect(svg.sources).toEqual([]);
    expect(svg.img.src).toBe('/logo.svg');
  });

  it('exports provider utility helpers', () => {
    expect(parseSize('320px')).toBe(320);
    expect(createMapper({ cover: 'crop' })('cover')).toBe('crop');

    const operations = createOperationsGenerator({
      keyMap: { width: 'w', format: 'f' },
      valueMap: { format: { jpeg: 'jpg' } }
    });

    expect(operations({ width: 320, format: 'jpeg' })).toBe('w=320&f=jpg');

    const setup = defineProvider({
      name: 'test',
      getImage: (src) => ({ url: src })
    });

    expect(setup()).toBe(setup());
  });

  it('creates a callable image helper', () => {
    const $img = createImage({
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

    expect($img('/hero.png', { width: 320, format: 'webp' })).toBe('/_ipx/w_320&f_webp/hero.png');
    expect(($img.avatar as typeof $img)('/user.png')).toBe('/_ipx/q_80&s_96x96/user.png');
    expect($img.getSizes('/hero.png', { sizes: '100vw md:1100px', modifiers: { format: 'webp' } }).src).toBe(
      '/_ipx/w_2200&f_webp/hero.png'
    );
  });
});

describe('image context and metadata', () => {
  const metadataProvider: ImageProvider = {
    name: 'metadata',
    getImage(src) {
      return {
        url: `/metadata${src}`,
        getMeta: async () => ({ width: 1200, height: 800, ratio: 1.5 })
      };
    }
  };

  it('exposes every operation through a resolved image context', async () => {
    const context = createImageContext({
      provider: 'metadata',
      providers: { metadata: metadataProvider }
    });
    const input = { src: '/photo.jpg', alt: 'Photo', width: 600, height: 400, format: 'webp' as const };

    expect(context.config.provider).toBe('metadata');
    expect(context.getImage(input).url).toBe('/metadata/photo.jpg');
    expect(context.getImageAttrs(input).src).toBe('/metadata/photo.jpg');
    expect(context.getPictureAttrs(input).img.src).toBe('/metadata/photo.jpg');
    expect(context.getPreloadLink(input)).toMatchObject({ rel: 'preload', as: 'image' });
    await expect(context.getMeta(input)).resolves.toEqual({ width: 1200, height: 800, ratio: 1.5 });
  });

  it('reads browser metadata and reports browser loading failures', async () => {
    class SuccessfulImage {
      naturalWidth = 800;
      naturalHeight = 400;
      width = 0;
      height = 0;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('Image', SuccessfulImage);
    await expect(getImageMeta({ src: '/photo.jpg' }, { provider: 'none' })).resolves.toEqual({
      width: 800,
      height: 400,
      ratio: 2
    });

    class FailingImage extends SuccessfulImage {
      override set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal('Image', FailingImage);
    await expect(getImageMeta({ src: '/missing.jpg' }, { provider: 'none' })).rejects.toThrow(
      /Unable to load image metadata/
    );
  });

  it('explains when metadata has no provider or browser implementation', async () => {
    vi.stubGlobal('Image', undefined);
    await expect(getImageMeta({ src: '/photo.jpg' }, { provider: 'none' })).rejects.toThrow(
      /metadata is not available/
    );
  });
});

describe('image edge behavior', () => {
  it('passes SVG and data sources through without generating candidates', () => {
    expect(generatePictureSources({ src: '/icon.svg', format: 'webp' })).toEqual([]);
    expect(generateSrcset({ src: 'data:image/png;base64,abc', width: 320 })).toEqual({
      widths: [],
      descriptor: 'x'
    });
    expect(generateSrcset({ src: '/photo.jpg' })).toEqual({ widths: [], descriptor: 'x' });
    expect(getImage({ src: 'data:image/png;base64,abc', width: 320 })).toEqual({
      url: 'data:image/png;base64,abc',
      isOptimized: false
    });
  });

  it('warns, returns, or throws according to invalid-source policy', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(getImage({ src: 'ftp://example.com/photo.jpg' })).toEqual({
      url: 'ftp://example.com/photo.jpg',
      isOptimized: false
    });
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('must be an absolute local path'));
    expect(() => getImage({ src: 'ftp://example.com/photo.jpg' }, { onInvalidSource: 'throw' })).toThrow(
      /must be an absolute local path/
    );
    expect(getImage({ src: 'ftp://example.com/photo.jpg' }, { onInvalidSource: 'passthrough' })).toEqual({
      url: 'ftp://example.com/photo.jpg',
      isOptimized: false
    });
  });

  it('supports literal placeholder URLs and reports unknown providers', () => {
    expect(
      getImageAttrs({ src: '/photo.jpg', width: 320, placeholder: 'data:image/png;base64,preview' }).placeholderSrc
    ).toBe('data:image/png;base64,preview');
    expect(() => getImage({ src: '/photo.jpg', provider: 'missing' })).toThrow(/Unknown image provider "missing"/);
  });

  it('lets providers use the memoized context image helper', () => {
    let helperCalls = 0;
    const bridge = defineProvider({
      getImage(src, _options, context) {
        helperCalls += 1;
        expect(context.$img.getImage(src, { provider: 'ipx', modifiers: { width: 20 } }).url).toContain('/_ipx/w_20/');
        expect(context.$img.getSizes(src, { provider: 'ipx', modifiers: { width: 20 } }).srcset).toContain('1x');
        expect(context.$img.getAttrs({ src, provider: 'ipx', width: 20 }).src).toContain('/_ipx/');
        expect(context.$img.getPicture({ src, provider: 'ipx', width: 20 }).img.src).toContain('/_ipx/');
        expect(context.$img.getPreloadLink({ src, provider: 'ipx', width: 20 }).href).toContain('/_ipx/');
        return { url: (context.$img.thumb as typeof context.$img)(src) };
      }
    });

    const config = {
      provider: 'bridge',
      providers: { bridge },
      presets: { thumb: { provider: 'ipx', width: 24, height: 24 } }
    };
    expect(getImage({ src: '/photo.jpg' }, config).url).toBe('/_ipx/s_24x24/photo.jpg');
    expect(getImage({ src: '/photo.jpg' }, config).url).toBe('/_ipx/s_24x24/photo.jpg');
    expect(helperCalls).toBe(2);
  });

  it('allows opaque IDs only for providers that opt into them', () => {
    const opaque = configureProvider(defineProvider({ getImage: (src) => ({ url: `/asset/${src}` }) }), {}, 'opaque', {
      acceptsOpaqueSource: true
    });
    expect(getImage({ src: 'asset-id' }, { provider: 'opaque', providers: { opaque } }).url).toBe('/asset/asset-id');
  });
});
