import type { IncomingMessage, ServerResponse } from 'node:http';
import type { IPXModifiers } from 'ipx';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getImageAttrs, type ImageConfig } from '@src/index';
import { appwriteProvider } from '@src/providers/appwrite';
import {
  createImageResponsePreview,
  createImageResponseServer,
  expectDensityImageSizes,
  expectPictureImageTypes,
  expectResponsiveImageWidths,
  imageContentTypes,
  inspectImage
} from '../setup/image-response';

const preview = createImageResponsePreview('appwrite-preview-fixture');
const path = '/v1/storage/buckets/photos/files/landscape';
const token = 'file+token/with=encoding';
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
    !Object.hasOwn(imageContentTypes, output)
  ) {
    response.writeHead(400).end('Invalid preview dimensions or output.');
    return;
  }

  const modifiers: Partial<IPXModifiers> = { format: output };
  if (width && height) modifiers.resize = `${width}x${height}`;
  else if (width) modifiers.width = width;
  else if (height) modifiers.height = height;
  const image = await preview('landscape.svg', modifiers).process();
  response.writeHead(200, { 'Content-Type': imageContentTypes[output]! }).end(image.data);
}

const server = createImageResponseServer(servePreview);

beforeAll(async () => {
  baseURL = await server.start();
  config = {
    provider: 'appwrite',
    providers: { appwrite: appwriteProvider({ baseURL, projectId: 'project-id' }) },
    providerSizes: [160, 320, 640],
    densities: [1]
  };
});

afterAll(() => server.close());

describe('Appwrite controlled-server response contract', () => {
  it('returns decoded widths matching every responsive width descriptor', async () => {
    await expectResponsiveImageWidths(`${path}/view?token=${encodeURIComponent(token)}`, config);
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
    await expectDensityImageSizes(attrs, { width: 160, height: 90 });
    expect(await inspectImage(attrs.placeholderSrc!)).toMatchObject({ width: 10, type: 'png' });
  });

  it('serves each advertised picture MIME type and a decoded JPEG fallback', async () => {
    await expectPictureImageTypes(`${path}/view?token=${encodeURIComponent(token)}`, config);
  });
});
