import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createIPX, type IPXModifiers } from 'ipx';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getImageAttrs, getPictureAttrs, type ImageConfig } from '@src/index';
import { filestackProvider } from '@src/providers/filestack';

const handle = 'pdn7PhZdT02GoYZCVYeF';
const source = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#246" /></svg>'
);
const preview = createIPX({
  storage: { name: 'filestack-processing-fixture', getMeta: () => ({}), getData: () => source }
});
const contentTypes: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif'
};
const secret = 'controlled-server-test-key';
let baseURL: string;
let config: ImageConfig;

function signature(url: string) {
  return createHmac('sha256', secret).update(url).digest('hex');
}

// This server checks the documented task order and decodes real image bytes. It
// does not verify a Filestack account, plan, or policy. The test-only signature
// checks that signURL receives the complete final URL for every variant.
async function serveImage(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url!, baseURL);
  const signed = url.searchParams.get('fixtureSignature');
  url.search = '';
  if (signed !== signature(url.href)) {
    response.writeHead(401).end('The final transformed URL must be signed.');
    return;
  }

  const match =
    /^\/resize=width:(\d+),height:(\d+)(?:,fit:(crop|clip|scale|max))?\/output=format:(png|jpg|webp|avif)(?:,quality:(\d+))?\/(.+)$/.exec(
      url.pathname
    );
  if (!match || match[6] !== handle) {
    response.writeHead(400).end('Expected resize, then output, then the source handle.');
    return;
  }
  const width = Number(match[1]);
  const height = Number(match[2]);
  const fit = match[3] ?? 'clip';
  const format = match[4]!;
  if (width < 1 || width > 10000 || height < 1 || height > 10000) {
    response.writeHead(400).end('Invalid Filestack resize dimensions.');
    return;
  }
  const modifiers: Partial<IPXModifiers> = {
    resize: `${width}x${height}`,
    fit: fit === 'crop' ? 'cover' : fit === 'scale' ? 'fill' : 'inside',
    format
  };
  if (fit !== 'max') modifiers.enlarge = true;
  if (match[5]) modifiers.quality = match[5];
  const image = await preview('landscape.svg', modifiers).process();
  response.writeHead(200, { 'Content-Type': contentTypes[format]! }).end(image.data);
}

const server = createServer((request, response) => {
  void serveImage(request, response).catch((error: unknown) => response.writeHead(500).end(String(error)));
});

function candidates(srcset: string) {
  return srcset.split(', ').map((candidate) => {
    const [url, descriptor] = candidate.split(' ');
    return { url: url!, descriptor: descriptor! };
  });
}

async function inspectImage(url: string) {
  const response = await fetch(url);
  expect(response.status).toBe(200);
  const bytes = Buffer.from(await response.arrayBuffer());
  const decode = createIPX({ storage: { name: 'response-bytes', getMeta: () => ({}), getData: () => bytes } });
  const decoded = await decode('response', { format: 'png' }).process();
  expect(decoded.data.length).toBeGreaterThan(0);
  return { ...decoded.meta, contentType: response.headers.get('content-type') };
}

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  config = {
    provider: 'filestack',
    providers: {
      filestack: filestackProvider({ baseURL, signURL: (url) => `${url}?fixtureSignature=${signature(url)}` })
    },
    providerSizes: [160, 320, 640],
    densities: [1]
  };
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

describe('Filestack controlled-server response contract', () => {
  it('returns decoded widths matching every responsive width descriptor', async () => {
    const attrs = getImageAttrs({ src: handle, width: 640, height: 360, sizes: '100vw', format: 'webp' }, config);
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

  it('crops density variants and serves the separately signed placeholder', async () => {
    const attrs = getImageAttrs(
      { src: handle, width: 160, height: 160, fit: 'cover', densities: [1, 2], format: 'png', placeholder: true },
      config
    );
    const variants = candidates(attrs.srcset!);
    expect(variants.map(({ descriptor }) => descriptor)).toEqual(['1x', '2x']);
    for (const { url, descriptor } of variants) {
      const density = Number.parseInt(descriptor, 10);
      expect(await inspectImage(url)).toMatchObject({ width: 160 * density, height: 160 * density, type: 'png' });
    }
    expect(await inspectImage(attrs.placeholderSrc!)).toMatchObject({ width: 10, height: 10, type: 'png' });
    const tampered = variants[0]!.url.replace('width:160', 'width:161');
    expect((await fetch(tampered)).status).toBe(401);
  });

  it('serves each advertised picture MIME type and a decoded JPEG fallback', async () => {
    const picture = getPictureAttrs(
      { src: handle, width: 160, height: 90, formats: ['avif', 'webp'], fallbackFormat: 'jpeg' },
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
