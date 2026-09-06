import { getImageAttrs, getPictureAttrs, type ImageAttrs, type ImageInput } from '@desource/image';
import { mergeClassNames, normalizeCrossorigin, pickImageInput, stripUndefined } from '@desource/image/kit';
import type { HTMLImgAttributes } from 'svelte/elements';
import { resolveCachedDsImageConfig } from './context.js';
import type {
  DsImageActionReturn,
  DsImageAttachment,
  DsImageBindingOptions,
  DsNativeImageAttrs,
  DsPictureBindingOptions,
  DsPictureElementProps
} from './types.js';

const pictureImageAttributeNames = new Set([
  'alt',
  'referrerpolicy',
  'usemap',
  'ismap',
  'loading',
  'crossorigin',
  'decoding',
  'nonce'
]);

export function getDsImageProps(
  options: DsImageBindingOptions,
  loaded = false
): HTMLImgAttributes & { nonce?: string } {
  const attrs = getImageAttrs(toDsImageInput(options), resolveCachedDsImageConfig(options.config));
  const placeholder = Boolean(attrs.placeholderSrc && !loaded);
  return stripUndefined({
    ...options.attrs,
    src: placeholder ? attrs.placeholderSrc : attrs.src,
    srcset: placeholder ? undefined : attrs.srcset,
    sizes: placeholder ? undefined : attrs.sizes,
    width: attrs.width,
    height: attrs.height,
    alt: attrs.alt ?? options.alt,
    loading: attrs.loading,
    decoding: attrs.decoding,
    fetchpriority: attrs.fetchpriority,
    crossorigin: normalizeCrossorigin(options.crossorigin),
    nonce: options.nonce,
    class: mergeClassNames(
      options.attrs?.class as never,
      options.class as never,
      placeholder ? attrs.placeholderClass : undefined
    ),
    style: options.style ?? options.attrs?.style
  }) as HTMLImgAttributes & { nonce?: string };
}

export function getDsPictureProps(options: DsPictureBindingOptions, loaded = false): DsPictureElementProps {
  const picture = getPictureAttrs(toDsImageInput(options), resolveCachedDsImageConfig(options.config));
  const placeholder = Boolean(picture.img.placeholderSrc && !loaded);
  return {
    pictureAttrs: stripUndefined({
      ...options.pictureAttrs,
      class: mergeClassNames(options.pictureAttrs?.class as never, options.class as never),
      style: options.style ?? options.pictureAttrs?.style
    }),
    sources: placeholder ? [] : picture.sources,
    imgAttrs: stripUndefined({
      ...options.attrs,
      ...options.imgAttrs,
      src: placeholder ? picture.img.placeholderSrc : picture.img.src,
      srcset: placeholder ? undefined : picture.img.srcset,
      sizes: placeholder ? undefined : picture.img.sizes,
      width: picture.img.width,
      height: picture.img.height,
      alt: picture.img.alt ?? options.alt,
      loading: picture.img.loading,
      decoding: picture.img.decoding,
      fetchpriority: picture.img.fetchpriority,
      crossorigin: normalizeCrossorigin(options.crossorigin),
      nonce: options.nonce,
      class: mergeClassNames(
        options.attrs?.class as never,
        options.imgAttrs?.class as never,
        placeholder ? picture.img.placeholderClass : undefined
      )
    })
  };
}

export function splitDsPictureAttributes(attributes: Record<string, unknown>): {
  pictureAttrs: Record<string, unknown>;
  imgAttrs: DsNativeImageAttrs;
} {
  const pictureAttrs: Record<string, unknown> = {};
  const imgAttrs: Record<string, unknown> = {};

  for (const [name, value] of Object.entries(attributes)) {
    if (pictureImageAttributeNames.has(name.toLowerCase())) imgAttrs[name] = value;
    else pictureAttrs[name] = value;
  }

  return { pictureAttrs, imgAttrs: imgAttrs as DsNativeImageAttrs };
}

export function dsImageAction(
  element: HTMLImageElement,
  options: DsImageBindingOptions
): DsImageActionReturn<DsImageBindingOptions> {
  return bindImage(element, options);
}

export function dsPictureAction(
  element: HTMLPictureElement,
  options: DsPictureBindingOptions
): DsImageActionReturn<DsPictureBindingOptions> {
  return bindPicture(element, options);
}

export function dsImageAttachment(options: DsImageBindingOptions): DsImageAttachment<HTMLImageElement> {
  return (element) => bindImage(element, options).destroy;
}

export function dsPictureAttachment(options: DsPictureBindingOptions): DsImageAttachment<HTMLPictureElement> {
  return (element) => bindPicture(element, options).destroy;
}

export function createDsImageBindings(config: DsImageBindingOptions['config']) {
  return {
    dsImageAction: (element: HTMLImageElement, options: Omit<DsImageBindingOptions, 'config'>) =>
      dsImageAction(element, { ...options, config }),
    dsPictureAction: (element: HTMLPictureElement, options: Omit<DsPictureBindingOptions, 'config'>) =>
      dsPictureAction(element, { ...options, config }),
    dsImageAttachment: (options: Omit<DsImageBindingOptions, 'config'>) => dsImageAttachment({ ...options, config }),
    dsPictureAttachment: (options: Omit<DsPictureBindingOptions, 'config'>) =>
      dsPictureAttachment({ ...options, config }),
    getDsImageProps: (options: Omit<DsImageBindingOptions, 'config'>, loaded = false) =>
      getDsImageProps({ ...options, config }, loaded),
    getDsPictureProps: (options: Omit<DsPictureBindingOptions, 'config'>, loaded = false) =>
      getDsPictureProps({ ...options, config }, loaded)
  };
}

export function preloadImage(
  attrs: ImageAttrs,
  callbacks: { ready: () => void; error: (event: Event) => void },
  crossorigin?: ReturnType<typeof normalizeCrossorigin>
): () => void {
  const ImageConstructor = globalThis.Image;
  if (!ImageConstructor) return () => undefined;

  const image = new ImageConstructor();
  let active = true;
  let settled = false;
  if (crossorigin) image.crossOrigin = crossorigin;
  if (attrs.sizes) image.sizes = attrs.sizes;
  if (attrs.srcset) image.srcset = attrs.srcset;

  const ready = () => {
    if (!active || settled) return;
    settled = true;
    const decoded = typeof image.decode === 'function' ? image.decode() : Promise.resolve();
    void decoded.then(
      () => {
        if (active) callbacks.ready();
      },
      () => {
        if (active) callbacks.error(new Event('error'));
      }
    );
  };
  image.onload = ready;
  image.onerror = (event) => {
    if (!active || settled) return;
    settled = true;
    callbacks.error(typeof event === 'string' ? new Event('error') : event);
  };
  image.src = attrs.src;
  if (image.complete && image.naturalWidth > 0) ready();

  return () => {
    active = false;
    image.onload = null;
    image.onerror = null;
  };
}

function bindImage(
  element: HTMLImageElement,
  initialOptions: DsImageBindingOptions
): DsImageActionReturn<DsImageBindingOptions> {
  let options = initialOptions;
  let attrs: ImageAttrs;
  let loaded = false;
  let sourceKey = '';
  let preloadingKey = '';
  let cancelPreload: () => void = () => undefined;
  let placeholderClasses = new Map<string, boolean>();

  const apply = () => {
    attrs = getImageAttrs(toDsImageInput(options), resolveCachedDsImageConfig(options.config));
    const nextKey = imageSourceKey(attrs);
    if (nextKey !== sourceKey) {
      sourceKey = nextKey;
      preloadingKey = '';
      loaded = false;
      options.onStateChange?.(false);
      cancelPreload();
      cancelPreload = () => undefined;
    }

    applyImageAttributes(element, attrs, options, loaded);
    placeholderClasses = applyPlaceholderClasses(
      element,
      placeholderClasses,
      attrs.placeholderSrc && !loaded ? attrs.placeholderClass : undefined
    );

    if (attrs.placeholderSrc && !loaded && preloadingKey !== sourceKey) {
      cancelPreload();
      preloadingKey = sourceKey;
      cancelPreload = preloadImage(
        attrs,
        {
          ready() {
            loaded = true;
            preloadingKey = '';
            options.onStateChange?.(true);
            applyImageAttributes(element, attrs, options, loaded);
            placeholderClasses = applyPlaceholderClasses(element, placeholderClasses, undefined);
          },
          error(event) {
            preloadingKey = '';
            options.onerror?.(event);
          }
        },
        normalizeCrossorigin(options.crossorigin)
      );
    }
  };

  const handleLoad = (event: Event) => {
    if (attrs.placeholderSrc && !loaded) return;
    loaded = true;
    options.onStateChange?.(true);
    placeholderClasses = applyPlaceholderClasses(element, placeholderClasses, undefined);
    options.onload?.(event);
  };
  const handleError = (event: Event) => options.onerror?.(event);
  element.addEventListener('load', handleLoad);
  element.addEventListener('error', handleError);
  apply();

  return {
    update(nextOptions) {
      options = nextOptions;
      apply();
    },
    destroy() {
      cancelPreload();
      element.removeEventListener('load', handleLoad);
      element.removeEventListener('error', handleError);
      applyPlaceholderClasses(element, placeholderClasses, undefined);
    }
  };
}

function bindPicture(
  element: HTMLPictureElement,
  initialOptions: DsPictureBindingOptions
): DsImageActionReturn<DsPictureBindingOptions> {
  let options = initialOptions;
  let image = requirePictureImage(element);
  let loaded = false;
  let sourceKey = '';
  let preloadingKey = '';
  let cancelPreload: () => void = () => undefined;
  let placeholderClasses = new Map<string, boolean>();

  const handleLoad = (event: Event) => {
    const picture = getPictureAttrs(toDsImageInput(options), resolveCachedDsImageConfig(options.config));
    if (picture.img.placeholderSrc && !loaded) return;
    loaded = true;
    options.onStateChange?.(true);
    placeholderClasses = applyPlaceholderClasses(image, placeholderClasses, undefined);
    options.onload?.(event);
  };
  const handleError = (event: Event) => options.onerror?.(event);

  const listen = (next: HTMLImageElement) => {
    image.removeEventListener('load', handleLoad);
    image.removeEventListener('error', handleError);
    image = next;
    image.addEventListener('load', handleLoad);
    image.addEventListener('error', handleError);
  };

  const apply = () => {
    const currentImage = requirePictureImage(element);
    if (currentImage !== image) listen(currentImage);
    const config = resolveCachedDsImageConfig(options.config);
    const picture = getPictureAttrs(toDsImageInput(options), config);
    const nextKey = imageSourceKey(picture.img);
    if (nextKey !== sourceKey) {
      sourceKey = nextKey;
      preloadingKey = '';
      loaded = false;
      options.onStateChange?.(false);
      cancelPreload();
      cancelPreload = () => undefined;
    }

    const placeholder = Boolean(picture.img.placeholderSrc && !loaded);
    applyPictureSources(element, image, placeholder ? [] : picture.sources);
    applyImageAttributes(image, picture.img, options, loaded);
    placeholderClasses = applyPlaceholderClasses(
      image,
      placeholderClasses,
      placeholder ? picture.img.placeholderClass : undefined
    );

    if (placeholder && preloadingKey !== sourceKey) {
      cancelPreload();
      preloadingKey = sourceKey;
      cancelPreload = preloadImage(
        picture.img,
        {
          ready() {
            loaded = true;
            preloadingKey = '';
            options.onStateChange?.(true);
            applyPictureSources(element, image, picture.sources);
            applyImageAttributes(image, picture.img, options, loaded);
            placeholderClasses = applyPlaceholderClasses(image, placeholderClasses, undefined);
          },
          error(event) {
            preloadingKey = '';
            options.onerror?.(event);
          }
        },
        normalizeCrossorigin(options.crossorigin)
      );
    }
  };

  image.addEventListener('load', handleLoad);
  image.addEventListener('error', handleError);
  apply();

  return {
    update(nextOptions) {
      options = nextOptions;
      apply();
    },
    destroy() {
      cancelPreload();
      image.removeEventListener('load', handleLoad);
      image.removeEventListener('error', handleError);
      applyPlaceholderClasses(image, placeholderClasses, undefined);
    }
  };
}

function applyImageAttributes(
  element: HTMLImageElement,
  attrs: ImageAttrs,
  options: DsImageBindingOptions,
  loaded: boolean
): void {
  const placeholder = Boolean(attrs.placeholderSrc && !loaded);
  setAttribute(element, 'src', placeholder ? attrs.placeholderSrc : attrs.src);
  setAttribute(element, 'srcset', placeholder ? undefined : attrs.srcset);
  setAttribute(element, 'sizes', placeholder ? undefined : attrs.sizes);
  setAttribute(element, 'width', attrs.width);
  setAttribute(element, 'height', attrs.height);
  setAttribute(element, 'alt', attrs.alt ?? options.alt);
  setAttribute(element, 'loading', attrs.loading);
  setAttribute(element, 'decoding', attrs.decoding);
  setAttribute(element, 'fetchpriority', attrs.fetchpriority);
  setAttribute(element, 'crossorigin', normalizeCrossorigin(options.crossorigin));
  setAttribute(element, 'nonce', options.nonce);
  element.dataset['dsImage'] = '';
}

function applyPictureSources(
  picture: HTMLPictureElement,
  image: HTMLImageElement,
  sources: ReturnType<typeof getPictureAttrs>['sources']
): void {
  const elements = Array.from(picture.querySelectorAll<HTMLSourceElement>(':scope > source'));
  for (let index = 0; index < sources.length; index += 1) {
    let element = elements[index];
    if (!element) {
      element = picture.ownerDocument.createElement('source');
      image.before(element);
      elements[index] = element;
    }
    const source = sources[index]!;
    element.dataset['dsImageSource'] = '';
    setAttribute(element, 'type', source.type);
    setAttribute(element, 'srcset', source.srcset);
    setAttribute(element, 'sizes', source.sizes);
  }
  for (const element of elements.slice(sources.length)) element.remove();
  picture.dataset['dsPicture'] = '';
}

function applyPlaceholderClasses(
  element: HTMLElement,
  previous: Map<string, boolean>,
  value: string | undefined
): Map<string, boolean> {
  for (const [name, existed] of previous) {
    if (!existed) element.classList.remove(name);
  }

  const next = new Map<string, boolean>();
  for (const name of value?.split(/\s+/).filter(Boolean) ?? []) {
    const existed = element.classList.contains(name);
    next.set(name, existed);
    element.classList.add(name);
  }
  return next;
}

function requirePictureImage(element: HTMLPictureElement): HTMLImageElement {
  const image = element.querySelector<HTMLImageElement>(':scope > img');
  if (!image) {
    throw new Error('[desource/image-svelte] dsPictureAction requires a child <img> element.');
  }
  return image;
}

function setAttribute(element: Element, name: string, value: string | number | boolean | null | undefined): void {
  if (value === false || value === null || value === undefined) element.removeAttribute(name);
  else element.setAttribute(name, value === true ? '' : String(value));
}

function imageSourceKey(attrs: ImageAttrs): string {
  return `${attrs.src}\n${attrs.srcset ?? ''}\n${attrs.sizes ?? ''}\n${attrs.placeholderSrc ?? ''}`;
}

export function toDsImageInput(options: DsImageBindingOptions): ImageInput {
  return pickImageInput(options);
}
