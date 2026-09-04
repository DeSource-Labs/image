import { BUILT_IN_PROVIDER_NAMES, type BuiltInProviderName } from '@desource/image/providers';

const featuredProviderIds = [
  'ipx',
  'cloudinary',
  'imgix',
  'vercel',
  'netlifyImageCdn',
  'awsAmplify',
  'imagekit',
  'cloudflare',
  'contentful',
  'directus',
  'sanity',
  'storyblok',
  'shopify',
  'supabase',
  'uploadcare',
  'unsplash'
] as const satisfies readonly BuiltInProviderName[];

const providerNames = {
  aliyun: 'Aliyun',
  awsAmplify: 'AWS Amplify',
  bunny: 'Bunny',
  builderio: 'Builder.io',
  caisy: 'Caisy',
  cloudflare: 'Cloudflare Transformations',
  cloudflareimages: 'Cloudflare Images',
  cloudimage: 'Cloudimage',
  cloudinary: 'Cloudinary',
  contentful: 'Contentful',
  directus: 'Directus',
  edgeonePages: 'EdgeOne Pages',
  fastly: 'Fastly',
  filerobot: 'Filerobot',
  flyimg: 'Flyimg',
  github: 'GitHub Avatars',
  glide: 'Glide',
  gumlet: 'Gumlet',
  hygraph: 'Hygraph',
  imageengine: 'ImageEngine',
  imagekit: 'ImageKit',
  imgix: 'Imgix',
  imgproxy: 'imgproxy',
  ipx: 'IPX',
  ipxStatic: 'IPX Static',
  netlify: 'Netlify',
  netlifyImageCdn: 'Netlify Image CDN',
  netlifyLargeMedia: 'Netlify Large Media',
  none: 'None',
  picsum: 'Picsum',
  prepr: 'Prepr',
  prismic: 'Prismic',
  sanity: 'Sanity',
  shopify: 'Shopify',
  sirv: 'Sirv',
  storyblok: 'Storyblok',
  strapi: 'Strapi',
  strapi5: 'Strapi 5',
  supabase: 'Supabase',
  twicpics: 'TwicPics',
  umbraco: 'Umbraco',
  unsplash: 'Unsplash',
  uploadcare: 'Uploadcare',
  vercel: 'Vercel',
  wagtail: 'Wagtail',
  weserv: 'Weserv'
} satisfies Record<BuiltInProviderName, string>;

const sharedIconProviders: Partial<Record<BuiltInProviderName, BuiltInProviderName>> = {
  cloudflareimages: 'cloudflare',
  ipxStatic: 'ipx',
  netlifyImageCdn: 'netlify',
  netlifyLargeMedia: 'netlify',
  strapi5: 'strapi'
};

const featuredProviderIdSet = new Set<BuiltInProviderName>(featuredProviderIds);
const providerIds = [...featuredProviderIds, ...BUILT_IN_PROVIDER_NAMES.filter((id) => !featuredProviderIdSet.has(id))];

export type ProviderId = BuiltInProviderName;

export const providers = providerIds.map((id) => ({
  id,
  name: providerNames[id],
  slug: toProviderSlug(id),
  icon: `/providers/${toProviderSlug(sharedIconProviders[id] ?? id)}.svg`
}));

function toProviderSlug(id: BuiltInProviderName): string {
  return id.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
