import { describe, expect, it } from 'vitest';
import {
  createImage,
  getImage,
  getImageAttrs,
  getPictureAttrs,
  type ImageConfig,
  type ModifierValue
} from '@src/index';
import { appwriteProvider, createBuiltInProviders, type AppwriteProviderOptions } from '@src/providers';
import appwriteSetup from '@src/providers/appwrite';
import { localProviderContext } from '../setup/shared';

const path = '/v1/storage/buckets/photos/files/hero';
const options = {
  baseURL: 'https://fra.cloud.appwrite.io',
  projectId: 'default-project'
} satisfies AppwriteProviderOptions;
const config = {
  provider: 'appwrite',
  providers: { appwrite: appwriteProvider(options) }
} satisfies ImageConfig;

// Fixtures follow https://appwrite.io/docs/products/storage/images.
// The pinned Nuxt Image version does not include an Appwrite provider.
describe('Appwrite provider', () => {
  it.each([
    ['view', 'https://storage.example.com/v1'],
    ['preview', 'https://storage.example.com/v1'],
    ['view', ''],
    ['preview', '']
  ])('preserves protocol-relative %s URLs with baseURL "%s"', (endpoint, baseURL) => {
    const src = `//fra.cloud.appwrite.io:8443${path}/${endpoint}?project=source&token=a%2Bb%2Fc%3D&width=100#asset`;
    const configured = {
      provider: 'appwrite',
      providers: { appwrite: appwriteProvider({ baseURL, projectId: 'fallback' }) }
    };
    const result = getImage({ src, width: 640, format: 'webp' }, configured);
    const url = new URL(result.url, 'https://app.example.com');

    expect(result.url.startsWith('//fra.cloud.appwrite.io:8443/')).toBe(true);
    expect(url.origin).toBe('https://fra.cloud.appwrite.io:8443');
    expect(url.pathname).toBe(`${path}/preview`);
    expect(url.hash).toBe('#asset');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      project: 'source',
      token: 'a+b/c=',
      width: '640',
      output: 'webp'
    });
    expect(getImage({ src: result.url, width: 640, format: 'webp' }, configured).url).toBe(result.url);
  });

  it.each(['cloud.appwrite.io', 'fra.cloud.appwrite.io', 'storage.example.com'])(
    'normalizes view URLs on %s without changing the bucket or file',
    (host) => {
      const url = new URL(
        getImage({ src: `https://${host}${path}/view?project=source-project`, width: 640, height: 360 }, config).url
      );
      expect(url.origin).toBe(`https://${host}`);
      expect(url.pathname).toBe(`${path}/preview`);
      expect(Object.fromEntries(url.searchParams)).toEqual({ project: 'source-project', width: '640', height: '360' });
    }
  );

  it.each(['view', 'preview', 'view/', 'preview/'])(
    'preserves access parameters, encoded identity, repeated parameters, and fragments for %s',
    (endpoint) => {
      const encodedPath = '/proxy/v1/storage/buckets/photo%2Dbucket/files/hero%2Ejpg';
      const src = `https://storage.example.com${encodedPath}/${endpoint}?project=production&token=a%2Bb%2Fc%3D&impersonateuserid=user-1&tag=a&tag=b&width=100&width=200&output=png#asset`;
      const result = getImage({ src, width: 640, format: 'webp' }, config);
      const url = new URL(result.url);
      expect(url.pathname).toBe(`${encodedPath}/preview`);
      expect(url.hash).toBe('#asset');
      expect(url.searchParams.get('project')).toBe('production');
      expect(url.searchParams.get('token')).toBe('a+b/c=');
      expect(url.searchParams.get('impersonateuserid')).toBe('user-1');
      expect(url.searchParams.getAll('tag')).toEqual(['a', 'b']);
      expect(url.searchParams.getAll('width')).toEqual(['640']);
      expect(url.searchParams.getAll('output')).toEqual(['webp']);
      expect(url.searchParams.has('format')).toBe(false);
      expect(getImage({ src: result.url, width: 640, format: 'webp' }, config).url).toBe(result.url);
    }
  );

  it('joins relative sources to a configured API endpoint and uses projectId as a fallback', () => {
    const image = createImage({
      provider: 'appwrite',
      providers: { appwrite: appwriteProvider({ baseURL: 'https://storage.example.com/api/v1', projectId: 'project' }) }
    });
    const url = new URL(image('storage/buckets/photos/files/hero/view', { width: 320 }));
    expect(url.pathname).toBe('/api/v1/storage/buckets/photos/files/hero/preview');
    expect(url.searchParams.get('project')).toBe('project');
    expect(url.searchParams.get('width')).toBe('320');
  });

  it('supports same-origin paths, configured project overrides, and explicit project modifiers', () => {
    const configured = {
      ...config,
      providerOptions: { appwrite: { baseURL: '', projectId: 'configured' } }
    };
    expect(getImage({ src: `${path}/view` }, configured).url).toBe(`${path}/preview?project=configured`);
    const url = getImage({ src: `${path}/preview?project=source`, modifiers: { project: 'explicit' } }, configured).url;
    expect(url).toBe(`${path}/preview?project=explicit`);
  });

  it('supports registry and default setup registration', () => {
    const src = `https://fra.cloud.appwrite.io${path}/preview?project=project&token=token`;
    for (const providers of [createBuiltInProviders(), { appwrite: appwriteSetup }]) {
      expect(getImage({ src }, { provider: 'appwrite', providers }).url).toBe(src);
    }
  });

  it.each(['', '?project=', '?project=%20', '?project=one&project=two'])(
    'rejects missing or ambiguous project parameters: %s',
    (query) => {
      expect(() =>
        getImage({ src: `${path}/view${query}` }, { provider: 'appwrite', providers: createBuiltInProviders() })
      ).toThrow('[appwrite] A project is required.');
    }
  );

  it.each([
    '/photo.jpg',
    `${path}/download`,
    `${path}/view/extra`,
    '/v1/storage/buckets//files/hero/view',
    '/v1/storage/buckets/photos/files//view',
    '/unrelated/view?redirect=/storage/buckets/photos/files/hero/view'
  ])('rejects unsupported Storage paths: %s', (src) => {
    expect(() => getImage({ src, width: 320 }, config)).toThrow('[appwrite] Expected a Storage file URL');
  });

  it.each(['jpeg', 'jpg', 'png', 'gif', 'webp', 'avif', 'heic'])('maps %s to output and quality directly', (format) => {
    const url = new URL(getImage({ src: `${path}/view`, format, quality: 72 }, config).url);
    expect(url.searchParams.get('output')).toBe(format === 'jpeg' ? 'jpg' : format);
    expect(url.searchParams.get('quality')).toBe('72');
    expect(url.searchParams.has('format')).toBe(false);
  });

  it('lets explicit format win over native output and maps the f alias in direct provider calls', () => {
    const result = appwriteSetup().getImage(
      `${path}/view?output=png`,
      { ...options, modifiers: { f: 'jpeg', output: 'gif', quality: 0, gravity: 'top', borderWidth: 2 } },
      localProviderContext
    );
    expect(Object.fromEntries(new URL(result.url).searchParams)).toEqual({
      output: 'jpg',
      quality: '0',
      gravity: 'top',
      borderWidth: '2',
      project: 'default-project'
    });
    const url = new URL(getImage({ src: `${path}/preview`, format: 'webp', modifiers: { output: 'png' } }, config).url);
    expect(url.searchParams.get('output')).toBe('webp');
  });

  it.each(['auto', 'svg', 'tiff', 'jxl'])('rejects unsupported output %s from modifiers or source URLs', (format) => {
    expect(() => getImage({ src: `${path}/view`, format }, config)).toThrow('[appwrite] Unsupported output format.');
    expect(() => getImage({ src: `${path}/preview?output=${format}` }, config)).toThrow(
      '[appwrite] Unsupported output format.'
    );
  });

  it.each<ModifierValue>([42, ['webp'], { format: 'webp' }])('rejects non-string output: %j', (output) => {
    expect(() => getImage({ src: `${path}/view`, modifiers: { output } }, config)).toThrow(
      '[appwrite] Unsupported output format.'
    );
  });

  it.each(['width', 'height'] as const)('accepts %s boundaries without clamping', (dimension) => {
    for (const value of [0, 1, 4000]) {
      const url = new URL(getImage({ src: `${path}/view`, [dimension]: value }, config).url);
      expect(url.searchParams.get(dimension)).toBe(String(value));
      const sourceUrl = new URL(getImage({ src: `${path}/preview?${dimension}=${value}` }, config).url);
      expect(sourceUrl.searchParams.get(dimension)).toBe(String(value));
    }
  });

  it.each(['width', 'height'] as const)('rejects invalid %s modifiers and source dimensions', (dimension) => {
    for (const value of [-1, 4001, 0.5, 1.5]) {
      expect(() => getImage({ src: `${path}/view`, [dimension]: value }, config)).toThrow(
        `[appwrite] ${dimension} must be an integer between 0 and 4000.`
      );
    }
    for (const value of ['', '-1', '4001', 'NaN', 'Infinity', 'false', '320px', '0.5', `1&${dimension}=2`]) {
      expect(() => getImage({ src: `${path}/preview?${dimension}=${value}` }, config)).toThrow(RangeError);
    }
    for (const value of [NaN, Infinity, ['320'], { size: 320 }]) {
      expect(() =>
        appwriteSetup().getImage(
          `${path}/view`,
          { ...options, modifiers: { [dimension]: value } },
          localProviderContext
        )
      ).toThrow(RangeError);
    }
  });

  it('replaces invalid source dimensions with valid requested dimensions', () => {
    const url = new URL(getImage({ src: `${path}/preview?width=5000&height=-1`, width: 320, height: 180 }, config).url);
    expect(url.searchParams.get('width')).toBe('320');
    expect(url.searchParams.get('height')).toBe('180');
  });

  it('rejects unsupported fit instead of promising an unavailable resize mode', () => {
    expect(() => getImage({ src: `${path}/view`, fit: 'contain' }, config)).toThrow(
      '[appwrite] The fit modifier is not supported.'
    );
  });

  it('preserves access parameters in responsive variants and resized placeholders', () => {
    const src = `${path}/view?project=source&token=access`;
    const attrs = getImageAttrs(
      { src, width: 320, height: 180, format: 'webp', densities: [1, 2], placeholder: true },
      config
    );
    const candidates = attrs.srcset!.split(', ').map((entry) => entry.split(' '));
    expect(candidates.map(([, density]) => density)).toEqual(['1x', '2x']);
    for (const [index, [candidate]] of candidates.entries()) {
      const url = new URL(candidate!);
      expect(url.pathname).toBe(`${path}/preview`);
      expect(url.searchParams.get('project')).toBe('source');
      expect(url.searchParams.get('token')).toBe('access');
      expect(url.searchParams.get('width')).toBe(String(320 * (index + 1)));
      expect(url.searchParams.get('height')).toBe(String(180 * (index + 1)));
    }
    const placeholder = new URL(attrs.placeholderSrc!);
    expect(placeholder.searchParams.get('width')).toBe('10');
    expect(placeholder.searchParams.get('project')).toBe('source');
    expect(placeholder.searchParams.get('token')).toBe('access');
    expect(placeholder.searchParams.has('blur')).toBe(false);
  });

  it('rejects responsive candidates exceeding either dimension limit without mislabeling their size', () => {
    expect(() => getImageAttrs({ src: `${path}/view`, width: 2001, densities: [1, 2] }, config)).toThrow(RangeError);
    expect(() => getImageAttrs({ src: `${path}/view`, width: 1000, height: 2001, densities: [1, 2] }, config)).toThrow(
      RangeError
    );
    expect(() => getImageAttrs({ src: `${path}/view`, sizes: '4001px', densities: [1] }, config)).toThrow(RangeError);
  });

  it('generates picture MIME types matching explicit output formats', () => {
    const picture = getPictureAttrs(
      { src: `${path}/view?output=png`, width: 320, densities: [1], formats: ['avif', 'webp'], fallbackFormat: 'jpeg' },
      config
    );
    expect(picture.sources.map((source) => source.type)).toEqual(['image/avif', 'image/webp']);
    expect(picture.sources.map((source) => new URL(source.srcset.split(' ')[0]!).searchParams.get('output'))).toEqual([
      'avif',
      'webp'
    ]);
    expect(new URL(picture.img.src).searchParams.get('output')).toBe('jpg');
  });
});
