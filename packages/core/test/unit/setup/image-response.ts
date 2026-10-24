import { Buffer } from 'node:buffer';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createIPX, type HandlerContext } from 'ipx';
import { expect } from 'vitest';
import { getImageAttrs, getPictureAttrs, type ImageAttrs, type ImageConfig } from '@src/index';

export const imageContentTypes: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif'
};

export function createImageResponsePreview(name: string) {
  const source = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#246" /></svg>'
  );
  return createIPX({ storage: { name, getMeta: () => ({}), getData: () => source } });
}

export function createImageResponseServer(
  handle: (request: IncomingMessage, response: ServerResponse) => Promise<void>
) {
  const server = createServer((request, response) => {
    void handle(request, response).catch((error: unknown) => response.writeHead(500).end(String(error)));
  });
  return {
    async start(): Promise<string> {
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
      return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    },
    async close(): Promise<void> {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  };
}

export function candidates(srcset: string) {
  return srcset.split(', ').map((candidate) => {
    const [url, descriptor] = candidate.split(' ');
    return { url: url!, descriptor: descriptor! };
  });
}

export async function inspectImage(
  url: string
): Promise<Partial<HandlerContext['meta']> & { contentType: string | null }> {
  const response = await globalThis.fetch(url);
  expect(response.status).toBe(200);
  const bytes = Buffer.from(await response.arrayBuffer());
  const decode = createIPX({ storage: { name: 'response-bytes', getMeta: () => ({}), getData: () => bytes } });
  // Re-encoding forces the decoder to consume the response body. The metadata
  // describes the response bytes independently of the URL query.
  const decoded = await decode('response', { format: 'png' }).process();
  expect(decoded.data.length).toBeGreaterThan(0);
  return { ...decoded.meta, contentType: response.headers.get('content-type') };
}

export async function expectResponsiveImageWidths(src: string, config: ImageConfig): Promise<void> {
  const attrs = getImageAttrs({ src, width: 640, height: 360, sizes: '100vw', format: 'webp' }, config);
  const variants = candidates(attrs.srcset!);
  expect(variants.map(({ descriptor }) => descriptor)).toEqual(['160w', '320w', '640w', '1536w']);
  await Promise.all(
    variants.map(async ({ url, descriptor }) => {
      const width = Number.parseInt(descriptor, 10);
      expect(await inspectImage(url)).toEqual({
        width,
        height: (width * 9) / 16,
        type: 'webp',
        contentType: 'image/webp'
      });
    })
  );
}

export async function expectDensityImageSizes(attrs: ImageAttrs, expected: { width: number; height: number }) {
  const variants = candidates(attrs.srcset!);
  expect(variants.map(({ descriptor }) => descriptor)).toEqual(['1x', '2x']);
  await Promise.all(
    variants.map(async ({ url, descriptor }) => {
      const density = Number.parseInt(descriptor, 10);
      expect(await inspectImage(url)).toMatchObject({
        width: expected.width * density,
        height: expected.height * density,
        type: 'png'
      });
    })
  );
  return variants;
}

export async function expectPictureImageTypes(src: string, config: ImageConfig): Promise<void> {
  const picture = getPictureAttrs(
    { src, width: 160, height: 90, formats: ['avif', 'webp'], fallbackFormat: 'jpeg' },
    config
  );
  expect(picture.sources.map(({ type }) => type)).toEqual(['image/avif', 'image/webp']);
  await Promise.all(
    picture.sources.flatMap(({ srcset, type }) =>
      candidates(srcset).map(async ({ url }) => {
        expect(await inspectImage(url)).toEqual({
          width: 160,
          height: 90,
          type: type!.slice('image/'.length),
          contentType: type
        });
      })
    )
  );
  expect(await inspectImage(picture.img.src)).toEqual({
    width: 160,
    height: 90,
    type: 'jpg',
    contentType: 'image/jpeg'
  });
}
