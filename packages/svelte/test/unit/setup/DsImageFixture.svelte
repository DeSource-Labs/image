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

<DsImage src="/hero.png" alt="Hero" width={800} format="webp" crossorigin nonce="nonce-value" />
