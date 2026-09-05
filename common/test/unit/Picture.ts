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
import type { NativeAttributeValue, TestContainer } from './Image';
import { expectPriorityImageAndPreload } from './setup/assertions';
import { installMockImage } from './setup/mock-image';
import { defaultTestTools, type TestTools } from './setup/tools';
import { pathname, searchParam } from './setup/url';

export interface PictureComponentSetupOptions {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  sizes?: SizesInput;
  quality?: number | string;
  format?: ImageFormat | readonly ImageFormat[];
  formats?: readonly ImageFormat[];
  fallbackFormat?: ImageFormat;
  legacyFormat?: ImageFormat;
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
  dataTestId?: string;
  imgClassName?: string;
  imgStyle?: string;
  referrerpolicy?: string;
  usemap?: string;
  imgAttrs?: Record<string, NativeAttributeValue>;
}

export interface PictureComponentSetupResult {
  container: TestContainer;
  picture(): HTMLPictureElement;
  image(): HTMLImageElement;
  sources(): HTMLSourceElement[];
  preloadLinks(): HTMLLinkElement[];
  update(options: Partial<PictureComponentSetupOptions>): void | Promise<void>;
  flush(): void | Promise<void>;
  unmount(): void | Promise<void>;
  onLoad: Mock;
  onError: Mock;
}

export type PictureComponentSetup = (
  options?: PictureComponentSetupOptions
) => PictureComponentSetupResult | Promise<PictureComponentSetupResult>;

export function testPictureComponent(setup: PictureComponentSetup, { act }: TestTools = defaultTestTools): void {
  describe('Picture component shared behavior', () => {
    it('renders sources, fallback attrs and forwarded picture/image attrs', async () => {
      const rendered = await setup({
        src: '/picture.jpg',
        alt: 'Picture image',
        width: 640,
        height: 360,
        sizes: '100vw',
        formats: ['avif', 'webp'],
        fallbackFormat: 'jpg',
        loading: 'lazy',
        decoding: 'async',
        crossorigin: true,
        nonce: 'picture-nonce',
        className: 'picture-shell',
        style: 'display:block',
        id: 'picture-shell',
        role: 'group',
        ariaLabel: 'Picture',
        dataTestId: 'picture',
        imgClassName: 'fallback-image',
        imgStyle: 'object-fit:cover',
        referrerpolicy: 'no-referrer',
        usemap: '#picture-map',
        imgAttrs: { 'data-kind': 'fallback', title: 'Fallback title' }
      });

      try {
        const picture = rendered.picture();
        const image = rendered.image();
        const sources = rendered.sources();

        expect(picture.dataset['dsPicture']).toBe('');
        expect(picture.getAttribute('class')).toContain('picture-shell');
        expect(picture.getAttribute('style')).toContain('display');
        expect(picture.getAttribute('id')).toBe('picture-shell');
        expect(picture.getAttribute('role')).toBe('group');
        expect(picture.getAttribute('aria-label')).toBe('Picture');
        expect(picture.dataset['testid']).toBe('picture');

        expect(sources).toHaveLength(2);
        expect(sources.map((source) => source.getAttribute('type'))).toEqual(['image/avif', 'image/webp']);
        expect(sources[0]!.getAttribute('srcset')).toContain('format=avif');
        expect(sources[1]!.getAttribute('srcset')).toContain('format=webp');
        expect(sources[0]!.getAttribute('sizes')).toBe('100vw');

        expect(image.dataset['dsPictureImg']).toBe('');
        expect(pathname(image.getAttribute('src'))).toBe('/picture.jpg');
        expect(searchParam(image.getAttribute('src'), 'format')).toBe('jpg');
        expect(image.getAttribute('width')).toBe('640');
        expect(image.getAttribute('height')).toBe('360');
        expect(image.getAttribute('alt')).toBe('Picture image');
        expect(image.getAttribute('loading')).toBe('lazy');
        expect(image.getAttribute('decoding')).toBe('async');
        expect(image.getAttribute('crossorigin')).toBe('anonymous');
        expect(image.getAttribute('nonce')).toBe('picture-nonce');
        expect(image.getAttribute('class')).toContain('fallback-image');
        expect(image.getAttribute('style')).toContain('object-fit');
        expect(image.getAttribute('referrerpolicy')).toBe('no-referrer');
        expect(image.getAttribute('usemap')).toBe('#picture-map');
        expect(image.dataset['kind']).toBe('fallback');
        expect(image.getAttribute('title')).toBe('Fallback title');
      } finally {
        await rendered.unmount();
      }
    });

    it('updates source formats and fallback image attrs together', async () => {
      const rendered = await setup({
        src: '/picture-initial.jpg',
        alt: 'Initial picture',
        width: 320,
        formats: ['avif', 'webp'],
        fallbackFormat: 'jpg',
        className: 'initial-shell',
        imgClassName: 'initial-image'
      });

      try {
        await rendered.update({
          src: '/picture-updated.jpg',
          alt: 'Updated picture',
          width: 480,
          formats: ['webp'],
          fallbackFormat: 'png',
          className: 'updated-shell',
          imgClassName: 'updated-image'
        });

        const picture = rendered.picture();
        const image = rendered.image();
        const sources = rendered.sources();

        expect(sources).toHaveLength(1);
        expect(sources[0]!.getAttribute('type')).toBe('image/webp');
        expect(sources[0]!.getAttribute('srcset')).toContain('/picture-updated.jpg');
        expect(pathname(image.getAttribute('src'))).toBe('/picture-updated.jpg');
        expect(searchParam(image.getAttribute('src'), 'format')).toBe('png');
        expect(image.getAttribute('width')).toBe('480');
        expect(image.getAttribute('alt')).toBe('Updated picture');
        expect(picture.getAttribute('class')).toContain('updated-shell');
        expect(picture.getAttribute('class')).not.toContain('initial-shell');
        expect(image.getAttribute('class')).toContain('updated-image');
        expect(image.getAttribute('class')).not.toContain('initial-image');
      } finally {
        await rendered.unmount();
      }
    });

    it('applies priority fallback attrs and emits a preload link', async () => {
      const rendered = await setup({
        src: '/picture-preload.jpg',
        alt: 'Preloaded picture',
        width: 400,
        formats: ['avif', 'webp'],
        fallbackFormat: 'jpg',
        priority: true,
        preload: { fetchPriority: 'high' },
        crossorigin: 'use-credentials',
        nonce: 'picture-head-nonce'
      });

      try {
        await expectPriorityImageAndPreload(rendered, {
          pathname: '/picture-preload.jpg',
          nonce: 'picture-head-nonce'
        });
      } finally {
        await rendered.unmount();
      }
    });

    it('hides sources while a placeholder is active and restores them after decode', async () => {
      const mockedImage = installMockImage();
      const rendered = await setup({
        src: '/picture-placeholder.jpg',
        alt: 'Placeholder picture',
        width: 640,
        height: 360,
        formats: ['avif', 'webp'],
        fallbackFormat: 'jpg',
        placeholder: true,
        placeholderClass: 'picture-placeholder'
      });

      try {
        await rendered.flush();

        const image = rendered.image();
        expect(mockedImage.images).toHaveLength(1);
        expect(pathname(mockedImage.images[0]!.src)).toBe('/picture-placeholder.jpg');
        expect(rendered.sources()).toHaveLength(0);
        expect(searchParam(image.getAttribute('src'), 'width')).toBe('10');
        expect(image.classList.contains('picture-placeholder')).toBe(true);

        image.dispatchEvent(new Event('load'));
        expect(rendered.onLoad).not.toHaveBeenCalled();

        mockedImage.images[0]!.onerror?.('error');
        expect(rendered.onError).toHaveBeenCalledOnce();

        await rendered.update({ src: '/picture-placeholder-next.jpg' });
        await rendered.flush();
        expect(mockedImage.images).toHaveLength(2);
        expect(pathname(image.getAttribute('src'))).toBe('/picture-placeholder-next.jpg');
        expect(searchParam(image.getAttribute('src'), 'width')).toBe('10');

        await act(async () => {
          mockedImage.images[1]!.onload?.(new Event('load'));
          await mockedImage.flush();
        });
        await rendered.flush();

        expect(rendered.sources()).toHaveLength(2);
        expect(pathname(image.getAttribute('src'))).toBe('/picture-placeholder-next.jpg');
        expect(searchParam(image.getAttribute('src'), 'width')).toBe('640');
        expect(image.classList.contains('picture-placeholder')).toBe(false);

        image.dispatchEvent(new Event('load'));
        image.dispatchEvent(new Event('error'));
        expect(rendered.onLoad).toHaveBeenCalledOnce();
        expect(rendered.onError).toHaveBeenCalledTimes(2);
      } finally {
        await rendered.unmount();
        mockedImage.restore();
      }
    });
  });
}
