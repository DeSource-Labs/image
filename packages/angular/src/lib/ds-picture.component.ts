import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
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
import { coerceBoolean, coerceCrossorigin, coerceNumber, coercePlaceholder, coercePreload } from './coercion.js';
import { DsPictureDirective } from './ds-picture.directive.js';
import type { DsNativeImageAttrs } from './types.js';

@Component({
  selector: 'ds-picture',
  standalone: true,
  imports: [DsPictureDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.display]': '"contents"' },
  template: `
    <picture
      [dsPicture]="src()"
      [alt]="alt()"
      [width]="width()"
      [height]="height()"
      [sizes]="sizes()"
      [quality]="quality()"
      [format]="format()"
      [formats]="formats()"
      [fallbackFormat]="fallbackFormat()"
      [legacyFormat]="legacyFormat()"
      [fit]="fit()"
      [position]="position()"
      [background]="background()"
      [modifiers]="modifiers()"
      [provider]="provider()"
      [preset]="preset()"
      [densities]="densities()"
      [loading]="loading()"
      [decoding]="decoding()"
      [fetchpriority]="fetchpriority()"
      [priority]="priority()"
      [preload]="preload()"
      [placeholder]="placeholder()"
      [placeholderClass]="placeholderClass()"
      [crossorigin]="crossorigin()"
      [nonce]="nonce()"
      [imgAttrs]="mergedImgAttrs()"
      [attr.class]="pictureClass()"
      [attr.style]="style()"
      [attr.id]="id()"
      [attr.role]="role()"
      [attr.aria-label]="ariaLabel()"
      [attr.data-testid]="dataTestid()"
      (dsLoad)="load.emit($event)"
      (dsError)="error.emit($event)"
    >
      <img [attr.alt]="alt()" />
    </picture>
  `
})
export class DsPictureComponent {
  readonly src = input.required<string>();
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

  readonly pictureClass = input<string | undefined>(undefined, { alias: 'class' });
  readonly style = input<string | undefined>();
  readonly id = input<string | undefined>();
  readonly role = input<string | undefined>();
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly dataTestid = input<string | undefined>(undefined, { alias: 'data-testid' });
  readonly imgClass = input<string | undefined>();
  readonly imgStyle = input<string | undefined>();
  readonly referrerpolicy = input<string | undefined>();
  readonly usemap = input<string | undefined>();

  readonly load = output<Event>();
  readonly error = output<Event>();

  readonly mergedImgAttrs = computed<DsNativeImageAttrs>(() => ({
    ...this.imgAttrs(),
    class: this.imgClass() ?? this.imgAttrs()['class'],
    style: this.imgStyle() ?? this.imgAttrs()['style'],
    referrerpolicy: this.referrerpolicy() ?? this.imgAttrs()['referrerpolicy'],
    usemap: this.usemap() ?? this.imgAttrs()['usemap']
  }));
}
