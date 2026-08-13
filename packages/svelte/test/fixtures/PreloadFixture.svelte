<script lang="ts">
  import { ipxProvider } from '@desource/image';
  import { Image, Picture, setImageConfig } from '../../src/lib/index.js';

  setImageConfig({
    provider: 'ipx',
    providers: { ipx: ipxProvider() }
  });
</script>

<Image
  src="/hero.png"
  alt="Preloaded hero"
  width={720}
  placeholder
  placeholderClass="blurred"
  preload={{ fetchPriority: 'high' }}
  class={['base', { featured: true }]}
  nonce="head-nonce"
/>

<Picture
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
