import type { IncomingMessage, ServerResponse } from 'node:http';
import type { IPXModifiers } from 'ipx';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getImage, type ImageConfig, type ImageFit } from '@src/index';
import { bytescaleProvider } from '@src/providers/bytescale';
import {
  createImageResponsePreview,
  createImageResponseServer,
  defineImageResponseTests,
  imageContentTypes,
  inspectImage
} from '../setup/image-response';

const preview = createImageResponsePreview('bytescale-processing-fixture');
const filePath = '/external/raw/landscape.jpg';
const token = 'source+token/with=encoding';
const source = `/W142hJk/raw${filePath}?token=${encodeURIComponent(token)}&version=2`;
let baseURL: string;
let config: ImageConfig;

// This controlled server checks the documented URL contract and decodes real
// image bytes. It does not verify a Bytescale account or external storage setup.
// Contract: https://www.bytescale.com/docs/image-processing-api
async function serveImage(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url!, baseURL);
  if (url.pathname !== `/W142hJk/image${filePath}`) {
    response.writeHead(404).end('Expected the account image endpoint and unchanged source path.');
    return;
  }
  if (url.searchParams.get('token') !== token || url.searchParams.get('version') !== '2') {
    response.writeHead(401).end('Missing source access parameters.');
    return;
  }

  const width = Number(url.searchParams.get('w') ?? 0);
  const height = Number(url.searchParams.get('h') ?? 0);
  const format = url.searchParams.get('f') ?? 'png';
  const fit = url.searchParams.get('fit') ?? 'crop';
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 0 ||
    height < 0 ||
    !Object.hasOwn(imageContentTypes, format) ||
    !['crop', 'max', 'min', 'shrink', 'shrink-cover', 'stretch'].includes(fit)
  ) {
    response.writeHead(400).end('Invalid Bytescale dimensions, format, or fit.');
    return;
  }

  const modifiers: Partial<IPXModifiers> = {
    format,
    fit:
      fit === 'crop'
        ? 'cover'
        : fit === 'stretch'
          ? 'fill'
          : fit === 'min' || fit === 'shrink-cover'
            ? 'outside'
            : 'inside'
  };
  if (width && height) modifiers.resize = `${width}x${height}`;
  else if (width) modifiers.width = width;
  else if (height) modifiers.height = height;
  if (fit !== 'shrink' && fit !== 'shrink-cover') modifiers.enlarge = true;
  const quality = url.searchParams.get('q');
  if (quality) modifiers.quality = quality;

  const image = await preview('landscape.svg', modifiers).process();
  response.writeHead(200, { 'Content-Type': imageContentTypes[format]! }).end(image.data);
}

const server = createImageResponseServer(serveImage);

beforeAll(async () => {
  baseURL = await server.start();
  config = {
    provider: 'bytescale',
    providers: { bytescale: bytescaleProvider({ baseURL }) },
    providerSizes: [160, 320, 640],
    densities: [1]
  };
});

afterAll(() => server.close());

describe('Bytescale controlled-server response contract', () => {
  defineImageResponseTests(() => ({ src: source, config }));

  it.each([
    ['cover', 160, 160, 160, 160],
    ['contain', 160, 160, 160, 90],
    ['inside', 160, 160, 160, 90],
    ['outside', 180, 180, 320, 180],
    ['fill', 160, 160, 160, 160],
    ['scale-down', 160, 160, 160, 90],
    ['shrink-cover', 180, 180, 320, 180]
  ] satisfies [ImageFit, number, number, number, number][])(
    'decodes the documented geometry for %s',
    async (fit, width, height, expectedWidth, expectedHeight) => {
      const image = getImage({ src: source, width, height, fit, format: 'png' }, config);
      expect(await inspectImage(image.url)).toMatchObject({ width: expectedWidth, height: expectedHeight });
    }
  );

  it('prevents enlargement with scale-down while max can enlarge', async () => {
    const shrink = getImage({ src: source, width: 3200, height: 1800, fit: 'scale-down', format: 'png' }, config);
    expect(await inspectImage(shrink.url)).toMatchObject({ width: 1600, height: 900 });
    const enlarge = getImage({ src: source, width: 3200, height: 1800, fit: 'contain', format: 'png' }, config);
    expect(await inspectImage(enlarge.url)).toMatchObject({ width: 3200, height: 1800 });
  });
});
