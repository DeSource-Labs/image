import { describe, expect, it, type Mock } from 'vitest';
import type {
  DensityInput,
  ImageDecoding,
  ImageFetchPriority,
  ImageFit,
  ImageFormat,
  ImageLoading,
  ImageModifiers,
  ImagePlaceholder,
  ImagePreload,
  SizesInput
} from '@desource/image';
import { installMockImage } from './setup/mock-image';

export type NativeAttributeValue = string | number | boolean | null | undefined;

export interface TestContainer {
  querySelector<T extends Element = Element>(selectors: string): T | null;
}

export interface ImageComponentSetupOptions {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  sizes?: SizesInput;
  quality?: number | string;
  format?: ImageFormat | readonly ImageFormat[];
  fit?: ImageFit;
  position?: string;
  background?: string;
  modifiers?: ImageModifiers;
  provider?: string;
  preset?: string;
  densities?: DensityInput;
  loading?: ImageLoading;
  decoding?: ImageDecoding;
  fetchpriority?: ImageFetchPriority;
  priority?: boolean;
  preload?: ImagePreload;
  placeholder?: ImagePlaceholder;
  placeholderClass?: string;
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

export interface ImageComponentSetupResult {
  container: TestContainer;
  image(): HTMLImageElement;
  preloadLinks(): HTMLLinkElement[];
  update(options: Partial<ImageComponentSetupOptions>): void | Promise<void>;
  flush(): void | Promise<void>;
  unmount(): void | Promise<void>;
  onLoad: Mock;
  onError: Mock;
}

export type ImageComponentSetup = (
  options?: ImageComponentSetupOptions
) => ImageComponentSetupResult | Promise<ImageComponentSetupResult>;

export function testImageComponent(setup: ImageComponentSetup): void {
  describe('Image component shared behavior', () => {
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
        expect(image.getAttribute('data-ds-image')).toBe('');
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
        expect(image.getAttribute('data-testid')).toBe('hero');
        expect(image.getAttribute('data-state')).toBe('ready');
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
        expect(image.getAttribute('data-state')).toBe('updated');
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
        await rendered.flush();

        const image = rendered.image();
        expect(image.getAttribute('loading')).toBe('eager');
        expect(image.getAttribute('fetchpriority')).toBe('high');

        const links = rendered.preloadLinks();
        expect(links).toHaveLength(1);
        expect(links[0]!.getAttribute('rel')).toBe('preload');
        expect(links[0]!.getAttribute('as')).toBe('image');
        expect(pathname(links[0]!.getAttribute('href'))).toBe('/preload.jpg');
        expect(links[0]!.getAttribute('fetchpriority')).toBe('high');
        expect(links[0]!.getAttribute('crossorigin')).toBe('use-credentials');
        expect(links[0]!.getAttribute('nonce')).toBe('head-nonce');
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
        expect(image.classList.contains('is-placeholder')).toBe(true);

        image.dispatchEvent(new Event('load'));
        expect(rendered.onLoad).not.toHaveBeenCalled();

        mockedImage.images[0]!.onerror?.('error');
        expect(rendered.onError).toHaveBeenCalledOnce();

        await rendered.update({ src: '/placeholder-next.jpg' });
        await rendered.flush();
        expect(mockedImage.images).toHaveLength(2);
        expect(pathname(image.getAttribute('src'))).toBe('/placeholder-next.jpg');
        expect(searchParam(image.getAttribute('src'), 'width')).toBe('10');

        mockedImage.images[1]!.onload?.(new Event('load'));
        await mockedImage.flush();
        await rendered.flush();

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

function pathname(value: string | null): string {
  return new URL(value ?? '', 'https://image.test').pathname;
}

function searchParam(value: string | null, key: string): string | null {
  return new URL(value ?? '', 'https://image.test').searchParams.get(key);
}
