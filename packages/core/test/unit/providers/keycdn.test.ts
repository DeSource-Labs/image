import { describe, expect, it } from 'vitest';
import {
  createImage,
  getImage,
  getImageAttrs,
  getPictureAttrs,
  type ImageConfig,
  type ModifierValue
} from '@src/index';
import { createBuiltInProviders, keycdnProvider, type KeyCDNProviderOptions } from '@src/providers';
import keycdnSetup from '@src/providers/keycdn';
import { localProviderContext } from '../setup/shared';

const providerOptions = { baseURL: 'https://ip.keycdn.com' } satisfies KeyCDNProviderOptions;
const config = {
  provider: 'keycdn',
  providers: { keycdn: keycdnProvider(providerOptions) }
} satisfies ImageConfig;

// Fixtures follow https://www.keycdn.com/support/image-processing.
describe('KeyCDN provider', () => {
  it.each([
    [{ width: 600 }, 'width=600'],
    [{ height: 400 }, 'height=400'],
    [{ width: 400, height: 400, fit: 'cover' }, 'fit=cover&height=400&width=400'],
    [{ width: 400, height: 400, fit: 'contain' }, 'fit=contain&height=400&width=400'],
    [{ width: 400, height: 400, fit: 'fill' }, 'fit=fill&height=400&width=400'],
    [{ width: 400, height: 400, fit: 'inside' }, 'fit=inside&height=400&width=400'],
    [{ width: 400, height: 400, fit: 'outside' }, 'fit=outside&height=400&width=400']
  ])('builds the documented resize request for %j', (modifiers, query) => {
    expect(getImage({ src: '/example.jpg', modifiers }, config).url).toBe(`https://ip.keycdn.com/example.jpg?${query}`);
  });

  it.each(['top', 'right', 'bottom', 'left'])('preserves the %s position', (position) => {
    const result = getImage({ src: '/example.jpg', width: 400, height: 200, fit: 'cover', position }, config);
    expect(new URL(result.url).searchParams.get('position')).toBe(position);
  });

  it.each([
    ['#2e3234', '2e3234'],
    ['#fff', 'ffffff'],
    ['46,50,52', '46,50,52'],
    ['46,50,52,0.5', '46,50,52,0.5'],
    ['transparent', '0,0,0,0']
  ])('maps background %s to bg=%s', (background, expected) => {
    const result = getImage({ src: '/example.jpg', width: 400, height: 400, fit: 'contain', background }, config);
    const query = new URL(result.url).searchParams;
    expect(query.get('bg')).toBe(expected);
    expect(query.has('background')).toBe(false);
  });

  it.each(['jpeg', 'jpg', 'png', 'webp'])('supports %s output', (format) => {
    const result = getImage({ src: '/example.jpg', format, quality: 70 }, config);
    expect(new URL(result.url).searchParams.get('format')).toBe(format === 'jpg' ? 'jpeg' : format);
    expect(new URL(result.url).searchParams.get('quality')).toBe('70');
  });

  it.each(['avif', 'gif', 'auto', 'tiff'])('rejects unsupported %s output', (format) => {
    expect(() => getImage({ src: '/example.jpg', format }, config)).toThrow(
      `[desource/image] [keycdn] Unsupported format "${format}"`
    );
  });

  it.each<{ value: ModifierValue }>([
    { value: { format: 'webp' } },
    { value: { toString: 'webp' } },
    { value: ['webp'] },
    { value: 42 }
  ])('rejects non-string format aliases $value with a clear error', ({ value }) => {
    expect(() =>
      keycdnSetup().getImage('/example.jpg', { ...providerOptions, modifiers: { f: value } }, localProviderContext)
    ).toThrow(new TypeError('[desource/image] [keycdn] Format must be a string. Use jpeg, jpg, png, or webp.'));
  });

  it('preserves absolute custom domains, paths, query values, and fragments while replacing transformations', () => {
    const src =
      'https://cdn.example.com/nested/caf%C3%A9%20photo%2F1.jpg?version=2&tag=a&tag=b&width=100&width=200&format=png#preview';
    const result = getImage({ src, width: 640, format: 'webp' }, config);
    const url = new URL(result.url);

    expect(url.origin).toBe('https://cdn.example.com');
    expect(url.pathname).toBe('/nested/caf%C3%A9%20photo%2F1.jpg');
    expect(url.hash).toBe('#preview');
    expect(url.searchParams.get('version')).toBe('2');
    expect(url.searchParams.getAll('tag')).toEqual(['a', 'b']);
    expect(url.searchParams.getAll('width')).toEqual(['640']);
    expect(url.searchParams.getAll('format')).toEqual(['webp']);
    expect(getImage({ src: result.url, width: 640, format: 'webp' }, config).url).toBe(result.url);
  });

  it('joins relative sources to a base path and preserves encoded nested query values', () => {
    const image = createImage({
      provider: 'keycdn',
      providers: { keycdn: keycdnProvider({ baseURL: 'https://cdn.example.com/assets/' }) }
    });
    const url = new URL(
      image('photo.jpg?source=https%3A%2F%2Forigin.example%2Fa.jpg%3Fx%3D1%26y%3D2#preview', { width: 320 })
    );

    expect(url.pathname).toBe('/assets/photo.jpg');
    expect(url.searchParams.get('source')).toBe('https://origin.example/a.jpg?x=1&y=2');
    expect(url.searchParams.get('width')).toBe('320');
    expect(url.hash).toBe('#preview');
  });

  it('supports absolute URLs without a base URL and default setup registration', () => {
    const src = 'https://cdn.example.com/photo.jpg?version=2#preview';
    expect(getImage({ src }, { provider: 'keycdn', providers: { keycdn: keycdnSetup } }).url).toBe(src);
    expect(getImage({ src, width: 320 }, { provider: 'keycdn', providers: createBuiltInProviders() }).url).toBe(
      'https://cdn.example.com/photo.jpg?version=2&width=320#preview'
    );
  });

  it('uses the default centered position when overriding an existing position', () => {
    const result = getImage(
      { src: '/photo.jpg?fit=cover&position=top', width: 320, height: 180, position: 'center' },
      config
    );
    expect(new URL(result.url).searchParams.has('position')).toBe(false);
  });

  it('serializes native flags and zero values without mutating modifiers', () => {
    const modifiers = { enlarge: false, progressive: true, quality: 0, crop: '600,400,100,0' };
    const result = keycdnSetup().getImage('/photo.jpg', { ...providerOptions, modifiers }, localProviderContext);
    const query = new URL(result.url).searchParams;
    expect(query.get('enlarge')).toBe('0');
    expect(query.get('progressive')).toBe('1');
    expect(query.get('quality')).toBe('0');
    expect(query.get('crop')).toBe('600,400,100,0');
    expect(modifiers).toEqual({ enlarge: false, progressive: true, quality: 0, crop: '600,400,100,0' });
  });

  it('generates responsive variants and a placeholder through the shared image API', () => {
    const attrs = getImageAttrs(
      {
        src: '/photo.jpg?version=2',
        width: 320,
        height: 180,
        fit: 'cover',
        format: 'webp',
        quality: 80,
        densities: [1, 2],
        placeholder: true
      },
      config
    );
    expect(attrs.srcset).toBe(
      'https://ip.keycdn.com/photo.jpg?version=2&fit=cover&format=webp&height=180&quality=80&width=320 1x, https://ip.keycdn.com/photo.jpg?version=2&fit=cover&format=webp&height=360&quality=80&width=640 2x'
    );
    const placeholder = new URL(attrs.placeholderSrc!);
    expect(placeholder.searchParams.get('width')).toBe('10');
    expect(placeholder.searchParams.get('blur')).toBe('3');
    expect(placeholder.searchParams.get('version')).toBe('2');
  });

  it('generates supported picture formats and rejects AVIF before returning misleading MIME types', () => {
    const input = { src: '/photo.jpg', width: 320, densities: [1], formats: ['webp'], fallbackFormat: 'jpeg' };
    const picture = getPictureAttrs(input, config);
    expect(picture.sources).toMatchObject([
      { type: 'image/webp', srcset: 'https://ip.keycdn.com/photo.jpg?format=webp&width=320 1x' }
    ]);
    expect(new URL(picture.img.src).searchParams.get('format')).toBe('jpeg');
    expect(() => getPictureAttrs({ ...input, formats: ['avif', 'webp'] }, config)).toThrow(/Unsupported format "avif"/);
  });
});
