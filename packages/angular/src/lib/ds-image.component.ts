import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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
import { DsImageDirective } from './ds-image.directive.js';
import type { DsNativeImageAttrs } from './types.js';

@Component({
  selector: 'ds-image',
  standalone: true,
  imports: [DsImageDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.display]': '"contents"' },
  template: `
    <img
      [dsImage]="src()"
      [alt]="alt()"
      [width]="width()"
      [height]="height()"
      [sizes]="sizes()"
      [quality]="quality()"
      [format]="format()"
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
      [nativeAttrs]="nativeAttrs()"
      [attr.class]="imgClass()"
      [attr.style]="style()"
      [attr.id]="id()"
      [attr.role]="role()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-describedby]="ariaDescribedby()"
      [attr.referrerpolicy]="referrerpolicy()"
      [attr.usemap]="usemap()"
      [attr.data-testid]="dataTestid()"
      (dsLoad)="load.emit($event)"
      (dsError)="error.emit($event)"
    />
  `
})
export class DsImageComponent {
  readonly src = input.required<string>();
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

  readonly imgClass = input<string | undefined>(undefined, { alias: 'class' });
  readonly style = input<string | undefined>();
  readonly id = input<string | undefined>();
  readonly role = input<string | undefined>();
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });
  readonly referrerpolicy = input<string | undefined>();
  readonly usemap = input<string | undefined>();
  readonly dataTestid = input<string | undefined>(undefined, { alias: 'data-testid' });

  readonly load = output<Event>();
  readonly error = output<Event>();
}
