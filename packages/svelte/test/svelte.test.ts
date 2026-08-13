import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { createImage, getImageAttrs, getPictureAttrs } from '@desource/image';
import { testImageBehavior } from '../../../common/test/unit/image-behavior';
import CustomImageFixture from './fixtures/CustomImageFixture.svelte';
import ImageFixture from './fixtures/ImageFixture.svelte';
import PictureFixture from './fixtures/PictureFixture.svelte';
import PreloadFixture from './fixtures/PreloadFixture.svelte';

testImageBehavior({
  name: 'svelte',
  createImage,
  getImageAttrs,
  getPictureAttrs
});

describe('svelte components', () => {
  it('renders Image server output with generated attrs and normalized crossorigin', () => {
    const { body } = render(ImageFixture);

    expect(body).toContain('src="/_ipx/w_800&amp;f_webp/hero.png"');
    expect(body).toContain('alt="Hero"');
    expect(body).toContain('crossorigin="anonymous"');
    expect(body).toContain('nonce="nonce-value"');
  });

  it('renders Picture server output with imgAttrs on the fallback image', () => {
    const { body } = render(PictureFixture);

    expect(body).toContain('<picture data-ds-picture="">');
    expect(body).toContain('type="image/avif"');
    expect(body).toContain('type="image/webp"');
    expect(body).toContain('id="fallback"');
    expect(body).toContain('src="/_ipx/w_800&amp;f_jpg/hero.png"');
  });

  it('supports custom Image rendering through a snippet', () => {
    const { body } = render(CustomImageFixture);

    expect(body).toContain('<figure');
    expect(body).toContain('data-custom="yes"');
    expect(body).toContain('data-src="/_ipx/w_800&amp;f_webp/hero.png"');
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
