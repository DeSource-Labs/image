// @vitest-environment jsdom

import { createElement, createRef } from 'react';
import { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { testImageComponent, type ImageComponentSetupOptions } from '@common/test/unit/Image';
import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';
import { ImageProvider } from '@lib';
import { Image } from '@src/Image';
import {
  cleanupDocument,
  createEventMocks,
  createReactRoot,
  flushReact,
  imagePropsFromOptions,
  renderReact,
  requireElement,
  testTools
} from './setup';

afterEach(cleanupDocument);

testImageComponent(async (options = {}) => {
  const { target, root } = createReactRoot();
  let current = { src: '/image.jpg', alt: 'Image', ...options } satisfies ImageComponentSetupOptions;
  const events = createEventMocks();

  const paint = async () =>
    renderReact(
      root,
      createElement(Image, {
        ...imagePropsFromOptions(current),
        onLoad: events.onLoad,
        onError: events.onError
      })
    );

  await paint();
  await flushReact();

  return {
    container: target,
    image: () => requireElement<HTMLImageElement>(target, 'img'),
    preloadLinks: () => Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')),
    async update(nextOptions) {
      current = { ...current, ...nextOptions };
      await paint();
      await flushReact();
    },
    flush: flushReact,
    async unmount() {
      await act(async () => root.unmount());
      target.remove();
    },
    onLoad: events.onLoad,
    onError: events.onError
  };
}, testTools);

describe('React Image component behavior', () => {
  it('forwards refs to the rendered image element', async () => {
    const { target, root } = createReactRoot();
    const ref = createRef<HTMLImageElement>();

    try {
      await renderReact(root, <Image ref={ref} src="/ref.jpg" alt="Ref" width={320} />);

      expect(ref.current).toBe(requireElement<HTMLImageElement>(target, 'img'));
      expect(ref.current?.getAttribute('src')).toContain('/ref.jpg');
    } finally {
      await act(async () => root.unmount());
      target.remove();
    }
  });

  it('renders deterministic server markup with generated attrs', () => {
    const body = renderToStaticMarkup(
      <ImageProvider config={imageComponentTestConfig}>
        <Image src="/hero.png" alt="Hero" width={800} format="webp" crossOrigin nonce="nonce-value" />
      </ImageProvider>
    );

    expect(body).toContain('src="/hero.png?width=800&amp;format=webp"');
    expect(body).toContain('alt="Hero"');
    expect(body).toContain('crossorigin="anonymous"');
    expect(body).toContain('nonce="nonce-value"');
  });

  it('supports custom render props without losing generated image props', async () => {
    const { target, root } = createReactRoot();
    const onLoad = vi.fn();

    await renderReact(
      root,
      <Image src="/custom.jpg" alt="Custom" width={480} format="webp" custom onLoad={onLoad}>
        {({ imgProps, src }) => (
          <figure data-custom="yes" data-src={src}>
            <img {...imgProps} />
          </figure>
        )}
      </Image>
    );

    try {
      const figure = requireElement<HTMLElement>(target, 'figure');
      const image = requireElement<HTMLImageElement>(target, 'img');
      expect(figure.dataset['custom']).toBe('yes');
      expect(figure.dataset['src']).toContain('/custom.jpg');
      expect(image.getAttribute('src')).toContain('format=webp');

      image.dispatchEvent(new Event('load'));
      expect(onLoad).toHaveBeenCalledOnce();
    } finally {
      await act(async () => root.unmount());
      target.remove();
    }
  });

  it('emits an error when placeholder decode rejects', async () => {
    const originalImage = globalThis.Image;
    const preloaders: Array<{
      src: string;
      srcset: string;
      sizes: string;
      complete: boolean;
      naturalWidth: number;
      onload: (() => void) | null;
      onerror: ((event: Event | string) => void) | null;
      decode: () => Promise<void>;
    }> = [];
    class MockImage {
      src = '';
      srcset = '';
      sizes = '';
      complete = false;
      naturalWidth = 0;
      onload: (() => void) | null = null;
      onerror: ((event: Event | string) => void) | null = null;
      decode = vi.fn(async () => {
        throw new Error('decode failed');
      });

      constructor() {
        preloaders.push(this);
      }
    }
    globalThis.Image = MockImage as unknown as typeof globalThis.Image;
    const { target, root } = createReactRoot();
    const onError = vi.fn();

    try {
      await renderReact(root, <Image src="/decode.jpg" alt="Decode" width={320} placeholder onError={onError} />);
      await flushReact();
      preloaders[0]!.onload?.();
      await flushReact();

      expect(onError).toHaveBeenCalledOnce();
      expect(requireElement<HTMLImageElement>(target, 'img').getAttribute('src')).toContain('width=10');
    } finally {
      globalThis.Image = originalImage;
      await act(async () => root.unmount());
      target.remove();
    }
  });
});
