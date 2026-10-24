import { Directive, input, type InputSignal } from '@angular/core';
import type {
  DensityInput,
  ImageDecoding,
  ImageFetchPriority,
  ImageFit,
  ImageFormat,
  ImageInput,
  ImageLoading,
  ImageModifiers,
  ImagePlaceholder,
  ImagePreload,
  SizesInput
} from '@desource/image';
import { stripUndefined } from '@desource/image/kit';
import { coerceBoolean, coerceCrossorigin, coerceNumber, coercePlaceholder, coercePreload } from './coercion.js';

@Directive()
export abstract class ImageInputs {
  abstract readonly src: InputSignal<string>;
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
}

export function readImageInput(inputs: ImageInputs): ImageInput {
  return stripUndefined({
    src: inputs.src(),
    alt: inputs.alt(),
    width: inputs.width(),
    height: inputs.height(),
    sizes: inputs.sizes(),
    quality: inputs.quality(),
    format: inputs.format(),
    fit: inputs.fit(),
    position: inputs.position(),
    background: inputs.background(),
    modifiers: inputs.modifiers(),
    provider: inputs.provider(),
    preset: inputs.preset(),
    densities: inputs.densities(),
    loading: inputs.loading(),
    decoding: inputs.decoding(),
    fetchpriority: inputs.fetchpriority(),
    priority: inputs.priority(),
    preload: inputs.preload(),
    placeholder: inputs.placeholder(),
    placeholderClass: inputs.placeholderClass()
  });
}
