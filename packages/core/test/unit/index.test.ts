import { describe, expect, it } from 'vitest';
import * as image from '@src/index';

describe('public index exports', () => {
  it('exposes core factories, utilities and default providers from the package root', () => {
    expect(image.createImage).toBeTypeOf('function');
    expect(image.getImage).toBeTypeOf('function');
    expect(image.getPictureAttrs).toBeTypeOf('function');
    expect(image.resolveImageConfig).toBeTypeOf('function');
    expect(image.defineProvider).toBeTypeOf('function');
    expect(image.ipxProvider).toBeTypeOf('function');
    expect(image.vercelProvider).toBeTypeOf('function');
    expect(image.mergeClassNames).toBeTypeOf('function');
  });
});
