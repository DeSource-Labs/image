import { describe, expect, it, type Mock } from 'vitest';
import type { ImageInput } from '@desource/image';
import { expectPlaceholderTransition, expectPriorityImageAndPreload } from './setup/assertions';
import { installMockImage } from './setup/mock-image';
import { defaultTestTools, type TestTools } from './setup/tools';
import { pathname, searchParam } from './setup/url';

export type NativeAttributeValue = string | number | boolean | null | undefined;

export interface TestContainer {
  querySelector<T extends Element = Element>(selectors: string): T | null;
}

export interface DsImageComponentSetupOptions extends Partial<
  Omit<ImageInput, 'formats' | 'fallbackFormat' | 'legacyFormat'>
> {
  crossorigin?: boolean | '' | 'true' | 'anonymous' | 'use-credentials' | null;
  nonce?: string;
  className?: string;
  style?: string;
  id?: string;
  role?: string;
  ariaLabel?: string;
  ariaDescribedby?: string;
  referrerpolicy?: string;
  usemap?: string;
  dataTestId?: string;
  nativeAttrs?: Record<string, NativeAttributeValue>;
}

export interface DsImageComponentSetupResult {
  container: TestContainer;
  image(): HTMLImageElement;
  preloadLinks(): HTMLLinkElement[];
  update(options: Partial<DsImageComponentSetupOptions>): void | Promise<void>;
  flush(): void | Promise<void>;
  unmount(): void | Promise<void>;
  onLoad: Mock;
  onError: Mock;
}

export type DsImageComponentSetup = (
  options?: DsImageComponentSetupOptions
) => DsImageComponentSetupResult | Promise<DsImageComponentSetupResult>;

export function testDsImageComponent(setup: DsImageComponentSetup, { act }: TestTools = defaultTestTools): void {
  describe('DsImage component shared behavior', () => {
    it('renders generated attrs and forwards native image attrs', async () => {
      const rendered = await setup({
        src: '/hero.jpg',
        alt: 'Hero image',
        width: 640,
        height: 360,
        format: 'webp',
        quality: 72,
        loading: 'lazy',
        decoding: 'async',
        fetchpriority: 'low',
        crossorigin: true,
        nonce: 'img-nonce',
        className: 'hero-image',
        style: 'object-fit:cover',
        id: 'hero-image',
        role: 'presentation',
        ariaLabel: 'Hero',
        ariaDescribedby: 'hero-copy',
        referrerpolicy: 'no-referrer',
        usemap: '#hero-map',
        dataTestId: 'hero',
        nativeAttrs: { 'data-state': 'ready', title: 'Hero title' }
      });

      try {
        const image = rendered.image();
        expect(image.dataset['dsImage']).toBe('');
        expect(pathname(image.getAttribute('src'))).toBe('/hero.jpg');
        expect(searchParam(image.getAttribute('src'), 'format')).toBe('webp');
        expect(searchParam(image.getAttribute('src'), 'quality')).toBe('72');
        expect(image.getAttribute('srcset')).toContain(' 1x');
        expect(image.getAttribute('srcset')).toContain(' 2x');
        expect(image.getAttribute('width')).toBe('640');
        expect(image.getAttribute('height')).toBe('360');
        expect(image.getAttribute('alt')).toBe('Hero image');
        expect(image.getAttribute('loading')).toBe('lazy');
        expect(image.getAttribute('decoding')).toBe('async');
        expect(image.getAttribute('fetchpriority')).toBe('low');
        expect(image.getAttribute('crossorigin')).toBe('anonymous');
        expect(image.getAttribute('nonce')).toBe('img-nonce');
        expect(image.getAttribute('class')).toContain('hero-image');
        expect(image.getAttribute('style')).toContain('object-fit');
        expect(image.getAttribute('id')).toBe('hero-image');
        expect(image.getAttribute('role')).toBe('presentation');
        expect(image.getAttribute('aria-label')).toBe('Hero');
        expect(image.getAttribute('aria-describedby')).toBe('hero-copy');
        expect(image.getAttribute('referrerpolicy')).toBe('no-referrer');
        expect(image.getAttribute('usemap')).toBe('#hero-map');
        expect(image.dataset['testid']).toBe('hero');
        expect(image.dataset['state']).toBe('ready');
        expect(image.getAttribute('title')).toBe('Hero title');
      } finally {
        await rendered.unmount();
      }
    });

    it('updates generated attrs and forwarded attrs together', async () => {
      const rendered = await setup({
        src: '/initial.jpg',
        alt: 'Initial image',
        width: 320,
        format: 'webp',
        className: 'initial-image',
        nativeAttrs: { 'data-state': 'initial' }
      });

      try {
        await rendered.update({
          src: '/updated.jpg',
          alt: 'Updated image',
          width: 480,
          format: 'avif',
          quality: 65,
          className: 'updated-image',
          nativeAttrs: { 'data-state': 'updated' }
        });

        const image = rendered.image();
        expect(pathname(image.getAttribute('src'))).toBe('/updated.jpg');
        expect(searchParam(image.getAttribute('src'), 'format')).toBe('avif');
        expect(searchParam(image.getAttribute('src'), 'quality')).toBe('65');
        expect(image.getAttribute('srcset')).toContain('width=480');
        expect(image.getAttribute('srcset')).toContain('width=960');
        expect(image.getAttribute('width')).toBe('480');
        expect(image.getAttribute('alt')).toBe('Updated image');
        expect(image.getAttribute('class')).toContain('updated-image');
        expect(image.getAttribute('class')).not.toContain('initial-image');
        expect(image.dataset['state']).toBe('updated');
      } finally {
        await rendered.unmount();
      }
    });

    it('applies priority image attrs and emits a preload link', async () => {
      const rendered = await setup({
        src: '/preload.jpg',
        alt: 'Preloaded image',
        width: 400,
        priority: true,
        preload: { fetchPriority: 'high' },
        crossorigin: 'use-credentials',
        nonce: 'head-nonce'
      });

      try {
        await expectPriorityImageAndPreload(rendered, { pathname: '/preload.jpg', nonce: 'head-nonce' });
      } finally {
        await rendered.unmount();
      }
    });

    it('keeps placeholder loads silent until the decoded source is ready', async () => {
      const mockedImage = installMockImage();
      const rendered = await setup({
        src: '/placeholder.jpg',
        alt: 'Placeholder image',
        width: 640,
        height: 360,
        placeholder: true,
        placeholderClass: 'is-placeholder'
      });

      try {
        await rendered.flush();

        const image = rendered.image();
        expect(mockedImage.images).toHaveLength(1);
        expect(pathname(mockedImage.images[0]!.src)).toBe('/placeholder.jpg');
        expect(searchParam(image.getAttribute('src'), 'width')).toBe('10');
        expect(image.hasAttribute('srcset')).toBe(false);
        await expectPlaceholderTransition(rendered, image, mockedImage, {
          act,
          nextSource: '/placeholder-next.jpg',
          placeholderClass: 'is-placeholder'
        });

        expect(pathname(image.getAttribute('src'))).toBe('/placeholder-next.jpg');
        expect(searchParam(image.getAttribute('src'), 'width')).toBe('640');
        expect(image.classList.contains('is-placeholder')).toBe(false);

        image.dispatchEvent(new Event('load'));
        expect(rendered.onLoad).toHaveBeenCalledOnce();
      } finally {
        await rendered.unmount();
        mockedImage.restore();
      }
    });

    it('forwards native load and error events when no placeholder is active', async () => {
      const rendered = await setup({
        src: '/events.jpg',
        alt: 'Event image',
        width: 320
      });

      try {
        const image = rendered.image();
        image.dispatchEvent(new Event('load'));
        image.dispatchEvent(new Event('error'));

        expect(rendered.onLoad).toHaveBeenCalledOnce();
        expect(rendered.onError).toHaveBeenCalledOnce();
      } finally {
        await rendered.unmount();
      }
    });
  });
}
