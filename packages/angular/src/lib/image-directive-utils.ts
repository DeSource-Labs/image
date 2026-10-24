import { isPlatformBrowser } from '@angular/common';
import {
  PLATFORM_ID,
  effect,
  inject,
  untracked,
  type Signal,
  type WritableSignal,
  type OutputEmitterRef,
  type Renderer2
} from '@angular/core';
import { getImagePreloadLink, type ImageAttrs, type ImageInput } from '@desource/image';
import { DS_IMAGE_CONFIG } from './config.js';
import { DsImageHeadService } from './ds-image-head.service.js';
import type { ImageInputs } from './image-inputs.js';
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

export function watchImagePlaceholder(
  imageAttrs: Signal<ImageAttrs>,
  loaded: WritableSignal<boolean>,
  error: OutputEmitterRef<Event>,
  options: { checkComplete?: boolean } = {}
): void {
  const browser = isPlatformBrowser(inject(PLATFORM_ID));
  let sourceKey = '';

  effect((onCleanup) => {
    const attrs = imageAttrs();
    const key = `${attrs.src}\n${attrs.srcset ?? ''}\n${attrs.sizes ?? ''}\n${attrs.placeholderSrc ?? ''}`;
    if (sourceKey !== key) {
      sourceKey = key;
      untracked(() => loaded.set(false));
    }

    if (!browser || !attrs.placeholderSrc) return;

    const preloader = new Image();
    let active = true;
    preloader.src = attrs.src;
    if (attrs.sizes) preloader.sizes = attrs.sizes;
    if (attrs.srcset) preloader.srcset = attrs.srcset;

    const complete = () => {
      if (!active) return;
      decodeImage(preloader)
        .then(() => {
          if (active) loaded.set(true);
        })
        .catch(() => {
          if (active) error.emit(new Event('error'));
        });
    };
    preloader.onload = complete;
    preloader.onerror = (event) => {
      if (active) error.emit(typeof event === 'string' ? new Event('error') : event);
    };
    if (options.checkComplete && preloader.complete && preloader.naturalWidth > 0) complete();

    onCleanup(() => {
      active = false;
      preloader.onload = null;
      preloader.onerror = null;
    });
  });
}

async function decodeImage(image: HTMLImageElement): Promise<void> {
  if (typeof image.decode === 'function') await image.decode();
}

export function watchImagePreload(
  imageInput: Signal<ImageInput>,
  options: Pick<ImageInputs, 'preload' | 'crossorigin' | 'nonce'>
): void {
  const config = inject(DS_IMAGE_CONFIG);
  const head = inject(DsImageHeadService);
  effect((onCleanup) => {
    if (!options.preload()) return;
    onCleanup(
      head.add(getImagePreloadLink(imageInput(), config), {
        crossorigin: options.crossorigin(),
        nonce: options.nonce()
      })
    );
  });
}

export function setNativeImageAttribute(
  renderer: Renderer2,
  element: HTMLElement,
  name: string,
  value: DsNativeImageAttrs[string]
): void {
  if (value === false || value === null || value === undefined) renderer.removeAttribute(element, name);
  else renderer.setAttribute(element, name, value === true ? '' : value.toString());
}

export function applyNativeImageAttrs(
  renderer: Renderer2,
  element: HTMLImageElement,
  attrs: DsNativeImageAttrs,
  applied: Set<string>,
  options: { protectAlt?: boolean } = {}
): void {
  const next = new Set<string>();
  for (const [name, value] of Object.entries(attrs)) {
    const normalized = name.toLowerCase();
    if (generatedImageAttrs.has(normalized) || (options.protectAlt && normalized === 'alt')) continue;
    next.add(name);
    setNativeImageAttribute(renderer, element, name, value);
  }
  for (const name of applied) {
    if (!next.has(name)) renderer.removeAttribute(element, name);
  }
  applied.clear();
  for (const name of next) applied.add(name);
}
