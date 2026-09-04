<script lang="ts">
  import { ipxProvider } from '@desource/image';
  import { Image, Picture, createImageBindings, setImageConfig } from '@desource/image-svelte';

  const config = setImageConfig({
    provider: 'ipx',
    providers: { ipx: ipxProvider() },
    screens: { sm: 640, md: 768, lg: 1024 }
  });
  const { imageAction, imageAttachment, pictureAction, pictureAttachment } = createImageBindings(config);
  let width = $state(720);
  let componentLoaded = $state(false);

  const actionOptions = $derived({
    src: '/hero.jpg',
    alt: 'Aurora reflected in a lake',
    width,
    height: 540,
    densities: '1x 2x',
    placeholder: true,
    placeholderClass: 'is-placeholder'
  });
</script>

<main>
  <header>
    <span class="eyebrow">Desource Image for Svelte</span>
    <h1>One provider model for every Svelte surface.</h1>
    <p>Components, actions, and attachments generate the same responsive output without wrapper elements.</p>
  </header>

  <label class="control">
    Render width: <strong data-testid="width-value">{width}px</strong>
    <input data-testid="width" type="range" min="320" max="960" step="80" bind:value={width} />
  </label>

  <section class="grid">
    <article>
      <span>Image component</span>
      <Image
        data-testid="image-component"
        src="/hero.jpg"
        alt="Aurora above a mountain lake"
        {width}
        height={540}
        sizes="sm:100vw md:50vw 680px"
        quality={82}
        placeholder
        preload={{ fetchPriority: 'high' }}
        class="media"
        onload={() => (componentLoaded = true)}
      />
      <small data-testid="component-state">{componentLoaded ? 'decoded' : 'loading'}</small>
    </article>

    <article>
      <span>Image action</span>
      <img data-testid="image-action" class="media" alt="Aurora reflected in a lake" use:imageAction={actionOptions} />
    </article>

    <article>
      <span>Image attachment (Svelte 5.29+)</span>
      <img
        data-testid="image-attachment"
        class="media"
        alt="Mountain lake rendered by an attachment"
        {@attach imageAttachment({
          src: '/hero.jpg',
          alt: 'Mountain lake rendered by an attachment',
          width,
          height: 540,
          format: 'webp'
        })}
      />
    </article>

    <article>
      <span>Picture component</span>
      <Picture
        data-testid="picture-component"
        src="/hero.jpg"
        alt="Responsive mountain landscape"
        {width}
        height={540}
        formats={['avif', 'webp']}
        fallbackFormat="jpg"
        class="media-frame"
        imgAttrs={{ class: 'media' }}
      />
    </article>

    <article>
      <span>Picture action</span>
      <picture
        data-testid="picture-action"
        class="media-frame"
        use:pictureAction={{
          src: '/hero.jpg',
          alt: 'Mountain landscape at dusk',
          width,
          height: 540,
          formats: ['webp'],
          fallbackFormat: 'jpg'
        }}
      >
        <img class="media" alt="Mountain landscape at dusk" />
      </picture>
    </article>

    <article>
      <span>Picture attachment (Svelte 5.29+)</span>
      <picture
        data-testid="picture-attachment"
        class="media-frame"
        {@attach pictureAttachment({
          src: '/hero.jpg',
          alt: 'Mountain landscape rendered by an attachment',
          width,
          height: 540,
          formats: ['avif'],
          fallbackFormat: 'jpg'
        })}
      >
        <img class="media" alt="Mountain landscape rendered by an attachment" />
      </picture>
    </article>
  </section>
</main>
