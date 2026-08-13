import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  configureProvider,
  createImageContext,
  defineProvider,
  generatePictureSources,
  generateSizes,
  generateSrcset,
  getImage,
  getImageAttrs,
  getImageMeta,
  parseDensities,
  parseSizes,
  type ImageProvider
} from '@desource/image';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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

describe('responsive parsing edge cases', () => {
  it('parses each density input form and falls back from invalid strings', () => {
    expect(parseDensities([2, 1, 2])).toEqual([1, 2]);
    expect(parseDensities(1.5)).toEqual([2]);
    expect(parseDensities('x1, 2x invalid', [1])).toEqual([1, 2]);
    expect(parseDensities('invalid', [1])).toEqual([1]);
  });

  it('rejects empty and unusable size inputs', () => {
    expect(parseSizes(undefined)).toBeUndefined();
    expect(parseSizes(null as unknown as undefined)).toBeUndefined();
    expect(parseSizes('')).toBeUndefined();
    expect(parseSizes('unknown:50vw')).toBeUndefined();
  });

  it('generates fixed widths and safe fallbacks for unusable responsive variants', () => {
    expect(generateSizes({})).toEqual({ widths: [] });
    expect(generateSizes({ width: 300, densities: [1, 2] })).toEqual({ widths: [300, 600] });
    expect(generateSizes({ sizes: '0vw', providerSizes: [320, 640] })).toEqual({
      sizes: '100vw',
      widths: [320, 640]
    });
    expect(generateSizes({ sizes: '400', densities: [1], providerSizes: [320, 640] })).toEqual({
      sizes: '400px',
      widths: [400]
    });
    expect(generateSizes({ sizes: 'calc(100vw)', providerSizes: [320] })).toEqual({
      sizes: '100vw',
      widths: [320]
    });
  });
});
