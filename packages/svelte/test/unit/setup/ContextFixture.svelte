<script lang="ts">
  import { setImageConfig, useImage } from '@src/context';

  setImageConfig({ provider: 'ipx' });
  const image = useImage();
  const url = image('/context.jpg', { width: 320 });
</script>

<output>{url}</output>
