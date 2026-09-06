<script lang="ts">
  import { ipxProvider } from '@desource/image';
  import { DsImage, DsPicture, setDsImageConfig } from '@src/index';

  setDsImageConfig({
    provider: 'ipx',
    providers: { ipx: ipxProvider() }
  });
</script>

<DsImage
  src="/hero.png"
  alt="Preloaded hero"
  width={720}
  placeholder
  placeholderClass="blurred"
  preload={{ fetchPriority: 'high' }}
  class={['base', { featured: true }]}
  nonce="head-nonce"
/>

<DsPicture
  src="/hero.png"
  alt="Distributed picture"
  width={720}
  formats={['avif', 'webp']}
  id="picture-shell"
  class="picture-class"
  referrerpolicy="no-referrer"
  imgAttrs={{ id: 'picture-image', class: 'image-class' }}
  preload
/>
