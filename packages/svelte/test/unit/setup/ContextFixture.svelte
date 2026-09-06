<script lang="ts">
  import { setDsImageConfig, useDsImage } from '@src/context';

  setDsImageConfig({ provider: 'ipx' });
  const image = useDsImage();
  const url = image('/context.jpg', { width: 320 });
</script>

<output>{url}</output>
