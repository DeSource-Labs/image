<script lang="ts">
  import { ipxProvider } from '@desource/image';
  import { Picture, setImageConfig } from '../../src/lib/index.js';

  setImageConfig({
    provider: 'ipx',
    providers: {
      ipx: ipxProvider()
    }
  });
</script>

<Picture
  src="/hero.png"
  alt="Hero"
  width={800}
  format="avif,webp"
  legacyFormat="jpg"
  imgAttrs={{ id: 'fallback' }}
/>
