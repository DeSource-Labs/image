import { IMAGE_LOADER } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineProvider } from '@desource/image';
import {
  DS_IMAGE_CONFIG,
  DsImageComponent,
  DsImageDirective,
  DsImageService,
  DsPictureComponent,
  DsPictureDirective,
  createAngularImageLoader,
  provideDsAwsAmplifyImage,
  provideDsImage,
  provideDsIpxImage,
  provideDsVercelImage
} from '../../src/public-api.js';
import { DsImageHeadService } from '../../src/lib/ds-image-head.service.js';

const testProvider = defineProvider({
  getImage(src, { modifiers }) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(modifiers)) {
      if (value !== undefined && value !== false) query.set(key, String(value));
    }
    return { url: query.size ? `${src}?${query}` : src };
  }
});

const providers = () => [
  provideDsImage({
    provider: 'test',
    providers: { test: testProvider },
    screens: { sm: 640, md: 768 }
  })
];

@Component({
  standalone: true,
  imports: [DsImageDirective],
  template: `
    <img
      [dsImage]="src()"
      alt="Fixture image"
      [width]="width()"
      [height]="300"
      [sizes]="sizes()"
      [placeholder]="placeholder()"
      placeholderClass="is-placeholder"
      [preload]="preload()"
      crossorigin="anonymous"
      nonce="fixture-nonce"
      [nativeAttrs]="nativeAttrs()"
      (dsLoad)="loadCount += 1"
      (dsError)="errorCount += 1"
    />
  `
})
class ImageHost {
  readonly src = signal('/photo.jpg');
  readonly width = signal(600);
  readonly sizes = signal<string | undefined>('sm:100vw 600px');
  readonly placeholder = signal<boolean | string>(false);
  readonly preload = signal(false);
  readonly nativeAttrs = signal<Record<string, string | boolean>>({
    class: 'fixture-image',
    'data-state': 'ready'
  });
  loadCount = 0;
  errorCount = 0;
}

@Component({
  standalone: true,
  imports: [DsPictureDirective],
  template: `
    <picture
      [dsPicture]="src()"
      alt="Fixture picture"
      [width]="640"
      [height]="360"
      [formats]="formats()"
      fallbackFormat="jpg"
      [placeholder]="placeholder()"
      placeholderClass="picture-placeholder"
      [preload]="preload()"
      [imgAttrs]="{ class: 'picture-image', 'data-kind': 'fallback' }"
      (dsLoad)="loadCount += 1"
      (dsError)="errorCount += 1"
    >
      <img alt="Fixture picture" />
    </picture>
  `
})
class PictureHost {
  readonly src = signal('/picture.jpg');
  readonly formats = signal<readonly ('avif' | 'webp')[]>(['avif', 'webp']);
  readonly placeholder = signal(false);
  readonly preload = signal(false);
  loadCount = 0;
  errorCount = 0;
}

@Component({
  standalone: true,
  imports: [DsImageComponent, DsPictureComponent],
  template: `
    <ds-image src="/component.jpg" alt="Component image" width="420" data-testid="image" />
    <ds-picture
      src="/component-picture.jpg"
      alt="Component picture"
      width="420"
      [formats]="['webp']"
      data-testid="picture"
    />
  `
})
class ComponentHost {}

@Component({
  standalone: true,
  imports: [DsPictureDirective],
  template: `<picture dsPicture="/missing.jpg" alt="Missing image"></picture>`
})
class MissingPictureImageHost {}

describe('Angular rendering APIs', () => {
  beforeEach(() => TestBed.resetTestingModule());
  afterEach(() => document.head.querySelectorAll('[data-ds-image-preload]').forEach((node) => node.remove()));

  it('renders responsive image attributes, forwards native attributes and reacts to input changes', () => {
    TestBed.configureTestingModule({ imports: [ImageHost], providers: providers() });
    const fixture = TestBed.createComponent(ImageHost);
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image.src).toContain('/photo.jpg?');
    expect(image.getAttribute('src')).toContain('width=1280');
    expect(image.getAttribute('srcset')).toContain('640w');
    expect(image.getAttribute('sizes')).toBe('(max-width: 639px) 600px, 100vw');
    expect(image.getAttribute('loading')).toBeNull();
    expect(image.getAttribute('class')).toBe('fixture-image');
    expect(image.dataset['state']).toBe('ready');
    expect(image.getAttribute('crossorigin')).toBe('anonymous');

    fixture.componentInstance.width.set(880);
    fixture.componentInstance.sizes.set(undefined);
    fixture.componentInstance.src.set('/next.jpg');
    fixture.componentInstance.nativeAttrs.set({ class: 'next-image', disabled: true });
    fixture.detectChanges();

    expect(image.getAttribute('src')).toContain('/next.jpg?');
    expect(image.getAttribute('src')).toContain('width=880');
    expect(image.getAttribute('class')).toBe('next-image');
    expect(image.hasAttribute('disabled')).toBe(true);
    expect(image.hasAttribute('data-state')).toBe(false);
  });

  it('emits native load and error events without fallback retries', () => {
    TestBed.configureTestingModule({ imports: [ImageHost], providers: providers() });
    const fixture = TestBed.createComponent(ImageHost);
    fixture.detectChanges();
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    image.dispatchEvent(new Event('load'));
    image.dispatchEvent(new Event('error'));
    expect(fixture.componentInstance.loadCount).toBe(1);
    expect(fixture.componentInstance.errorCount).toBe(1);
  });

  it('shows the real placeholder URL until the full image preloads and decodes', async () => {
    const originalImage = globalThis.Image;
    const preloaders: MockPreloader[] = [];
    class MockPreloader {
      src = '';
      srcset = '';
      sizes = '';
      complete = false;
      naturalWidth = 0;
      onload: ((event: Event) => void) | null = null;
      onerror: ((event: Event | string) => void) | null = null;
      decode = vi.fn().mockResolvedValue(undefined);
      constructor() {
        preloaders.push(this);
      }
    }
    globalThis.Image = MockPreloader as unknown as typeof Image;

    try {
      TestBed.configureTestingModule({ imports: [ImageHost], providers: providers() });
      const fixture = TestBed.createComponent(ImageHost);
      fixture.componentInstance.placeholder.set(true);
      fixture.componentInstance.preload.set(true);
      fixture.detectChanges();
      const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
      const directive = fixture.debugElement.query(By.directive(DsImageDirective)).injector.get(DsImageDirective);

      expect(image.getAttribute('src')).toContain('width=10');
      expect(image.classList.contains('is-placeholder')).toBe(true);
      expect(image.hasAttribute('srcset')).toBe(false);
      expect(preloaders).toHaveLength(1);
      expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(1);

      preloaders[0]!.onerror?.('error');
      expect(fixture.componentInstance.errorCount).toBe(1);

      preloaders[0]!.onload?.(new Event('load'));
      await Promise.resolve();
      await Promise.resolve();
      fixture.detectChanges();

      expect(directive.loaded()).toBe(true);
      expect(image.getAttribute('src')).toContain('width=1280');
      expect(image.classList.contains('is-placeholder')).toBe(false);
      expect(fixture.componentInstance.loadCount).toBe(0);
      image.dispatchEvent(new Event('load'));
      expect(fixture.componentInstance.loadCount).toBe(1);

      fixture.componentInstance.preload.set(false);
      fixture.detectChanges();
      expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(0);
    } finally {
      globalThis.Image = originalImage;
    }
  });

  it('renders and updates picture source elements around the fallback image', () => {
    TestBed.configureTestingModule({ imports: [PictureHost], providers: providers() });
    const fixture = TestBed.createComponent(PictureHost);
    fixture.detectChanges();

    const picture = fixture.nativeElement.querySelector('picture') as HTMLPictureElement;
    const image = picture.querySelector('img')!;
    expect(picture.querySelectorAll('source')).toHaveLength(2);
    expect(picture.querySelector('source')?.getAttribute('type')).toBe('image/avif');
    expect(image.getAttribute('src')).toContain('format=jpg');
    expect(image.getAttribute('class')).toBe('picture-image');
    expect(image.dataset['kind']).toBe('fallback');

    fixture.componentInstance.formats.set(['webp']);
    fixture.detectChanges();
    expect(picture.querySelectorAll('source')).toHaveLength(1);
    expect(picture.querySelector('source')?.getAttribute('type')).toBe('image/webp');

    image.dispatchEvent(new Event('load'));
    expect(fixture.componentInstance.loadCount).toBe(1);
  });

  it('preloads and decodes picture placeholders before restoring responsive sources', async () => {
    const originalImage = globalThis.Image;
    const preloaders: MockPreloader[] = [];
    class MockPreloader {
      src = '';
      srcset = '';
      sizes = '';
      onload: (() => void) | null = null;
      onerror: ((event: Event | string) => void) | null = null;
      decode = vi.fn().mockResolvedValue(undefined);
      constructor() {
        preloaders.push(this);
      }
    }
    globalThis.Image = MockPreloader as unknown as typeof Image;

    try {
      TestBed.configureTestingModule({ imports: [PictureHost], providers: providers() });
      const fixture = TestBed.createComponent(PictureHost);
      fixture.componentInstance.placeholder.set(true);
      fixture.componentInstance.preload.set(true);
      fixture.detectChanges();

      const picture = fixture.nativeElement.querySelector('picture') as HTMLPictureElement;
      const image = picture.querySelector('img')!;
      const directive = fixture.debugElement.query(By.directive(DsPictureDirective)).injector.get(DsPictureDirective);
      expect(picture.querySelectorAll('source')).toHaveLength(0);
      expect(image.getAttribute('src')).toContain('width=10');
      expect(image.classList.contains('picture-placeholder')).toBe(true);
      expect(preloaders).toHaveLength(1);
      expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(1);

      preloaders[0]!.decode.mockRejectedValueOnce(new Error('decode failed'));
      preloaders[0]!.onload?.();
      await Promise.resolve();
      await Promise.resolve();
      expect(fixture.componentInstance.errorCount).toBe(1);

      fixture.componentInstance.src.set('/picture-next.jpg');
      fixture.detectChanges();
      expect(preloaders).toHaveLength(2);
      preloaders[1]!.onerror?.('error');
      expect(fixture.componentInstance.errorCount).toBe(2);
      preloaders[1]!.onload?.();
      await Promise.resolve();
      await Promise.resolve();
      fixture.detectChanges();

      expect(directive.loaded()).toBe(true);
      expect(picture.querySelectorAll('source')).toHaveLength(2);
      expect(image.getAttribute('src')).toContain('/picture-next.jpg');
      expect(image.classList.contains('picture-placeholder')).toBe(false);

      fixture.componentInstance.preload.set(false);
      fixture.detectChanges();
      expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(0);
      fixture.destroy();
      expect(preloaders[1]!.onload).toBeNull();
      expect(preloaders[1]!.onerror).toBeNull();
    } finally {
      globalThis.Image = originalImage;
    }
  });

  it('fails fast when a picture directive has no fallback img', () => {
    TestBed.configureTestingModule({ imports: [MissingPictureImageHost], providers: providers() });
    const fixture = TestBed.createComponent(MissingPictureImageHost);
    expect(() => fixture.detectChanges()).toThrow(/requires a child <img>/);
  });

  it('keeps component wrappers transparent while delegating to directives', () => {
    TestBed.configureTestingModule({ imports: [ComponentHost], providers: providers() });
    const fixture = TestBed.createComponent(ComponentHost);
    fixture.detectChanges();

    const imageHost = fixture.nativeElement.querySelector('ds-image') as HTMLElement;
    const pictureHost = fixture.nativeElement.querySelector('ds-picture') as HTMLElement;
    expect(imageHost.style.display).toBe('contents');
    expect(imageHost.querySelector('img')?.getAttribute('src')).toContain('width=420');
    expect(pictureHost.style.display).toBe('contents');
    expect(pictureHost.querySelectorAll('source')).toHaveLength(1);
  });

  it('renders safely with the server platform id and leaves placeholders deterministic', () => {
    TestBed.configureTestingModule({
      imports: [ImageHost],
      providers: [...providers(), { provide: PLATFORM_ID, useValue: 'server' }]
    });
    const fixture = TestBed.createComponent(ImageHost);
    fixture.componentInstance.placeholder.set(true);
    fixture.detectChanges();
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image.getAttribute('src')).toContain('width=10');
    expect(image.classList.contains('is-placeholder')).toBe(true);
  });
});

describe('Angular configuration and services', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('provides a safe default configuration without application setup', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(DS_IMAGE_CONFIG).provider).toBe('ipx');
  });

  it('resolves provider setup once per injector and shares it with the service and native loader', () => {
    const setup = vi.fn(testProvider);
    TestBed.configureTestingModule({
      providers: [provideDsImage({ provider: 'setup', providers: { setup } })]
    });

    const config = TestBed.inject(DS_IMAGE_CONFIG);
    const service = TestBed.inject(DsImageService);
    const loader = TestBed.inject(IMAGE_LOADER);
    expect(TestBed.inject(DS_IMAGE_CONFIG)).toBe(config);
    expect(service.create()('/service.jpg', { width: 320 })).toContain('width=320');
    expect(loader({ src: '/native.jpg', width: 480 })).toContain('width=480');
    expect(
      loader({
        src: '/native.jpg',
        width: 480,
        isPlaceholder: true,
        loaderParams: { modifiers: { grayscale: true } }
      })
    ).toContain('blur=3');
    expect(setup).toHaveBeenCalledOnce();
  });

  it('creates an Angular loader directly and supports flattened loader modifiers', () => {
    TestBed.configureTestingModule({ providers: providers() });
    const loader = createAngularImageLoader(TestBed.inject(DS_IMAGE_CONFIG));
    const url = loader({ src: '/direct.jpg', width: 700, loaderParams: { quality: 77, sharpen: 2 } });
    expect(url).toContain('width=700');
    expect(url).toContain('quality=77');
    expect(url).toContain('sharpen=2');
  });

  it('exposes concise provider-specific convenience providers', () => {
    expect(provideDsIpxImage()).toBeTruthy();
    expect(provideDsVercelImage()).toBeTruthy();
    expect(provideDsAwsAmplifyImage()).toBeTruthy();
  });

  it('reference-counts identical preload links and preserves distinct variants', () => {
    TestBed.configureTestingModule({ providers: providers() });
    const head = TestBed.inject(DsImageHeadService);
    const attrs = { rel: 'preload' as const, as: 'image' as const, href: '/photo.jpg' };
    const first = head.add(attrs, { crossorigin: 'anonymous' });
    const second = head.add(attrs, { crossorigin: 'anonymous' });
    const variant = head.add(attrs, { nonce: 'different' });
    expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(2);
    first();
    expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(2);
    second();
    expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(1);
    variant();
    expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(0);
  });
});
