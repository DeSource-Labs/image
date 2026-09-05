import { expect } from 'vitest';
import { pathname } from './url';

interface PriorityPreloadResult {
  image(): HTMLImageElement;
  preloadLinks(): HTMLLinkElement[];
  flush(): void | Promise<void>;
}

export async function expectPriorityImageAndPreload(
  rendered: PriorityPreloadResult,
  expected: { pathname: string; nonce: string }
): Promise<void> {
  await rendered.flush();

  const image = rendered.image();
  expect(image.getAttribute('loading')).toBe('eager');
  expect(image.getAttribute('fetchpriority')).toBe('high');

  const links = rendered.preloadLinks() as [HTMLLinkElement];
  expect(links).toHaveLength(1);
  expect(links[0].getAttribute('rel')).toBe('preload');
  expect(links[0].getAttribute('as')).toBe('image');
  expect(pathname(links[0].getAttribute('href'))).toBe(expected.pathname);
  expect(links[0].getAttribute('fetchpriority')).toBe('high');
  expect(links[0].getAttribute('crossorigin')).toBe('use-credentials');
  expect(links[0].getAttribute('nonce')).toBe(expected.nonce);
}
