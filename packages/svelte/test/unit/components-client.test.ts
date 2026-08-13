// @vitest-environment jsdom

import { mount, tick, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ImageComponent from '../../src/lib/Image.svelte';
import PictureComponent from '../../src/lib/Picture.svelte';
import CustomImageFixture from '../fixtures/CustomImageFixture.svelte';

afterEach(() => {
  document.body.replaceChildren();
});

describe('Svelte component client lifecycle', () => {
  it('moves Image from its placeholder to the decoded source and forwards load', async () => {
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
      const onload = vi.fn();
      const component = mount(ImageComponent, {
        target: document.body,
        props: {
          src: '/photo.jpg',
          alt: 'Photo',
          width: 640,
          placeholder: true,
          onload
        }
      });
      await tick();
      const image = document.querySelector('img')!;
      expect(image.getAttribute('src')).toContain('s_10x10');

      preloaders[0]!.onload?.();
      await Promise.resolve();
      await Promise.resolve();
      await tick();
      expect(image.getAttribute('src')).not.toContain('s_10x10');
      expect(image.getAttribute('src')).toContain('/photo.jpg');
      image.dispatchEvent(new Event('load'));
      expect(onload).toHaveBeenCalledOnce();
      await unmount(component);
    } finally {
      globalThis.Image = originalImage;
    }
  });

  it('restores Picture sources after decoding and forwards native events', async () => {
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
      const onload = vi.fn();
      const onerror = vi.fn();
      const component = mount(PictureComponent, {
        target: document.body,
        props: {
          src: '/photo.jpg',
          alt: 'Photo',
          width: 640,
          formats: ['avif', 'webp'],
          placeholder: true,
          onload,
          onerror
        }
      });
      await tick();
      const picture = document.querySelector('picture')!;
      const image = picture.querySelector('img')!;
      expect(picture.querySelectorAll('source')).toHaveLength(0);
      image.dispatchEvent(new Event('load'));
      expect(onload).not.toHaveBeenCalled();

      preloaders[0]!.onload?.();
      await Promise.resolve();
      await Promise.resolve();
      await tick();
      expect(picture.querySelectorAll('source')).toHaveLength(2);
      image.dispatchEvent(new Event('load'));
      image.dispatchEvent(new Event('error'));
      expect(onload).toHaveBeenCalledOnce();
      expect(onerror).toHaveBeenCalledOnce();
      await unmount(component);
    } finally {
      globalThis.Image = originalImage;
    }
  });

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
