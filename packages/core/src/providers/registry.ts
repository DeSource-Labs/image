import type { ImageProvider } from '../types';
import { aliyunProvider } from './aliyun';
import { awsAmplifyProvider } from './awsAmplify';
import { bunnyProvider } from './bunny';
import { builderioProvider } from './builderio';
import { caisyProvider } from './caisy';
import { cloudflareProvider } from './cloudflare';
import { cloudflareImagesProvider } from './cloudflareimages';
import { cloudimageProvider } from './cloudimage';
import { cloudinaryProvider } from './cloudinary';
import { contentfulProvider } from './contentful';
import { directusProvider } from './directus';
import { fastlyProvider } from './fastly';
import { filerobotProvider } from './filerobot';
import { flyimgProvider } from './flyimg';
import { githubProvider } from './github';
import { glideProvider } from './glide';
import { gumletProvider } from './gumlet';
import { hygraphProvider } from './hygraph';
import { imageEngineProvider } from './imageengine';
import { imagekitProvider } from './imagekit';
import { imgixProvider } from './imgix';
import { ipxProvider } from './ipx';
import { ipxStaticProvider } from './ipxStatic';
import { netlifyProvider } from './netlify';
import { netlifyLargeMediaProvider } from './netlifyLargeMedia';
import { netlifyImageCdnProvider } from './netlifyImageCdn';
import { picsumProvider } from './picsum';
import { preprProvider } from './prepr';
import { noneProvider } from './none';
import { prismicProvider } from './prismic';
import { sanityProvider } from './sanity';
import { shopifyProvider } from './shopify';
import { storyblokProvider } from './storyblok';
import { strapiProvider } from './strapi';
import { strapi5Provider } from './strapi5';
import { supabaseProvider } from './supabase';
import { twicpicsProvider } from './twicpics';
import { umbracoProvider } from './umbraco';
import { unsplashProvider } from './unsplash';
import { uploadcareProvider } from './uploadcare';
import { vercelProvider } from './vercel';
import { wagtailProvider } from './wagtail';
import { weservProvider } from './weserv';
import { sirvProvider } from './sirv';

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

export type BuiltInProviderName = (typeof BUILT_IN_PROVIDER_NAMES)[number];

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
