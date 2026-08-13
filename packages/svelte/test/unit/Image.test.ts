// @vitest-environment jsdom

import { mount, tick, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { testImageComponent, type ImageComponentSetupOptions } from '@common/test/unit/Image';
import type { ImageComponentProps } from '@src/index';
import CustomImageFixture from './setup/CustomImageFixture.svelte';
import ImageHarness from './setup/ImageHarness.svelte';

type ImageHarnessExports = {
  setProps(next: Partial<ImageComponentProps>): void;
};

afterEach(() => {
  document.body.replaceChildren();
  document.head.querySelectorAll('link[rel="preload"][as="image"]').forEach((node) => node.remove());
});

testImageComponent(async (options = {}) => {
  const target = document.createElement('div');
  document.body.append(target);
  const onLoad = vi.fn();
  const onError = vi.fn();
  const component = mount(ImageHarness, {
    target,
    props: {
      props: toSvelteImageProps({ src: '/image.jpg', alt: 'Image', ...options }) as ImageComponentProps,
      onload: onLoad,
      onerror: onError
    }
  }) as ImageHarnessExports;

  await tick();

  return {
    container: target,
    image: () => requireElement<HTMLImageElement>(target, 'img'),
    preloadLinks: () => Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')),
    async update(nextOptions) {
      component.setProps(toSvelteImageProps(nextOptions));
      await tick();
    },
    async flush() {
      await Promise.resolve();
      await Promise.resolve();
      await tick();
    },
    async unmount() {
      await unmount(component as never);
      target.remove();
    },
    onLoad,
    onError
  };
});

describe('Svelte Image component behavior', () => {
  it('updates custom Image snippets after their source decodes', async () => {
    const originalImage = globalThis.Image;
    const preloaders: MockImage[] = [];
    class MockImage {
      src = '';
      srcset = '';
      sizes = '';
      complete = false;
      naturalWidth = 0;
      onload: (() => void) | null = null;
      onerror: ((event: Event | string) => void) | null = null;
      decode = vi.fn().mockResolvedValue(undefined);
      constructor() {
        preloaders.push(this);
      }
    }
    globalThis.Image = MockImage as unknown as typeof globalThis.Image;

    try {
      const component = mount(CustomImageFixture, { target: document.body });
      await tick();
      const figure = document.querySelector('figure')!;
      expect(figure.dataset['loaded']).toBe('false');
      expect(preloaders).toHaveLength(1);
      preloaders[0]!.onload?.();
      await Promise.resolve();
      await Promise.resolve();
      await tick();
      expect(figure.dataset['loaded']).toBe('true');
      await unmount(component);
    } finally {
      globalThis.Image = originalImage;
    }
  });
});

function toSvelteImageProps(options: ImageComponentSetupOptions): Partial<ImageComponentProps> {
  const { className, ariaLabel, ariaDescribedby, dataTestId, nativeAttrs, ...coreOptions } = options;
  const props: Record<string, unknown> = { ...coreOptions };
  if (className !== undefined) props['class'] = className;
  if (ariaLabel !== undefined) props['aria-label'] = ariaLabel;
  if (ariaDescribedby !== undefined) props['aria-describedby'] = ariaDescribedby;
  if (dataTestId !== undefined) props['data-testid'] = dataTestId;
  if (nativeAttrs) Object.assign(props, nativeAttrs);
  return props as Partial<ImageComponentProps>;
}

function requireElement<T extends Element>(container: ParentNode, selector: string): T {
  const element = container.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Expected ${selector} to be rendered.`);
  }
  return element;
}
