import { By } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';
import { DsPictureDirective, provideDsImage } from '@lib';

const providers = () => [provideDsImage(imageComponentTestConfig)];

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
class PictureDirectiveHost {
  readonly src = signal('/picture.jpg');
  readonly formats = signal<readonly ('avif' | 'webp')[]>(['avif', 'webp']);
  readonly placeholder = signal(false);
  readonly preload = signal(false);
  loadCount = 0;
  errorCount = 0;
}

@Component({
  standalone: true,
  imports: [DsPictureDirective],
  template: `<picture dsPicture="/missing.jpg" alt="Missing image"></picture>`
})
class MissingPictureImageHost {}

describe('DsPictureDirective', () => {
  beforeEach(() => TestBed.resetTestingModule());
  afterEach(() => document.head.querySelectorAll('[data-ds-image-preload]').forEach((node) => node.remove()));

  it('renders and updates picture source elements around the fallback image', async () => {
    TestBed.configureTestingModule({ imports: [PictureDirectiveHost], providers: providers() });
    const fixture = TestBed.createComponent(PictureDirectiveHost);
    await settle(fixture);

    const picture = requirePicture(fixture);
    const image = requireImage(picture);
    expect(picture.querySelectorAll('source')).toHaveLength(2);
    expect(picture.querySelector('source')?.getAttribute('type')).toBe('image/avif');
    expect(image.getAttribute('src')).toContain('format=jpg');
    expect(image.getAttribute('class')).toBe('picture-image');
    expect(image.dataset['kind']).toBe('fallback');

    fixture.componentInstance.formats.set(['webp']);
    await settle(fixture);
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
      TestBed.configureTestingModule({ imports: [PictureDirectiveHost], providers: providers() });
      const fixture = TestBed.createComponent(PictureDirectiveHost);
      fixture.componentInstance.placeholder.set(true);
      fixture.componentInstance.preload.set(true);
      await settle(fixture);

      const picture = requirePicture(fixture);
      const image = requireImage(picture);
      const directive = fixture.debugElement.query(By.directive(DsPictureDirective)).injector.get(DsPictureDirective);
      expect(picture.querySelectorAll('source')).toHaveLength(0);
      expect(image.getAttribute('src')).toContain('width=10');
      expect(image.classList.contains('picture-placeholder')).toBe(true);
      expect(preloaders).toHaveLength(1);
      expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(1);

      preloaders[0]!.decode.mockRejectedValueOnce(new Error('decode failed'));
      preloaders[0]!.onload?.();
      await settle(fixture);
      expect(fixture.componentInstance.errorCount).toBe(1);

      fixture.componentInstance.src.set('/picture-next.jpg');
      await settle(fixture);
      expect(preloaders).toHaveLength(2);
      preloaders[1]!.onerror?.('error');
      expect(fixture.componentInstance.errorCount).toBe(2);
      preloaders[1]!.onload?.();
      await settle(fixture);

      expect(directive.loaded()).toBe(true);
      expect(picture.querySelectorAll('source')).toHaveLength(2);
      expect(image.getAttribute('src')).toContain('/picture-next.jpg');
      expect(image.classList.contains('picture-placeholder')).toBe(false);

      fixture.componentInstance.preload.set(false);
      await settle(fixture);
      expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(0);
      fixture.destroy();
      expect(preloaders[1]!.onload).toBeNull();
      expect(preloaders[1]!.onerror).toBeNull();
    } finally {
      globalThis.Image = originalImage;
    }
  });

  it('fails fast when a picture directive has no fallback img', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ imports: [MissingPictureImageHost], providers: providers() });
    const fixture = TestBed.createComponent(MissingPictureImageHost);

    try {
      await expect(fixture.whenStable()).rejects.toThrow(/requires a child <img>/);
      expect(consoleError).toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await fixture.whenStable();
}

function requirePicture(fixture: ComponentFixture<unknown>): HTMLPictureElement {
  const picture = fixture.nativeElement.querySelector('picture') as HTMLPictureElement | null;
  if (!picture) throw new Error('Expected picture fixture to render a picture element.');
  return picture;
}

function requireImage(picture: HTMLPictureElement): HTMLImageElement {
  const image = picture.querySelector('img');
  if (!image) throw new Error('Expected picture fixture to render an img element.');
  return image;
}
