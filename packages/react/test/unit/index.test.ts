import { describe, expect, it } from 'vitest';
import * as reactImage from '@lib';

describe('React public exports', () => {
  it('exports components, hooks, config and binding helpers', () => {
    expect(reactImage.Image).toHaveProperty('render');
    expect(reactImage.Picture).toHaveProperty('render');
    expect(reactImage.ImageProvider).toBeTypeOf('function');
    expect(reactImage.useImage).toBeTypeOf('function');
    expect(reactImage.useImageProps).toBeTypeOf('function');
    expect(reactImage.usePictureProps).toBeTypeOf('function');
    expect(reactImage.getImageProps).toBeTypeOf('function');
    expect(reactImage.addImagePreloadLink).toBeTypeOf('function');
  });
});
