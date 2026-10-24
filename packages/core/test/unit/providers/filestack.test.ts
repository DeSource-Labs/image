import { Buffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import {
  createImage,
  getImage,
  getImageAttrs,
  getPictureAttrs,
  type ImageConfig,
  type ImageModifiers
} from '@src/index';
import { createBuiltInProviders, filestackProvider, type FilestackProviderOptions } from '@src/providers';
import filestackSetup from '@src/providers/filestack';
import { localProviderContext } from '../setup/shared';

const baseURL = 'https://cdn.filestackcontent.com';
const handle = 'pdn7PhZdT02GoYZCVYeF';
const config = { provider: 'filestack', providers: { filestack: filestackProvider() } } satisfies ImageConfig;

function direct(modifiers: ImageModifiers) {
  return filestackSetup().getImage(handle, { modifiers }, localProviderContext).url;
}

// Fixtures follow https://www.filestack.com/docs/api/processing/ and the official
// Filelink base64 source encoding. The pinned Nuxt Image has no Filestack provider.
describe('Filestack provider', () => {
  it.each([
    handle,
    `/${handle}`,
    `${baseURL}/${handle}`,
    `http://cdn.filestackcontent.com/${handle}`,
    `//cdn.filestackcontent.com/${handle}`
  ])('accepts an unsigned, untransformed handle source: %s', (src) => {
    expect(getImage({ src, width: 800, height: 600, fit: 'cover', format: 'webp', quality: 80 }, config).url).toBe(
      `${baseURL}/resize=width:800,height:600,fit:crop/output=format:webp,quality:80/${handle}`
    );
  });

  it('supports default setup, registry, and configured factory registration', () => {
    for (const providers of [createBuiltInProviders(), { filestack: filestackSetup }, config.providers]) {
      expect(getImage({ src: handle }, { provider: 'filestack', providers }).url).toBe(`${baseURL}/${handle}`);
    }
  });

  it('uses a configured CDN origin and providerOptions overrides', () => {
    const options = { baseURL: 'https://images.example.com/' } satisfies FilestackProviderOptions;
    const image = createImage({ provider: 'filestack', providers: { filestack: filestackProvider(options) } });
    expect(image(`https://images.example.com/${handle}`, { width: 320 })).toBe(
      `https://images.example.com/resize=width:320/${handle}`
    );
    expect(getImage({ src: handle, width: 320 }, { ...config, providerOptions: { filestack: options } }).url).toBe(
      `https://images.example.com/resize=width:320/${handle}`
    );
  });

  it('merges factory modifier defaults and lets each image override them', () => {
    const options = {
      modifiers: { width: 800, height: 600, fit: 'cover', format: 'webp', quality: 80 }
    } satisfies FilestackProviderOptions;
    const image = createImage({ provider: 'filestack', providers: { filestack: filestackProvider(options) } });
    expect(image(handle)).toBe(
      `${baseURL}/resize=width:800,height:600,fit:crop/output=format:webp,quality:80/${handle}`
    );
    expect(image(handle, { width: 320, fit: 'contain', quality: 60 })).toBe(
      `${baseURL}/resize=width:320,height:600,fit:clip/output=format:webp,quality:60/${handle}`
    );
    expect(image(handle)).toBe(
      `${baseURL}/resize=width:800,height:600,fit:crop/output=format:webp,quality:80/${handle}`
    );
  });

  it.each([
    'https://origin.example.com/photo.jpg?token=a%2Bb%2Fc%3D&tag=one&tag=two',
    'http://origin.example.com/folder/photo.jpg?redirect=https%3A%2F%2Fexample.com%2Fa%3Fx%3D1',
    'https://origin.example.com/café.jpg?caption=čaj&x=1,2',
    'src://photos/folder/hero.jpg?version=one%2Ftwo&x=1'
  ])('preserves external source bytes through base64url encoding: %s', (src) => {
    const url = getImage(
      { src, width: 640, format: 'webp', quality: 80 },
      { provider: 'filestack', providers: { filestack: filestackProvider({ apiKey: 'public-key_1' }) } }
    ).url;
    expect(url).toBe(
      `${baseURL}/public-key_1/resize=width:640/output=format:webp,quality:80/b64://${Buffer.from(src).toString('base64').replaceAll('+', '-').replaceAll('/', '_')}`
    );
    expect(new URL(url).search).toBe('');
    expect(Buffer.from(url.split('/b64://')[1]!, 'base64url').toString()).toBe(src);
  });

  it.each(['https://origin.example.com/photo.jpg', 'src://photos/hero.jpg'])(
    'requires a public application key for %s',
    (src) => expect(() => getImage({ src, width: 320 }, config)).toThrow(/apiKey/)
  );

  it.each([
    `${baseURL}/resize=width:100/${handle}`,
    `${baseURL}/security=p:policy,s:signature/${handle}`,
    `${baseURL}/${handle}?policy=policy&signature=signature`,
    `${baseURL}/${handle}?cache=1`,
    `${baseURL}/${handle}#fragment`,
    `${baseURL}/key/resize=width:100/https://origin.example.com/photo.jpg?x=1`
  ])('rejects transformed, signed, or decorated CDN sources: %s', (src) => {
    expect(() => getImage({ src, width: 320 }, config)).toThrow(/\[filestack\]/);
  });

  it.each(['folder/photo.jpg', 'file:///photo.jpg', 'src://', '../handle', 'handle?x=1', 'handle/extra'])(
    'rejects unsupported sources: %s',
    (src) => expect(() => getImage({ src, width: 320 }, config)).toThrow(/\[filestack\]/)
  );

  it.each([
    'ftp://cdn.example.com',
    'https://cdn.example.com/tasks',
    'https://cdn.example.com?x=1',
    'https://cdn.example.com#x',
    'https://user:password@cdn.example.com'
  ])('rejects a baseURL that is not an HTTP(S) origin: %s', (baseURL) =>
    expect(() => getImage({ src: handle }, { ...config, providerOptions: { filestack: { baseURL } } })).toThrow(
      /\[filestack\]/
    )
  );

  it.each(['', 'key/resize=width:1', 'key?x=1', 'key with space'])('rejects invalid application keys: %s', (apiKey) =>
    expect(() =>
      getImage(
        { src: 'https://origin.example.com/photo.jpg' },
        { ...config, providerOptions: { filestack: { apiKey } } }
      )
    ).toThrow(/apiKey/)
  );

  it.each([
    ['cover', 'crop'],
    ['contain', 'clip'],
    ['fill', 'scale'],
    ['inside', 'max'],
    ['scale-down', 'max'],
    ['clip', 'clip'],
    ['crop', 'crop'],
    ['scale', 'scale'],
    ['max', 'max']
  ])('maps fit %s to %s', (fit, expected) => {
    expect(direct({ width: 800, height: 600, fit })).toBe(
      `${baseURL}/resize=width:800,height:600,fit:${expected}/${handle}`
    );
  });

  it('requires dimensions for fit and both dimensions for crop or scale', () => {
    expect(() => direct({ fit: 'clip' })).toThrow(/\[filestack\]/);
    for (const fit of ['crop', 'cover', 'scale', 'fill']) {
      expect(() => direct({ width: 320, fit })).toThrow(/\[filestack\]/);
      expect(() => direct({ height: 180, fit })).toThrow(/\[filestack\]/);
    }
    expect(() => direct({ width: 320, height: 180, fit: 'outside' })).toThrow(/\[filestack\]/);
  });

  it.each(['width', 'height'] as const)('validates %s without silently clamping responsive dimensions', (dimension) => {
    for (const value of [1, 10000, '320']) {
      expect(direct({ [dimension]: value })).toBe(`${baseURL}/resize=${dimension}:${value}/${handle}`);
    }
    for (const value of [0, -1, 10001, 0.5, NaN, Infinity, '', '320px', ['320'], { size: 320 }]) {
      expect(() => direct({ [dimension]: value })).toThrow(/\[filestack\]/);
    }
    expect(() => getImageAttrs({ src: handle, width: 320, [dimension]: 5001, densities: [1, 2] }, config)).toThrow(
      /\[filestack\]/
    );
  });

  it.each(['jpg', 'jpeg', 'png', 'webp', 'avif'])('emits an explicit %s output task', (format) => {
    expect(direct({ format, quality: 80 })).toBe(
      `${baseURL}/output=format:${format === 'jpeg' ? 'jpg' : format},quality:80/${handle}`
    );
  });

  it('supports quality without conversion and the format alias', () => {
    expect(direct({ width: 320, quality: 80 })).toBe(`${baseURL}/resize=width:320/output=quality:80/${handle}`);
    expect(direct({ quality: 'input' })).toBe(`${baseURL}/output=quality:input/${handle}`);
    expect(direct({ f: 'jpeg' })).toBe(`${baseURL}/output=format:jpg/${handle}`);
  });

  it.each(['gif', 'tiff', 'jxl', 'pjpg', 'svg', 'auto', 'auto_image', 'webp/rotate=deg:90'])(
    'rejects unsupported output %s',
    (format) => {
      expect(() => direct({ format })).toThrow(/\[filestack\]/);
    }
  );

  it.each([0, 101, -1, 0.5, '80/rotate=deg:90', 'invalid', ['80']])('rejects invalid direct quality %j', (quality) => {
    expect(() => direct({ quality } as ImageModifiers)).toThrow(/\[filestack\]/);
  });

  it('omits unsupported modifiers and keeps task order independent of input key order', () => {
    expect(
      direct({
        quality: 80,
        format: 'webp',
        height: 600,
        width: 800,
        fit: 'cover',
        position: 'top',
        background: '#fff',
        blur: 3,
        rotate: 90
      })
    ).toBe(`${baseURL}/resize=width:800,height:600,fit:crop/output=format:webp,quality:80/${handle}`);
  });

  it('signs each final responsive URL, picture source, and placeholder after serialization', () => {
    const signURL = vi.fn((url: string) => `${url}?signed=true`);
    const signedConfig = { ...config, providers: { filestack: filestackProvider({ signURL }) } };
    const attrs = getImageAttrs(
      { src: handle, width: 320, height: 180, densities: [1, 2], format: 'webp', placeholder: true },
      signedConfig
    );
    const unsigned = signURL.mock.calls.map(([url]) => url);
    expect(unsigned).toContain(`${baseURL}/resize=width:320,height:180/output=format:webp/${handle}`);
    expect(unsigned).toContain(`${baseURL}/resize=width:640,height:360/output=format:webp/${handle}`);
    expect(unsigned.some((url) => url.includes('/resize=width:10,'))).toBe(true);
    for (const candidate of attrs.srcset!.split(', ')) expect(candidate.split(' ')[0]).toContain('?signed=true');
    expect(attrs.placeholderSrc).toContain('?signed=true');

    const picture = getPictureAttrs(
      { src: handle, width: 320, formats: ['avif', 'webp'], fallbackFormat: 'jpeg', densities: [1] },
      signedConfig
    );
    expect(picture.sources.map(({ type }) => type)).toEqual(['image/avif', 'image/webp']);
    expect(picture.img.src).toContain('/output=format:jpg/');
    for (const source of picture.sources) expect(source.srcset).toContain('?signed=true');
    expect(signURL.mock.calls.every(([url]) => !url.includes('?signed=true'))).toBe(true);
  });
});
