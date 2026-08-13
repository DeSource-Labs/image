import { describe, expect, it, vi } from 'vitest';
import {
  getImage,
  ipxProvider,
  normalizeImageSource,
  resolveAlias,
  resolveImageConfig,
  validateSource,
  vercelProvider,
  type ResolvedImageConfig
} from '@src/index';

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

  it('externalizes disallowed domains for providers that require an allowlist', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const image = getImage(
      {
        src: 'https://evil.example.com/hero.jpg',
        width: 800
      },
      {
        provider: 'ipx',
        providers: { ipx: ipxProvider() },
        domains: ['example.com'],
        onInvalidSource: 'warn'
      }
    );

    expect(image).toEqual({ url: 'https://evil.example.com/hero.jpg', isOptimized: false });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('throws for invalid local patterns when requested', () => {
    expect(() =>
      getImage(
        {
          src: '/private/hero.jpg',
          width: 800
        },
        {
          provider: 'ipx',
          providers: { ipx: ipxProvider() },
          localPatterns: [{ pathname: '/images/**' }],
          onInvalidSource: 'throw'
        }
      )
    ).toThrow(/localPatterns/);
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

describe('source normalization and validation', () => {
  const config = (overrides: Partial<ResolvedImageConfig> = {}) => ({
    ...resolveImageConfig(),
    ...overrides
  });

  it('normalizes paths while preserving URL and opaque source forms', () => {
    expect(normalizeImageSource('photo.jpg')).toBe('/photo.jpg');
    expect(normalizeImageSource('photo.jpg', true)).toBe('photo.jpg');
    expect(normalizeImageSource('cms:asset-id')).toBe('cms:asset-id');
    expect(normalizeImageSource('')).toBe('');
    expect(normalizeImageSource('/photo.jpg')).toBe('/photo.jpg');
    expect(normalizeImageSource('//cdn.example/photo.jpg')).toBe('//cdn.example/photo.jpg');
    expect(normalizeImageSource('https://cdn.example/photo.jpg')).toBe('https://cdn.example/photo.jpg');
    expect(normalizeImageSource('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
  });

  it('resolves exact and nested aliases without partial matches', () => {
    expect(resolveAlias('/cdn', { '/cdn/': 'https://images.example.com/root/' })).toBe(
      'https://images.example.com/root/'
    );
    expect(resolveAlias('/cdn/folder/photo.jpg', { cdn: 'https://images.example.com/root/' })).toBe(
      'https://images.example.com/root/folder/photo.jpg'
    );
    expect(resolveAlias('/cdn-other/photo.jpg', { cdn: 'https://images.example.com' })).toBe('/cdn-other/photo.jpg');
  });

  it('validates local patterns including single and recursive wildcards', () => {
    expect(validateSource('', config())).toEqual({ valid: false, reason: 'Image source is empty.' });
    expect(validateSource('data:image/png;base64,abc', config())).toEqual({ valid: true });
    expect(validateSource('/public/photo.jpg', config())).toEqual({ valid: true });

    const restricted = config({ localPatterns: [{ pathname: '/img/*' }, { pathname: '/media/**' }] });
    expect(validateSource('/img/photo.jpg', restricted).valid).toBe(true);
    expect(validateSource('/img/nested/photo.jpg', restricted).valid).toBe(false);
    expect(validateSource('/media/nested/photo.jpg', restricted).valid).toBe(true);
    expect(validateSource('/private/photo.jpg', restricted).reason).toContain('localPatterns');
  });

  it('validates remote domains and every remote-pattern constraint', () => {
    expect(validateSource('https://images.example.com/photo.jpg', config()).valid).toBe(true);
    expect(
      validateSource('https://images.example.com/photo.jpg', config({ domains: ['images.example.com'] })).valid
    ).toBe(true);

    const restricted = config({
      domains: [],
      remotePatterns: [
        {
          protocol: 'https:',
          hostname: '*.example.com',
          port: '8443',
          pathname: '/account/**',
          search: '?v=1'
        }
      ]
    });
    expect(validateSource('https://cdn.example.com:8443/account/a/photo.jpg?v=1', restricted).valid).toBe(true);
    expect(validateSource('http://cdn.example.com:8443/account/a/photo.jpg?v=1', restricted).valid).toBe(false);
    expect(validateSource('https://other.test:8443/account/a/photo.jpg?v=1', restricted).valid).toBe(false);
    expect(validateSource('https://cdn.example.com/account/a/photo.jpg?v=1', restricted).valid).toBe(false);
    expect(validateSource('https://cdn.example.com:8443/private/photo.jpg?v=1', restricted).valid).toBe(false);
    expect(validateSource('https://cdn.example.com:8443/account/photo.jpg?v=2', restricted).valid).toBe(false);
    expect(validateSource('http://%', restricted).reason).toContain('not a valid URL');
    expect(validateSource('relative/photo.jpg', restricted).reason).toContain('must be an absolute local path');
  });
});
