<script lang="ts">
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
    ...rest
  }: PictureComponentProps = $props();

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
  const imageClass = $derived([className, picture.img.placeholderSrc && !loaded ? picture.img.placeholderClass : undefined].filter(Boolean).join(' ') || undefined);
  const imageStyle = $derived(styleWithPlaceholder(style, picture.img.placeholderSrc, loaded));

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

<picture>
  {#each picture.sources as source (source.type)}
    <source type={source.type} srcset={source.srcset} sizes={source.sizes} />
  {/each}
  <img
    {...rest}
    src={picture.img.src}
    srcset={picture.img.srcset}
    sizes={picture.img.sizes}
    width={picture.img.width}
    height={picture.img.height}
    alt={picture.img.alt ?? ''}
    loading={picture.img.loading}
    decoding={picture.img.decoding}
    fetchpriority={picture.img.fetchpriority}
    class={imageClass}
    style={imageStyle}
    onload={handleLoad}
  />
</picture>
