import { URL } from 'node:url';
import { expect } from 'vitest';
import { getImage, type ImageConfig } from '@src/index';

export function expectQueryTransformPreservesSource(
  src: string,
  config: ImageConfig,
  expectedQuery: Record<string, string | string[]>
): void {
  const original = new URL(src);
  const result = getImage({ src, width: 640, format: 'webp' }, config);
  const url = new URL(result.url);

  expect(url.origin).toBe(original.origin);
  expect(url.pathname).toBe(original.pathname);
  expect(url.hash).toBe(original.hash);
  for (const [name, value] of Object.entries(expectedQuery)) {
    if (Array.isArray(value)) expect(url.searchParams.getAll(name)).toEqual(value);
    else expect(url.searchParams.get(name)).toBe(value);
  }
  expect(getImage({ src: result.url, width: 640, format: 'webp' }, config).url).toBe(result.url);
}
