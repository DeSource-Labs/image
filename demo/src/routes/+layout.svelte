<script lang="ts">
  import '../app.scss';
  import SiteFooter from '$lib/SiteFooter.svelte';

  let { children } = $props();
</script>

<div class="site-frame">
  <div class="site-content">{@render children()}</div>
  <SiteFooter />
</div>

<style lang="scss">
  .site-frame {
    display: flex;
    min-height: 100svh;
    flex-direction: column;

    .site-content {
      flex: 1 0 auto;
    }
  }
</style>
