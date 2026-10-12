import { Buffer } from 'node:buffer';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createIPX, type IPXModifiers } from 'ipx';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getImageAttrs, getPictureAttrs, type ImageConfig } from '@src/index';
import { appwriteProvider } from '@src/providers/appwrite';

const source = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#246" /></svg>'
);
const preview = createIPX({
  storage: { name: 'appwrite-preview-fixture', getMeta: () => ({}), getData: () => source }
});
const path = '/v1/storage/buckets/photos/files/landscape';
const token = 'file+token/with=encoding';
const contentTypes: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif'
};
let baseURL: string;
let config: ImageConfig;

// This controlled server checks the documented URL contract and real image bytes.
// It does not verify an Appwrite deployment, its permissions, or plan availability.
// Contract: https://appwrite.io/docs/products/storage/images
async function servePreview(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url!, baseURL);
  if (url.pathname !== `${path}/preview`) {
    response.writeHead(404).end('Expected the Storage preview endpoint.');
    return;
  }
  if (url.searchParams.get('project') !== 'project-id' || url.searchParams.get('token') !== token) {
    response.writeHead(401).end('Missing project or file token.');
    return;
  }

  const width = Number(url.searchParams.get('width') ?? 0);
  const height = Number(url.searchParams.get('height') ?? 0);
  const output = url.searchParams.get('output') ?? 'png';
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 0 ||
    height < 0 ||
    width > 4000 ||
    height > 4000 ||
    !Object.hasOwn(contentTypes, output)
  ) {
    response.writeHead(400).end('Invalid preview dimensions or output.');
    return;
  }

  const modifiers: Partial<IPXModifiers> = { format: output };
  if (width && height) modifiers.resize = `${width}x${height}`;
  else if (width) modifiers.width = width;
  else if (height) modifiers.height = height;
  const image = await preview('landscape.svg', modifiers).process();
  response.writeHead(200, { 'Content-Type': contentTypes[output]! }).end(image.data);
}

const server = createServer((request, response) => {
  void servePreview(request, response).catch((error: unknown) => {
    response.writeHead(500).end(String(error));
  });
});

async function inspectImage(url: string) {
  const response = await fetch(url);
  expect(response.status).toBe(200);
  const data = Buffer.from(await response.arrayBuffer());
  const decode = createIPX({
    storage: { name: 'response-bytes', getMeta: () => ({}), getData: () => data }
  });
  // Re-encoding forces the image decoder to consume the response body. The
  // metadata describes those response bytes, independently of the URL query.
  const decoded = await decode('response', { format: 'png' }).process();
  expect(decoded.data.length).toBeGreaterThan(0);
  return { ...decoded.meta, contentType: response.headers.get('content-type') };
}

function candidates(srcset: string) {
  return srcset.split(', ').map((candidate) => {
    const [url, descriptor] = candidate.split(' ');
    return { url: url!, descriptor: descriptor! };
  });
}

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  config = {
    provider: 'appwrite',
    providers: { appwrite: appwriteProvider({ baseURL, projectId: 'project-id' }) },
    providerSizes: [160, 320, 640],
    densities: [1]
  };
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

describe('Appwrite controlled-server response contract', () => {
  it('returns decoded widths matching every responsive width descriptor', async () => {
    const attrs = getImageAttrs(
      {
        src: `${path}/view?token=${encodeURIComponent(token)}`,
        width: 640,
        height: 360,
        sizes: '100vw',
        format: 'webp'
      },
      config
    );
    const variants = candidates(attrs.srcset!);
    expect(variants.map(({ descriptor }) => descriptor)).toEqual(['160w', '320w', '640w', '1536w']);
    for (const { url, descriptor } of variants) {
      const width = Number.parseInt(descriptor, 10);
      expect(await inspectImage(url)).toEqual({
        width,
        height: (width * 9) / 16,
        type: 'webp',
        contentType: 'image/webp'
      });
    }
  });

  it('keeps access parameters while serving density variants and the placeholder', async () => {
    const attrs = getImageAttrs(
      {
        src: `${path}/preview?project=project-id&token=${encodeURIComponent(token)}`,
        width: 160,
        height: 90,
        densities: [1, 2],
        format: 'png',
        placeholder: true
      },
      config
    );
    const variants = candidates(attrs.srcset!);
    expect(variants.map(({ descriptor }) => descriptor)).toEqual(['1x', '2x']);
    for (const { url, descriptor } of variants) {
      const density = Number.parseInt(descriptor, 10);
      expect(await inspectImage(url)).toMatchObject({ width: 160 * density, height: 90 * density, type: 'png' });
    }
    expect(await inspectImage(attrs.placeholderSrc!)).toMatchObject({ width: 10, type: 'png' });
  });

  it('serves each advertised picture MIME type and a decoded JPEG fallback', async () => {
    const picture = getPictureAttrs(
      {
        src: `${path}/view?token=${encodeURIComponent(token)}`,
        width: 160,
        height: 90,
        formats: ['avif', 'webp'],
        fallbackFormat: 'jpeg'
      },
      config
    );
    expect(picture.sources.map(({ type }) => type)).toEqual(['image/avif', 'image/webp']);
    for (const { srcset, type } of picture.sources) {
      for (const { url } of candidates(srcset)) {
        expect(await inspectImage(url)).toEqual({
          width: 160,
          height: 90,
          type: type!.slice('image/'.length),
          contentType: type
        });
      }
    }
    expect(await inspectImage(picture.img.src)).toEqual({
      width: 160,
      height: 90,
      type: 'jpg',
      contentType: 'image/jpeg'
    });
  });
});
