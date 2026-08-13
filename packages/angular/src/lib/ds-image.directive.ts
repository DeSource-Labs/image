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
import {
  getImageAttrs,
  getImagePreloadLink,
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

const generatedAttrs = new Set([
  'src',
  'srcset',
  'sizes',
  'width',
  'height',
  'alt',
  'loading',
  'decoding',
  'fetchpriority',
  'crossorigin',
  'nonce'
]);

@Directive({
  selector: 'img[dsImage]',
  standalone: true,
  host: {
    '[attr.src]': 'renderedSrc()',
    '[attr.srcset]': 'renderedSrcset()',
    '[attr.sizes]': 'renderedSizes()',
    '[attr.width]': 'attrs().width',
    '[attr.height]': 'attrs().height',
    '[attr.alt]': 'attrs().alt',
    '[attr.loading]': 'attrs().loading',
    '[attr.decoding]': 'attrs().decoding',
    '[attr.fetchpriority]': 'attrs().fetchpriority',
    '[attr.crossorigin]': 'crossorigin()',
    '[attr.nonce]': 'nonce()',
    '[attr.data-ds-image]': '""',
    '(load)': 'handleLoad($event)',
    '(error)': 'handleError($event)'
  }
})
export class DsImageDirective {
  private readonly config = inject(DS_IMAGE_CONFIG);
  private readonly element = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly head = inject(DsImageHeadService);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private previousPlaceholderClass?: string;
  private readonly appliedNativeAttrs = new Set<string>();
  private sourceKey = '';

  readonly src = input.required<string>({ alias: 'dsImage' });
  readonly alt = input.required<string>();
  readonly width = input<number | undefined, unknown>(undefined, { transform: coerceNumber });
  readonly height = input<number | undefined, unknown>(undefined, { transform: coerceNumber });
  readonly sizes = input<SizesInput | undefined>();
  readonly quality = input<number | undefined, unknown>(undefined, { transform: coerceNumber });
  readonly format = input<ImageFormat | readonly ImageFormat[] | undefined>();
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
  readonly nativeAttrs = input<DsNativeImageAttrs>({});

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
  readonly attrs = computed(() => getImageAttrs(this.imageInput(), this.config));
  readonly showingPlaceholder = computed(() => Boolean(this.attrs().placeholderSrc && !this.loaded()));
  readonly renderedSrc = computed(() => (this.showingPlaceholder() ? this.attrs().placeholderSrc : this.attrs().src));
  readonly renderedSrcset = computed(() => (this.showingPlaceholder() ? undefined : this.attrs().srcset));
  readonly renderedSizes = computed(() => (this.showingPlaceholder() ? undefined : this.attrs().sizes));

  constructor() {
    effect((onCleanup) => {
      const attrs = this.attrs();
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

      const complete = () => {
        if (!active) return;
        this.decode(preloader)
          .then(() => {
            if (!active) return;
            this.loaded.set(true);
          })
          .catch(() => {
            if (active) this.error.emit(new Event('error'));
          });
      };
      preloader.onload = complete;
      preloader.onerror = (event) => {
        if (active) this.error.emit(typeof event === 'string' ? new Event('error') : event);
      };
      if (preloader.complete && preloader.naturalWidth > 0) complete();

      onCleanup(() => {
        active = false;
        preloader.onload = null;
        preloader.onerror = null;
      });
    });

    effect(() => {
      const next = new Set<string>();
      for (const [name, value] of Object.entries(this.nativeAttrs())) {
        if (generatedAttrs.has(name.toLowerCase())) continue;
        next.add(name);
        if (value === false || value === null || value === undefined) this.renderer.removeAttribute(this.element, name);
        else this.renderer.setAttribute(this.element, name, value === true ? '' : String(value));
      }
      for (const name of this.appliedNativeAttrs) {
        if (!next.has(name)) this.renderer.removeAttribute(this.element, name);
      }
      this.appliedNativeAttrs.clear();
      for (const name of next) this.appliedNativeAttrs.add(name);
    });

    effect((onCleanup) => {
      const current = this.showingPlaceholder() ? this.attrs().placeholderClass : undefined;
      if (this.previousPlaceholderClass && this.previousPlaceholderClass !== current) {
        this.renderer.removeClass(this.element, this.previousPlaceholderClass);
      }
      if (current) this.renderer.addClass(this.element, current);
      this.previousPlaceholderClass = current;
      onCleanup(() => {
        if (current) this.renderer.removeClass(this.element, current);
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

  handleLoad(event: Event): void {
    if (this.showingPlaceholder()) return;
    this.loaded.set(true);
    this.load.emit(event);
  }

  handleError(event: Event): void {
    if (!this.showingPlaceholder()) this.error.emit(event);
  }

  private async decode(image: HTMLImageElement): Promise<void> {
    if (typeof image.decode === 'function') await image.decode();
  }
}
