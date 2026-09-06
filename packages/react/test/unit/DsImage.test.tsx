// @vitest-environment jsdom

import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { testDsImageComponent, type DsImageComponentSetupOptions } from '@common/test/unit/DsImage';
import { installMockImage } from '@common/test/unit/setup/mock-image';
import { DsImage } from '@src/DsImage';
import {
  cleanupDocument,
  createReactHarness,
  createReactRoot,
  flushReact,
  dsImagePropsFromOptions,
  renderConfiguredMarkup,
  renderReact,
  requireElement,
  testTools,
  withRenderedRef
} from './setup';

afterEach(cleanupDocument);

testDsImageComponent(async (options = {}) => {
  const harness = await createReactHarness(
    { src: '/image.jpg', alt: 'Image', ...options } satisfies DsImageComponentSetupOptions,
    (current, events) => (
      <DsImage {...dsImagePropsFromOptions(current)} onLoad={events.onLoad} onError={events.onError} />
    )
  );

  return {
    ...harness,
    image: () => requireElement<HTMLImageElement>(harness.container, 'img')
  };
}, testTools);

describe('React DsImage component behavior', () => {
  it('forwards refs to the rendered image element', async () => {
    await withRenderedRef<HTMLImageElement>(
      'img',
      (ref) => <DsImage ref={ref} src="/ref.jpg" alt="Ref" width={320} />,
      (ref, image) => {
        expect(ref).toBe(image);
        expect(image.getAttribute('src')).toContain('/ref.jpg');
      }
    );
  });

  it('renders deterministic server markup with generated attrs', () => {
    const body = renderConfiguredMarkup(
      <DsImage src="/hero.png" alt="Hero" width={800} format="webp" crossOrigin nonce="nonce-value" />
    );

    expect(body).toContain('src="/hero.png?width=800&amp;format=webp"');
    expect(body).toContain('alt="Hero"');
    expect(body).toContain('crossorigin="anonymous"');
    expect(body).toContain('nonce="nonce-value"');
  });

  it('supports custom render props without losing generated image props', async () => {
    const { target, root } = createReactRoot();
    const onLoad = vi.fn();

    await renderReact(
      root,
      <DsImage src="/custom.jpg" alt="Custom" width={480} format="webp" custom onLoad={onLoad}>
        {({ imgProps, src }) => (
          <figure data-custom="yes" data-src={src}>
            <img {...imgProps} />
          </figure>
        )}
      </DsImage>
    );

    try {
      const figure = requireElement<HTMLElement>(target, 'figure');
      const image = requireElement<HTMLImageElement>(target, 'img');
      expect(figure.dataset['custom']).toBe('yes');
      expect(figure.dataset['src']).toContain('/custom.jpg');
      expect(image.getAttribute('src')).toContain('format=webp');

      image.dispatchEvent(new Event('load'));
      expect(onLoad).toHaveBeenCalledOnce();
    } finally {
      await act(async () => root.unmount());
      target.remove();
    }
  });

  it('emits an error when placeholder decode rejects', async () => {
    const mockedImage = installMockImage({
      async decode() {
        throw new Error('decode failed');
      }
    });
    const { target, root } = createReactRoot();
    const onError = vi.fn();

    try {
      await renderReact(root, <DsImage src="/decode.jpg" alt="Decode" width={320} placeholder onError={onError} />);
      await flushReact();
      mockedImage.images[0]!.onload?.(new Event('load'));
      await flushReact();

      expect(onError).toHaveBeenCalledOnce();
      expect(requireElement<HTMLImageElement>(target, 'img').getAttribute('src')).toContain('width=10');
    } finally {
      mockedImage.restore();
      await act(async () => root.unmount());
      target.remove();
    }
  });
});
