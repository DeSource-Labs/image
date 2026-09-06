<script lang="ts">
  import Playground from '$lib/Playground.svelte';
</script>

<section class="playground-section" id="playground">
  <div class="shell section-intro">
    <div>
      <p class="eyebrow">Powered by DeSource Image</p>
      <h2>Change image settings. Inspect every generated candidate.</h2>
    </div>
    <p class="section-copy">
      This page uses the published API. Each control updates the provider URL, dimensions, format, quality,
      <code>srcset</code>, and <code>sizes</code> through <code>@desource/image</code>.
    </p>
  </div>
  <div class="shell"><Playground /></div>
</section>

<style lang="scss">
  @use '../../styles/mixins' as mixins;

  .playground-section {
    padding-block: 150px;
    background: linear-gradient(to bottom, transparent, rgba(143, 184, 255, 0.035), transparent);
  }

  .section-intro {
    @include mixins.section-heading;

    code {
      color: var(--lime);
    }
  }

  @include mixins.at-most(980px) {
    .section-intro {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  @include mixins.at-most(680px) {
    .playground-section {
      padding-block: 100px;
    }
  }
</style>
