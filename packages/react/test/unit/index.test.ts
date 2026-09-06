import { describe, expect, it } from 'vitest';
import * as reactImage from '@lib';

describe('React public exports', () => {
  it('exports components, hooks, config and binding helpers', () => {
    expect(reactImage.DsImage).toHaveProperty('render');
    expect(reactImage.DsPicture).toHaveProperty('render');
    expect(reactImage.DsImageProvider).toBeTypeOf('function');
    expect(reactImage.useDsImage).toBeTypeOf('function');
    expect(reactImage.useDsImageProps).toBeTypeOf('function');
    expect(reactImage.useDsPictureProps).toBeTypeOf('function');
    expect(reactImage.getDsImageProps).toBeTypeOf('function');
    expect(reactImage.addDsImagePreloadLink).toBeTypeOf('function');
  });
});
