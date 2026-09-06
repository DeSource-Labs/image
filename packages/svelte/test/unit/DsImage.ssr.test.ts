import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import DsCustomImageFixture from './setup/DsCustomImageFixture.svelte';
import DsImageFixture from './setup/DsImageFixture.svelte';

describe('Svelte DsImage SSR behavior', () => {
  it('renders DsImage server output with generated attrs and normalized crossorigin', () => {
    const { body } = render(DsImageFixture);

    expect(body).toContain('src="/_ipx/w_800&amp;f_webp/hero.png"');
    expect(body).toContain('alt="Hero"');
    expect(body).toContain('crossorigin="anonymous"');
    expect(body).toContain('nonce="nonce-value"');
  });

  it('supports custom DsImage rendering through a snippet', () => {
    const { body } = render(DsCustomImageFixture);

    expect(body).toContain('<figure');
    expect(body).toContain('data-custom="yes"');
    expect(body).toContain('data-src="/_ipx/w_800&amp;f_webp/hero.png"');
  });
});
