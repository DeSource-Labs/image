// @vitest-environment jsdom

import { createElement, createRef } from 'react';
import { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { testPictureComponent, type PictureComponentSetupOptions } from '@common/test/unit/Picture';
import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';
import { ImageProvider } from '@lib';
import { Picture } from '@src/Picture';
import {
  cleanupDocument,
  createEventMocks,
  createReactRoot,
  flushReact,
  picturePropsFromOptions,
  renderReact,
  requireElement
} from './setup';

afterEach(cleanupDocument);

testPictureComponent(async (options = {}) => {
  const { target, root } = createReactRoot();
  let current = { src: '/picture.jpg', alt: 'Picture', ...options } satisfies PictureComponentSetupOptions;
  const events = createEventMocks();

  const paint = async () =>
    renderReact(
      root,
      createElement(Picture, {
        ...picturePropsFromOptions(current),
        onLoad: events.onLoad,
        onError: events.onError
      })
    );

  await paint();
  await flushReact();

  return {
    container: target,
    picture: () => requireElement<HTMLPictureElement>(target, 'picture'),
    image: () => requireElement<HTMLImageElement>(target, 'picture img'),
    sources: () => Array.from(target.querySelectorAll<HTMLSourceElement>('picture source')),
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
});

describe('React Picture component behavior', () => {
  it('forwards refs to the rendered picture element', async () => {
    const { target, root } = createReactRoot();
    const ref = createRef<HTMLPictureElement>();

    try {
      await renderReact(root, <Picture ref={ref} src="/ref.jpg" alt="Ref" width={320} formats={['webp']} />);

      expect(ref.current).toBe(requireElement<HTMLPictureElement>(target, 'picture'));
      expect(ref.current?.querySelector('img')?.getAttribute('src')).toContain('/ref.jpg');
    } finally {
      await act(async () => root.unmount());
      target.remove();
    }
  });

  it('renders deterministic server markup with generated sources', () => {
    const body = renderToStaticMarkup(
      <ImageProvider config={imageComponentTestConfig}>
        <Picture
          src="/hero.png"
          alt="Hero"
          width={800}
          formats={['avif', 'webp']}
          fallbackFormat="jpg"
          imgAttrs={{ className: 'fallback' }}
        />
      </ImageProvider>
    );

    expect(body).toContain('<picture');
    expect(body).toContain('type="image/avif"');
    expect(body).toContain('type="image/webp"');
    expect(body).toContain('format=jpg');
    expect(body).toContain('class="fallback"');
  });
});
