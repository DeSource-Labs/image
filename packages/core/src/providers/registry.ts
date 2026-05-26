import type { ImageProvider } from '../types.js';
import { aliyunProvider } from './aliyun.js';
import { awsAmplifyProvider } from './awsAmplify.js';
import { bunnyProvider } from './bunny.js';
import { builderioProvider } from './builderio.js';
import { caisyProvider } from './caisy.js';
import { cloudflareProvider } from './cloudflare.js';
import { cloudflareImagesProvider } from './cloudflareimages.js';
import { cloudimageProvider } from './cloudimage.js';
import { cloudinaryProvider } from './cloudinary.js';
import { contentfulProvider } from './contentful.js';
import { directusProvider } from './directus.js';
import { fastlyProvider } from './fastly.js';
import { filerobotProvider } from './filerobot.js';
import { flyimgProvider } from './flyimg.js';
import { githubProvider } from './github.js';
import { glideProvider } from './glide.js';
import { gumletProvider } from './gumlet.js';
import { hygraphProvider } from './hygraph.js';
import { imageEngineProvider } from './imageengine.js';
import { imagekitProvider } from './imagekit.js';
import { imgixProvider } from './imgix.js';
import { ipxProvider } from './ipx.js';
import { ipxStaticProvider } from './ipxStatic.js';
import { netlifyProvider } from './netlify.js';
import { netlifyLargeMediaProvider } from './netlifyLargeMedia.js';
import { netlifyImageCdnProvider } from './netlifyImageCdn.js';
import { picsumProvider } from './picsum.js';
import { preprProvider } from './prepr.js';
import { noneProvider } from './none.js';
import { prismicProvider } from './prismic.js';
import { sanityProvider } from './sanity.js';
import { shopifyProvider } from './shopify.js';
import { storyblokProvider } from './storyblok.js';
import { strapiProvider } from './strapi.js';
import { strapi5Provider } from './strapi5.js';
import { supabaseProvider } from './supabase.js';
import { twicpicsProvider } from './twicpics.js';
import { umbracoProvider } from './umbraco.js';
import { unsplashProvider } from './unsplash.js';
import { uploadcareProvider } from './uploadcare.js';
import { vercelProvider } from './vercel.js';
import { wagtailProvider } from './wagtail.js';
import { weservProvider } from './weserv.js';
import { sirvProvider } from './sirv.js';

export const BUILT_IN_PROVIDER_NAMES = [
  'aliyun',
  'awsAmplify',
  'bunny',
  'builderio',
  'caisy',
  'cloudflare',
  'cloudflareimages',
  'cloudimage',
  'cloudinary',
  'contentful',
  'directus',
  'fastly',
  'filerobot',
  'flyimg',
  'github',
  'glide',
  'gumlet',
  'hygraph',
  'imageengine',
  'imagekit',
  'imgix',
  'ipx',
  'ipxStatic',
  'netlify',
  'netlifyLargeMedia',
  'netlifyImageCdn',
  'picsum',
  'prepr',
  'none',
  'prismic',
  'sanity',
  'shopify',
  'storyblok',
  'strapi',
  'strapi5',
  'supabase',
  'twicpics',
  'umbraco',
  'unsplash',
  'uploadcare',
  'vercel',
  'wagtail',
  'weserv',
  'sirv'
] as const;

export type BuiltInProviderName = typeof BUILT_IN_PROVIDER_NAMES[number];

export function createBuiltInProviders(): Record<BuiltInProviderName, ImageProvider> {
  return {
    aliyun: aliyunProvider(),
    awsAmplify: awsAmplifyProvider(),
    bunny: bunnyProvider(),
    builderio: builderioProvider(),
    caisy: caisyProvider(),
    cloudflare: cloudflareProvider(),
    cloudflareimages: cloudflareImagesProvider(),
    cloudimage: cloudimageProvider(),
    cloudinary: cloudinaryProvider(),
    contentful: contentfulProvider(),
    directus: directusProvider(),
    fastly: fastlyProvider(),
    filerobot: filerobotProvider(),
    flyimg: flyimgProvider(),
    github: githubProvider(),
    glide: glideProvider(),
    gumlet: gumletProvider(),
    hygraph: hygraphProvider(),
    imageengine: imageEngineProvider(),
    imagekit: imagekitProvider(),
    imgix: imgixProvider(),
    ipx: ipxProvider(),
    ipxStatic: ipxStaticProvider(),
    netlify: netlifyProvider(),
    netlifyLargeMedia: netlifyLargeMediaProvider(),
    netlifyImageCdn: netlifyImageCdnProvider(),
    picsum: picsumProvider(),
    prepr: preprProvider(),
    none: noneProvider(),
    prismic: prismicProvider(),
    sanity: sanityProvider(),
    shopify: shopifyProvider(),
    storyblok: storyblokProvider(),
    strapi: strapiProvider(),
    strapi5: strapi5Provider(),
    supabase: supabaseProvider(),
    twicpics: twicpicsProvider(),
    umbraco: umbracoProvider(),
    unsplash: unsplashProvider(),
    uploadcare: uploadcareProvider(),
    vercel: vercelProvider(),
    wagtail: wagtailProvider(),
    weserv: weservProvider(),
    sirv: sirvProvider()
  };
}
