<script lang="ts">
  import { Image } from '@desource/svelte-image';
</script>

<main>
  <Image
    src="/img/hero.jpg"
    alt="Background"
    quality={75}
    sizes="100vw md:1100px"
    format="webp"
    loading="lazy"
  />
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #172033;
    background: #f7f8fb;
  }

  main {
    display: grid;
    gap: 24px;
    max-width: 1120px;
    margin: 0 auto;
    padding: 48px 20px;
  }

  :global(img) {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
</style>
