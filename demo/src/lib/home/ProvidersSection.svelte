<script lang="ts">
  import { resolve } from '$app/paths';
  import Gallery from '$lib/Gallery.svelte';
  import { providers } from '$lib/providers';

  const providerImages = providers.map((provider) => ({
    src: provider.icon,
    alt: provider.name,
    href: resolve('/providers/[provider]', { provider: provider.slug })
  }));
</script>

<section class="providers shell" id="providers">
  <div class="provider-heading">
    <div>
      <p class="eyebrow">46 built-in provider modules</p>
      <h2>Use the CDN, CMS, or image service already in your stack.</h2>
    </div>
    <p class="section-copy">
      DeSource Image handles provider selection, modifier translation, and URL generation. Provider subpath imports
      remain tree-shakable. Set a default provider or override it per image.
    </p>
  </div>
  <div class="provider-gallery">
    <Gallery images={providerImages} />
  </div>
  <p class="gallery-hint">Drag to explore. Select a provider for setup, options, and examples.</p>
  <details class="provider-directory animated-details">
    <summary>Browse all {providers.length} providers</summary>
    <ul>
      {#each providers as provider (provider.slug)}<li>
          <a href={resolve('/providers/[provider]', { provider: provider.slug })}>{provider.name}</a>
        </li>{/each}
    </ul>
  </details>
</section>

<style lang="scss">
  @use '../../styles/mixins' as mixins;

  .providers {
    padding-block: 150px;
  }

  .provider-heading {
    @include mixins.section-heading;
  }

  .provider-gallery {
    height: clamp(420px, 55vw, 620px);
  }

  .gallery-hint {
    color: var(--muted);
    text-align: center;
    font-size: 0.85rem;
  }

  .provider-directory {
    margin-top: 28px;
    padding: 20px 0;
    border-block: 1px solid var(--line);

    summary {
      width: fit-content;
      padding: 8px 2px;
      color: var(--lime);
      font-weight: 700;
      cursor: pointer;
    }

    ul {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      padding: 24px 10px 10px;
      list-style: none;
    }

    li {
      padding: 2px;
    }

    a {
      overflow: hidden;
      text-overflow: ellipsis;
      text-wrap: nowrap;
      display: block;
      color: #cad6e4;
      font-size: 0.85rem;
      text-underline-offset: 4px;
      transition: color 160ms ease;

      &:hover {
        color: var(--lime);
      }
    }
  }

  @include mixins.at-most(980px) {
    .provider-heading {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .providers {
      width: 100%;
      margin-inline: unset;

      > :not(.provider-gallery) {
        padding-right: 20px;
        padding-left: 20px;
      }
    }
  }

  @include mixins.at-most(680px) {
    .providers {
      padding-block: 100px;
    }
  }
</style>
