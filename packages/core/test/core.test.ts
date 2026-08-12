import { describe, expect, it, vi } from 'vitest';
import {
  awsAmplifyProvider,
  createDefaultProviders,
  createImage,
  createMapper,
  createOperationsGenerator,
  detectImageProvider,
  defineProvider,
  generatePictureSources,
  generateSizes,
  generateSrcset,
  getImage,
  getImageAttrs,
  getPictureAttrs,
  ipxProvider,
  parseDensities,
  parseSize,
  parseSizes,
  resolveAlias,
  resolveImageConfig,
  validateSource,
  vercelProvider
} from '../src/index';
import { BUILT_IN_PROVIDER_NAMES, createBuiltInProviders } from '../src/providers/index';
import { cloudinaryProvider } from '../src/providers/cloudinary';
import { imgixProvider } from '../src/providers/imgix';
import { testImageBehavior } from '../../../common/tests/image-behavior';

testImageBehavior({
  name: 'core',
  createImage,
  getImageAttrs,
  getPictureAttrs
});

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

    expect(generated.srcset).toBe(
      '/_vercel/image?url=https%3A%2F%2Fexample.com%2Fa.jpg&w=640&q=100 1x, /_vercel/image?url=https%3A%2F%2Fexample.com%2Fa.jpg&w=640&q=100 2x'
    );
  });
});

describe('aliases, validation and merge order', () => {
  it('resolves source aliases before provider URL generation', () => {
    expect(resolveAlias('/unsplash/photo-id', { unsplash: 'https://images.unsplash.com' })).toBe(
      'https://images.unsplash.com/photo-id'
    );
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
    const image = getImage(
      {
        src: 'https://evil.example.com/hero.jpg',
        width: 800
      },
      {
        provider: 'cloudinary',
        providers: { cloudinary: cloudinaryProvider({ cloudName: 'demo' }) },
        domains: ['example.com'],
        onInvalidSource: 'warn'
      }
    );

    expect(image).toEqual({ url: 'https://evil.example.com/hero.jpg', isOptimized: false });
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('throws for invalid domains when requested', () => {
    expect(() =>
      getImage(
        {
          src: 'https://evil.example.com/hero.jpg',
          width: 800
        },
        {
          provider: 'cloudinary',
          providers: { cloudinary: cloudinaryProvider({ cloudName: 'demo' }) },
          domains: ['example.com'],
          onInvalidSource: 'throw'
        }
      )
    ).toThrow(/not allowed/);
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
    expect(
      getImage(
        { src: '/user.png', width: 64 },
        {
          provider: 'vercel',
          providers: { vercel: vercelProvider({ defaultQuality: 50 }) }
        }
      ).url
    ).toContain('q=50');
  });

  it('throws clear errors for unknown presets', () => {
    expect(() => getImage({ src: '/user.png', preset: 'missing' })).toThrow(/Unknown image preset/);
  });
});

describe('providers', () => {
  it('keeps default providers small and exposes every built-in provider on demand', () => {
    expect(Object.keys(createDefaultProviders()).sort()).toEqual(
      ['awsAmplify', 'ipx', 'ipxStatic', 'netlify', 'netlifyImageCdn', 'netlifyLargeMedia', 'none', 'vercel'].sort()
    );
    expect(Object.keys(createBuiltInProviders()).sort()).toEqual([...BUILT_IN_PROVIDER_NAMES].sort());
  });

  it('detects deployment providers automatically', () => {
    vi.stubEnv('AWS_APP_ID', 'app-id');
    expect(detectImageProvider()).toBe('awsAmplify');
    vi.unstubAllEnvs();

    vi.stubEnv('VERCEL', '1');
    expect(detectImageProvider()).toBe('vercel');
    vi.unstubAllEnvs();

    vi.stubEnv('NETLIFY', 'true');
    expect(detectImageProvider()).toBe('netlify');
    vi.unstubAllEnvs();

    expect(detectImageProvider()).toBe('ipx');
  });

  it('uses DESOURCE_IMAGE_PROVIDER as a compatibility override', () => {
    vi.stubEnv('DESOURCE_IMAGE_PROVIDER', 'cloudinary');
    expect(detectImageProvider()).toBe('cloudinary');
    vi.unstubAllEnvs();
  });

  it('generates Vercel local and remote URLs', () => {
    const config = resolveImageConfig({
      provider: 'vercel',
      providers: { vercel: vercelProvider() },
      domains: ['example.com']
    });

    expect(getImage({ src: '/hero.png', width: 800, quality: 75 }, config).url).toBe(
      '/_vercel/image?url=%2Fhero.png&w=1024&q=75'
    );
    expect(getImage({ src: 'https://example.com/hero.png', width: 800, quality: 75 }, config).url).toBe(
      '/_vercel/image?url=https%3A%2F%2Fexample.com%2Fhero.png&w=1024&q=75'
    );
    expect(getImage({ src: '/hero.png' }, config).url).toBe('/_vercel/image?url=%2Fhero.png&w=1536&q=100');
    expect(getImage({ src: 'https://unlisted.example/hero.png', width: 800 }, config)).toEqual({
      url: 'https://unlisted.example/hero.png',
      isOptimized: false
    });
  });

  it('generates AWS Amplify URLs', () => {
    const config = resolveImageConfig({
      provider: 'awsAmplify',
      providers: { awsAmplify: awsAmplifyProvider() }
    });

    expect(getImage({ src: '/hero.png', width: 800, quality: 75, format: 'webp' }, config).url).toBe(
      '/_amplify/image?url=%2Fhero.png&w=1024&q=75&format=webp'
    );
    expect(getImage({ src: '/hero.png', format: 'webp' }, config).url).toBe(
      '/_amplify/image?url=%2Fhero.png&w=1536&q=100&format=webp'
    );
  });

  it('generates URLs for additional built-in providers', () => {
    const providers = createBuiltInProviders();

    expect(
      getImage({ provider: 'unsplash', src: '/photo-id', width: 320, quality: 80, format: 'webp' }, { providers }).url
    ).toBe('https://images.unsplash.com/photo-id?fm=webp&q=80&w=320');
    expect(getImage({ provider: 'github', src: '/u/1', width: 128 }, { providers }).url).toBe(
      'https://avatars.githubusercontent.com/u/1?v=4&s=128'
    );
    expect(
      getImage(
        { provider: 'cloudflareimages', src: 'image-id' },
        {
          providers,
          providerOptions: {
            cloudflareimages: { accountHash: 'account' }
          }
        }
      ).url
    ).toBe('https://imagedelivery.net/account/image-id/public');
  });

  it('generates IPX URLs with modifiers', () => {
    const config = resolveImageConfig({
      provider: 'ipx',
      providers: { ipx: ipxProvider() }
    });

    expect(
      getImage(
        {
          src: '/hero.png',
          width: 800,
          height: 400,
          quality: 70,
          format: 'webp',
          fit: 'cover',
          position: 'center',
          background: 'fff',
          modifiers: { blur: 8 }
        },
        config
      ).url
    ).toBe('/_ipx/s_800x400&f_webp&q_70&fit_cover&pos_center&b_fff&blur_8/hero.png');
  });

  it('honors standard modifiers', () => {
    const config = resolveImageConfig({
      provider: 'ipx',
      providers: { ipx: ipxProvider() }
    });

    expect(
      getImage(
        {
          src: '/hero.png',
          modifiers: {
            width: 800,
            format: 'webp',
            quality: 75
          }
        },
        config
      ).url
    ).toBe('/_ipx/w_800&f_webp&q_75/hero.png');
  });

  it('defaults to local IPX-style URLs', () => {
    const attrs = getImageAttrs({
      src: '/img/1.png',
      quality: 75,
      sizes: '100vw md:1100px',
      format: 'webp',
      loading: 'lazy'
    });

    expect(attrs.src).toBe('/_ipx/w_2200&f_webp&q_75/img/1.png');
    expect(attrs.fallbackSrc).toBe('/img/1.png');
    expect(attrs.sizes).toBe('(max-width: 767px) 100vw, 1100px');
    expect(attrs.srcset).toContain('/_ipx/w_1100&f_webp&q_75/img/1.png 1100w');
  });

  it('generates Cloudinary URLs', () => {
    const config = resolveImageConfig({
      provider: 'cloudinary',
      providers: { cloudinary: cloudinaryProvider({ cloudName: 'demo' }) }
    });

    expect(
      getImage(
        {
          src: '/sample.jpg',
          width: 300,
          quality: 80,
          format: 'webp',
          fit: 'fill'
        },
        config
      ).url
    ).toBe('https://res.cloudinary.com/demo/image/upload/f_webp,q_80,w_300,c_fill/sample.jpg');
  });

  it('generates Imgix URLs', () => {
    const config = resolveImageConfig({
      provider: 'imgix',
      providers: { imgix: imgixProvider({ baseURL: 'https://example.imgix.net' }) }
    });

    expect(
      getImage(
        {
          src: '/hero.jpg',
          width: 500,
          quality: 75,
          format: 'webp'
        },
        config
      ).url
    ).toBe('https://example.imgix.net/hero.jpg?w=500&q=75&f=webp');
  });
});

describe('attrs and picture output', () => {
  it('generates image attrs with responsive srcset and placeholder', () => {
    const attrs = getImageAttrs(
      {
        src: '/hero.png',
        width: 1100,
        height: 600,
        sizes: '100vw md:1100px',
        format: 'webp',
        priority: true,
        placeholder: [32, 18, 20, 6]
      },
      {
        provider: 'vercel',
        providers: { vercel: vercelProvider() },
        providerSizes: [320, 640, 768, 1024, 1280]
      }
    );

    expect(attrs.src).toBe('/_vercel/image?url=%2Fhero.png&w=1536&q=100');
    expect(attrs.srcset).toContain('1100w');
    expect(attrs.sizes).toBe('(max-width: 767px) 100vw, 1100px');
    expect(attrs.loading).toBe('eager');
    expect(attrs.fetchpriority).toBe('high');
    expect(attrs.placeholderSrc).toBe('/_vercel/image?url=%2Fhero.png&w=640&q=20');
  });

  it('supports the preload alias', () => {
    const attrs = getImageAttrs(
      {
        src: '/hero.png',
        width: 800,
        preload: { fetchPriority: 'high' }
      },
      {
        provider: 'ipx',
        providers: { ipx: ipxProvider() }
      }
    );

    expect(attrs.loading).toBe('eager');
    expect(attrs.fetchpriority).toBe('high');
    expect(attrs.decoding).toBe('sync');
  });

  it('uses Nuxt-compatible placeholder defaults', () => {
    const attrs = getImageAttrs(
      {
        src: '/hero.png',
        width: 800,
        placeholder: true
      },
      {
        provider: 'ipx',
        providers: { ipx: ipxProvider() }
      }
    );

    expect(attrs.placeholderSrc).toBe('/_ipx/s_10x10&q_50&blur_3/hero.png');
  });

  it('generates picture sources for avif and webp with fallback img', () => {
    const picture = getPictureAttrs(
      {
        src: '/hero.png',
        width: 800,
        height: 400,
        sizes: '100vw',
        format: ['avif', 'webp']
      },
      {
        provider: 'vercel',
        providers: { vercel: vercelProvider() },
        providerSizes: [320, 640, 800]
      }
    );

    expect(picture.sources.map((source) => source.type)).toEqual(['image/avif', 'image/webp']);
    expect(picture.sources[0]?.srcset).toContain('320w');
    expect(picture.img.src).toBe('/_vercel/image?url=%2Fhero.png&w=1536&q=100');
  });

  it('supports comma-separated picture formats and legacyFormat alias', () => {
    const picture = getPictureAttrs(
      {
        src: '/hero.png',
        width: 800,
        sizes: '100vw',
        format: 'avif,webp',
        legacyFormat: 'jpg'
      },
      {
        provider: 'ipx',
        providers: { ipx: ipxProvider() },
        providerSizes: [320, 800]
      }
    );

    expect(picture.sources.map((source) => source.type)).toEqual(['image/avif', 'image/webp']);
    expect(picture.img.src).toContain('f_jpeg');
  });

  it('generates picture sources directly', () => {
    const sources = generatePictureSources(
      {
        src: '/hero.png',
        width: 800,
        format: ['avif', 'webp']
      },
      {
        provider: 'vercel',
        providers: { vercel: vercelProvider() }
      }
    );

    expect(sources).toHaveLength(2);
  });

  it('does not apply global picture formats to fallback img', () => {
    const picture = getPictureAttrs(
      {
        src: '/hero.png',
        width: 800,
        sizes: '100vw'
      },
      {
        provider: 'ipx',
        providers: { ipx: ipxProvider() },
        format: ['avif', 'webp'],
        providerSizes: [320, 800]
      }
    );

    expect(picture.sources[0]?.srcset).toContain('f_avif');
    expect(picture.sources[1]?.srcset).toContain('f_webp');
    expect(picture.img.src).not.toContain('f_avif');
    expect(picture.img.src).not.toContain('f_webp');
    expect(picture.img.src).toContain('f_png');
  });

  it('keeps global picture formats out of plain image URLs', () => {
    const attrs = getImageAttrs(
      {
        src: '/hero.png',
        width: 800
      },
      {
        provider: 'ipx',
        providers: { ipx: ipxProvider() },
        format: ['avif', 'webp']
      }
    );

    expect(attrs.src).toBe('/_ipx/w_800/hero.png');
  });

  it('uses Nuxt-style picture fallbacks and SVG passthrough', () => {
    expect(
      getPictureAttrs({
        src: '/hero.jpg',
        width: 800,
        format: ['avif', 'webp']
      }).img.src
    ).toContain('f_jpeg');

    const svg = getPictureAttrs({
      src: '/logo.svg',
      width: 1200
    });

    expect(svg.sources).toEqual([]);
    expect(svg.img.src).toBe('/logo.svg');
  });

  it('exports Nuxt-style provider utility helpers', () => {
    expect(parseSize('320px')).toBe(320);
    expect(createMapper({ cover: 'crop' })('cover')).toBe('crop');

    const operations = createOperationsGenerator({
      keyMap: { width: 'w', format: 'f' },
      valueMap: { format: { jpeg: 'jpg' } }
    });

    expect(operations({ width: 320, format: 'jpeg' })).toBe('w=320&f=jpg');

    const setup = defineProvider({
      name: 'test',
      getImage: (input) => ({ url: input.src })
    });

    expect(setup()).toBe(setup());
  });

  it('creates a callable image helper', () => {
    const $img = createImage({
      provider: 'ipx',
      providers: { ipx: ipxProvider() },
      presets: {
        avatar: {
          width: 96,
          height: 96,
          quality: 80
        }
      }
    });

    expect($img('/hero.png', { width: 320, format: 'webp' })).toBe('/_ipx/w_320&f_webp/hero.png');
    expect(($img.avatar as typeof $img)('/user.png')).toBe('/_ipx/s_96x96&q_80/user.png');
    expect($img.getSizes('/hero.png', { sizes: '100vw md:1100px', modifiers: { format: 'webp' } }).src).toBe(
      '/_ipx/w_2200&f_webp/hero.png'
    );
  });
});
