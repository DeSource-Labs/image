// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { testDsPictureComponent, type DsPictureComponentSetupOptions } from '@common/test/unit/DsPicture';
import { DsPicture } from '@src/DsPicture';
import {
  cleanupDocument,
  createReactHarness,
  dsPicturePropsFromOptions,
  renderConfiguredMarkup,
  requireElement,
  testTools,
  withRenderedRef
} from './setup';

afterEach(cleanupDocument);

testDsPictureComponent(async (options = {}) => {
  const harness = await createReactHarness(
    { src: '/picture.jpg', alt: 'Picture', ...options } satisfies DsPictureComponentSetupOptions,
    (current, events) => (
      <DsPicture {...dsPicturePropsFromOptions(current)} onLoad={events.onLoad} onError={events.onError} />
    )
  );

  return {
    ...harness,
    picture: () => requireElement<HTMLPictureElement>(harness.container, 'picture'),
    image: () => requireElement<HTMLImageElement>(harness.container, 'picture img'),
    sources: () => Array.from(harness.container.querySelectorAll<HTMLSourceElement>('picture source'))
  };
}, testTools);

describe('React DsPicture component behavior', () => {
  it('forwards refs to the rendered picture element', async () => {
    await withRenderedRef<HTMLPictureElement>(
      'picture',
      (ref) => <DsPicture ref={ref} src="/ref.jpg" alt="Ref" width={320} formats={['webp']} />,
      (ref, picture) => {
        expect(ref).toBe(picture);
        expect(picture.querySelector('img')?.getAttribute('src')).toContain('/ref.jpg');
      }
    );
  });

  it('renders deterministic server markup with generated sources', () => {
    const body = renderConfiguredMarkup(
      <DsPicture
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
