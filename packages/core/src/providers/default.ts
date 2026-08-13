import type { ImageProviderDefinition } from '../types.js';
import { awsAmplifyProvider } from './awsAmplify.js';
import { ipxProvider } from './ipx.js';
import { ipxStaticProvider } from './ipxStatic.js';
import { netlifyImageCdnProvider } from './netlifyImageCdn.js';
import { netlifyLargeMediaProvider } from './netlifyLargeMedia.js';
import { noneProvider } from './none.js';
import { vercelProvider } from './vercel.js';
import type { NetlifyImageCdnProviderOptions } from './netlifyImageCdn.js';

/** Backwards-compatible alias for Netlify Image CDN. */
export function netlifyProvider(options: NetlifyImageCdnProviderOptions = {}): ImageProviderDefinition {
  return netlifyImageCdnProvider(options);
}

export function createDefaultProviders(): Record<string, ImageProviderDefinition> {
  return {
    none: noneProvider(),
    ipx: ipxProvider(),
    ipxStatic: ipxStaticProvider(),
    awsAmplify: awsAmplifyProvider(),
    vercel: vercelProvider(),
    netlify: netlifyProvider(),
    netlifyImageCdn: netlifyImageCdnProvider(),
    netlifyLargeMedia: netlifyLargeMediaProvider()
  };
}

export {
  awsAmplifyProvider,
  ipxProvider,
  ipxStaticProvider,
  netlifyImageCdnProvider,
  netlifyLargeMediaProvider,
  noneProvider,
  vercelProvider
};

export type { AwsAmplifyProviderOptions } from './awsAmplify.js';
export type { IpxProviderOptions } from './ipx.js';
export type { IpxStaticProviderOptions } from './ipxStatic.js';
export type { NetlifyImageCdnProviderOptions } from './netlifyImageCdn.js';
export type { NetlifyLargeMediaProviderOptions } from './netlifyLargeMedia.js';
export type { VercelProviderOptions } from './vercel.js';
export type NetlifyProviderOptions = NetlifyImageCdnProviderOptions;
