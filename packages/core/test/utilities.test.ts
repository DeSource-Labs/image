import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  appendProviderModifiers,
  appendQuery,
  checkDensities,
  clampQuality,
  cleanColor,
  configureProvider,
  createMappedQueryProvider,
  createMapper,
  createOperationsGenerator,
  defineProvider,
  encodeRemoteOrPath,
  isDataSource,
  isDefinedProvider,
  isDevelopment,
  isLocalSource,
  isRemoteSource,
  isResolvedImageConfig,
  isTransformable,
  joinURL,
  joinURLParts,
  mappedModifiers,
  mappedQueryURL,
  mergeClassNames,
  mergeModifiers,
  mimeForFormat,
  normalizeCrossorigin,
  normalizeFormat,
  normalizeImageSource,
  parseSize,
  pathOperations,
  providerBaseURL,
  resolveAlias,
  resolveImageConfig,
  resolveProviderRegistration,
  sourcePath,
  sourceWithBase,
  stableModifiers,
  stripLeadingSlash,
  stripUndefined,
  styleWithPlaceholder,
  toNumber,
  uniqueSorted,
  validateSource,
  withStandardParams,
  type ImageProviderInput,
  type ResolvedImageConfig
} from '@desource/image';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('framework kit utilities', () => {
  it('recognizes only fully resolved image configurations', () => {
    const resolved = resolveImageConfig();
    expect(isResolvedImageConfig(resolved)).toBe(true);

    for (const key of ['provider', 'densities', 'providerSizes', 'screens', 'providers', 'providerOptions'] as const) {
      const candidate = { ...resolved } as Record<string, unknown>;
      delete candidate[key];
      expect(isResolvedImageConfig(candidate)).toBe(false);
    }
    expect(isResolvedImageConfig({ ...resolved, screens: undefined })).toBe(false);
  });

  it('normalizes attributes without dropping intentional falsy values', () => {
    expect(stripUndefined({ empty: '', false: false, nil: null, one: 1, missing: undefined })).toEqual({
      empty: '',
      false: false,
      nil: null,
      one: 1
    });
    expect([true, '', 'true', 'anonymous'].map(normalizeCrossorigin)).toEqual([
      'anonymous',
      'anonymous',
      'anonymous',
      'anonymous'
    ]);
    expect(normalizeCrossorigin('use-credentials')).toBe('use-credentials');
    expect(normalizeCrossorigin(false)).toBeUndefined();
  });

  it('merges nested class values and placeholder styles deterministically', () => {
    expect(
      mergeClassNames('hero', 2, 3n, ['responsive', [false, 'loaded']], { visible: true, hidden: false }, null)
    ).toBe('hero 2 3 responsive loaded visible');
    expect(mergeClassNames(false, undefined, '')).toBeUndefined();
    expect(styleWithPlaceholder('display:block', '/image"preview.jpg', false)).toBe(
      'display:block;background-image:url("/image%22preview.jpg");background-size:cover;background-position:center'
    );
    expect(styleWithPlaceholder(null, '/preview.jpg', true)).toBeUndefined();
    expect(styleWithPlaceholder('display:block', undefined, false)).toBe('display:block');
  });
});

describe('source normalization and validation', () => {
  const config = (overrides: Partial<ResolvedImageConfig> = {}) => ({
    ...resolveImageConfig(),
    ...overrides
  });

  it('normalizes paths while preserving URL and opaque source forms', () => {
    expect(normalizeImageSource('photo.jpg')).toBe('/photo.jpg');
    expect(normalizeImageSource('photo.jpg', true)).toBe('photo.jpg');
    expect(normalizeImageSource('cms:asset-id')).toBe('cms:asset-id');
    expect(normalizeImageSource('')).toBe('');
    expect(normalizeImageSource('/photo.jpg')).toBe('/photo.jpg');
    expect(normalizeImageSource('//cdn.example/photo.jpg')).toBe('//cdn.example/photo.jpg');
    expect(normalizeImageSource('https://cdn.example/photo.jpg')).toBe('https://cdn.example/photo.jpg');
    expect(normalizeImageSource('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
  });

  it('resolves exact and nested aliases without partial matches', () => {
    expect(resolveAlias('/cdn', { '/cdn/': 'https://images.example.com/root/' })).toBe(
      'https://images.example.com/root/'
    );
    expect(resolveAlias('/cdn/folder/photo.jpg', { cdn: 'https://images.example.com/root/' })).toBe(
      'https://images.example.com/root/folder/photo.jpg'
    );
    expect(resolveAlias('/cdn-other/photo.jpg', { cdn: 'https://images.example.com' })).toBe('/cdn-other/photo.jpg');
  });

  it('validates local patterns including single and recursive wildcards', () => {
    expect(validateSource('', config())).toEqual({ valid: false, reason: 'Image source is empty.' });
    expect(validateSource('data:image/png;base64,abc', config())).toEqual({ valid: true });
    expect(validateSource('/public/photo.jpg', config())).toEqual({ valid: true });

    const restricted = config({ localPatterns: [{ pathname: '/img/*' }, { pathname: '/media/**' }] });
    expect(validateSource('/img/photo.jpg', restricted).valid).toBe(true);
    expect(validateSource('/img/nested/photo.jpg', restricted).valid).toBe(false);
    expect(validateSource('/media/nested/photo.jpg', restricted).valid).toBe(true);
    expect(validateSource('/private/photo.jpg', restricted).reason).toContain('localPatterns');
  });

  it('validates remote domains and every remote-pattern constraint', () => {
    expect(validateSource('https://images.example.com/photo.jpg', config()).valid).toBe(true);
    expect(
      validateSource('https://images.example.com/photo.jpg', config({ domains: ['images.example.com'] })).valid
    ).toBe(true);

    const restricted = config({
      domains: [],
      remotePatterns: [
        {
          protocol: 'https:',
          hostname: '*.example.com',
          port: '8443',
          pathname: '/account/**',
          search: '?v=1'
        }
      ]
    });
    expect(validateSource('https://cdn.example.com:8443/account/a/photo.jpg?v=1', restricted).valid).toBe(true);
    expect(validateSource('http://cdn.example.com:8443/account/a/photo.jpg?v=1', restricted).valid).toBe(false);
    expect(validateSource('https://other.test:8443/account/a/photo.jpg?v=1', restricted).valid).toBe(false);
    expect(validateSource('https://cdn.example.com/account/a/photo.jpg?v=1', restricted).valid).toBe(false);
    expect(validateSource('https://cdn.example.com:8443/private/photo.jpg?v=1', restricted).valid).toBe(false);
    expect(validateSource('https://cdn.example.com:8443/account/photo.jpg?v=2', restricted).valid).toBe(false);
    expect(validateSource('http://%', restricted).reason).toContain('not a valid URL');
    expect(validateSource('relative/photo.jpg', restricted).reason).toContain('must be an absolute local path');
  });
});

describe('generic value and URL utilities', () => {
  it('maps operation keys and values with object and function mappers', () => {
    const mapper = createMapper({ cover: 'crop', missingValue: 'fallback' });
    expect(mapper('cover')).toBe('crop');
    expect(mapper('unknown' as 'cover')).toBe('unknown');
    expect(mapper()).toBe('fallback');

    const query = createOperationsGenerator({
      keyMap: { width: 'w', fit: 'mode', skip: 'x' },
      valueMap: {
        fit: { cover: 'crop' },
        skip: () => undefined
      }
    });
    expect(query({ width: 320, fit: 'cover', skip: true, height: undefined })).toBe('w=320&mode=crop');

    const path = createOperationsGenerator({
      keyMap: (key: string) => key.toUpperCase(),
      valueMap: { quality: (value: number) => Math.round(value) },
      formatter: (key, value) => `${key}_${value}`,
      joinWith: ','
    });
    expect(path({ quality: 72.6, width: 640 })).toBe('QUALITY_73,WIDTH_640');
  });

  it('parses, clamps, sorts, and merges image values', () => {
    expect(toNumber(12)).toBe(12);
    expect(toNumber(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(toNumber(' 12.5 ')).toBe(12.5);
    expect(toNumber('')).toBeUndefined();
    expect(toNumber('nope')).toBeUndefined();
    expect(toNumber(null)).toBeUndefined();

    expect(parseSize(320)).toBe(320);
    expect(parseSize(Number.NaN)).toBeUndefined();
    expect(parseSize(' 640px ')).toBe(640);
    expect(parseSize('50vw')).toBeUndefined();
    expect(parseSize(null)).toBeUndefined();
    expect(clampQuality('101')).toBe(100);
    expect(clampQuality(0)).toBe(1);
    expect(clampQuality(50.6)).toBe(51);
    expect(clampQuality('invalid')).toBeUndefined();
    expect(uniqueSorted([640, 320.4, 640, -1, Number.NaN, 0])).toEqual([320, 640]);
    expect(mergeModifiers({ width: 320 }, undefined, { width: 640, format: 'webp' })).toEqual({
      width: 640,
      format: 'webp'
    });
  });

  it('warns about excessive densities and rejects empty density lists', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    checkDensities([1, 2]);
    expect(warn).not.toHaveBeenCalled();
    checkDensities([1, 3]);
    expect(warn).toHaveBeenCalledOnce();
    expect(() => checkDensities([])).toThrow(/must not be empty/);
  });

  it('builds URLs and stable modifier lists', () => {
    expect(joinURL('', '/photo.jpg')).toBe('/photo.jpg');
    expect(joinURL('/base', '')).toBe('/base');
    expect(joinURL('/base/', '/photo.jpg')).toBe('/base/photo.jpg');
    expect(appendQuery('/photo.jpg', {})).toBe('/photo.jpg');
    expect(appendQuery('/photo.jpg?token=1', { width: 320, empty: '', off: false })).toBe(
      '/photo.jpg?token=1&width=320'
    );
    expect(appendQuery('/photo.jpg', { 'crop mode': 'top left' })).toBe('/photo.jpg?crop%20mode=top%20left');
    expect(stableModifiers(undefined)).toEqual([]);
    expect(stableModifiers({ z: 1, a: 'yes', empty: '', no: false, nil: null })).toEqual([
      ['a', 'yes'],
      ['z', 1]
    ]);
  });

  it('classifies sources and formats', () => {
    expect(isRemoteSource('HTTPS://example.com/photo.jpg')).toBe(true);
    expect(isRemoteSource('/photo.jpg')).toBe(false);
    expect(isDataSource('blob:https://example.com/id')).toBe(true);
    expect(isDataSource('/photo.jpg')).toBe(false);
    expect(isLocalSource('/photo.jpg')).toBe(true);
    expect(isLocalSource('//example.com/photo.jpg')).toBe(false);
    expect(stripLeadingSlash('///photo.jpg')).toBe('photo.jpg');
    expect(normalizeFormat('jpg')).toBe('jpeg');
    expect(normalizeFormat('webp')).toBe('webp');
    expect(normalizeFormat(undefined)).toBeUndefined();
    expect(mimeForFormat('jpg')).toBe('image/jpeg');
    expect(encodeRemoteOrPath('https://example.com/a b.jpg')).toBe('https%3A%2F%2Fexample.com%2Fa%20b.jpg');
    expect(encodeRemoteOrPath('/a b.jpg')).toBe('/a b.jpg');
    vi.stubEnv('NODE_ENV', 'development');
    expect(isDevelopment()).toBe(true);
  });
});

describe('provider-authoring utilities', () => {
  const input = (overrides: Partial<ImageProviderInput> = {}): ImageProviderInput => ({
    src: '/photo.jpg',
    width: 640,
    height: 360,
    quality: 75,
    format: 'jpg',
    modifiers: { fit: 'cover', custom: 'yes' },
    ...overrides
  });

  it('detects transformations and adds standard parameters', () => {
    expect(isTransformable(input())).toBe(true);
    expect(
      isTransformable(
        input({ width: undefined, height: undefined, quality: undefined, format: undefined, modifiers: {} })
      )
    ).toBe(false);
    expect(
      isTransformable(
        input({ width: undefined, height: undefined, quality: undefined, format: undefined, modifiers: { blur: 2 } })
      )
    ).toBe(true);
    expect(withStandardParams(input(), { fit: 'crop' })).toEqual({
      fit: 'crop',
      w: 640,
      h: 360,
      q: 75,
      f: 'jpeg'
    });
    expect(appendProviderModifiers({ width: 640 }, { width: 320, fit: 'cover' }, ['width'])).toEqual({
      width: 640,
      fit: 'cover'
    });
  });

  it('handles provider base URLs and source paths', () => {
    expect(providerBaseURL({ baseURL: '/custom' }, { baseURL: '/default' })).toBe('/custom');
    expect(providerBaseURL(undefined, { baseURL: '/default' })).toBe('/default');
    expect(providerBaseURL(undefined, {})).toBe('');
    expect(sourceWithBase('/photo.jpg', 'https://cdn.example.com/base')).toBe('https://cdn.example.com/base/photo.jpg');
    expect(sourceWithBase('https://source.example/photo.jpg', 'https://cdn.example.com')).toBe(
      'https://source.example/photo.jpg'
    );
    expect(sourceWithBase('/photo.jpg')).toBe('/photo.jpg');
    expect(joinURLParts(undefined, '', '/account/', 42, null, 'photo.jpg')).toBe('/account/42/photo.jpg');
    expect(joinURLParts(undefined, null, '')).toBe('');
    expect(sourcePath('https://example.com/folder/photo.jpg?x=1')).toBe('/folder/photo.jpg');
    expect(sourcePath('not a URL')).toBe('not a URL');
  });

  it('maps modifiers into query and path provider conventions', () => {
    const keyMap = { width: 'w', height: 'h', quality: 'q', format: 'fm', fit: 'mode' };
    const valueMap = {
      format: { jpeg: 'jpg' },
      fit: (value: string | number | boolean | bigint) => (value === 'cover' ? 'crop' : value)
    };
    expect(mappedModifiers(input(), keyMap, valueMap, ['custom'])).toEqual({
      mode: 'crop',
      fm: 'jpg',
      h: 360,
      q: 75,
      w: 640
    });
    expect(
      mappedQueryURL(input(), { baseURL: 'https://cdn.example.com', defaultParams: { token: 'abc' } }, keyMap, valueMap)
    ).toBe('https://cdn.example.com/photo.jpg?token=abc&custom=yes&mode=crop&fm=jpg&h=360&q=75&w=640');
    expect(pathOperations(input(), keyMap, valueMap)).toBe('custom_yes,fm_jpg,h_360,mode_crop,q_75,w_640');
    expect(pathOperations(input(), keyMap, valueMap, (key, value) => `${key}:${value}`, '/')).toContain('mode:crop');
    expect(cleanColor('#00ff88')).toBe('00ff88');
    expect(cleanColor('transparent')).toBe('transparent');
    expect(cleanColor(123)).toBe(123);
  });

  it('creates configurable query providers', () => {
    const provider = createMappedQueryProvider(
      'example',
      { baseURL: 'https://cdn.example.com', defaultParams: { token: 'default' } },
      { width: 'w' }
    );
    expect(
      provider.getImage(
        input({ width: undefined, height: undefined, quality: undefined, format: undefined, modifiers: {} })
      )
    ).toEqual({
      url: 'https://cdn.example.com/photo.jpg?token=default',
      isOptimized: false
    });
    expect(
      provider.getImage(input({ height: undefined, quality: undefined, format: undefined, modifiers: {} }), {
        baseURL: 'https://other.example',
        defaultParams: { token: 'custom' }
      })
    ).toEqual({ url: 'https://other.example/photo.jpg?token=custom&w=640', isOptimized: true });
  });

  it('memoizes, configures, identifies, and resolves defined providers', () => {
    const factory = vi.fn(() => ({
      defaults: { baseURL: '/default', nested: { fromSetup: true } },
      getImage: (src: string) => ({ url: src })
    }));
    const setup = defineProvider(factory);
    expect(setup()).toBe(setup());
    expect(factory).toHaveBeenCalledOnce();
    expect(isDefinedProvider(setup())).toBe(true);

    const configured = configureProvider(setup, { baseURL: '/configured' }, 'configured', {
      acceptsOpaqueSource: true
    });
    expect(configured.name).toBe('configured');
    expect(configured.defaults).toEqual({
      baseURL: '/configured',
      nested: { fromSetup: true }
    });
    expect(configured.acceptsOpaqueSource).toBe(true);
    expect(isDefinedProvider(configured)).toBe(true);

    const plain = { name: 'plain', getImage: (providerInput: ImageProviderInput) => ({ url: providerInput.src }) };
    expect(isDefinedProvider(plain)).toBe(false);
    expect(resolveProviderRegistration(plain)).toBe(plain);
    expect(resolveProviderRegistration(() => plain)).toBe(plain);

    const objectSetup = defineProvider({ getImage: (src: string) => ({ url: src }) });
    expect(objectSetup().getImage('/photo.jpg', {}, { options: resolveImageConfig(), $img: () => '' }).url).toBe(
      '/photo.jpg'
    );
  });
});
