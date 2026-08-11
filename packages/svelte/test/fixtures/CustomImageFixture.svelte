<script lang="ts">
  import { ipxProvider } from '@desource/image';
  import { Image, setImageConfig } from '../../src/lib/index.js';

  setImageConfig({
    provider: 'ipx',
    providers: {
      ipx: ipxProvider()
    }
  });
</script>

<Image
  src="/hero.png"
  alt="Hero"
  width={800}
  format="webp"
  custom
>
  {#snippet children({ imgAttrs, src, isLoaded })}
    <figure data-src={src} data-loaded={isLoaded}>
      <img {...imgAttrs} data-custom="yes" />
    </figure>
  {/snippet}
</Image>
