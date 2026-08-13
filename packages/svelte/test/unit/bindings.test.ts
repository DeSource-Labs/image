// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { defineProvider, type ImageConfig } from '@desource/image';
import {
  createImageBindings,
  getImageProps,
  getPictureProps,
  imageAction,
  imageAttachment,
  pictureAction,
  pictureAttachment,
  preloadImage,
  splitPictureAttributes
} from '../../src/lib/bindings.js';

function createConfig(setup = vi.fn()) {
  const provider = defineProvider(() => {
    setup();
    return {
      getImage(src, { modifiers }) {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(modifiers)) {
          if (value !== undefined && value !== false) query.set(key, String(value));
        }
        return { url: query.size ? `${src}?${query}` : src };
      }
    };
  });
  return {
    provider: 'test',
    providers: { test: provider },
    screens: { sm: 640, md: 768 }
  } satisfies ImageConfig;
}

describe('Svelte image bindings', () => {
  it('creates SSR-safe image and picture props with required accessibility attrs', () => {
    const config = createConfig();
    const image = getImageProps({
      src: '/photo.jpg',
      alt: 'Product photograph',
      width: 640,
      densities: '1x 2x',
      class: ['media', { selected: true }],
      attrs: { id: 'product' },
      crossorigin: true,
      config
    });
    expect(image.src).toContain('width=640');
    expect(image.srcset).toContain('2x');
    expect(image.alt).toBe('Product photograph');
    expect(image.class).toBe('media selected');
    expect(image.crossorigin).toBe('anonymous');

    const picture = getPictureProps({
      src: '/photo.jpg',
      alt: 'Responsive product photograph',
      width: 640,
      formats: ['avif', 'webp'],
      fallbackFormat: 'jpg',
      class: 'shell',
      pictureAttrs: { id: 'picture' },
      imgAttrs: { id: 'fallback', class: 'fallback' },
      config
    });
    expect(picture.pictureAttrs).toMatchObject({ id: 'picture', class: 'shell' });
    expect(picture.sources.map((source) => source.type)).toEqual(['image/avif', 'image/webp']);
    expect(picture.imgAttrs).toMatchObject({ id: 'fallback', class: 'fallback' });
    expect(picture.imgAttrs.src).toContain('format=jpg');
  });

  it('uses a true placeholder, decodes the main source and updates reactively', async () => {
    const originalImage = globalThis.Image;
    const preloaders: MockImage[] = [];
    class MockImage {
      src = '';
      srcset = '';
      sizes = '';
      crossOrigin: string | null = null;
      complete = false;
      naturalWidth = 0;
      onload: (() => void) | null = null;
      onerror: ((event: Event | string) => void) | null = null;
      decode = vi.fn().mockResolvedValue(undefined);
      constructor() {
        preloaders.push(this);
      }
    }
    globalThis.Image = MockImage as unknown as typeof Image;

    try {
      const image = document.createElement('img');
      image.className = 'existing';
      const onload = vi.fn();
      const onerror = vi.fn();
      const onStateChange = vi.fn();
      const binding = imageAction(image, {
        src: '/photo.jpg',
        alt: 'Photo',
        width: 600,
        placeholder: true,
        placeholderClass: 'blurred soft',
        config: createConfig(),
        onload,
        onerror,
        onStateChange
      });

      expect(image.src).toContain('width=10');
      expect(image.hasAttribute('srcset')).toBe(false);
      expect(image.className).toContain('existing');
      expect(image.className).toContain('blurred');
      expect(preloaders).toHaveLength(1);
      expect(onStateChange).toHaveBeenLastCalledWith(false);

      preloaders[0]!.onload?.();
      await Promise.resolve();
      await Promise.resolve();
      expect(image.src).toContain('width=600');
      expect(image.className).toBe('existing');
      expect(onStateChange).toHaveBeenLastCalledWith(true);
      expect(onload).not.toHaveBeenCalled();

      image.dispatchEvent(new Event('load'));
      expect(onload).toHaveBeenCalledOnce();

      binding.update({
        src: '/next.jpg',
        alt: 'Next photo',
        width: 800,
        config: createConfig(),
        onload,
        onerror,
        onStateChange
      });
      expect(image.getAttribute('src')).toContain('/next.jpg?');
      expect(image.getAttribute('src')).toContain('width=800');
      expect(image.alt).toBe('Next photo');
      expect(image.hasAttribute('srcset')).toBe(true);
      image.dispatchEvent(new Event('error'));
      expect(onerror).toHaveBeenCalledOnce();

      binding.destroy();
      image.dispatchEvent(new Event('load'));
      expect(onload).toHaveBeenCalledOnce();
    } finally {
      globalThis.Image = originalImage;
    }
  });

  it('creates and updates picture sources from the same action engine', () => {
    const picture = document.createElement('picture');
    const image = document.createElement('img');
    picture.append(image);
    const load = vi.fn();
    const config = createConfig();
    const binding = pictureAction(picture, {
      src: '/landscape.jpg',
      alt: 'Landscape',
      width: 720,
      formats: ['avif', 'webp'],
      fallbackFormat: 'jpg',
      config,
      onload: load
    });

    expect(picture.dataset['dsPicture']).toBe('');
    expect(picture.querySelectorAll('source')).toHaveLength(2);
    expect(picture.querySelector('source')?.type).toBe('image/avif');
    expect(image.src).toContain('format=jpg');
    image.dispatchEvent(new Event('load'));
    expect(load).toHaveBeenCalledOnce();

    binding.update({
      src: '/landscape.jpg',
      alt: 'Landscape',
      width: 900,
      formats: ['webp'],
      fallbackFormat: 'png',
      config,
      onload: load
    });
    expect(picture.querySelectorAll('source')).toHaveLength(1);
    expect(picture.querySelector('source')?.type).toBe('image/webp');
    expect(image.src).toContain('format=png');
    binding.destroy();
  });

  it('preloads picture placeholders, handles failures, and follows a replaced fallback image', async () => {
    const originalImage = globalThis.Image;
    const preloaders: MockImage[] = [];
    class MockImage {
      src = '';
      srcset = '';
      sizes = '';
      crossOrigin: string | null = null;
      complete = false;
      naturalWidth = 0;
      onload: (() => void) | null = null;
      onerror: ((event: Event | string) => void) | null = null;
      decode = vi.fn().mockResolvedValue(undefined);
      constructor() {
        preloaders.push(this);
      }
    }
    globalThis.Image = MockImage as unknown as typeof Image;

    try {
      const picture = document.createElement('picture');
      const initialImage = document.createElement('img');
      initialImage.className = 'fallback existing';
      picture.append(initialImage);
      const onload = vi.fn();
      const onerror = vi.fn();
      const onStateChange = vi.fn();
      const config = createConfig();
      const binding = pictureAction(picture, {
        src: '/landscape.jpg',
        alt: 'Landscape',
        width: 720,
        formats: ['avif', 'webp'],
        fallbackFormat: 'jpg',
        placeholder: true,
        placeholderClass: 'blurred existing',
        config,
        onload,
        onerror,
        onStateChange
      });

      expect(picture.querySelectorAll('source')).toHaveLength(0);
      expect(initialImage.src).toContain('width=10');
      expect(initialImage.classList.contains('blurred')).toBe(true);
      initialImage.dispatchEvent(new Event('load'));
      expect(onload).not.toHaveBeenCalled();

      preloaders[0]!.onerror?.('error');
      expect(onerror).toHaveBeenCalledOnce();

      binding.update({
        src: '/next.jpg',
        alt: 'Next landscape',
        width: 900,
        formats: ['webp'],
        fallbackFormat: 'jpg',
        placeholder: true,
        placeholderClass: 'blurred',
        config,
        onload,
        onerror,
        onStateChange
      });
      expect(preloaders).toHaveLength(2);
      preloaders[1]!.onload?.();
      await Promise.resolve();
      await Promise.resolve();
      expect(picture.querySelectorAll('source')).toHaveLength(1);
      expect(initialImage.src).toContain('/next.jpg');
      expect(initialImage.className).toBe('fallback existing');
      expect(onStateChange).toHaveBeenLastCalledWith(true);

      const replacement = document.createElement('img');
      initialImage.replaceWith(replacement);
      binding.update({
        src: '/replacement.jpg',
        alt: 'Replacement',
        width: 640,
        formats: ['avif'],
        config,
        onload,
        onerror,
        onStateChange
      });
      replacement.dispatchEvent(new Event('load'));
      replacement.dispatchEvent(new Event('error'));
      expect(onload).toHaveBeenCalledOnce();
      expect(onerror).toHaveBeenCalledTimes(2);
      binding.destroy();
      replacement.dispatchEvent(new Event('load'));
      expect(onload).toHaveBeenCalledOnce();
    } finally {
      globalThis.Image = originalImage;
    }
  });

  it('reports preload decode and native loading failures once', async () => {
    const originalImage = globalThis.Image;
    const preloaders: MockImage[] = [];
    class MockImage {
      src = '';
      complete = false;
      naturalWidth = 0;
      onload: (() => void) | null = null;
      onerror: ((event: Event | string) => void) | null = null;
      decode = vi.fn().mockRejectedValue(new Error('decode failed'));
      constructor() {
        preloaders.push(this);
      }
    }
    globalThis.Image = MockImage as unknown as typeof Image;

    try {
      const ready = vi.fn();
      const error = vi.fn();
      const cleanup = preloadImage({ src: '/photo.jpg' }, { ready, error }, 'anonymous');
      preloaders[0]!.onload?.();
      await Promise.resolve();
      await Promise.resolve();
      expect(ready).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledOnce();
      preloaders[0]!.onerror?.('error');
      expect(error).toHaveBeenCalledOnce();
      cleanup();

      const secondError = vi.fn();
      preloadImage({ src: '/missing.jpg' }, { ready, error: secondError });
      preloaders[1]!.onerror?.('error');
      expect(secondError).toHaveBeenCalledOnce();
    } finally {
      globalThis.Image = originalImage;
    }
  });

  it('supports attachment factories and validates picture markup', () => {
    const config = createConfig();
    const image = document.createElement('img');
    const cleanup = imageAttachment({ src: '/image.jpg', alt: 'Image', width: 320, config })(image);
    expect(image.src).toContain('width=320');
    cleanup?.();

    const picture = document.createElement('picture');
    expect(() => pictureAction(picture, { src: '/image.jpg', alt: 'Image', config })).toThrow(/requires a child <img>/);
    picture.append(document.createElement('img'));
    const cleanupPicture = pictureAttachment({
      src: '/image.jpg',
      alt: 'Image',
      formats: ['webp'],
      config
    })(picture);
    expect(picture.querySelectorAll('source')).toHaveLength(1);
    cleanupPicture?.();
  });

  it('binds configuration once and distributes picture/image attributes', () => {
    const setup = vi.fn();
    const bindings = createImageBindings(createConfig(setup));
    expect(bindings.getImageProps({ src: '/one.jpg', alt: 'One' }).src).toContain('/one.jpg');
    expect(bindings.getImageProps({ src: '/two.jpg', alt: 'Two' }).src).toContain('/two.jpg');
    expect(bindings.getPictureProps({ src: '/picture.jpg', alt: 'Picture', formats: ['webp'] }).sources).toHaveLength(
      1
    );

    const actionImage = document.createElement('img');
    bindings.imageAction(actionImage, { src: '/action.jpg', alt: 'Action' }).destroy();
    const attachedImage = document.createElement('img');
    bindings.imageAttachment({ src: '/attachment.jpg', alt: 'Attachment' })(attachedImage)?.();
    const actionPicture = document.createElement('picture');
    actionPicture.append(document.createElement('img'));
    bindings.pictureAction(actionPicture, { src: '/action-picture.jpg', alt: 'Action picture' }).destroy();
    const attachedPicture = document.createElement('picture');
    attachedPicture.append(document.createElement('img'));
    bindings.pictureAttachment({ src: '/attached-picture.jpg', alt: 'Attached picture' })(attachedPicture)?.();
    expect(setup).toHaveBeenCalledOnce();

    expect(
      splitPictureAttributes({
        id: 'shell',
        class: 'picture',
        referrerpolicy: 'no-referrer',
        loading: 'lazy',
        'aria-label': 'Artwork'
      })
    ).toEqual({
      pictureAttrs: { id: 'shell', class: 'picture', 'aria-label': 'Artwork' },
      imgAttrs: { referrerpolicy: 'no-referrer', loading: 'lazy' }
    });
  });
});
