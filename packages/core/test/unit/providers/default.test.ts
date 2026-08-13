import { describe, expect, it, vi } from 'vitest';
import {
  awsAmplifyProvider,
  createDefaultProviders,
  detectImageProvider,
  getImage,
  getImageAttrs,
  ipxProvider,
  resolveImageConfig,
  vercelProvider
} from '@src/index';
import { BUILT_IN_PROVIDER_NAMES, createBuiltInProviders } from '@src/providers';
import { cloudinaryProvider } from '@src/providers/cloudinary';
import { imgixProvider } from '@src/providers/imgix';

describe('providers', () => {
  it('keeps default providers small and exposes every built-in provider on demand', () => {
    expect(Object.keys(createDefaultProviders()).sort()).toEqual(
      ['awsAmplify', 'ipx', 'ipxStatic', 'netlify', 'netlifyImageCdn', 'netlifyLargeMedia', 'none', 'vercel'].sort()
    );
    expect(Object.keys(createBuiltInProviders()).sort()).toEqual([...BUILT_IN_PROVIDER_NAMES].sort());
  });

  it('resolves an explicit provider once and otherwise falls back to IPX', () => {
    expect(detectImageProvider('awsAmplify')).toBe('awsAmplify');
    expect(detectImageProvider('vercel')).toBe('vercel');
    expect(detectImageProvider()).toBe('ipx');
  });

  it('ignores package-specific environment variables', () => {
    vi.stubEnv('DESOURCE_IMAGE_PROVIDER', 'cloudinary');
    expect(detectImageProvider()).toBe('ipx');
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
      '/_vercel/image?url=https:%2F%2Fexample.com%2Fhero.png&w=1024&q=75'
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
      '/_amplify/image?url=%2Fhero.png&q=75&w=1024&format=webp'
    );
    expect(getImage({ src: '/hero.png', format: 'webp' }, config).url).toBe(
      '/_amplify/image?url=%2Fhero.png&format=webp&w=1536&q=100'
    );
  });

  it('generates URLs for additional built-in providers', () => {
    const providers = createBuiltInProviders();

    expect(
      getImage({ provider: 'unsplash', src: '/photo-id', width: 320, quality: 80, format: 'webp' }, { providers }).url
    ).toBe('https://images.unsplash.com/photo-id?w=320&q=80&fm=webp');
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
    ).toBe('/_ipx/blur_8&fit_cover&pos_center&b_fff&q_70&f_webp&s_800x400/hero.png');
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
    ).toBe('/_ipx/w_800&q_75&f_webp/hero.png');
  });

  it('defaults to local IPX-style URLs', () => {
    const attrs = getImageAttrs({
      src: '/img/1.png',
      quality: 75,
      sizes: '100vw md:1100px',
      format: 'webp',
      loading: 'lazy'
    });

    expect(attrs.src).toBe('/_ipx/w_2200&q_75&f_webp/img/1.png');
    expect(attrs.fallbackSrc).toBe('/img/1.png');
    expect(attrs.sizes).toBe('(max-width: 767px) 100vw, 1100px');
    expect(attrs.srcset).toContain('/_ipx/w_1100&q_75&f_webp/img/1.png 1100w');
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
    ).toBe('https://res.cloudinary.com/demo/image/upload/f_webp,q_80,c_fill,w_300/sample');
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
    ).toBe('https://example.imgix.net/hero.jpg?w=500&q=75&fm=webp');
  });
});
