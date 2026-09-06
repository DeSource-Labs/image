import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ContextFixture from './setup/ContextFixture.svelte';
import { createDsImageConfig, dsImageForConfig, resolveCachedDsImageConfig } from '@src/context';

describe('Svelte image context', () => {
  it('memoizes unresolved configs and callable image helpers', () => {
    const input = { provider: 'ipx' };
    const resolved = createDsImageConfig(input);
    expect(createDsImageConfig(input)).toBe(resolved);
    expect(resolveCachedDsImageConfig(resolved)).toBe(resolved);
    expect(dsImageForConfig(resolved)).toBe(dsImageForConfig(resolved));
  });

  it('sets and consumes image config during component initialization', () => {
    const { body } = render(ContextFixture);
    expect(body).toContain('/_ipx/w_320/context.jpg');
  });
});
