// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { testPictureComponent, type PictureComponentSetupOptions } from '@common/test/unit/Picture';
import { Picture } from '@src/Picture';
import {
  cleanupDocument,
  createReactHarness,
  picturePropsFromOptions,
  renderConfiguredMarkup,
  requireElement,
  testTools,
  withRenderedRef
} from './setup';

afterEach(cleanupDocument);

testPictureComponent(async (options = {}) => {
  const harness = await createReactHarness(
    { src: '/picture.jpg', alt: 'Picture', ...options } satisfies PictureComponentSetupOptions,
    (current, events) => (
      <Picture {...picturePropsFromOptions(current)} onLoad={events.onLoad} onError={events.onError} />
    )
  );

  return {
    ...harness,
    picture: () => requireElement<HTMLPictureElement>(harness.container, 'picture'),
    image: () => requireElement<HTMLImageElement>(harness.container, 'picture img'),
    sources: () => Array.from(harness.container.querySelectorAll<HTMLSourceElement>('picture source'))
  };
}, testTools);

describe('React Picture component behavior', () => {
  it('forwards refs to the rendered picture element', async () => {
    await withRenderedRef<HTMLPictureElement>(
      'picture',
      (ref) => <Picture ref={ref} src="/ref.jpg" alt="Ref" width={320} formats={['webp']} />,
      (ref, picture) => {
        expect(ref).toBe(picture);
        expect(picture.querySelector('img')?.getAttribute('src')).toContain('/ref.jpg');
      }
    );
  });

  it('renders deterministic server markup with generated sources', () => {
    const body = renderConfiguredMarkup(
      <Picture
        src="/hero.png"
        alt="Hero"
        width={800}
        formats={['avif', 'webp']}
        fallbackFormat="jpg"
        imgAttrs={{ className: 'fallback' }}
      />
    );

    expect(body).toContain('<picture');
    expect(body).toContain('type="image/avif"');
    expect(body).toContain('type="image/webp"');
    expect(body).toContain('format=jpg');
    expect(body).toContain('class="fallback"');
  });
});
