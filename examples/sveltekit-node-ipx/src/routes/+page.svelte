<script lang="ts">
  import { Image, Picture } from '@desource/svelte-image';
</script>

<main>
  <h1>SvelteKit Node IPX URL generation</h1>
  <Image
    src="/unsplash/photo-1500530855697-b586d89ba3ee"
    alt="Mountain cabin"
    width={2200}
    height={1467}
    sizes="100vw md:1100px"
    format="webp"
    preset="cover"
    placeholder={[48, 32, 30, 8]}
  />

  <Picture
    src="/unsplash/photo-1498050108023-c5249f4df085"
    alt="Developer workspace"
    width={1200}
    height={800}
    sizes="100vw md:50vw"
    formats={['avif', 'webp']}
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
