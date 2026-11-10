import { describe, expect, it } from 'vitest';
import {
  createImage,
  getImage,
  getImageAttrs,
  getPictureAttrs,
  type ImageConfig,
  type ImageModifiers
} from '@src/index';
import { bytescaleProvider, createBuiltInProviders, type BytescaleProviderOptions } from '@src/providers';
import bytescaleSetup from '@src/providers/bytescale';
import { localProviderContext } from '../setup/shared';

const providerOptions = { baseURL: 'https://upcdn.io/account/image' } satisfies BytescaleProviderOptions;
const config = {
  provider: 'bytescale',
  providers: { bytescale: bytescaleProvider(providerOptions) }
} satisfies ImageConfig;

// Fixtures follow https://www.bytescale.com/docs/image-processing-api.
describe('Bytescale provider', () => {
  it.each(['https://upcdn.io', 'https://images.example.com', '//images.example.com'])(
    'normalizes the delivery slot while preserving the host and file path: %s',
    (origin) => {
      const src = `${origin}/account/raw/folder/raw/caf%C3%A9%20photo%2F1.jpg?token=a%2Bb%2F%3D&tag=a&tag=b&w=100&w=200&f=png&src=https%3A%2F%2Forigin.example%2Fa.jpg%3Fx%3D1%26y%3D2#preview`;
      const result = getImage({ src, width: 640, format: 'webp' }, config).url;
      const url = new URL(result, 'https://fallback.example');
      expect(result.startsWith(`${origin}/account/image/`)).toBe(true);
      expect(url.pathname).toBe('/account/image/folder/raw/caf%C3%A9%20photo%2F1.jpg');
      expect(url.hash).toBe('#preview');
      expect(url.searchParams.get('token')).toBe('a+b/=');
      expect(url.searchParams.getAll('tag')).toEqual(['a', 'b']);
      expect(url.searchParams.getAll('w')).toEqual(['640']);
      expect(url.searchParams.getAll('f')).toEqual(['webp']);
      expect(url.searchParams.get('src')).toBe('https://origin.example/a.jpg?x=1&y=2');
      expect(getImage({ src: result, width: 640, format: 'webp' }, config).url).toBe(result);
    }
  );

  it.each(['raw', 'image'])('joins relative file paths to a configured %s endpoint', (endpoint) => {
    const image = createImage({
      ...config,
      providerOptions: { bytescale: { baseURL: `https://assets.example.com/account/${endpoint}/external` } }
    });
    expect(image('photo.jpg?version=2', { width: 320, height: 180, quality: 72, format: 'jpeg' })).toBe(
      'https://assets.example.com/account/image/external/photo.jpg?version=2&f=jpg&h=180&q=72&w=320'
    );
  });

  it('supports setup and registry registration with full account paths', () => {
    const src = 'https://upcdn.io/another-account/raw/external/photo.jpg?auth=token';
    for (const providers of [{ bytescale: bytescaleSetup }, createBuiltInProviders()]) {
      expect(getImage({ src, width: 320 }, { provider: 'bytescale', providers }).url).toBe(
        'https://upcdn.io/another-account/image/external/photo.jpg?auth=token&w=320'
      );
    }
    const transformed = 'https://upcdn.io/account/image/folder/raw/photo.jpg?w=320&fit=max#preview';
    expect(getImage({ src: transformed }, config).url).toBe(transformed);
    expect(
      getImage({ src: '/account/raw/photo.jpg' }, { provider: 'bytescale', providers: { bytescale: bytescaleSetup } })
        .url
    ).toBe('/account/image/photo.jpg');
  });

  it.each([
    'https://upcdn.io/account/video/photo.jpg',
    'https://upcdn.io/account/raw/',
    'https://origin.example/photo.jpg',
    'https://origin.example/folder/nested/raw/photo.jpg'
  ])('rejects unsupported source paths: %s', (src) => {
    expect(() => getImage({ src, width: 320 }, config)).toThrow('[bytescale] Expected a Bytescale URL');
  });

  it.each([
    ['cover', 'crop'],
    ['contain', 'max'],
    ['inside', 'max'],
    ['outside', 'min'],
    ['fill', 'stretch'],
    ['scale-down', 'shrink'],
    ...['crop', 'max', 'min', 'stretch', 'shrink', 'shrink-cover', 'enlarge', 'enlarge-cover', 'width', 'height'].map(
      (fit) => [fit, fit]
    )
  ])('maps fit %s to %s', (fit, expected) => {
    const url = new URL(getImage({ src: '/photo.jpg?fit=stretch', width: 320, height: 180, fit }, config).url);
    expect(url.searchParams.getAll('fit')).toEqual([expected]);
  });

  it.each(['unknown', 'constructor', 'toString', ['crop'], { mode: 'crop' }, 42])(
    'rejects invalid fit values: %j',
    (fit) => {
      expect(() =>
        bytescaleSetup().getImage(
          '/photo.jpg',
          { ...providerOptions, modifiers: { fit: fit as ImageModifiers['fit'] } },
          localProviderContext
        )
      ).toThrow('[bytescale] Unsupported fit.');
    }
  );

  it.each(['jpeg', 'jpg', 'png', 'gif', 'webp', 'avif'])(
    'maps %s and removes conflicting format fallback',
    (format) => {
      const url = new URL(
        getImage({ src: '/photo.jpg?f=png&f2=jpeg', format, quality: 72, modifiers: { f2: 'png' } }, config).url
      );
      expect(url.searchParams.get('f')).toBe(format === 'jpeg' ? 'jpg' : format);
      expect(url.searchParams.get('q')).toBe('72');
      expect(url.searchParams.has('f2')).toBe(false);
    }
  );

  it.each(['auto', 'svg', 'meta', 'meta-out', ['webp'], 42])('rejects unsupported format aliases: %j', (f) => {
    expect(() =>
      bytescaleSetup().getImage('/photo.jpg', { ...providerOptions, modifiers: { f } }, localProviderContext)
    ).toThrow('[bytescale] Unsupported output format.');
  });

  it('maps format aliases and preserves native parameters without mutating modifiers', () => {
    const modifiers = { f: 'jpeg', crop: 'smart', 'crop-x': 0, sharpen: 0, strip: true };
    const url = bytescaleSetup().getImage(
      '/photo.jpg?version=2',
      { ...providerOptions, modifiers },
      localProviderContext
    ).url;
    expect(Object.fromEntries(new URL(url).searchParams)).toEqual({
      version: '2',
      crop: 'smart',
      'crop-x': '0',
      f: 'jpg',
      sharpen: '0',
      strip: 'true'
    });
    expect(modifiers).toEqual({ f: 'jpeg', crop: 'smart', 'crop-x': 0, sharpen: 0, strip: true });
  });

  it.each(['/document.pdf', '/document.pdf?bg-pdf=true'])(
    'preserves an explicit false PDF background modifier: %s',
    (src) => {
      const modifiers = Object.freeze({ 'bg-pdf': false });
      const url = new URL(getImage({ src, format: 'png', modifiers }, config).url);

      expect(url.searchParams.getAll('bg-pdf')).toEqual(['false']);
      expect(url.searchParams.get('f')).toBe('png');
      expect(modifiers['bg-pdf']).toBe(false);
    }
  );

  it('lets an ordinary image disable a forced background from its source URL', () => {
    const url = new URL(
      getImage({ src: '/photo.png?bg-force=true&version=2', format: 'webp', modifiers: { 'bg-force': false } }, config)
        .url
    );

    expect(url.searchParams.getAll('bg-force')).toEqual(['false']);
    expect(url.searchParams.get('version')).toBe('2');
    expect(url.searchParams.get('f')).toBe('webp');
  });

  it('preserves delivery context in responsive variants, placeholders, and picture sources', () => {
    const src = 'https://cdn.example.com/account/raw/external/photo.jpg?auth=public-token&version=2';
    const attrs = getImageAttrs(
      { src, width: 320, height: 180, fit: 'cover', format: 'png', densities: [1, 2], placeholder: true },
      config
    );
    const variants = attrs.srcset!.split(', ').map((candidate) => new URL(candidate.split(' ')[0]!));
    expect(variants.map((url) => url.searchParams.get('w'))).toEqual(['320', '640']);
    expect(variants.map((url) => url.searchParams.get('h'))).toEqual(['180', '360']);
    const placeholder = new URL(attrs.placeholderSrc!);
    expect(placeholder.searchParams.get('w')).toBe('10');
    for (const url of [...variants, placeholder]) {
      expect(url.origin).toBe('https://cdn.example.com');
      expect(url.pathname).toBe('/account/image/external/photo.jpg');
      expect(url.searchParams.get('auth')).toBe('public-token');
      expect(url.searchParams.get('version')).toBe('2');
      expect(url.searchParams.get('fit')).toBe('crop');
    }
    const picture = getPictureAttrs(
      { src: `${src}&f2=png`, width: 320, densities: [1], formats: ['avif', 'webp'], fallbackFormat: 'jpeg' },
      config
    );
    expect(picture.sources.map((source) => source.type)).toEqual(['image/avif', 'image/webp']);
    expect(picture.sources.map((source) => new URL(source.srcset.split(' ')[0]!).searchParams.get('f'))).toEqual([
      'avif',
      'webp'
    ]);
    expect(new URL(picture.img.src).searchParams.get('f')).toBe('jpg');
    expect(new URL(picture.img.src).searchParams.has('f2')).toBe(false);
  });
});
