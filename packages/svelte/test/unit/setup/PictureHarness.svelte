<script lang="ts">
  import { Picture, setImageConfig, type PictureComponentProps } from '../../../src/lib/index.js';
  import { imageComponentTestConfig } from '../../../../../common/test/unit/setup/image-test-provider';

  let {
    props,
    onload,
    onerror
  }: {
    props: PictureComponentProps;
    onload?: (event: Event) => void;
    onerror?: (event: Event) => void;
  } = $props();

  setImageConfig(imageComponentTestConfig);

  // svelte-ignore state_referenced_locally
  let current = $state({ ...props });

  export function setProps(next: Partial<PictureComponentProps>) {
    current = { ...current, ...next };
  }
</script>

<Picture {...current} {onload} {onerror} />
