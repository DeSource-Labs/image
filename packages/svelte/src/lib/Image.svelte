<script lang="ts">
  import { onMount } from 'svelte';
  import { getImageAttrs, type ImageInput } from '@desource/image';
  import { getImageConfig } from './context.js';
  import type { ImageComponentProps, ImageSlotProps } from './types.js';

  let {
    src,
    alt = '',
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
  let fallbackActive = $state(false);
  let imageElement: HTMLImageElement | undefined = $state();

  const imageInput = $derived<ImageInput>({
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
    placeholderClass
  });

  const attrs = $derived(getImageAttrs(imageInput, config));
  const renderedSrc = $derived(fallbackActive && attrs.fallbackSrc ? attrs.fallbackSrc : attrs.src);
  const renderedSrcset = $derived(fallbackActive ? undefined : attrs.srcset);
  const renderedSizes = $derived(fallbackActive ? undefined : attrs.sizes);
  const imageClass = $derived(
    [className, attrs.placeholderSrc && !loaded ? attrs.placeholderClass : undefined].filter(Boolean).join(' ') ||
      undefined
  );
  const imageStyle = $derived(styleWithPlaceholder(style, attrs.placeholderSrc, loaded));
  const normalizedCrossorigin = $derived(normalizeCrossorigin(crossorigin));
  const nonceAttrs = $derived(nonce ? { nonce } : {});
  const slotProps = $derived<ImageSlotProps>({
    imgAttrs: stripUndefined({
      ...rest,
      src: renderedSrc,
      srcset: renderedSrcset,
      sizes: renderedSizes,
      width: attrs.width,
      height: attrs.height,
      alt: attrs.alt ?? '',
      loading: attrs.loading,
      decoding: attrs.decoding,
      fetchpriority: attrs.fetchpriority,
      crossorigin: normalizedCrossorigin,
      nonce,
      class: imageClass,
      style: imageStyle
    }),
    isLoaded: loaded,
    src: renderedSrc
  });

  function handleLoad(event: Event) {
    loaded = true;
    (onload as ((event: Event) => void) | undefined)?.(event);
  }

  function handleError(event: Event) {
    applyFallback();

    (onerror as ((event: Event) => void) | undefined)?.(event);
  }

  function applyFallback() {
    if (attrs.fallbackSrc && !fallbackActive) {
      fallbackActive = true;
    }
  }

  onMount(() => {
    const check = () => {
      if (imageElement?.complete && imageElement.naturalWidth === 0) {
        applyFallback();
      }
    };
    const immediate = globalThis.setTimeout(check, 0);
    const delayed = globalThis.setTimeout(check, 300);

    return () => {
      globalThis.clearTimeout(immediate);
      globalThis.clearTimeout(delayed);
    };
  });

  function styleWithPlaceholder(
    base: string | null | undefined,
    placeholderSrc: string | undefined,
    isLoaded: boolean
  ): string | undefined {
    if (!placeholderSrc || isLoaded) {
      return base ?? undefined;
    }

    const escaped = placeholderSrc.replace(/"/g, '%22');
    return [base, `background-image:url("${escaped}")`, 'background-size:cover', 'background-position:center']
      .filter(Boolean)
      .join(';');
  }

  function normalizeCrossorigin(value: unknown): 'anonymous' | 'use-credentials' | undefined {
    if (value === true || value === '' || value === 'true') {
      return 'anonymous';
    }

    return value === 'anonymous' || value === 'use-credentials' ? value : undefined;
  }

  function stripUndefined<T extends Record<string, unknown>>(value: T): T {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
  }
</script>

{#if custom && children}
  {@render children(slotProps)}
{:else}
  <img
    bind:this={imageElement}
    {...rest}
    src={renderedSrc}
    srcset={renderedSrcset}
    sizes={renderedSizes}
    width={attrs.width}
    height={attrs.height}
    alt={attrs.alt ?? ''}
    loading={attrs.loading}
    decoding={attrs.decoding}
    fetchpriority={attrs.fetchpriority}
    crossorigin={normalizedCrossorigin}
    {...nonceAttrs}
    class={imageClass}
    style={imageStyle}
    onload={handleLoad}
    onerror={handleError}
  />
{/if}
