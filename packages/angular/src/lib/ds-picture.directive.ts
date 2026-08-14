import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  PLATFORM_ID,
  Renderer2,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked
} from '@angular/core';
import type { AfterContentInit } from '@angular/core';
import {
  getImagePreloadLink,
  getPictureAttrs,
  type DensityInput,
  type ImageDecoding,
  type ImageFetchPriority,
  type ImageFit,
  type ImageFormat,
  type ImageInput,
  type ImageLoading,
  type ImageModifiers,
  type ImagePlaceholder,
  type ImagePreload,
  type SizesInput
} from '@desource/image';
import { stripUndefined } from '@desource/image/kit';
import { coerceBoolean, coerceCrossorigin, coerceNumber, coercePlaceholder, coercePreload } from './coercion.js';
import { DS_IMAGE_CONFIG } from './config.js';
import { DsImageHeadService } from './ds-image-head.service.js';

import type { DsNativeImageAttrs } from './types.js';

const generatedImageAttrs = new Set([
  'src',
  'srcset',
  'sizes',
  'width',
  'height',
  'loading',
  'decoding',
  'fetchpriority',
  'crossorigin',
  'nonce'
]);

@Directive({
  selector: 'picture[dsPicture]',
  standalone: true,
  host: { '[attr.data-ds-picture]': '""' }
})
export class DsPictureDirective implements AfterContentInit {
  private readonly config = inject(DS_IMAGE_CONFIG);
  private readonly element = inject<ElementRef<HTMLPictureElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly head = inject(DsImageHeadService);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly ready = signal(false);
  private readonly sourceElements: HTMLSourceElement[] = [];
  private readonly appliedNativeAttrs = new Set<string>();
  private sourceKey = '';
  private appliedPlaceholderClass?: string;

  readonly src = input.required<string>({ alias: 'dsPicture' });
  readonly alt = input.required<string>();
  readonly width = input<number | undefined, unknown>(undefined, { transform: coerceNumber });
  readonly height = input<number | undefined, unknown>(undefined, { transform: coerceNumber });
  readonly sizes = input<SizesInput | undefined>();
  readonly quality = input<number | undefined, unknown>(undefined, { transform: coerceNumber });
  readonly format = input<ImageFormat | readonly ImageFormat[] | undefined>();
  readonly formats = input<readonly ImageFormat[] | undefined>();
  readonly fallbackFormat = input<ImageFormat | undefined>();
  readonly legacyFormat = input<ImageFormat | undefined>();
  readonly fit = input<ImageFit | undefined>();
  readonly position = input<string | undefined>();
  readonly background = input<string | undefined>();
  readonly modifiers = input<ImageModifiers | undefined>();
  readonly provider = input<string | undefined>();
  readonly preset = input<string | undefined>();
  readonly densities = input<DensityInput | undefined>();
  readonly loading = input<ImageLoading | undefined>();
  readonly decoding = input<ImageDecoding | undefined>();
  readonly fetchpriority = input<ImageFetchPriority | undefined>();
  readonly priority = input<boolean, unknown>(false, { transform: coerceBoolean });
  readonly preload = input<ImagePreload | undefined, unknown>(undefined, { transform: coercePreload });
  readonly placeholder = input<ImagePlaceholder | undefined, unknown>(undefined, { transform: coercePlaceholder });
  readonly placeholderClass = input<string | undefined>();
  readonly crossorigin = input<'anonymous' | 'use-credentials' | undefined, unknown>(undefined, {
    transform: coerceCrossorigin
  });
  readonly nonce = input<string | undefined>();
  readonly imgAttrs = input<DsNativeImageAttrs>({});

  readonly load = output<Event>({ alias: 'dsLoad' });
  readonly error = output<Event>({ alias: 'dsError' });
  readonly loaded = signal(false);

  readonly imageInput = computed<ImageInput>(() =>
    stripUndefined({
      src: this.src(),
      alt: this.alt(),
      width: this.width(),
      height: this.height(),
      sizes: this.sizes(),
      quality: this.quality(),
      format: this.format(),
      formats: this.formats(),
      fallbackFormat: this.fallbackFormat(),
      legacyFormat: this.legacyFormat(),
      fit: this.fit(),
      position: this.position(),
      background: this.background(),
      modifiers: this.modifiers(),
      provider: this.provider(),
      preset: this.preset(),
      densities: this.densities(),
      loading: this.loading(),
      decoding: this.decoding(),
      fetchpriority: this.fetchpriority(),
      priority: this.priority(),
      preload: this.preload(),
      placeholder: this.placeholder(),
      placeholderClass: this.placeholderClass()
    })
  );
  readonly picture = computed(() => getPictureAttrs(this.imageInput(), this.config));
  readonly showingPlaceholder = computed(() => Boolean(this.picture().img.placeholderSrc && !this.loaded()));

  constructor() {
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

    effect((onCleanup) => {
      const picture = this.picture();
      const attrs = picture.img;
      const key = `${attrs.src}\n${attrs.srcset ?? ''}\n${attrs.sizes ?? ''}\n${attrs.placeholderSrc ?? ''}`;
      if (this.sourceKey !== key) {
        this.sourceKey = key;
        untracked(() => this.loaded.set(false));
      }

      if (!this.browser || !attrs.placeholderSrc) return;
      const preloader = new Image();
      let active = true;
      preloader.src = attrs.src;
      if (attrs.sizes) preloader.sizes = attrs.sizes;
      if (attrs.srcset) preloader.srcset = attrs.srcset;
      preloader.onload = () => {
        const decoded = typeof preloader.decode === 'function' ? preloader.decode() : Promise.resolve();
        void decoded
          .then(() => {
            if (!active) return;
            this.loaded.set(true);
          })
          .catch(() => {
            if (active) this.error.emit(new Event('error'));
          });
      };
      preloader.onerror = (event) => {
        if (active) this.error.emit(typeof event === 'string' ? new Event('error') : event);
      };
      onCleanup(() => {
        active = false;
        preloader.onload = null;
        preloader.onerror = null;
      });
    });

    effect((onCleanup) => {
      if (!this.preload()) return;
      onCleanup(
        this.head.add(getImagePreloadLink(this.imageInput(), this.config), {
          crossorigin: this.crossorigin(),
          nonce: this.nonce()
        })
      );
    });
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
    const nextNativeAttrs = new Set<string>();
    for (const [name, value] of Object.entries(this.imgAttrs())) {
      if (generatedImageAttrs.has(name.toLowerCase())) continue;
      nextNativeAttrs.add(name);
      this.setAttribute(image, name, value);
    }

    for (const name of this.appliedNativeAttrs) {
      if (!nextNativeAttrs.has(name)) this.renderer.removeAttribute(image, name);
    }

    this.appliedNativeAttrs.clear();
    for (const name of nextNativeAttrs) this.appliedNativeAttrs.add(name);
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
    if (value === false || value === null || value === undefined) this.renderer.removeAttribute(element, name);
    else this.renderer.setAttribute(element, name, value === true ? '' : value.toString());
  }
}
