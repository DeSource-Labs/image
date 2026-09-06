import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import DsPictureFixture from './setup/DsPictureFixture.svelte';
import PreloadFixture from './setup/PreloadFixture.svelte';

describe('Svelte DsPicture SSR behavior', () => {
  it('renders DsPicture server output with imgAttrs on the fallback image', () => {
    const { body } = render(DsPictureFixture);

    expect(body).toContain('<picture data-ds-picture="">');
    expect(body).toContain('type="image/avif"');
    expect(body).toContain('type="image/webp"');
    expect(body).toContain('id="fallback"');
    expect(body).toContain('src="/_ipx/w_800&amp;f_jpg/hero.png"');
  });

  it('renders true placeholders and preload links into the SSR head', () => {
    const { body, head } = render(PreloadFixture);

    expect(body).toContain('src="/_ipx/blur_3&amp;q_50&amp;s_10x10/hero.png"');
    expect(body).not.toContain('background-image');
    expect(body).toContain('class="base featured blurred"');
    expect(body).toContain('id="picture-shell"');
    expect(body).toContain('id="picture-image"');
    expect(body).toContain('referrerpolicy="no-referrer"');
    expect(head.match(/rel="preload"/g)).toHaveLength(2);
    expect(head).toContain('fetchpriority="high"');
    expect(head).toContain('nonce="head-nonce"');
  });
});
