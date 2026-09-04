import { describe, expect, it } from 'vitest';
import { resolveImageConfig } from '@src/index';
import {
  escapeCssSelectorValue,
  isPathUnderBasePath,
  isResolvedImageConfig,
  mergeClassNames,
  normalizeBasePath,
  normalizeCrossorigin,
  parseRequestPath,
  stringifyModifierValue,
  stripLeadingSlashes,
  stripTrailingSlashes,
  stripUndefined,
  styleWithPlaceholder,
  trimSlashes
} from '@src/kit';

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

  it('normalizes shared server paths without regex-heavy local copies', () => {
    expect(stripLeadingSlashes('///photo.jpg')).toBe('photo.jpg');
    expect(stripTrailingSlashes('/assets///')).toBe('/assets');
    expect(trimSlashes('///assets///')).toBe('assets');
    expect(normalizeBasePath('images///')).toBe('/images');
    expect(normalizeBasePath('/')).toBe('/_ipx');
    expect(isPathUnderBasePath('/_ipx', '/_ipx')).toBe(true);
    expect(isPathUnderBasePath('/_ipx/w_320/photo.jpg', '/_ipx')).toBe(true);
    expect(isPathUnderBasePath('/_ipx-other/photo.jpg', '/_ipx')).toBe(false);
    expect(parseRequestPath('/_ipx/w_320/photo.jpg?token=1')).toEqual({
      pathname: '/_ipx/w_320/photo.jpg',
      search: '?token=1'
    });
    expect(parseRequestPath('/_ipx/w_320/photo.jpg')).toEqual({
      pathname: '/_ipx/w_320/photo.jpg',
      search: ''
    });
  });

  it('escapes selector values and stringifies modifier values explicitly', () => {
    expect(escapeCssSelectorValue('a"b\\c')).toBe('a\\"b\\\\c');
    expect(stringifyModifierValue(null)).toBe('null');
    expect(stringifyModifierValue(['a', null, undefined, 2])).toBe('a,,,2');
    expect(stringifyModifierValue({ crop: { x: 1, y: null } })).toBe('{"crop":{"x":1,"y":null}}');
  });
});
