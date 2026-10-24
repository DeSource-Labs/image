import { Directive, ElementRef, Renderer2, computed, effect, inject, input, output, signal } from '@angular/core';
import type { AfterContentInit } from '@angular/core';
import { getPictureAttrs, type ImageFormat, type ImageInput } from '@desource/image';
import { stripUndefined } from '@desource/image/kit';
import { DS_IMAGE_CONFIG } from './config.js';
import {
  applyNativeImageAttrs,
  setNativeImageAttribute,
  watchImagePlaceholder,
  watchImagePreload
} from './image-directive-utils.js';
import { ImageInputs, readImageInput } from './image-inputs.js';
import type { DsNativeImageAttrs } from './types.js';

@Directive({
  selector: 'picture[dsPicture]',
  standalone: true,
  host: { '[attr.data-ds-picture]': '""' }
})
export class DsPictureDirective extends ImageInputs implements AfterContentInit {
  private readonly config = inject(DS_IMAGE_CONFIG);
  private readonly element = inject<ElementRef<HTMLPictureElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly ready = signal(false);
  private readonly sourceElements: HTMLSourceElement[] = [];
  private readonly appliedNativeAttrs = new Set<string>();
  private appliedPlaceholderClass?: string;

  readonly src = input.required<string>({ alias: 'dsPicture' });
  readonly formats = input<readonly ImageFormat[] | undefined>();
  readonly fallbackFormat = input<ImageFormat | undefined>();
  readonly legacyFormat = input<ImageFormat | undefined>();
  readonly imgAttrs = input<DsNativeImageAttrs>({});

  readonly load = output<Event>({ alias: 'dsLoad' });
  readonly error = output<Event>({ alias: 'dsError' });
  readonly loaded = signal(false);

  readonly imageInput = computed<ImageInput>(() =>
    stripUndefined({
      ...readImageInput(this),
      formats: this.formats(),
      fallbackFormat: this.fallbackFormat(),
      legacyFormat: this.legacyFormat()
    })
  );
  readonly picture = computed(() => getPictureAttrs(this.imageInput(), this.config));
  readonly showingPlaceholder = computed(() => Boolean(this.picture().img.placeholderSrc && !this.loaded()));

  constructor() {
    super();
    effect(() => {
      if (!this.ready()) return;
      this.applyPicture();
    });

    effect((onCleanup) => {
      if (!this.ready()) return;
      const image = this.imageElement();
      if (!image) return;
      const stopLoad = this.renderer.listen(image, 'load', (event: Event) => this.handleLoad(event));
      const stopError = this.renderer.listen(image, 'error', (event: Event) => this.handleError(event));
      onCleanup(() => {
        stopLoad();
        stopError();
      });
    });

    watchImagePlaceholder(
      computed(() => this.picture().img),
      this.loaded,
      this.error
    );

    watchImagePreload(this.imageInput, this);
  }

  ngAfterContentInit(): void {
    this.ready.set(true);
  }

  private applyPicture(): void {
    const image = this.imageElement();
    if (!image) {
      throw new Error('[desource/image-angular] <picture dsPicture> requires a child <img> element.');
    }

    const picture = this.picture();
    const placeholder = this.showingPlaceholder();
    this.applySources(image, placeholder ? [] : picture.sources);
    this.applyImageAttrs(image, picture.img, placeholder);
    this.applyNativeAttrs(image);
    this.applyPlaceholderClass(image, placeholder ? picture.img.placeholderClass : undefined);
  }

  private applySources(image: HTMLImageElement, sources: ReturnType<typeof getPictureAttrs>['sources']): void {
    for (let index = 0; index < sources.length; index += 1) {
      const sourceElement = this.sourceElementAt(index, image);
      const source = sources[index]!;
      this.setAttribute(sourceElement, 'type', source.type);
      this.setAttribute(sourceElement, 'srcset', source.srcset);
      this.setAttribute(sourceElement, 'sizes', source.sizes);
    }

    while (this.sourceElements.length > sources.length) {
      const source = this.sourceElements.pop();
      if (source) this.renderer.removeChild(this.element, source);
    }
  }

  private sourceElementAt(index: number, image: HTMLImageElement): HTMLSourceElement {
    let sourceElement = this.sourceElements[index];
    if (sourceElement) return sourceElement;

    sourceElement = this.renderer.createElement('source') as HTMLSourceElement;
    this.sourceElements[index] = sourceElement;
    this.renderer.insertBefore(this.element, sourceElement, image);
    return sourceElement;
  }

  private applyImageAttrs(
    image: HTMLImageElement,
    attrs: ReturnType<typeof getPictureAttrs>['img'],
    placeholder: boolean
  ): void {
    this.setAttribute(image, 'src', placeholder ? attrs.placeholderSrc : attrs.src);
    this.setAttribute(image, 'srcset', placeholder ? undefined : attrs.srcset);
    this.setAttribute(image, 'sizes', placeholder ? undefined : attrs.sizes);
    this.setAttribute(image, 'width', attrs.width);
    this.setAttribute(image, 'height', attrs.height);
    this.setAttribute(image, 'alt', attrs.alt ?? '');
    this.setAttribute(image, 'loading', attrs.loading);
    this.setAttribute(image, 'decoding', attrs.decoding);
    this.setAttribute(image, 'fetchpriority', attrs.fetchpriority);
    this.setAttribute(image, 'crossorigin', this.crossorigin());
    this.setAttribute(image, 'nonce', this.nonce());
    this.renderer.setAttribute(image, 'data-ds-picture-img', '');
  }

  private applyNativeAttrs(image: HTMLImageElement): void {
    applyNativeImageAttrs(this.renderer, image, this.imgAttrs(), this.appliedNativeAttrs);
  }

  private applyPlaceholderClass(image: HTMLImageElement, nextClass: string | undefined): void {
    if (this.appliedPlaceholderClass && this.appliedPlaceholderClass !== nextClass) {
      this.renderer.removeClass(image, this.appliedPlaceholderClass);
    }

    if (nextClass) {
      this.renderer.addClass(image, nextClass);
    }

    this.appliedPlaceholderClass = nextClass;
  }

  private handleLoad(event: Event): void {
    if (this.showingPlaceholder()) return;
    this.loaded.set(true);
    this.load.emit(event);
  }

  private handleError(event: Event): void {
    if (!this.showingPlaceholder()) this.error.emit(event);
  }

  private imageElement(): HTMLImageElement | null {
    return this.element.querySelector('img');
  }

  private setAttribute(element: HTMLElement, name: string, value: string | number | boolean | null | undefined): void {
    setNativeImageAttribute(this.renderer, element, name, value);
  }
}
