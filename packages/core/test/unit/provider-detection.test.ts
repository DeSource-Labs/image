import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectImageProvider } from '@src/config';

const environment = vi.hoisted(() => ({ provider: '' }));
vi.mock('std-env', () => ({
  get provider() {
    return environment.provider;
  }
}));

afterEach(() => {
  environment.provider = '';
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('deployment provider detection', () => {
  it.each([
    ['vercel', 'vercel'],
    ['aws_amplify', 'awsAmplify'],
    ['netlify', 'netlifyImageCdn'],
    ['unsupported-host', 'ipx'],
    ['', 'ipx']
  ])('selects %s deployment provider as %s', (deployment, expected) => {
    environment.provider = deployment;
    vi.stubEnv('NETLIFY_LFS_ORIGIN_URL', '');
    expect(detectImageProvider()).toBe(expected);
  });

  it('selects Netlify Large Media only when its origin is configured', () => {
    environment.provider = 'netlify';
    vi.stubEnv('NETLIFY_LFS_ORIGIN_URL', 'https://media.example.com');
    expect(detectImageProvider()).toBe('netlifyLargeMedia');
  });

  it('prefers explicit configuration over the compiled provider and deployment environment', () => {
    environment.provider = 'vercel';
    vi.stubGlobal('__DS_IMAGE_PROVIDER__', 'netlifyImageCdn');
    expect(detectImageProvider('ipx')).toBe('ipx');
    expect(detectImageProvider()).toBe('netlifyImageCdn');
    vi.stubGlobal('__DS_IMAGE_PROVIDER__', 'auto');
    expect(detectImageProvider()).toBe('vercel');
  });
});
