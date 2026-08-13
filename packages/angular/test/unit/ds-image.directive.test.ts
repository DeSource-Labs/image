import { isPlatformServer } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';
import { DsImageDirective, provideDsImage } from '@lib';

const providers = () => [provideDsImage(imageComponentTestConfig)];

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
class ImageDirectiveHost {
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

describe('DsImageDirective', () => {
  beforeEach(() => TestBed.resetTestingModule());
  afterEach(() => document.head.querySelectorAll('[data-ds-image-preload]').forEach((node) => node.remove()));

  it('renders responsive image attributes, forwards native attributes and reacts to input changes', async () => {
    TestBed.configureTestingModule({ imports: [ImageDirectiveHost], providers: providers() });
    const fixture = TestBed.createComponent(ImageDirectiveHost);
    await settle(fixture);

    const image = requireImage(fixture);
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
    await settle(fixture);

    expect(image.getAttribute('src')).toContain('/next.jpg?');
    expect(image.getAttribute('src')).toContain('width=880');
    expect(image.getAttribute('class')).toBe('next-image');
    expect(image.hasAttribute('disabled')).toBe(true);
    expect(image.hasAttribute('data-state')).toBe(false);
  });

  it('emits native load and error events without fallback retries', async () => {
    TestBed.configureTestingModule({ imports: [ImageDirectiveHost], providers: providers() });
    const fixture = TestBed.createComponent(ImageDirectiveHost);
    await settle(fixture);
    const image = requireImage(fixture);

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
      TestBed.configureTestingModule({ imports: [ImageDirectiveHost], providers: providers() });
      const fixture = TestBed.createComponent(ImageDirectiveHost);
      fixture.componentInstance.placeholder.set(true);
      fixture.componentInstance.preload.set(true);
      await settle(fixture);
      const image = requireImage(fixture);
      const directive = fixture.debugElement.query(By.directive(DsImageDirective)).injector.get(DsImageDirective);

      expect(image.getAttribute('src')).toContain('width=10');
      expect(image.classList.contains('is-placeholder')).toBe(true);
      expect(image.hasAttribute('srcset')).toBe(false);
      expect(preloaders).toHaveLength(1);
      expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(1);

      preloaders[0]!.onerror?.('error');
      expect(fixture.componentInstance.errorCount).toBe(1);

      preloaders[0]!.onload?.(new Event('load'));
      await settle(fixture);

      expect(directive.loaded()).toBe(true);
      expect(image.getAttribute('src')).toContain('width=1280');
      expect(image.classList.contains('is-placeholder')).toBe(false);
      expect(fixture.componentInstance.loadCount).toBe(0);
      image.dispatchEvent(new Event('load'));
      expect(fixture.componentInstance.loadCount).toBe(1);

      fixture.componentInstance.preload.set(false);
      await settle(fixture);
      expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(0);
    } finally {
      globalThis.Image = originalImage;
    }
  });

  it('renders safely with the server platform id and leaves placeholders deterministic', async () => {
    TestBed.configureTestingModule({
      imports: [ImageDirectiveHost],
      providers: [...providers(), { provide: PLATFORM_ID, useValue: 'server' }]
    });
    expect(isPlatformServer(TestBed.inject(PLATFORM_ID))).toBe(true);
    const fixture = TestBed.createComponent(ImageDirectiveHost);
    fixture.componentInstance.placeholder.set(true);
    await settle(fixture);
    const image = requireImage(fixture);
    expect(image.getAttribute('src')).toContain('width=10');
    expect(image.classList.contains('is-placeholder')).toBe(true);
  });
});

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await fixture.whenStable();
}

function requireImage(fixture: ComponentFixture<unknown>): HTMLImageElement {
  const image = fixture.nativeElement.querySelector('img') as HTMLImageElement | null;
  if (!image) throw new Error('Expected image fixture to render an img element.');
  return image;
}
