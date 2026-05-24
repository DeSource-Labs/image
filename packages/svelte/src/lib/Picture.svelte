<script lang="ts">
  import { onMount } from 'svelte';
  import { getPictureAttrs, type ImageInput } from '@desource/image-core';
  import { getImageConfig } from './context.js';
  import type { PictureComponentProps } from './types.js';

  let {
    src,
    alt = '',
    width,
    height,
    sizes,
    quality,
    format,
    formats,
    fallbackFormat,
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
    placeholder,
    placeholderClass,
    class: className,
    style,
    onload,
    onerror,
    ...rest
  }: PictureComponentProps = $props();

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
    formats,
    fallbackFormat,
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
    placeholder,
    placeholderClass
  });

  const picture = $derived(getPictureAttrs(imageInput, config));
  const renderedSrc = $derived(fallbackActive && picture.img.fallbackSrc ? picture.img.fallbackSrc : picture.img.src);
  const renderedSrcset = $derived(fallbackActive ? undefined : picture.img.srcset);
  const renderedSizes = $derived(fallbackActive ? undefined : picture.img.sizes);
  const imageClass = $derived([className, picture.img.placeholderSrc && !loaded ? picture.img.placeholderClass : undefined].filter(Boolean).join(' ') || undefined);
  const imageStyle = $derived(styleWithPlaceholder(style, picture.img.placeholderSrc, loaded));

  function handleLoad(event: Event) {
    loaded = true;
    (onload as ((event: Event) => void) | undefined)?.(event);
  }

  function handleError(event: Event) {
    applyFallback();

    (onerror as ((event: Event) => void) | undefined)?.(event);
  }

  function applyFallback() {
    if (picture.img.fallbackSrc && !fallbackActive) {
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

  function styleWithPlaceholder(base: string | null | undefined, placeholderSrc: string | undefined, isLoaded: boolean): string | undefined {
    if (!placeholderSrc || isLoaded) {
      return base ?? undefined;
    }

    const escaped = placeholderSrc.replace(/"/g, '%22');
    return [
      base,
      `background-image:url("${escaped}")`,
      'background-size:cover',
      'background-position:center'
    ].filter(Boolean).join(';');
  }
</script>

<picture>
  {#each picture.sources as source (source.type)}
    <source type={source.type} srcset={source.srcset} sizes={source.sizes} />
  {/each}
  <img
    bind:this={imageElement}
    {...rest}
    src={renderedSrc}
    srcset={renderedSrcset}
    sizes={renderedSizes}
    width={picture.img.width}
    height={picture.img.height}
    alt={picture.img.alt ?? ''}
    loading={picture.img.loading}
    decoding={picture.img.decoding}
    fetchpriority={picture.img.fetchpriority}
    class={imageClass}
    style={imageStyle}
    onload={handleLoad}
    onerror={handleError}
  />
</picture>
