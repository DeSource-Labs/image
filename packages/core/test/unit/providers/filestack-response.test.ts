import { createHmac } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { IPXModifiers } from 'ipx';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ImageConfig } from '@src/index';
import { filestackProvider } from '@src/providers/filestack';
import {
  createImageResponsePreview,
  createImageResponseServer,
  expectCroppedDensityAndPlaceholder,
  expectPictureImageTypes,
  expectResponsiveImageWidths,
  imageContentTypes
} from '../setup/image-response';

const handle = 'pdn7PhZdT02GoYZCVYeF';
const preview = createImageResponsePreview('filestack-processing-fixture');
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
  response.writeHead(200, { 'Content-Type': imageContentTypes[format]! }).end(image.data);
}

const server = createImageResponseServer(serveImage);

beforeAll(async () => {
  baseURL = await server.start();
  config = {
    provider: 'filestack',
    providers: {
      filestack: filestackProvider({ baseURL, signURL: (url) => `${url}?fixtureSignature=${signature(url)}` })
    },
    providerSizes: [160, 320, 640],
    densities: [1]
  };
});

afterAll(() => server.close());

describe('Filestack controlled-server response contract', () => {
  it('returns decoded widths matching every responsive width descriptor', async () => {
    await expectResponsiveImageWidths(handle, config);
  });

  it('crops density variants and serves the separately signed placeholder', async () => {
    const variants = await expectCroppedDensityAndPlaceholder(handle, config);
    const tampered = variants[0]!.url.replace('width:160', 'width:161');
    expect((await fetch(tampered)).status).toBe(401);
  });

  it('serves each advertised picture MIME type and a decoded JPEG fallback', async () => {
    await expectPictureImageTypes(handle, config);
  });
});
