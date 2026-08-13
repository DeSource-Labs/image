import { describe, expect, it } from 'vitest';
import {
  isResolvedImageConfig,
  mergeClassNames,
  normalizeCrossorigin,
  resolveImageConfig,
  stripUndefined,
  styleWithPlaceholder
} from '../src/index';

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
