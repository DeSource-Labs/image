import { describe, expect, it } from 'vitest';
import { createDsImageNodeMiddleware, createDsImageWebHandler } from '@server';

describe('React image server helpers', () => {
  it('creates Node and Web handlers through the shared server', () => {
    expect(createDsImageNodeMiddleware()).toBeTypeOf('function');
    expect(createDsImageWebHandler()).toBeTypeOf('function');
  });
});
