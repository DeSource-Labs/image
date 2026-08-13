import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import CustomImageFixture from './setup/CustomImageFixture.svelte';
import ImageFixture from './setup/ImageFixture.svelte';

describe('Svelte Image SSR behavior', () => {
  it('renders Image server output with generated attrs and normalized crossorigin', () => {
    const { body } = render(ImageFixture);

    expect(body).toContain('src="/_ipx/w_800&amp;f_webp/hero.png"');
    expect(body).toContain('alt="Hero"');
    expect(body).toContain('crossorigin="anonymous"');
    expect(body).toContain('nonce="nonce-value"');
  });

  it('supports custom Image rendering through a snippet', () => {
    const { body } = render(CustomImageFixture);

    expect(body).toContain('<figure');
    expect(body).toContain('data-custom="yes"');
    expect(body).toContain('data-src="/_ipx/w_800&amp;f_webp/hero.png"');
  });
});
