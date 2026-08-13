import { describe, expect, it, vi } from 'vitest';
import {
  appendQuery,
  checkDensities,
  clampQuality,
  createMapper,
  createOperationsGenerator,
  encodeRemoteOrPath,
  isDataSource,
  isDevelopment,
  isLocalSource,
  isRemoteSource,
  joinURL,
  mergeModifiers,
  mimeForFormat,
  normalizeFormat,
  parseSize,
  stableModifiers,
  stripLeadingSlash,
  toNumber,
  uniqueSorted
} from '../src/index';

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

    const path = createOperationsGenerator<
      'quality' | 'width',
      string | number | boolean,
      string,
      string | number | boolean
    >({
      keyMap: (key) => key?.toUpperCase(),
      valueMap: { quality: (value) => (typeof value === 'number' ? Math.round(value) : value) },
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
