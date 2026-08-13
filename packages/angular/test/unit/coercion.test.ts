import { describe, expect, it } from 'vitest';
import {
  coerceBoolean,
  coerceCrossorigin,
  coerceNumber,
  coercePlaceholder,
  coercePreload,
  mergeClassNames,
  styleWithPlaceholder
} from '../../src/lib/coercion';

describe('coercion', () => {
  it('coerces Angular template inputs to image-compatible values', () => {
    expect(coerceNumber('320')).toBe(320);
    expect(coerceNumber('bad')).toBeUndefined();
    expect(coerceBoolean('true')).toBe(true);
    expect(coerceBoolean('false')).toBe(false);
    expect(coercePlaceholder('')).toBe(true);
    expect(coercePlaceholder([12, 8, 40, 2])).toEqual([12, 8, 40, 2]);
    expect(coercePlaceholder('data:image/png;base64,x')).toBe('data:image/png;base64,x');
    expect(coercePreload('')).toBe(true);
    expect(coercePreload({ fetchPriority: 'high' })).toEqual({ fetchPriority: 'high' });
    expect(coercePreload('invalid')).toBeUndefined();
    expect(coerceCrossorigin(true)).toBe('anonymous');
    expect(coerceCrossorigin('use-credentials')).toBe('use-credentials');
    expect(coerceCrossorigin('invalid')).toBeUndefined();
  });

  it('merges classes and placeholder styles without dropping caller styles', () => {
    expect(mergeClassNames(['base', 'placeholder'])).toBe('base placeholder');
    expect(styleWithPlaceholder('object-fit:cover', '/_ipx/w_10/hero.png', false)).toBe(
      'object-fit:cover;background-image:url("/_ipx/w_10/hero.png");background-size:cover;background-position:center'
    );
    expect(styleWithPlaceholder('object-fit:cover', '/_ipx/w_10/hero.png', true)).toBe('object-fit:cover');
  });
});
