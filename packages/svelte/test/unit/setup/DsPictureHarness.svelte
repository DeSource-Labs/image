<script lang="ts">
  import { DsPicture, setDsImageConfig, type DsPictureComponentProps } from '@src/index';
  import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';

  let {
    props,
    onload,
    onerror
  }: {
    props: DsPictureComponentProps;
    onload?: (event: Event) => void;
    onerror?: (event: Event) => void;
  } = $props();

  setDsImageConfig(imageComponentTestConfig);

  // svelte-ignore state_referenced_locally
  let current = $state({ ...props });

  export function setProps(next: Partial<DsPictureComponentProps>) {
    current = { ...current, ...next };
  }
</script>

<DsPicture {...current} {onload} {onerror} />
