import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ContextFixture from './setup/ContextFixture.svelte';
import { createImageConfig, imageForConfig, resolveCachedConfig } from '../../src/lib/context.js';

describe('Svelte image context', () => {
  it('memoizes unresolved configs and callable image helpers', () => {
    const input = { provider: 'ipx' };
    const resolved = createImageConfig(input);
    expect(createImageConfig(input)).toBe(resolved);
    expect(resolveCachedConfig(resolved)).toBe(resolved);
    expect(imageForConfig(resolved)).toBe(imageForConfig(resolved));
  });

  it('sets and consumes image config during component initialization', () => {
    const { body } = render(ContextFixture);
    expect(body).toContain('/_ipx/w_320/context.jpg');
  });
});
