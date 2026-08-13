<script lang="ts">
  import { getImageAttrs, getImagePreloadLink } from '@desource/image';
  import { normalizeCrossorigin } from '@desource/image/kit';
  import { getImageProps, imageAction, preloadImage, toImageInput } from './bindings.js';
  import { getImageConfig } from './context.js';
  import type { ImageBindingOptions, ImageComponentProps, ImageSlotProps } from './types.js';

  let {
    src,
    alt,
    width,
    height,
    sizes,
    quality,
    format,
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
    custom = false,
    children,
    class: className,
    style,
    crossorigin,
    nonce,
    onload,
    onerror,
    ...rest
  }: ImageComponentProps = $props();

  const config = getImageConfig();
  let loaded = $state(false);

  const bindingOptions = $derived<ImageBindingOptions>({
    src,
    alt,
    width,
    height,
    sizes,
    quality,
    format,
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
    attrs: rest,
    class: className,
    style,
    onload,
    onerror,
    onStateChange(value) {
      loaded = value;
    }
  });
  const imageInput = $derived(toImageInput(bindingOptions));
  const attrs = $derived(getImageAttrs(imageInput, config));
  const elementProps = $derived(getImageProps(bindingOptions, loaded));
  const preloadLink = $derived(preload ? getImagePreloadLink(imageInput, config) : undefined);
  const nonceAttrs = $derived(nonce ? { nonce } : {});
  const slotProps = $derived<ImageSlotProps>({
    imgAttrs: elementProps,
    isLoaded: loaded,
    src: elementProps.src ?? undefined
  });

  $effect(() => {
    if (!custom) return;
    const key = `${attrs.src}\n${attrs.srcset ?? ''}\n${attrs.sizes ?? ''}`;
    if (!key) return;
    loaded = false;
    return preloadImage(
      attrs,
      {
        ready() {
          loaded = true;
          onload?.(new Event('load'));
        },
        error(event) {
          onerror?.(event);
        }
      },
      normalizeCrossorigin(crossorigin)
    );
  });
</script>

<svelte:head>
  {#if preloadLink}
    <link
      rel="preload"
      as="image"
      href={preloadLink.href}
      imagesrcset={preloadLink.imagesrcset}
      imagesizes={preloadLink.imagesizes}
      fetchpriority={preloadLink.fetchpriority}
      crossorigin={normalizeCrossorigin(crossorigin)}
      {...nonceAttrs}
    />
  {/if}
</svelte:head>

{#if custom && children}
  {@render children(slotProps)}
{:else}
  <img {...elementProps} use:imageAction={bindingOptions} data-ds-image="" />
{/if}
