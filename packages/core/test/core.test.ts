import { describe, expect, it, vi } from 'vitest';
import {
  cloudinaryProvider,
  generatePictureSources,
  generateSizes,
  generateSrcset,
  getImage,
  getImageAttrs,
  getPictureAttrs,
  imgixProvider,
  ipxProvider,
  parseDensities,
  parseSizes,
  resolveAlias,
  resolveImageConfig,
  validateSource,
  vercelProvider
} from '../src/index.js';

describe('sizes and densities', () => {
  it('parses Nuxt-like responsive sizes', () => {
    const parsed = parseSizes('100vw md:50vw lg:400px');

    expect(parsed?.sizes).toBe('(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw');
  });

  it('generates width candidates without exceeding intrinsic width', () => {
    const generated = generateSizes({
      width: 1100,
      sizes: '100vw md:1100px',
      providerSizes: [320, 640, 768, 1024, 1280, 1536]
    });

    expect(generated.sizes).toBe('(min-width: 768px) 1100px, 100vw');
    expect(generated.widths).toEqual([320, 640, 768, 1024, 1100]);
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
    const generated = generateSrcset({
      src: 'https://example.com/a.jpg',
      width: 50,
      height: 25,
      densities: '1 2'
    }, config);

    expect(generated.srcset).toBe('/_vercel/image?url=https%3A%2F%2Fexample.com%2Fa.jpg&w=50&q=75 1x, /_vercel/image?url=https%3A%2F%2Fexample.com%2Fa.jpg&w=100&q=75 2x');
  });
});

describe('aliases, validation and merge order', () => {
  it('resolves source aliases before provider URL generation', () => {
    expect(resolveAlias('/unsplash/photo-id', { unsplash: 'https://images.unsplash.com' }))
      .toBe('https://images.unsplash.com/photo-id');
  });

  it('validates remote domains and local patterns', () => {
    const config = resolveImageConfig({
      domains: ['assets.example.com'],
      localPatterns: [{ pathname: '/images/**' }]
    });

    expect(validateSource('https://assets.example.com/hero.jpg', config).valid).toBe(true);
    expect(validateSource('https://evil.example.com/hero.jpg', config).valid).toBe(false);
    expect(validateSource('/images/hero.jpg', config).valid).toBe(true);
    expect(validateSource('/private/hero.jpg', config).valid).toBe(false);
  });

  it('warns and passes through invalid sources when configured that way', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const image = getImage({
      src: 'https://evil.example.com/hero.jpg',
      width: 800
    }, {
      provider: 'vercel',
      providers: { vercel: vercelProvider() },
      domains: ['example.com'],
      onInvalidSource: 'warn'
    });

    expect(image).toEqual({ url: 'https://evil.example.com/hero.jpg', isOptimized: false });
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('throws for invalid domains when requested', () => {
    expect(() => getImage({
      src: 'https://evil.example.com/hero.jpg',
      width: 800
    }, {
      provider: 'vercel',
      providers: { vercel: vercelProvider() },
      domains: ['example.com'],
      onInvalidSource: 'throw'
    })).toThrow(/not allowed/);
  });

  it('merges quality by component, preset, global, then provider defaults', () => {
    const config = {
      provider: 'vercel',
      providers: { vercel: vercelProvider({ defaultQuality: 50 }) },
      quality: 70,
      presets: {
        avatar: {
          width: 64,
          quality: 60
        }
      }
    };

    expect(getImage({ src: '/user.png', preset: 'avatar' }, config).url).toContain('q=60');
    expect(getImage({ src: '/user.png', preset: 'avatar', quality: 80 }, config).url).toContain('q=80');
    expect(getImage({ src: '/user.png', width: 64 }, config).url).toContain('q=70');
    expect(getImage({ src: '/user.png', width: 64 }, {
      provider: 'vercel',
      providers: { vercel: vercelProvider({ defaultQuality: 50 }) }
    }).url).toContain('q=50');
  });
});

describe('providers', () => {
  it('generates Vercel local and remote URLs', () => {
    const config = resolveImageConfig({
      provider: 'vercel',
      providers: { vercel: vercelProvider() }
    });

    expect(getImage({ src: '/hero.png', width: 800, quality: 75 }, config).url)
      .toBe('/_vercel/image?url=%2Fhero.png&w=800&q=75');
    expect(getImage({ src: 'https://example.com/hero.png', width: 800, quality: 75 }, config).url)
      .toBe('/_vercel/image?url=https%3A%2F%2Fexample.com%2Fhero.png&w=800&q=75');
  });

  it('generates IPX URLs with modifiers', () => {
    const config = resolveImageConfig({
      provider: 'ipx',
      providers: { ipx: ipxProvider() }
    });

    expect(getImage({
      src: '/hero.png',
      width: 800,
      height: 400,
      quality: 70,
      format: 'webp',
      fit: 'cover',
      position: 'center',
      background: 'fff',
      modifiers: { blur: 8 }
    }, config).url).toBe('/_ipx/bg_fff,blur_8,f_webp,fit_cover,h_400,pos_center,q_70,w_800/hero.png');
  });

  it('generates Cloudinary URLs', () => {
    const config = resolveImageConfig({
      provider: 'cloudinary',
      providers: { cloudinary: cloudinaryProvider({ cloudName: 'demo' }) }
    });

    expect(getImage({
      src: '/sample.jpg',
      width: 300,
      quality: 80,
      format: 'webp',
      fit: 'fill'
    }, config).url).toBe('https://res.cloudinary.com/demo/image/upload/f_webp,q_80,w_300,c_fill/sample.jpg');
  });

  it('generates Imgix URLs', () => {
    const config = resolveImageConfig({
      provider: 'imgix',
      providers: { imgix: imgixProvider({ baseURL: 'https://example.imgix.net' }) }
    });

    expect(getImage({
      src: '/hero.jpg',
      width: 500,
      quality: 75,
      format: 'webp'
    }, config).url).toBe('https://example.imgix.net/hero.jpg?w=500&q=75&f=webp');
  });
});

describe('attrs and picture output', () => {
  it('generates image attrs with responsive srcset and placeholder', () => {
    const attrs = getImageAttrs({
      src: '/hero.png',
      width: 1100,
      height: 600,
      sizes: '100vw md:1100px',
      format: 'webp',
      priority: true,
      placeholder: [32, 18, 20, 6]
    }, {
      provider: 'vercel',
      providers: { vercel: vercelProvider() },
      providerSizes: [320, 640, 768, 1024, 1280]
    });

    expect(attrs.src).toBe('/_vercel/image?url=%2Fhero.png&w=1100&q=75');
    expect(attrs.srcset).toContain('320w');
    expect(attrs.sizes).toBe('(min-width: 768px) 1100px, 100vw');
    expect(attrs.loading).toBe('eager');
    expect(attrs.fetchpriority).toBe('high');
    expect(attrs.placeholderSrc).toBe('/_vercel/image?url=%2Fhero.png&w=32&q=20');
  });

  it('generates picture sources for avif and webp with fallback img', () => {
    const picture = getPictureAttrs({
      src: '/hero.png',
      width: 800,
      height: 400,
      sizes: '100vw',
      format: ['avif', 'webp']
    }, {
      provider: 'vercel',
      providers: { vercel: vercelProvider() },
      providerSizes: [320, 640, 800]
    });

    expect(picture.sources.map((source) => source.type)).toEqual(['image/avif', 'image/webp']);
    expect(picture.sources[0]?.srcset).toContain('320w');
    expect(picture.img.src).toBe('/_vercel/image?url=%2Fhero.png&w=800&q=75');
  });

  it('generates picture sources directly', () => {
    const sources = generatePictureSources({
      src: '/hero.png',
      width: 800,
      format: ['avif', 'webp']
    }, {
      provider: 'vercel',
      providers: { vercel: vercelProvider() }
    });

    expect(sources).toHaveLength(2);
  });

  it('does not apply global picture formats to fallback img', () => {
    const picture = getPictureAttrs({
      src: '/hero.png',
      width: 800,
      sizes: '100vw'
    }, {
      provider: 'ipx',
      providers: { ipx: ipxProvider() },
      format: ['avif', 'webp'],
      providerSizes: [320, 800]
    });

    expect(picture.sources[0]?.srcset).toContain('f_avif');
    expect(picture.sources[1]?.srcset).toContain('f_webp');
    expect(picture.img.src).not.toContain('f_avif');
    expect(picture.img.src).not.toContain('f_webp');
  });
});
