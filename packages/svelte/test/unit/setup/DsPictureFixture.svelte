<script lang="ts">
  import { ipxProvider } from '@desource/image';
  import { DsPicture, setDsImageConfig } from '@src/index';

  setDsImageConfig({
    provider: 'ipx',
    providers: {
      ipx: ipxProvider()
    }
  });
</script>

<DsPicture src="/hero.png" alt="Hero" width={800} format="avif,webp" legacyFormat="jpg" imgAttrs={{ id: 'fallback' }} />
