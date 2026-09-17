import { describe, expect, it } from 'vitest';
import type { DsImageComponentSetup } from './DsImage';
import { installMockImage } from './setup/mock-image';
import type { TestTools } from './setup/tools';

export function testPlaceholderLifecycle(setup: DsImageComponentSetup, { act }: TestTools): void {
  describe('placeholder lifecycle', () => {
    it.each(['resolve', 'reject'] as const)(
      'ignores a stale decode that %ss after the source changes',
      async (outcome) => {
        const pending = deferredDecode();
        const mocked = installMockImage({ decode: () => pending.promise });
        const rendered = await setup({ src: '/old.jpg', alt: 'Photo', placeholder: '/preview.jpg' });

        try {
          await rendered.flush();
          const oldImage = mocked.images[0]!;
          await act(async () => oldImage.onload?.(new Event('load')));
          await rendered.update({ src: '/current.jpg' });
          expect(oldImage.onload).toBeNull();
          expect(oldImage.onerror).toBeNull();

          await act(async () => {
            if (outcome === 'resolve') pending.resolve();
            else pending.reject(new Error('stale decode'));
            await mocked.flush();
          });
          await rendered.flush();
          expect(rendered.image().getAttribute('src')).toBe('/preview.jpg');
          expect(rendered.onLoad).not.toHaveBeenCalled();
          expect(rendered.onError).not.toHaveBeenCalled();
          expect(mocked.images).toHaveLength(2);

          // The replacement still owns the loading state after the stale result.
          mocked.images[1]!.decode = async () => undefined;
          await act(async () => {
            mocked.images[1]!.onload?.(new Event('load'));
            await mocked.flush();
          });
          await rendered.flush();
          expect(rendered.image().getAttribute('src')).toContain('/current.jpg');
        } finally {
          await rendered.unmount();
          mocked.restore();
        }
      }
    );

    it.each(['resolve', 'reject'] as const)('ignores a pending decode that %ss after unmount', async (outcome) => {
      const pending = deferredDecode();
      const mocked = installMockImage({ decode: () => pending.promise });
      const rendered = await setup({ src: '/photo.jpg', alt: 'Photo', placeholder: '/preview.jpg' });
      let unmounted = false;

      try {
        await rendered.flush();
        const image = mocked.images[0]!;
        await act(async () => image.onload?.(new Event('load')));
        await rendered.unmount();
        unmounted = true;
        expect(image.onload).toBeNull();
        expect(image.onerror).toBeNull();
        await act(async () => {
          if (outcome === 'resolve') pending.resolve();
          else pending.reject(new Error('unmounted decode'));
          await mocked.flush();
        });
        expect(rendered.onLoad).not.toHaveBeenCalled();
        expect(rendered.onError).not.toHaveBeenCalled();
      } finally {
        if (!unmounted) await rendered.unmount();
        mocked.restore();
      }
    });

    it('reveals the loaded image when the browser has no decode API', async () => {
      const mocked = installMockImage({ decode: false });
      const rendered = await setup({ src: '/photo.jpg', alt: 'Photo', placeholder: '/preview.jpg' });
      try {
        await rendered.flush();
        await act(async () => {
          mocked.images[0]!.onload?.(new Event('load'));
          await mocked.flush();
        });
        await rendered.flush();
        expect(rendered.image().getAttribute('src')).toContain('/photo.jpg');
        expect(rendered.image().classList.contains('ds-image-placeholder')).toBe(false);
      } finally {
        await rendered.unmount();
        mocked.restore();
      }
    });

    it('keeps the placeholder visible when decoding fails and reports the error', async () => {
      const mocked = installMockImage({
        decode: async () => {
          throw new Error('invalid image');
        }
      });
      const rendered = await setup({ src: '/broken.jpg', alt: 'Photo', placeholder: '/preview.jpg' });
      try {
        await rendered.flush();
        await act(async () => {
          mocked.images[0]!.onload?.(new Event('load'));
          await mocked.flush();
        });
        await rendered.flush();
        expect(rendered.image().getAttribute('src')).toBe('/preview.jpg');
        expect(rendered.onError).toHaveBeenCalledOnce();
        expect(rendered.onLoad).not.toHaveBeenCalled();
      } finally {
        await rendered.unmount();
        mocked.restore();
      }
    });
  });
}

function deferredDecode() {
  let resolve!: () => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}
