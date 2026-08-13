<script lang="ts">
  import { Image, setImageConfig, type ImageComponentProps } from '../../../src/lib/index.js';
  import { imageComponentTestConfig } from '../../../../../common/test/unit/setup/image-test-provider';

  let {
    props,
    onload,
    onerror
  }: {
    props: ImageComponentProps;
    onload?: (event: Event) => void;
    onerror?: (event: Event) => void;
  } = $props();

  setImageConfig(imageComponentTestConfig);

  // svelte-ignore state_referenced_locally
  let current = $state({ ...props });

  export function setProps(next: Partial<ImageComponentProps>) {
    current = { ...current, ...next };
  }
</script>

<Image {...current} {onload} {onerror} />
