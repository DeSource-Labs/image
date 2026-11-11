import { describe, expect, it } from 'vitest';
import {
  createImage,
  getImage,
  getImageAttrs,
  getPictureAttrs,
  type ImageConfig,
  type ImageModifiers
} from '@src/index';
import { createBuiltInProviders, imagebossProvider, type ImageBossProviderOptions } from '@src/providers';
import imagebossSetup from '@src/providers/imageboss';
import { localProviderContext } from '../setup/shared';

const providerOptions = { source: 'my-images' } satisfies ImageBossProviderOptions;
const config = {
  provider: 'imageboss',
  providers: { imageboss: imagebossProvider(providerOptions) }
} satisfies ImageConfig;

// Fixtures follow https://imageboss.me/docs and its operation and conversion guides.
describe('ImageBoss provider', () => {
  it.each([
    [{}, 'cdn'],
    [{ width: 320 }, 'width/320'],
    [{ height: 180 }, 'height/180'],
    [{ width: 320, height: 180 }, 'cover/320x180']
  ] satisfies [ImageModifiers, string][])('selects an operation from dimensions: %j', (modifiers, operation) => {
    expect(getImage({ src: '/photo.jpg', modifiers }, config).url).toBe(
      `https://img.imageboss.me/my-images/${operation}/photo.jpg`
    );
  });

  it('applies provider options and per-image modifiers over configured defaults', () => {
    const image = createImage({
      provider: 'imageboss',
      providers: { imageboss: imagebossProvider({ source: 'original', modifiers: { quality: 60, format: 'png' } }) },
      providerOptions: { imageboss: { baseURL: 'https://images.example.com', source: 'website' } }
    });
    expect(image('photo.jpg?version=2', { width: 320, quality: 75 })).toBe(
      'https://images.example.com/website/width/320/format:png,quality:75/photo.jpg?version=2'
    );
  });

  it('supports setup and registry registration with an existing delivery URL', () => {
    const src = 'https://img.imageboss.me/website/cdn/photo.jpg';
    for (const providers of [{ imageboss: imagebossSetup }, createBuiltInProviders()]) {
      expect(getImage({ src, width: 320 }, { provider: 'imageboss', providers }).url).toBe(
        'https://img.imageboss.me/website/width/320/photo.jpg'
      );
    }
    expect(() =>
      getImage({ src: '/photo.jpg' }, { provider: 'imageboss', providers: createBuiltInProviders() })
    ).toThrow('[imageboss]');
  });

  it.each([
    ['cover', undefined, 'cover'],
    ['contain', undefined, 'cover:contain'],
    ['inside', undefined, 'cover:inside'],
    ['cover', 'center', 'cover:center'],
    ['cover', 'northEast', 'cover:northeast'],
    ['cover', 'face', 'cover:face'],
    ['cover', 'entropy', 'cover:entropy']
  ])('maps fit %s and position %s to %s', (fit, position, operation) => {
    expect(getImage({ src: '/photo.jpg', width: 320, height: 180, fit, position }, config).url).toBe(
      `https://img.imageboss.me/my-images/${operation}/320x180/photo.jpg`
    );
  });

  it.each(['fill', 'outside', 'scale-down', 'constructor'])('rejects unsupported fit %s', (fit) => {
    expect(() => getImage({ src: '/photo.jpg', width: 320, height: 180, fit }, config)).toThrow('[imageboss]');
  });

  it.each(['auto', 'jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'])('serializes output format %s', (format) => {
    expect(getImage({ src: '/photo.jpg', format }, config).url).toBe(
      `https://img.imageboss.me/my-images/cdn/format:${format === 'jpeg' ? 'jpg' : format}/photo.jpg`
    );
  });

  it.each(['mp4', 'svg', ['webp']])('rejects unsupported image format aliases: %j', (f) => {
    expect(() =>
      imagebossSetup().getImage('/photo.jpg', { ...providerOptions, modifiers: { f } }, localProviderContext)
    ).toThrow('[imageboss]');
  });

  it('serializes native options in stable order without dropping zero or false or mutating input', () => {
    const modifiers = Object.freeze({ quality: 72, 'fp-x': 0, download: false, background: '#abc', f: 'jpeg' });
    const first = imagebossSetup().getImage('/photo.jpg', { ...providerOptions, modifiers }, localProviderContext).url;
    const reversed = Object.fromEntries(Object.entries(modifiers).reverse());
    const second = imagebossSetup().getImage(
      '/photo.jpg',
      { ...providerOptions, modifiers: reversed },
      localProviderContext
    ).url;
    expect(first).toBe(
      'https://img.imageboss.me/my-images/cdn/download:false,fill-color:aabbcc,format:jpg,fp-x:0,quality:72/photo.jpg'
    );
    expect(second).toBe(first);
    expect(modifiers.background).toBe('#abc');
  });

  it('escapes source and option delimiters while preserving encoded paths and query parameters', () => {
    const src = '/folder/café photo%2F1,2:3.jpg?token=a%2Bb%2F%3D&tag=a&tag=b#preview';
    const url = getImage({ src, width: 320, modifiers: { text: 'a,b:c/d?e#f' } }, config).url;
    expect(url).toBe(
      'https://img.imageboss.me/my-images/width/320/text:a%2Cb%3Ac%2Fd%3Fe%23f/folder/caf%C3%A9%20photo%2F1%2C2%3A3.jpg?token=a%2Bb%2F%3D&tag=a&tag=b#preview'
    );
    expect(getImage({ src: url, width: 320, modifiers: { text: 'a,b:c/d?e#f' } }, config).url).toBe(url);
  });

  it('does not strip transformation-shaped folders from a relative image path', () => {
    const src = '/my-images/width/100/format:png/photo.jpg';
    expect(getImage({ src, width: 320 }, config).url).toBe(
      'https://img.imageboss.me/my-images/width/320/my-images/width/100/format%3Apng/photo.jpg'
    );
  });

  it.each(['https://img.imageboss.me', 'https://images.example.com', '//images.example.com'])(
    'updates an existing delivery URL without duplicating transformations: %s',
    (origin) => {
      const customConfig = { ...config, providerOptions: { imageboss: { baseURL: 'https://images.example.com' } } };
      const src = `${origin}/another-source/cover:center/100x100/blur:2,format:png,quality:60/folder/photo%2F1.jpg?tag=a&tag=b#preview`;
      const url = getImage({ src, width: 640, format: 'webp' }, customConfig).url;
      expect(url).toBe(
        `${origin}/another-source/width/640/blur:2,format:webp,quality:60/folder/photo%2F1.jpg?tag=a&tag=b#preview`
      );
      expect(getImage({ src: url, width: 640, format: 'webp' }, customConfig).url).toBe(url);
      expect(getImage({ src, quality: 75 }, customConfig).url).toBe(
        `${origin}/another-source/cover:center/100x100/blur:2,format:png,quality:75/folder/photo%2F1.jpg?tag=a&tag=b#preview`
      );
    }
  );

  it('retains an existing cover mode while resizing and lets explicit fit override it', () => {
    const src = 'https://img.imageboss.me/website/cover:contain/100x100/format:png/photo.jpg';
    expect(getImage({ src, width: 320, height: 180 }, config).url).toBe(
      'https://img.imageboss.me/website/cover:contain/320x180/format:png/photo.jpg'
    );
    expect(getImage({ src, width: 320, height: 180, fit: 'cover' }, config).url).toBe(
      'https://img.imageboss.me/website/cover/320x180/format:png/photo.jpg'
    );
  });

  it.each([
    'https://origin.example/photo.jpg',
    'https://img.imageboss.me/website/width/no-size/photo.jpg',
    'https://img.imageboss.me/website/cover/320x180/'
  ])('rejects invalid delivery URLs: %s', (src) => {
    expect(() => getImage({ src, width: 320 }, config)).toThrow('[imageboss]');
  });

  it.each([{ 'text/format': 'png' }, { text: { value: 'caption' } }, { quality: Number.POSITIVE_INFINITY }])(
    'rejects invalid option values or keys: %j',
    (modifiers) => {
      expect(() =>
        imagebossSetup().getImage('/photo.jpg', { ...providerOptions, modifiers }, localProviderContext)
      ).toThrow('[imageboss]');
    }
  );

  it('preserves a signed URL only when no transformation is requested', () => {
    const src = 'https://img.imageboss.me/private/width/320/photo.jpg?bossToken=signature&expires=2000000000';
    expect(getImage({ src }, config).url).toBe(src);
    expect(() => getImage({ src, width: 640 }, config)).toThrow('[imageboss]');
    expect(() => getImage({ src: '/photo.jpg?bossToken=signature', width: 640 }, config)).toThrow('[imageboss]');
  });

  it('keeps source identity and options in responsive variants, placeholders, and picture output', () => {
    const src = 'https://img.imageboss.me/website/cdn/quality:65/folder/photo.jpg?version=2';
    const attrs = getImageAttrs(
      { src, width: 320, height: 180, fit: 'cover', format: 'png', densities: [1, 2], placeholder: true },
      config
    );
    const variants = attrs.srcset!.split(', ').map((candidate) => new URL(candidate.split(' ')[0]!));
    expect(variants.map((url) => url.pathname.split('/')[3])).toEqual(['320x180', '640x360']);
    const placeholder = new URL(attrs.placeholderSrc!);
    expect(placeholder.pathname).toMatch(/^\/website\/cover\/10x10\//);
    for (const url of [...variants, placeholder]) {
      expect(url.pathname).toMatch(/^\/website\/cover\//);
      expect(url.pathname.endsWith('/folder/photo.jpg')).toBe(true);
      expect(url.searchParams.get('version')).toBe('2');
    }
    const picture = getPictureAttrs(
      { src, width: 320, densities: [1], formats: ['avif', 'webp'], fallbackFormat: 'jpeg' },
      config
    );
    expect(picture.sources.map((source) => source.type)).toEqual(['image/avif', 'image/webp']);
    expect(picture.sources[0]!.srcset).toContain('/format:avif,quality:65/');
    expect(picture.sources[1]!.srcset).toContain('/format:webp,quality:65/');
    expect(picture.img.src).toContain('/format:jpg,quality:65/');
  });
});
