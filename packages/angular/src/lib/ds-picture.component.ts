import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { ImageFormat } from '@desource/image';
import { ImageInputs } from './image-inputs.js';
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
export class DsPictureComponent extends ImageInputs {
  readonly src = input.required<string>();
  readonly formats = input<readonly ImageFormat[] | undefined>();
  readonly fallbackFormat = input<ImageFormat | undefined>();
  readonly legacyFormat = input<ImageFormat | undefined>();
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
