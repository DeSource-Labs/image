// @vitest-environment jsdom

import { mount, tick, unmount } from 'svelte';
import { afterEach, vi } from 'vitest';
import { testPictureComponent, type PictureComponentSetupOptions } from '@common/test/unit/Picture';
import type { NativeImageAttrs, PictureComponentProps } from '@src/index';
import PictureHarness from './setup/PictureHarness.svelte';

type PictureHarnessExports = {
  setProps(next: Partial<PictureComponentProps>): void;
};

afterEach(() => {
  document.body.replaceChildren();
  document.head.querySelectorAll('link[rel="preload"][as="image"]').forEach((node) => node.remove());
});

testPictureComponent(async (options = {}) => {
  const target = document.createElement('div');
  document.body.append(target);
  const onLoad = vi.fn();
  const onError = vi.fn();
  const component = mount(PictureHarness, {
    target,
    props: {
      props: toSveltePictureProps({ src: '/picture.jpg', alt: 'Picture', ...options }) as PictureComponentProps,
      onload: onLoad,
      onerror: onError
    }
  }) as PictureHarnessExports;

  await tick();

  return {
    container: target,
    picture: () => requireElement<HTMLPictureElement>(target, 'picture'),
    image: () => requireElement<HTMLImageElement>(target, 'picture img'),
    sources: () => Array.from(target.querySelectorAll<HTMLSourceElement>('picture source')),
    preloadLinks: () => Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')),
    async update(nextOptions) {
      component.setProps(toSveltePictureProps(nextOptions));
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

function toSveltePictureProps(options: PictureComponentSetupOptions): Partial<PictureComponentProps> {
  const { className, ariaLabel, dataTestId, imgClassName, imgStyle, imgAttrs, ...coreOptions } = options;
  const props: Record<string, unknown> = { ...coreOptions };
  const fallbackImageAttrs: Record<string, unknown> = { ...(imgAttrs ?? {}) };

  if (className !== undefined) props['class'] = className;
  if (ariaLabel !== undefined) props['aria-label'] = ariaLabel;
  if (dataTestId !== undefined) props['data-testid'] = dataTestId;
  if (imgClassName !== undefined) fallbackImageAttrs['class'] = imgClassName;
  if (imgStyle !== undefined) fallbackImageAttrs['style'] = imgStyle;
  if (Object.keys(fallbackImageAttrs).length > 0) props['imgAttrs'] = fallbackImageAttrs as NativeImageAttrs;

  return props as Partial<PictureComponentProps>;
}

function requireElement<T extends Element>(container: ParentNode, selector: string): T {
  const element = container.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Expected ${selector} to be rendered.`);
  }
  return element;
}
