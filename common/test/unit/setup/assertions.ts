import { expect, type Mock } from 'vitest';
import type { MockImageController } from './mock-image';
import type { TestTools } from './tools';
import { pathname, searchParam } from './url';

interface PriorityPreloadResult {
  image(): HTMLImageElement;
  preloadLinks(): HTMLLinkElement[];
  flush(): void | Promise<void>;
}

interface PlaceholderTransitionResult {
  update(options: { src: string }): void | Promise<void>;
  flush(): void | Promise<void>;
  onLoad: Mock;
  onError: Mock;
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

export async function expectPlaceholderTransition(
  rendered: PlaceholderTransitionResult,
  image: HTMLImageElement,
  mockedImage: MockImageController,
  options: {
    act: TestTools['act'];
    nextSource: string;
    placeholderClass: string;
  }
): Promise<void> {
  expect(image.classList.contains(options.placeholderClass)).toBe(true);

  image.dispatchEvent(new Event('load'));
  expect(rendered.onLoad).not.toHaveBeenCalled();

  mockedImage.images[0]!.onerror?.('error');
  expect(rendered.onError).toHaveBeenCalledOnce();

  await rendered.update({ src: options.nextSource });
  await rendered.flush();
  expect(mockedImage.images).toHaveLength(2);
  expect(pathname(image.getAttribute('src'))).toBe(options.nextSource);
  expect(searchParam(image.getAttribute('src'), 'width')).toBe('10');

  await options.act(async () => {
    mockedImage.images[1]!.onload?.(new Event('load'));
    await mockedImage.flush();
  });
  await rendered.flush();
}
