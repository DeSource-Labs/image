import type { IncomingMessage, ServerResponse } from 'node:http';
import type { IPXModifiers } from 'ipx';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getImage, type ImageConfig, type ImageModifiers } from '@src/index';
import { imagebossProvider } from '@src/providers/imageboss';
import {
  createImageResponsePreview,
  createImageResponseServer,
  defineImageResponseTests,
  imageContentTypes,
  inspectImage
} from '../setup/image-response';

const preview = createImageResponsePreview('imageboss-processing-fixture');
const source = '/folder/landscape%20one.jpg?token=source%2Btoken%2F%3D&version=2';
let baseURL: string;
let config: ImageConfig;

// This server independently interprets the public URL contract and returns real
// image bytes. It does not verify a live ImageBoss source or account.
// https://imageboss.me/docs/operations/cover
// https://imageboss.me/docs/image-conversion
async function serveImage(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url!, baseURL);
  const segments = url.pathname.slice(1).split('/');
  const sourceName = segments.shift();
  const operation = segments.shift()!;
  const dimensions = operation === 'cdn' ? '' : segments.shift()!;
  const options = new Map<string, string>();
  if (segments[0]?.includes(':')) {
    for (const option of segments.shift()!.split(',')) {
      const separator = option.indexOf(':');
      options.set(option.slice(0, separator), decodeURIComponent(option.slice(separator + 1)));
    }
  }
  if (sourceName !== 'website' || segments.join('/') !== 'folder/landscape%20one.jpg') {
    response.writeHead(404).end('Expected the configured source and unchanged file path.');
    return;
  }
  if (url.searchParams.get('token') !== 'source+token/=' || url.searchParams.get('version') !== '2') {
    response.writeHead(401).end('Missing source access parameters.');
    return;
  }
  const format = options.get('format') ?? 'png';
  if (!Object.hasOwn(imageContentTypes, format)) {
    response.writeHead(400).end('Unsupported output format.');
    return;
  }

  const modifiers: Partial<IPXModifiers> = { format, enlarge: true };
  if (operation === 'width' || operation === 'height') {
    if (!/^[1-9]\d*$/.test(dimensions)) {
      response.writeHead(400).end('Expected one positive dimension.');
      return;
    }
    modifiers[operation] = Number(dimensions);
  } else if (['cover', 'cover:center', 'cover:contain', 'cover:inside'].includes(operation)) {
    if (!/^[1-9]\d*x[1-9]\d*$/.test(dimensions)) {
      response.writeHead(400).end('Expected width and height.');
      return;
    }
    modifiers.resize = dimensions;
    modifiers.fit = operation === 'cover:contain' ? 'contain' : operation === 'cover:inside' ? 'inside' : 'cover';
  } else if (operation !== 'cdn') {
    response.writeHead(400).end('Unsupported operation.');
    return;
  }
  if (options.has('quality')) modifiers.quality = options.get('quality')!;
  if (options.has('fill-color')) modifiers.background = `#${options.get('fill-color')!}`;
  const image = await preview('landscape.svg', modifiers).process();
  response.writeHead(200, { 'Content-Type': imageContentTypes[format]! }).end(image.data);
}

const server = createImageResponseServer(serveImage);

beforeAll(async () => {
  baseURL = await server.start();
  config = {
    provider: 'imageboss',
    providers: { imageboss: imagebossProvider({ baseURL, source: 'website' }) },
    providerSizes: [160, 320, 640],
    densities: [1]
  };
});

afterAll(() => server.close());

describe('ImageBoss controlled-server response contract', () => {
  defineImageResponseTests(() => ({ src: source, config }));

  it.each([
    [{}, 1600, 900],
    [{ width: 160 }, 160, 90],
    [{ height: 90 }, 160, 90],
    [{ width: 160, height: 160, fit: 'cover' }, 160, 160],
    [{ width: 160, height: 160, fit: 'contain', background: '#abcdef' }, 160, 160],
    [{ width: 160, height: 160, fit: 'inside' }, 160, 90]
  ] satisfies [ImageModifiers, number, number][])(
    'decodes documented geometry for %j',
    async (modifiers, width, height) => {
      const image = getImage({ src: source, format: 'png', modifiers }, config);
      expect(await inspectImage(image.url)).toMatchObject({ width, height, type: 'png' });
    }
  );
});
