import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ImageInputs } from './image-inputs.js';
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
export class DsImageComponent extends ImageInputs {
  readonly src = input.required<string>();
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
