<script lang="ts">
  import { getImagePreloadLink, getPictureAttrs } from '@desource/image';
  import { normalizeCrossorigin } from '@desource/image/kit';
  import { getPictureProps, preloadImage, splitPictureAttributes, toImageInput } from './bindings.js';
  import { getImageConfig } from './context.js';
  import type { PictureBindingOptions, PictureComponentProps } from './types.js';

  let {
    src,
    alt,
    width,
    height,
    sizes,
    quality,
    format,
    formats,
    fallbackFormat,
    legacyFormat,
    fit,
    position,
    background,
    modifiers,
    provider,
    preset,
    densities,
    loading,
    decoding,
    fetchpriority,
    priority = false,
    preload,
    placeholder,
    placeholderClass,
    imgAttrs,
    class: className,
    style,
    crossorigin,
    nonce,
    onload,
    onerror,
    ...rest
  }: PictureComponentProps = $props();

  const config = getImageConfig();
  let loaded = $state(false);
  const distributed = $derived(splitPictureAttributes(rest));
  const bindingOptions = $derived<PictureBindingOptions>({
    src,
    alt,
    width,
    height,
    sizes,
    quality,
    format,
    formats,
    fallbackFormat,
    legacyFormat,
    fit,
    position,
    background,
    modifiers,
    provider,
    preset,
    densities,
    loading,
    decoding,
    fetchpriority,
    priority,
    preload,
    placeholder,
    placeholderClass,
    crossorigin,
    nonce,
    config,
    pictureAttrs: distributed.pictureAttrs,
    attrs: distributed.imgAttrs,
    imgAttrs,
    class: className,
    style,
    onload,
    onerror
  });
  const imageInput = $derived(toImageInput(bindingOptions));
  const picture = $derived(getPictureAttrs(imageInput, config));
  const elementProps = $derived(getPictureProps(bindingOptions, loaded));
  const basePreload = $derived(preload ? getImagePreloadLink(imageInput, config) : undefined);
  const preloadSource = $derived(picture.sources[0]);
  const nonceAttrs = $derived(nonce ? { nonce } : {});

  $effect(() => {
    const attrs = picture.img;
    const key = `${attrs.src}\n${attrs.srcset ?? ''}\n${attrs.sizes ?? ''}\n${attrs.placeholderSrc ?? ''}`;
    if (!key) return;
    loaded = false;
    if (!attrs.placeholderSrc) return;
    return preloadImage(
      attrs,
      {
        ready() {
          loaded = true;
        },
        error(event) {
          onerror?.(event);
        }
      },
      normalizeCrossorigin(crossorigin)
    );
  });

  function handleLoad(event: Event) {
    if (picture.img.placeholderSrc && !loaded) return;
    loaded = true;
    onload?.(event);
  }

  function handleError(event: Event) {
    onerror?.(event);
  }
</script>

<svelte:head>
  {#if basePreload}
    <link
      rel="preload"
      as="image"
      href={basePreload.href}
      imagesrcset={preloadSource?.srcset ?? basePreload.imagesrcset}
      imagesizes={preloadSource?.sizes ?? basePreload.imagesizes}
      fetchpriority={basePreload.fetchpriority}
      crossorigin={normalizeCrossorigin(crossorigin)}
      {...nonceAttrs}
    />
  {/if}
</svelte:head>

<picture {...elementProps.pictureAttrs} data-ds-picture="">
  {#each elementProps.sources as source (`${source.type}:${source.srcset}`)}
    <source type={source.type} srcset={source.srcset} sizes={source.sizes} data-ds-image-source="" />
  {/each}
  <img {...elementProps.imgAttrs} data-ds-picture-img="" onload={handleLoad} onerror={handleError} />
</picture>
