<script lang="ts">
  import { ipxProvider } from '@desource/image';
  import { Image, Picture, createImageBindings, setImageConfig } from '@desource/image-svelte';

  const config = setImageConfig({
    provider: 'ipx',
    providers: { ipx: ipxProvider() },
    screens: { sm: 640, md: 768, lg: 1024 }
  });
  const { imageAction, imageAttachment, pictureAction } = createImageBindings(config);
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
    <span class="eyebrow">Svelte package fixture</span>
    <h1>Components, actions, and attachments in one engine.</h1>
    <p>Every surface resolves the same provider once and reacts without fallback timers.</p>
  </header>

  <label class="control">
    Render width: <strong data-testid="width-value">{width}px</strong>
    <input data-testid="width" type="range" min="320" max="960" step="80" bind:value={width} />
  </label>

  <section class="grid">
    <article>
      <span>Image component</span>
      <Image
        data-testid="component"
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
      <img data-testid="action" class="media" alt="Aurora reflected in a lake" use:imageAction={actionOptions} />
    </article>

    <article>
      <span>Image attachment (Svelte 5.29+)</span>
      <img
        data-testid="attachment"
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
  </section>
</main>
