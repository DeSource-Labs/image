import { afterEach, describe, expect, it, vi } from 'vitest';
import { createImage, resolveImageConfig, type ImageProviderContext } from '@desource/image';
import cloudimageSetup from '../src/providers/cloudimage';
import cloudinarySetup from '../src/providers/cloudinary';
import directusSetup from '../src/providers/directus';
import filerobotSetup from '../src/providers/filerobot';
import flyimgSetup from '../src/providers/flyimg';
import hygraphSetup from '../src/providers/hygraph';
import netlifyLargeMediaSetup from '../src/providers/netlifyLargeMedia';
import sanitySetup from '../src/providers/sanity';
import strapi5Setup from '../src/providers/strapi5';
import weservSetup from '../src/providers/weserv';

const resolved = resolveImageConfig({ baseURL: '/site' });
const context: ImageProviderContext = { options: resolved, $img: createImage(resolved) };

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
