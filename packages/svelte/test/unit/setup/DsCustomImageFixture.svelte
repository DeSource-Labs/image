<script lang="ts">
  import { ipxProvider } from '@desource/image';
  import { DsImage, setDsImageConfig } from '@src/index';

  setDsImageConfig({
    provider: 'ipx',
    providers: {
      ipx: ipxProvider()
    }
  });
</script>

<DsImage src="/hero.png" alt="Hero" width={800} format="webp" custom>
  {#snippet children({ imgAttrs, src, isLoaded })}
    <figure data-src={src} data-loaded={isLoaded}>
      <img {...imgAttrs} data-custom="yes" />
    </figure>
  {/snippet}
</DsImage>
