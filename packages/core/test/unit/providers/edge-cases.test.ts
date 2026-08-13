import { afterEach, describe, expect, it, vi } from 'vitest';
import { createImage, resolveImageConfig, type ImageProviderContext } from '@src/index';
import cloudimageSetup from '@src/providers/cloudimage';
import cloudinarySetup from '@src/providers/cloudinary';
import directusSetup from '@src/providers/directus';
import edgeonePagesSetup, { edgeonePagesProvider } from '@src/providers/edgeonePages';
import filerobotSetup from '@src/providers/filerobot';
import flyimgSetup from '@src/providers/flyimg';
import hygraphSetup from '@src/providers/hygraph';
import imgproxySetup, { imgproxyProvider } from '@src/providers/imgproxy';
import netlifyLargeMediaSetup from '@src/providers/netlifyLargeMedia';
import sanitySetup from '@src/providers/sanity';
import strapi5Setup from '@src/providers/strapi5';
import weservSetup from '@src/providers/weserv';

const resolved = resolveImageConfig({ baseURL: '/site' });
const context: ImageProviderContext = { options: resolved, $img: createImage(resolved) };
type ImgproxyGetImageOptions = Parameters<ReturnType<typeof imgproxySetup>['getImage']>[1];

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('provider edge cases', () => {
  it('handles Cloudimage validation, generated CDNs, remote sources, and base URL fallback', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(cloudimageSetup().getImage('/photo.jpg', { modifiers: {}, token: '', cdnURL: '' }, context).url).toContain(
      '<token>'
    );
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('required'));

    vi.stubEnv('NODE_ENV', 'production');
    expect(
      cloudimageSetup().getImage('/photo.jpg', { modifiers: {}, token: 'demo', apiVersion: 'v7' }, context).url
    ).toBe('https://demo.cloudimg.io/v7/site/photo.jpg');
    expect(
      cloudimageSetup().getImage(
        'https://origin.example/photo.jpg',
        { modifiers: { width: 320 }, token: 'demo', apiVersion: 'v7' },
        context
      ).url
    ).toBe('https://demo.cloudimg.io/v7/https://origin.example/photo.jpg?width=320');
    expect(
      cloudimageSetup().getImage('/photo.jpg', { modifiers: {}, token: '', cdnURL: 'https://custom.example' }, context)
        .url
    ).toBe('https://custom.example/site/photo.jpg');
  });

  it('supports Cloudinary upload mappings, remote folders, and fetch URLs', () => {
    expect(
      cloudinarySetup().getImage(
        'https://res.cloudinary.com/demo/image/upload/v1/folder/photo.jpg',
        { modifiers: {}, baseURL: '/' },
        context
      ).url
    ).toContain('/image/upload/f_auto,q_auto/v1/folder/photo.jpg');
    expect(
      cloudinarySetup().getImage(
        '/photo.jpg',
        {
          modifiers: { background: '#fff', color: '#000' },
          baseURL: 'https://res.cloudinary.com/demo/image/upload/folder'
        },
        context
      ).url
    ).toContain('/image/upload/f_auto,q_auto,b_rgb_fff,co_rgb_000/folder/photo.jpg');
    expect(
      cloudinarySetup().getImage(
        'https://origin.example/a photo.jpg',
        { modifiers: {}, baseURL: 'https://res.cloudinary.com/demo/image/fetch' },
        context
      ).url
    ).toContain('/image/fetch/f_auto,q_auto/https://origin.example/a%20photo.jpg');
  });

  it('deduplicates Directus transform arrays before serializing them', () => {
    const transform = { resize: { width: 320 } };
    const result = directusSetup().getImage(
      '/asset-id',
      { baseURL: 'https://cms.example/assets', modifiers: { transforms: [transform, transform] } },
      context
    );
    expect(decodeURIComponent(result.url)).toContain('transforms=[{"resize":{"width":320}}]');
  });

  it('requires EdgeOne Pages base URL and serializes its imageMogr2 operations', () => {
    expect(() => edgeonePagesSetup().getImage('/photo.jpg', { modifiers: {}, baseURL: '' }, context)).toThrow(
      /requires baseURL/
    );
    expect(
      edgeonePagesProvider().getImage('/photo.jpg', { modifiers: {}, baseURL: 'https://edge.example' }, context)
    ).toEqual({
      url: 'https://edge.example/photo.jpg'
    });
    expect(
      edgeonePagesSetup().getImage(
        '/nested/photo.jpg',
        {
          baseURL: 'https://edge.example/images',
          modifiers: {
            width: 320,
            height: 180,
            fit: 'cover',
            pad: true,
            background: '#00ffcc',
            crop: '10x20a30a40',
            gravity: 'center',
            dx: -4,
            dy: 8,
            iradius: 12,
            scrop: '100x100',
            rotate: 90,
            autoOrient: true,
            quality: 72,
            format: 'jpeg',
            blur: 3,
            sharpen: 50,
            strip: true,
            interlace: true
          }
        },
        context
      ).url
    ).toBe(
      'https://edge.example/images/nested/photo.jpg?imageMogr2/thumbnail/!320x180r/pad/1/color/MDBmZmNj/crop/10x20a30a40/gravity/center/dx/-4/dy/8/iradius/12/scrop/100x100/rotate/90/auto-orient/quality/72/format/jpg/blur/3x3/sharpen/50/strip/interlace/1'
    );
    expect(
      edgeonePagesSetup().getImage(
        '/photo.jpg',
        {
          baseURL: 'https://edge.example',
          modifiers: {
            width: 640,
            height: 360,
            fit: 'fill',
            interlace: 2
          }
        },
        context
      ).url
    ).toBe('https://edge.example/photo.jpg?imageMogr2/thumbnail/640x360!/interlace/2');
  });

  it('handles Filerobot remote URLs and warns about a missing base URL in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(filerobotSetup().getImage('/photo.jpg', { modifiers: {}, baseURL: '' }, context).url).toBe('/photo.jpg');
    expect(warning).toHaveBeenCalledOnce();
    expect(
      filerobotSetup().getImage(
        'https://origin.example/photo.jpg',
        { modifiers: { width: 320 }, baseURL: 'https://cdn.example' },
        context
      ).url
    ).toBe('https://origin.example/photo.jpg?w=320');
  });

  it('maps Flyimg fit modes, inverted defaults, and relative sources', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const provider = flyimgSetup();

    expect(provider.getImage('/photo.jpg', { modifiers: { fit: 'outside' }, baseURL: '' }, context).url).toBe(
      '/upload/-//photo.jpg'
    );
    expect(warning).toHaveBeenCalledTimes(3);
    expect(
      provider.getImage(
        '/photo.jpg',
        {
          modifiers: {
            fit: 'fill',
            strip: false,
            mozjpeg: 0,
            preserveAspectRatio: true,
            preserveNaturalSize: '0',
            background: '#fff',
            textColor: '#000',
            textBackground: 'transparent',
            text: 'hello world'
          },
          baseURL: 'https://fly.example',
          sourceURL: 'https://site.example',
          processType: 'path'
        },
        context
      ).url
    ).toContain(
      '/path/bg_%23fff,tc_%23000,tbg_transparent,t_hello%20world,par_0,st_0,moz_0,pns_0/https://site.example/photo.jpg'
    );
    expect(
      provider.getImage(
        'https://origin.example/photo.jpg',
        { modifiers: { fit: 'cover', crop: false }, baseURL: 'https://fly.example' },
        context
      ).url
    ).toContain('/upload/c_1/https://origin.example/photo.jpg');
  });

  it('supports Hygraph combined IDs and reports malformed configuration', () => {
    const provider = hygraphSetup();
    expect(
      provider.getImage('/base-id/folder/image-id', { modifiers: {}, baseURL: 'https://graphassets.com' }, context).url
    ).toBe('https://graphassets.com/base-id/auto_image/image-id');
    expect(() => provider.getImage('/invalid', { modifiers: {}, baseURL: 'https://graphassets.com' }, context)).toThrow(
      /Invalid image URL/
    );
    expect(() => provider.getImage('/image-id', { modifiers: {}, baseURL: '' }, context)).toThrow(
      /No Hygraph image base URL/
    );
  });

  it('generates unsafe or signed Imgproxy URLs and validates signing inputs', () => {
    expect(
      imgproxyProvider().getImage(
        '/photo.jpg',
        {
          baseURL: 'https://imgproxy.example',
          modifiers: {}
        },
        context
      ).url
    ).toBe('https://imgproxy.example/unsafe/L3Bob3RvLmpwZw');

    expect(
      imgproxySetup().getImage(
        'https://origin.example/a photo.jpg',
        {
          baseURL: 'https://imgproxy.example',
          key: '00112233445566778899aabbccddeeff',
          salt: '0102030405060708',
          modifiers: {
            width: 320,
            height: 180,
            fit: 'cover'
          }
        },
        context
      ).url
    ).toMatch(
      /^https:\/\/imgproxy\.example\/(?!unsafe\/)[A-Za-z0-9_-]+\/w:320\/h:180\/rt:fill\/aHR0cHM6Ly9vcmlnaW4uZXhhbXBsZS9hIHBob3RvLmpwZw$/
    );

    expect(() =>
      imgproxySetup().getImage(
        '/photo.jpg',
        {
          baseURL: 'https://imgproxy.example',
          key: 'abc',
          salt: '00',
          modifiers: {}
        },
        context
      )
    ).toThrow(/Invalid hex string for signing key/);
    expect(() =>
      imgproxySetup().getImage(
        '/photo.jpg',
        {
          baseURL: 'https://imgproxy.example',
          key: '00',
          salt: 'xyz',
          modifiers: {}
        },
        context
      )
    ).toThrow(/Invalid hex string for signing salt/);
  });

  it('normalizes Imgproxy fit modes into resizing types', () => {
    const provider = imgproxySetup();
    const cases = [
      { fit: 'contain', expected: ['/w:320/h:180/rt:fit/', '/ex:1/'] },
      { fit: 'fill', expected: ['/w:320/h:180/rt:force/'] },
      { fit: 'inside', expected: ['/w:320/h:180/rt:fit/'] },
      { fit: 'outside', expected: ['/w:320/h:180/rt:fill/'] },
      { fit: 'cover', width: 320, expected: ['/w:320/rt:fit/'] }
    ] satisfies Array<{
      fit: 'contain' | 'fill' | 'inside' | 'outside' | 'cover';
      width?: number;
      expected: string[];
    }>;

    for (const { fit, width = 320, expected } of cases) {
      const result = provider.getImage(
        '/photo.jpg',
        {
          baseURL: 'https://imgproxy.example',
          modifiers: {
            width,
            height: fit === 'cover' ? undefined : 180,
            fit
          }
        },
        context
      );

      for (const fragment of expected) {
        expect(result.url).toContain(fragment);
      }
    }
  });

  it('serializes Imgproxy mapped modifiers, booleans, crop values, and rotation', () => {
    expect(
      imgproxySetup().getImage(
        '/photo.jpg',
        {
          baseURL: 'https://imgproxy.example',
          modifiers: {
            resize: 'fit:320:180',
            size: '320:180',
            minWidth: 160,
            minHeight: 90,
            zoom: 1.5,
            dpr: 2,
            enlarge: true,
            extend: 'false',
            extendAspectRatio: '1:1',
            gravity: 'ce',
            crop: { width: 120, height: 80, gravity: 'so' },
            autoRotate: 't',
            rotate: -91,
            background: 'ffffff',
            blur: 4,
            sharpen: 2,
            pixelate: 8,
            stripMetadata: 1,
            keepCopyright: false,
            stripColorProfile: 'true',
            enforceThumbnail: 'no',
            quality: 75,
            format: 'webp',
            raw: true,
            cachebuster: 'v1',
            expires: 123,
            filename: 'photo.webp',
            returnAttachment: 'true',
            preset: 'sharp',
            maxSrcResolution: 10,
            maxSrcFileSize: 20,
            maxAnimationFrames: 30,
            maxAnimationFrameResolution: '40:50',
            maxResultDimension: '60:70'
          }
        },
        context
      ).url
    ).toContain('/rs:fit:320:180/');

    const options = {
      baseURL: 'https://imgproxy.example',
      modifiers: {
        crop: '120:80:ce',
        rotate: Number.NaN
      }
    } as unknown as ImgproxyGetImageOptions;
    const unsafeResult = imgproxySetup().getImage('/photo.jpg', options, context);

    expect(unsafeResult.url).toContain('/c:120:80:ce/');
    expect(unsafeResult.url).toContain('/rot:NaN/');
  });

  it('enforces Netlify Large Media resize constraints', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const provider = netlifyLargeMediaSetup();
    const incomplete = provider.getImage(
      '/photo.jpg',
      { modifiers: { width: 320, fit: 'fill', format: 'webp' }, baseURL: '/' },
      context
    );
    expect(incomplete.url).toBe('/photo.jpg?w=320&nf_resize=fit');
    expect(warning).toHaveBeenCalledOnce();
    expect(
      provider.getImage('/photo.jpg', { modifiers: { width: 320, height: 180, fit: 'fill' }, baseURL: '/' }, context)
        .url
    ).toBe('/photo.jpg?w=320&h=180&nf_resize=smartcrop');
  });

  it('converts Sanity crop and hotspot metadata and handles invalid IDs', () => {
    const provider = sanitySetup();
    expect(
      provider.getImage(
        'image-abc-800x600-jpg',
        {
          projectId: 'project',
          dataset: 'production',
          modifiers: {
            crop: { left: 0.1, top: 0.2, right: 0.1, bottom: 0.2 },
            hotspot: { x: 0.25, y: 0.75 },
            format: 'auto',
            fit: 'contain'
          }
        },
        context
      ).url
    ).toContain('fit=fill&rect=80,120,640,360&fp-x=0.25&fp-y=0.75&auto=format&bg=ffffff');

    vi.stubEnv('NODE_ENV', 'development');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(
      provider.getImage('invalid-id', { projectId: 'project', modifiers: { format: 'webp' } }, context).url
    ).toContain('cdn.sanity.io/images/project/production/.id?fm=webp');
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('invalid image asset ID'));
  });

  it('selects the closest available Strapi 5 breakpoint or falls back', () => {
    const provider = strapi5Setup();
    const formats = {
      large: { url: '/uploads/large.jpg' },
      medium: { url: '/uploads/medium.jpg' },
      small: {}
    };
    expect(
      provider.getImage(
        '/uploads/photo.jpg',
        { baseURL: 'https://cms.example/uploads', modifiers: { breakpoint: 'medium', formats } },
        context
      ).url
    ).toBe('https://cms.example/uploads/medium.jpg');
    expect(
      provider.getImage(
        '/uploads/photo.jpg',
        {
          baseURL: 'https://cms.example/uploads',
          modifiers: { breakpoint: 'thumbnail', formats }
        },
        context
      ).url
    ).toBe('https://cms.example/uploads/photo.jpg');
  });

  it('leaves Weserv sources unchanged when its required public base URL is absent', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(weservSetup().getImage('/photo.jpg', { modifiers: {}, baseURL: '' }, context)).toEqual({
      url: '/photo.jpg'
    });
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('requires the public baseURL'));
  });
});
