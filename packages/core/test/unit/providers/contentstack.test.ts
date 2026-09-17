import { describe, expect, it } from 'vitest';
import {
  createImage,
  getImage,
  getImageAttrs,
  getPictureAttrs,
  type ImageConfig,
  type ModifierValue
} from '@src/index';
import { contentstackProvider, createBuiltInProviders, type ContentstackProviderOptions } from '@src/providers';
import contentstackSetup from '@src/providers/contentstack';
import { localProviderContext } from '../setup/shared';

const path = '/v3/assets/stack/asset/version/photo.jpg';
const providerOptions = {
  baseURL: 'https://images.contentstack.io',
  environment: 'production'
} satisfies ContentstackProviderOptions;
const config = {
  provider: 'contentstack',
  providers: { contentstack: contentstackProvider(providerOptions) }
} satisfies ImageConfig;

// Fixtures follow https://www.contentstack.com/docs/developers/apis/image-delivery-api.
// The pinned Nuxt Image version has no Contentstack provider to compare against.
describe('Contentstack provider', () => {
  it.each([
    'images.contentstack.io',
    'eu-images.contentstack.com',
    'au-images.contentstack.com',
    'azure-na-images.contentstack.com',
    'azure-eu-images.contentstack.com',
    'gcp-na-images.contentstack.com',
    'gcp-eu-images.contentstack.com',
    'assets.example.com'
  ])('preserves the %s delivery host and source environment', (host) => {
    const src = `https://${host}${path}?environment=staging&branch=preview&version=2`;
    const url = new URL(getImage({ src, width: 640 }, config).url);

    expect(url.hostname).toBe(host);
    expect(url.pathname).toBe(path);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      environment: 'staging',
      branch: 'preview',
      version: '2',
      width: '640'
    });
  });

  it('preserves encoded paths, repeated query parameters, and fragments while replacing transformations', () => {
    const src =
      'https://assets.example.com/v3/assets/stack/asset/caf%C3%A9%20photo%2F1.jpg?environment=preview&tag=a&tag=b&width=100&width=200&format=png&source=https%3A%2F%2Forigin.example%2Fa.jpg%3Fx%3D1%26y%3D2#preview';
    const result = getImage({ src, width: 640, format: 'webp' }, config);
    const url = new URL(result.url);

    expect(url.origin).toBe('https://assets.example.com');
    expect(url.pathname).toBe('/v3/assets/stack/asset/caf%C3%A9%20photo%2F1.jpg');
    expect(url.hash).toBe('#preview');
    expect(url.searchParams.get('environment')).toBe('preview');
    expect(url.searchParams.getAll('tag')).toEqual(['a', 'b']);
    expect(url.searchParams.getAll('width')).toEqual(['640']);
    expect(url.searchParams.getAll('format')).toEqual(['webp']);
    expect(url.searchParams.get('source')).toBe('https://origin.example/a.jpg?x=1&y=2');
    expect(getImage({ src: result.url, width: 640, format: 'webp' }, config).url).toBe(result.url);
  });

  it('joins relative sources to a configured regional base path', () => {
    const image = createImage({
      provider: 'contentstack',
      providers: {
        contentstack: contentstackProvider({
          baseURL: 'https://eu-images.contentstack.com/v3/assets/stack/',
          environment: 'preview'
        })
      }
    });
    expect(image('asset/version/photo.jpg?branch=development', { width: 320 })).toBe(
      'https://eu-images.contentstack.com/v3/assets/stack/asset/version/photo.jpg?branch=development&width=320&environment=preview'
    );
  });

  it('uses providerOptions over factory defaults and allows an explicit environment modifier', () => {
    const configured = { ...config, providerOptions: { contentstack: { environment: 'preview' } } };
    expect(new URL(getImage({ src: path }, configured).url).searchParams.get('environment')).toBe('preview');
    expect(
      new URL(
        getImage({ src: `${path}?environment=staging`, modifiers: { environment: 'development' } }, configured).url
      ).searchParams.get('environment')
    ).toBe('development');
  });

  it.each(['', '?environment=', '?environment=%20', '?environment=one&environment=two'])(
    'rejects missing or ambiguous environments: %s',
    (query) => {
      expect(() =>
        getImage(
          { src: `https://images.contentstack.io${path}${query}`, width: 320 },
          { provider: 'contentstack', providers: createBuiltInProviders() }
        )
      ).toThrow('[desource/image] [contentstack] An environment is required.');
    }
  );

  it('supports default setup and registry registration without changing an unmodified URL', () => {
    const src = `https://eu-images.contentstack.com${path}?environment=production&branch=preview#asset`;
    expect(getImage({ src }, { provider: 'contentstack', providers: { contentstack: contentstackSetup } }).url).toBe(
      src
    );
    expect(getImage({ src, width: 320 }, { provider: 'contentstack', providers: createBuiltInProviders() }).url).toBe(
      `https://eu-images.contentstack.com${path}?environment=production&branch=preview&width=320#asset`
    );
  });

  it.each([
    ['cover', 'crop'],
    ['contain', 'bounds'],
    ['crop', 'crop'],
    ['bounds', 'bounds']
  ])('maps fit %s to %s', (fit, expected) => {
    const url = new URL(getImage({ src: `${path}?fit=cover`, width: 320, height: 180, fit }, config).url);
    expect(url.searchParams.getAll('fit')).toEqual([expected]);
    expect(url.searchParams.get('width')).toBe('320');
    expect(url.searchParams.get('height')).toBe('180');
  });

  it.each(['fill', 'inside', 'outside', 'scale-down', 'unknown'])('rejects unsupported fit %s', (fit) => {
    expect(() => getImage({ src: path, fit }, config)).toThrow(`[contentstack] Unsupported fit "${fit}"`);
  });

  it.each(['jpeg', 'jpg', 'png', 'gif', 'webp', 'avif'])('maps %s output and quality', (format) => {
    const url = new URL(getImage({ src: path, format, quality: 72 }, config).url);
    expect(url.searchParams.get('format')).toBe(format === 'jpeg' ? 'jpg' : format);
    expect(url.searchParams.get('quality')).toBe('72');
  });

  it.each(['auto', 'svg', 'tiff', 'pjpg', 'webpll', 'webply'])('rejects unsupported format %s', (format) => {
    expect(() => getImage({ src: path, format }, config)).toThrow(`[contentstack] Unsupported format "${format}"`);
  });

  it.each<{ value: ModifierValue }>([{ value: ['webp'] }, { value: { format: 'webp' } }, { value: 42 }])(
    'rejects non-string format aliases $value',
    ({ value }) => {
      expect(() =>
        contentstackSetup().getImage(path, { ...providerOptions, modifiers: { f: value } }, localProviderContext)
      ).toThrow('[contentstack] Format must be a string.');
    }
  );

  it('maps the format alias without forwarding f and removes conflicting auto negotiation', () => {
    const result = contentstackSetup().getImage(
      `${path}?auto=avif`,
      { ...providerOptions, modifiers: { f: 'jpeg', auto: 'webp' } },
      localProviderContext
    );
    const query = new URL(result.url).searchParams;
    expect(query.get('format')).toBe('jpg');
    expect(query.has('f')).toBe(false);
    expect(query.has('auto')).toBe(false);
  });

  it('preserves native crop controls and negotiation when no explicit format is requested', () => {
    const modifiers = { crop: '100,80,x10,y20', disable: 'upscale', quality: 0, blur: 0 };
    const result = contentstackSetup().getImage(
      `${path}?auto=webp&trim=10`,
      { ...providerOptions, modifiers },
      localProviderContext
    );
    expect(Object.fromEntries(new URL(result.url).searchParams)).toEqual({
      auto: 'webp',
      trim: '10',
      crop: '100,80,x10,y20',
      disable: 'upscale',
      quality: '0',
      blur: '0',
      environment: 'production'
    });
    expect(modifiers).toEqual({ crop: '100,80,x10,y20', disable: 'upscale', quality: 0, blur: 0 });
  });

  it('keeps delivery context in responsive variants and placeholders', () => {
    const attrs = getImageAttrs(
      {
        src: `${path}?environment=preview&branch=development`,
        width: 320,
        height: 180,
        fit: 'cover',
        format: 'webp',
        densities: [1, 2],
        placeholder: true
      },
      config
    );
    expect(attrs.srcset).toBe(
      `https://images.contentstack.io${path}?environment=preview&branch=development&fit=crop&format=webp&height=180&width=320 1x, https://images.contentstack.io${path}?environment=preview&branch=development&fit=crop&format=webp&height=360&width=640 2x`
    );
    const placeholder = new URL(attrs.placeholderSrc!);
    expect(placeholder.searchParams.get('width')).toBe('10');
    expect(placeholder.searchParams.get('environment')).toBe('preview');
    expect(placeholder.searchParams.get('branch')).toBe('development');
  });

  it('generates explicit picture formats without conflicting negotiation or misleading MIME types', () => {
    const picture = getPictureAttrs(
      {
        src: `${path}?auto=webp`,
        width: 320,
        densities: [1],
        formats: ['avif', 'webp'],
        fallbackFormat: 'jpeg'
      },
      config
    );
    expect(picture.sources).toEqual([
      {
        type: 'image/avif',
        srcset: `https://images.contentstack.io${path}?format=avif&width=320&environment=production 1x`,
        sizes: undefined
      },
      {
        type: 'image/webp',
        srcset: `https://images.contentstack.io${path}?format=webp&width=320&environment=production 1x`,
        sizes: undefined
      }
    ]);
    expect(new URL(picture.img.src).searchParams.get('format')).toBe('jpg');
    expect(new URL(picture.img.src).searchParams.has('auto')).toBe(false);
    expect(() => getPictureAttrs({ src: path, formats: ['pjpg'] }, config)).toThrow(/Unsupported format "pjpg"/);
  });
});
