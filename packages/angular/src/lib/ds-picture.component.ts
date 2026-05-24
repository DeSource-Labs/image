import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import {
  type DensityInput,
  type ImageDecoding,
  type ImageFetchPriority,
  type ImageFit,
  type ImageFormat,
  type ImageInput,
  type ImageLoading,
  type ImageModifiers,
  type ImagePlaceholder,
  getPictureAttrs
} from '@desource/image-core';
import { DS_IMAGE_CONFIG } from './config.js';
import { coerceBoolean, coerceNumber, coercePlaceholder, mergeClassNames, stripUndefined, styleWithPlaceholder } from './coercion.js';

type NativeAttrs = Record<string, string | number | boolean | null | undefined>;

@Component({
  selector: 'ds-picture',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': '"contents"'
  },
  template: `
    <picture>
      @for (source of picture().sources; track source.type) {
        <source
          [attr.type]="source.type"
          [attr.srcset]="source.srcset"
          [attr.sizes]="source.sizes"
        />
      }
      <img
        #image
        [attr.src]="picture().img.src"
        [attr.srcset]="picture().img.srcset"
        [attr.sizes]="picture().img.sizes"
        [attr.width]="picture().img.width"
        [attr.height]="picture().img.height"
        [attr.alt]="picture().img.alt ?? ''"
        [attr.loading]="picture().img.loading"
        [attr.decoding]="picture().img.decoding"
        [attr.fetchpriority]="picture().img.fetchpriority"
        [attr.class]="imageClass()"
        [attr.style]="imageStyle()"
        [attr.id]="id()"
        [attr.role]="role()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-describedby]="ariaDescribedby()"
        [attr.referrerpolicy]="referrerpolicy()"
        [attr.crossorigin]="crossorigin()"
        [attr.usemap]="usemap()"
        [attr.data-testid]="dataTestid()"
        (load)="loaded.set(true)"
        (error)="handleError($event)"
      />
    </picture>
  `
})
export class DsPictureComponent {
  private readonly config = inject(DS_IMAGE_CONFIG);
  private readonly renderer = inject(Renderer2);
  private readonly imageRef = viewChild<ElementRef<HTMLImageElement>>('image');

  readonly src = input.required<string>();
  readonly alt = input<string>('');
  readonly width = input<number | undefined, unknown>(undefined, { transform: coerceNumber });
  readonly height = input<number | undefined, unknown>(undefined, { transform: coerceNumber });
  readonly sizes = input<string | undefined>();
  readonly quality = input<number | undefined, unknown>(undefined, { transform: coerceNumber });
  readonly format = input<ImageFormat | readonly ImageFormat[] | undefined>();
  readonly formats = input<readonly ImageFormat[] | undefined>();
  readonly fallbackFormat = input<ImageFormat | undefined>();
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
  readonly placeholder = input<ImagePlaceholder | undefined, unknown>(undefined, { transform: coercePlaceholder });
  readonly placeholderClass = input<string | undefined>();

  readonly imgClass = input<string | undefined>(undefined, { alias: 'class' });
  readonly style = input<string | undefined>();
  readonly id = input<string | undefined>();
  readonly role = input<string | undefined>();
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });
  readonly referrerpolicy = input<string | undefined>();
  readonly crossorigin = input<string | undefined>();
  readonly usemap = input<string | undefined>();
  readonly dataTestid = input<string | undefined>(undefined, { alias: 'data-testid' });
  readonly nativeAttrs = input<NativeAttrs>({});

  readonly loaded = signal(false);

  readonly imageInput = computed<ImageInput>(() => stripUndefined({
    src: this.src(),
    alt: this.alt(),
    width: this.width(),
    height: this.height(),
    sizes: this.sizes(),
    quality: this.quality(),
    format: this.format(),
    formats: this.formats(),
    fallbackFormat: this.fallbackFormat(),
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
    placeholder: this.placeholder(),
    placeholderClass: this.placeholderClass()
  }));

  readonly picture = computed(() => getPictureAttrs(this.imageInput(), this.config));

  readonly imageClass = computed(() => mergeClassNames([
    this.imgClass(),
    this.picture().img.placeholderSrc && !this.loaded() ? this.picture().img.placeholderClass : undefined
  ]));

  readonly imageStyle = computed(() => styleWithPlaceholder(this.style(), this.picture().img.placeholderSrc, this.loaded()));

  handleError(event: Event): void {
    const image = event.target;

    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    this.applyFallback(image);
  }

  constructor() {
    effect(() => {
      const image = this.imageRef()?.nativeElement;
      if (!image) {
        return;
      }

      for (const [name, value] of Object.entries(this.nativeAttrs())) {
        if (value === false || value === null || value === undefined) {
          this.renderer.removeAttribute(image, name);
        } else {
          this.renderer.setAttribute(image, name, value === true ? '' : String(value));
        }
      }
    });

    effect(() => {
      const image = this.imageRef()?.nativeElement;
      const fallbackSrc = this.picture().img.fallbackSrc;

      if (!image || !fallbackSrc || typeof globalThis.setTimeout === 'undefined') {
        return;
      }

      const check = () => {
        if (image.complete && image.naturalWidth === 0) {
          this.applyFallback(image);
        }
      };

      globalThis.setTimeout(check, 0);
      globalThis.setTimeout(check, 300);
    });
  }

  private applyFallback(image: HTMLImageElement): void {
    const fallbackSrc = this.picture().img.fallbackSrc;

    if (!fallbackSrc || image.dataset['dsFallbackApplied'] === 'true') {
      return;
    }

    image.dataset['dsFallbackApplied'] = 'true';
    image.removeAttribute('srcset');
    image.removeAttribute('sizes');
    image.src = fallbackSrc;
  }
}
