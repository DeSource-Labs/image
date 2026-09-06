<script lang="ts">
  import { DsImage, setDsImageConfig, type DsImageComponentProps } from '@src/index';
  import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';

  let {
    props,
    onload,
    onerror
  }: {
    props: DsImageComponentProps;
    onload?: (event: Event) => void;
    onerror?: (event: Event) => void;
  } = $props();

  setDsImageConfig(imageComponentTestConfig);

  // svelte-ignore state_referenced_locally
  let current = $state({ ...props });

  export function setProps(next: Partial<DsImageComponentProps>) {
    current = { ...current, ...next };
  }
</script>

<DsImage {...current} {onload} {onerror} />
