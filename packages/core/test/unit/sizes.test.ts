import { describe, expect, it } from 'vitest';
import {
  generateSizes,
  generateSrcset,
  parseDensities,
  parseSizes,
  resolveImageConfig,
  vercelProvider
} from '@src/index';

describe('sizes and densities', () => {
  it('parses responsive sizes', () => {
    const parsed = parseSizes('100vw md:50vw lg:400px');

    expect(parsed?.sizes).toBe('(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 400px');
  });

  it('parses object sizes', () => {
    const parsed = parseSizes({ '1px': '100vw', md: '1100px' });

    expect(parsed?.sizes).toBe('(max-width: 767px) 100vw, 1100px');
  });

  it('generates size candidates from responsive sizes and densities', () => {
    const generated = generateSizes({
      width: 1100,
      sizes: '100vw md:1100px',
      providerSizes: [320, 640, 768, 1024, 1280, 1536]
    });

    expect(generated.sizes).toBe('(max-width: 767px) 100vw, 1100px');
    expect(generated.widths).toEqual([320, 640, 767, 768, 1024, 1100, 1280, 1534, 2200]);
  });

  it('parses density syntaxes', () => {
    expect(parseDensities('x1 x2')).toEqual([1, 2]);
    expect(parseDensities('1 2')).toEqual([1, 2]);
    expect(parseDensities([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('generates density srcsets when no sizes attr is provided', () => {
    const config = resolveImageConfig({
      provider: 'vercel',
      providers: { vercel: vercelProvider() },
      domains: ['example.com']
    });
    const generated = generateSrcset(
      {
        src: 'https://example.com/a.jpg',
        width: 50,
        height: 25,
        densities: '1 2'
      },
      config
    );

    expect(generated.srcset).toBe('/_vercel/image?url=https:%2F%2Fexample.com%2Fa.jpg&w=640&q=100 1x');
  });
});

describe('responsive parsing edge cases', () => {
  it('parses each density input form and falls back from invalid strings', () => {
    expect(parseDensities([2, 1, 2])).toEqual([1, 2]);
    expect(parseDensities(1.5)).toEqual([2]);
    expect(parseDensities('x1, 2x invalid', [1])).toEqual([1, 2]);
    expect(parseDensities('invalid', [1])).toEqual([1]);
  });

  it('rejects empty and unusable size inputs', () => {
    expect(parseSizes(undefined)).toBeUndefined();
    expect(parseSizes(null as unknown as undefined)).toBeUndefined();
    expect(parseSizes('')).toBeUndefined();
    expect(parseSizes('unknown:50vw')).toBeUndefined();
  });

  it('generates fixed widths and safe fallbacks for unusable responsive variants', () => {
    expect(generateSizes({})).toEqual({ widths: [] });
    expect(generateSizes({ width: 300, densities: [1, 2] })).toEqual({ widths: [300, 600] });
    expect(generateSizes({ sizes: '0vw', providerSizes: [320, 640] })).toEqual({
      sizes: '100vw',
      widths: [320, 640]
    });
    expect(generateSizes({ sizes: '400', densities: [1], providerSizes: [320, 640] })).toEqual({
      sizes: '400px',
      widths: [400]
    });
    expect(generateSizes({ sizes: 'calc(100vw)', providerSizes: [320] })).toEqual({
      sizes: '100vw',
      widths: [320]
    });
  });
});
