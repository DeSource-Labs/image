import { describe, expect, it, vi } from 'vitest';
import {
  appendProviderModifiers,
  cleanColor,
  configureProvider,
  createImage,
  createMappedQueryProvider,
  defineProvider,
  isTransformable,
  joinURLParts,
  mappedModifiers,
  mappedQueryURL,
  pathOperations,
  providerBaseURL,
  resolveImageConfig,
  resolveProviderRegistration,
  sourcePath,
  sourceWithBase,
  withStandardParams,
  type ImageProviderInput,
  type ModifierValueMap
} from '../src/index';

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
      fit: (value) => (value === 'cover' ? 'crop' : value)
    } satisfies ModifierValueMap;
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
    const resolvedConfig = resolveImageConfig();
    const providerContext = { options: resolvedConfig, $img: createImage(resolvedConfig) };
    expect(provider.getImage('/photo.jpg', { modifiers: {} }, providerContext)).toEqual({
      url: 'https://cdn.example.com/photo.jpg?token=default',
      isOptimized: false
    });
    expect(
      provider.getImage(
        '/photo.jpg',
        {
          modifiers: { width: 640 },
          baseURL: 'https://other.example',
          defaultParams: { token: 'custom' }
        },
        providerContext
      )
    ).toEqual({ url: 'https://other.example/photo.jpg?token=custom&w=640', isOptimized: true });
  });

  it('memoizes, configures, and resolves providers', () => {
    const factory = vi.fn(() => ({
      defaults: { baseURL: '/default', nested: { fromSetup: true } },
      getImage: (src: string) => ({ url: src })
    }));
    const setup = defineProvider(factory);
    expect(setup()).toBe(setup());
    expect(factory).toHaveBeenCalledOnce();

    const configured = configureProvider(setup, { baseURL: '/configured' }, 'configured', {
      acceptsOpaqueSource: true
    });
    expect(configured.name).toBe('configured');
    expect(configured.defaults).toEqual({
      baseURL: '/configured',
      nested: { fromSetup: true }
    });
    expect(configured.acceptsOpaqueSource).toBe(true);

    const plain = { name: 'plain', getImage: (src: string) => ({ url: src }) };
    expect(resolveProviderRegistration(plain)).toBe(plain);
    expect(resolveProviderRegistration(() => plain)).toBe(plain);

    const objectSetup = defineProvider({ getImage: (src: string) => ({ url: src }) });
    const resolvedConfig = resolveImageConfig();
    const providerContext = { options: resolvedConfig, $img: createImage(resolvedConfig) };
    expect(objectSetup().getImage('/photo.jpg', { modifiers: {} }, providerContext).url).toBe('/photo.jpg');
  });
});
