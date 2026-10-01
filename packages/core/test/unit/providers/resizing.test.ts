import { afterEach, describe, expect, it, vi } from 'vitest';
import { createImage, getImage, resolveImageConfig, type ImageModifiers } from '@src/index';
import { aliyunProvider } from '@src/providers/aliyun';
import { awsAmplifyProvider } from '@src/providers/awsAmplify';
import { edgeonePagesProvider } from '@src/providers/edgeonePages';
import { hygraphProvider } from '@src/providers/hygraph';
import ipxStaticSetup from '@src/providers/ipxStatic';
import { netlifyLargeMediaProvider } from '@src/providers/netlifyLargeMedia';
import { picsumProvider } from '@src/providers/picsum';
import { prismicProvider } from '@src/providers/prismic';
import { strapiProvider } from '@src/providers/strapi';
import { supabaseProvider } from '@src/providers/supabase';
import { storyblokProvider } from '@src/providers/storyblok';
import { wagtailProvider } from '@src/providers/wagtail';
import { twicpicsProvider } from '@src/providers/twicpics';
import { uploadcareProvider } from '@src/providers/uploadcare';
import { vercelProvider } from '@src/providers/vercel';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('provider resizing contracts', () => {
  it.each([
    ['vercel', vercelProvider],
    ['awsAmplify', awsAmplifyProvider]
  ] as const)('%s rounds up to supported widths and caps oversized requests', (name, provider) => {
    vi.stubEnv('NODE_ENV', 'development');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const config = { provider: name, providers: { [name]: provider({ path: '/images', defaultQuality: 82 }) } };
    const url = (width?: number) => new URL(getImage({ src: '/photo.jpg', width }, config).url, 'https://site.test');

    expect(url(768).searchParams.get('w')).toBe('768');
    expect(warning).not.toHaveBeenCalled();
    expect(url(700).searchParams.get('w')).toBe('768');
    expect(warning).toHaveBeenLastCalledWith(expect.stringContaining('Defaulting to `768`'));
    expect(url(8000).searchParams.get('w')).toBe('1536');
    expect(warning).toHaveBeenLastCalledWith(expect.stringContaining('Defaulting to `1536`'));
    const defaultUrl = url();
    expect(defaultUrl.pathname).toBe('/images');
    expect(defaultUrl.searchParams.get('q')).toBe('82');
    expect(defaultUrl.searchParams.get('w')).toBe('1536');
    expect(warning).toHaveBeenLastCalledWith(expect.stringContaining('A defined width should be provided'));
  });

  it.each([
    [{ width: 320 }, 'resize,w_320'],
    [{ height: 180 }, 'resize,h_180'],
    [{ width: 320, height: 180 }, 'resize,fw_320,fh_180'],
    [{ width: 320, resize: { w: 100 } }, 'resize,w_100']
  ])('preserves Aliyun resize semantics for %j', (modifiers, operation) => {
    const image = createImage({ provider: 'aliyun', providers: { aliyun: aliyunProvider() } });
    expect(image('/photo.jpg', modifiers)).toBe(`/photo.jpg?image_process=${operation}`);
  });

  it.each([
    [{ width: 320, fit: 'outside' }, 'contain=320x320'],
    [{ height: 180, fit: 'outside' }, 'contain=180x180'],
    [{ width: 320, height: 180, fit: 'outside' }, 'contain=320x320'],
    [{ width: 320 }, 'cover=320x-'],
    [{ height: 180 }, 'cover=-x180']
  ] satisfies [ImageModifiers, string][])('maps TwicPics dimensions %j', (modifiers, operation) => {
    const image = createImage({ provider: 'twicpics', providers: { twicpics: twicpicsProvider() } });
    expect(image('/photo.jpg', modifiers)).toBe(`/photo.jpg?twic=v1/${operation}`);
  });

  it.each([
    [{ width: 320 }, '-/resize/320x/'],
    [{ height: 180 }, '-/resize/x180/'],
    [{ width: 320, height: 180, fit: 'inside' }, '-/smart_resize/320x180/'],
    [{ fit: 'cover' }, '']
  ] satisfies [ImageModifiers, string][])('builds Uploadcare geometry %j without mutating input', (modifiers, path) => {
    const image = createImage({ provider: 'uploadcare', providers: { uploadcare: uploadcareProvider() } });
    const original = structuredClone(modifiers);
    expect(image('https://custom.ucarecdn.com/asset-id', modifiers)).toBe(
      `https://custom.ucarecdn.com/asset-id/${path}`
    );
    expect(modifiers).toEqual(original);
  });

  it.each([
    [{ width: 320, background: 'ffffff' }, 'thumbnail/320x/pad/1/color/ZmZmZmZm'],
    [{ height: 180, pad: true }, 'thumbnail/x180/pad/1'],
    [{ crop: '100x80', format: 'webp' }, 'crop/100x80/format/webp'],
    [{ crop: '100x80', dx: 0, dy: 0 }, 'crop/100x80/dx/0/dy/0']
  ] satisfies [ImageModifiers, string][])('serializes EdgeOne optional operations %j', (modifiers, path) => {
    const image = createImage({
      provider: 'edgeonePages',
      providers: { edgeonePages: edgeonePagesProvider({ baseURL: 'https://edge.example' }) }
    });
    expect(image('/photo.jpg', modifiers)).toBe(`https://edge.example/photo.jpg?imageMogr2/${path}`);
  });

  it.each([0, -2, 0.2, 3.6, 20])('limits Picsum blur %s to its supported range', (blur) => {
    const image = createImage({ provider: 'picsum', providers: { picsum: picsumProvider() } });
    const expected = new Map([
      [0, null],
      [-2, null],
      [0.2, '1'],
      [3.6, '4'],
      [20, '10']
    ]);
    const url = new URL(image('/seed/landscape', { width: 320, blur, format: 'webp', quality: 80 }));
    expect(url.pathname).toBe('/seed/landscape/320');
    expect(url.searchParams.get('blur')).toBe(expected.get(blur));
    expect([...url.searchParams.keys()]).toEqual(blur > 0 ? ['blur'] : []);
  });

  it('defaults Netlify Large Media resizing to contain', () => {
    const image = createImage({
      provider: 'netlifyLargeMedia',
      providers: { netlifyLargeMedia: netlifyLargeMediaProvider() }
    });
    expect(image('/photo.jpg', { height: 180 })).toBe('/photo.jpg?h=180&nf_resize=fit');
  });

  it.each([
    [{ width: 320 }, 'width-320'],
    [{ height: 180 }, 'height-180']
  ])('preserves aspect ratio in Wagtail when only one dimension is requested: %j', (modifiers, operation) => {
    const image = createImage({
      provider: 'wagtail',
      providers: { wagtail: wagtailProvider({ baseURL: 'https://cms.example' }) }
    });
    expect(image('/photo', modifiers)).toBe(`https://cms.example/photo/${operation}|format-webp|webpquality-70`);
  });

  it('keeps Storyblok SVG sources free of raster transforms', () => {
    const image = createImage({ provider: 'storyblok', providers: { storyblok: storyblokProvider() } });
    expect(image('/logo.svg', { width: 320, height: 180, format: 'webp', quality: 70 })).toBe(
      'https://a.storyblok.com/logo.svg'
    );
    expect(image('/photo.jpg', { height: 180 })).toBe('https://a.storyblok.com/photo.jpg/m/0x180');
  });

  it('resolves the static IPX route under the application base URL', () => {
    const options = resolveImageConfig({ baseURL: '/shop' });
    expect(
      ipxStaticSetup().getImage('/photo.jpg', { modifiers: {} }, { options, $img: createImage(options) }).url
    ).toBe('/shop/_ipx/_/photo.jpg');
  });

  it('keeps Unsplash sources on their original CDN when passed through Prismic', () => {
    const image = createImage({ provider: 'prismic', providers: { prismic: prismicProvider() } });
    expect(image('https://images.unsplash.com/photo-id', { width: 320 })).toBe(
      'https://images.unsplash.com/photo-id?w=320'
    );
  });

  it('selects the named Strapi breakpoint', () => {
    const image = createImage({
      provider: 'strapi',
      providers: { strapi: strapiProvider({ baseURL: 'https://cms.example/uploads' }) }
    });
    expect(image('/photo.jpg', { breakpoint: 'thumbnail' })).toBe('https://cms.example/uploads/thumbnail_photo.jpg');
  });

  it('rejects missing Supabase configuration before generating a broken URL', () => {
    const image = createImage({ provider: 'supabase', providers: { supabase: supabaseProvider() } });
    expect(() => image('/photo.jpg')).toThrow('Supabase provider requires baseURL to be set');
  });

  it.each([
    ['https://graphassets.com', '/base-id/image-id/'],
    ['https://graphassets.com/base-id', '/'],
    ['https://graphassets.com/base-id', '/image-id//']
  ])('rejects malformed Hygraph asset paths with base %s and source %s', (baseURL, src) => {
    const image = createImage({ provider: 'hygraph', providers: { hygraph: hygraphProvider({ baseURL }) } });
    expect(() => image(src)).toThrow('[desource/image] [hygraph] Invalid image URL.');
  });
});
