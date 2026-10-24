import { Directive, ElementRef, Renderer2, computed, effect, inject, input, output, signal } from '@angular/core';
import { getImageAttrs } from '@desource/image';
import { DS_IMAGE_CONFIG } from './config.js';
import { applyNativeImageAttrs, watchImagePlaceholder, watchImagePreload } from './image-directive-utils.js';
import { ImageInputs, readImageInput } from './image-inputs.js';
import type { DsNativeImageAttrs } from './types.js';

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
export class DsImageDirective extends ImageInputs {
  private readonly config = inject(DS_IMAGE_CONFIG);
  private readonly element = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private previousPlaceholderClass?: string;
  private readonly appliedNativeAttrs = new Set<string>();

  readonly src = input.required<string>({ alias: 'dsImage' });
  readonly nativeAttrs = input<DsNativeImageAttrs>({});

  readonly load = output<Event>({ alias: 'dsLoad' });
  readonly error = output<Event>({ alias: 'dsError' });
  readonly loaded = signal(false);

  readonly imageInput = computed(() => readImageInput(this));
  readonly attrs = computed(() => getImageAttrs(this.imageInput(), this.config));
  readonly showingPlaceholder = computed(() => Boolean(this.attrs().placeholderSrc && !this.loaded()));
  readonly renderedSrc = computed(() => (this.showingPlaceholder() ? this.attrs().placeholderSrc : this.attrs().src));
  readonly renderedSrcset = computed(() => (this.showingPlaceholder() ? undefined : this.attrs().srcset));
  readonly renderedSizes = computed(() => (this.showingPlaceholder() ? undefined : this.attrs().sizes));

  constructor() {
    super();
    watchImagePlaceholder(this.attrs, this.loaded, this.error, { checkComplete: true });

    effect(() => {
      applyNativeImageAttrs(this.renderer, this.element, this.nativeAttrs(), this.appliedNativeAttrs, {
        protectAlt: true
      });
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

    watchImagePreload(this.imageInput, this);
  }

  handleLoad(event: Event): void {
    if (this.showingPlaceholder()) return;
    this.loaded.set(true);
    this.load.emit(event);
  }

  handleError(event: Event): void {
    if (!this.showingPlaceholder()) this.error.emit(event);
  }
}
