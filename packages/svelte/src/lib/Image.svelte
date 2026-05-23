<script lang="ts">
  import { getImageAttrs, type ImageInput } from '@desource/image-core';
  import { getImageConfig } from './context.js';
  import type { ImageComponentProps } from './types.js';

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
    placeholder,
    placeholderClass,
    class: className,
    style,
    onload,
    ...rest
  }: ImageComponentProps = $props();

  const config = getImageConfig();
  let loaded = $state(false);

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
    placeholder,
    placeholderClass
  });

  const attrs = $derived(getImageAttrs(imageInput, config));
  const imageClass = $derived([className, attrs.placeholderSrc && !loaded ? attrs.placeholderClass : undefined].filter(Boolean).join(' ') || undefined);
  const imageStyle = $derived(styleWithPlaceholder(style, attrs.placeholderSrc, loaded));

  function handleLoad(event: Event) {
    loaded = true;
    (onload as ((event: Event) => void) | undefined)?.(event);
  }

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

<img
  {...rest}
  src={attrs.src}
  srcset={attrs.srcset}
  sizes={attrs.sizes}
  width={attrs.width}
  height={attrs.height}
  alt={attrs.alt ?? ''}
  loading={attrs.loading}
  decoding={attrs.decoding}
  fetchpriority={attrs.fetchpriority}
  class={imageClass}
  style={imageStyle}
  onload={handleLoad}
/>
