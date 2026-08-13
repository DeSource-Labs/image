<script lang="ts">
  import { setImageConfig, useImage } from '../../../src/lib/context.js';

  setImageConfig({ provider: 'ipx' });
  const image = useImage();
  const url = image('/context.jpg', { width: 320 });
</script>

<output>{url}</output>
