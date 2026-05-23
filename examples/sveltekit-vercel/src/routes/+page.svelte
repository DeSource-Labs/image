<script lang="ts">
  import { Image, Picture } from '@desource/svelte-image';
</script>

<main>
  <section class="hero">
    <h1>SvelteKit Vercel image optimization</h1>
    <Image
      src="/unsplash/photo-1500530855697-b586d89ba3ee"
      alt="Mountain cabin"
      width={2200}
      height={1467}
      sizes="100vw md:1100px"
      format="webp"
      preset="cover"
      placeholder
      placeholderClass="blur"
      priority
    />
  </section>

  <section class="grid">
    <Picture
      src="/unsplash/photo-1498050108023-c5249f4df085"
      alt="Developer workspace"
      width={1200}
      height={800}
      sizes="100vw md:50vw"
      formats={['avif', 'webp']}
      placeholder={[48, 32, 25, 8]}
    />

    <Image
      src="/unsplash/photo-1507003211169-0a1dd7228f2d"
      alt="Profile"
      preset="avatar"
      class="avatar"
      placeholder
    />
  </section>
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
    gap: 32px;
    max-width: 1120px;
    margin: 0 auto;
    padding: 48px 20px;
  }

  .hero,
  .grid {
    display: grid;
    gap: 16px;
  }

  .hero :global(img),
  .grid :global(img) {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }

  .grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  :global(.avatar) {
    max-width: 96px;
    border-radius: 999px;
  }

  :global(.blur) {
    filter: blur(12px);
    transition: filter 180ms ease;
  }
</style>
