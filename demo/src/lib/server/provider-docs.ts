import type { ProviderId } from '$lib/providers';

export interface ProviderDoc {
  description: string;
  options: { name: string; value: string | number | null; description: string }[];
  src: string;
  source: string;
  modifiers: string;
  notes: string[];
  reference: string;
  factory: string;
  example: Record<string, unknown>;
  extra: { title: string; language: string; code: string }[];
}

export const providerDocs: Record<ProviderId, ProviderDoc> = {
  ipx: {
    description: 'Transform local files and allowed remote images with an IPX server.',
    options: [
      {
        name: 'path',
        value: '/_ipx',
        description: 'The optimizer route. Defaults to /_ipx; baseURL takes precedence when both are set.'
      }
    ],
    src: '/img/hero.jpg',
    source: 'Use a path relative to a configured static directory, or an absolute URL from an allowed domain.',
    modifiers:
      'Width and height become a single resize operation. Supports format, quality, fit, background, position, blur, crop, rotate, sharpen and the IPX operation names.',
    notes: [
      'Selected automatically outside supported hosting platforms. The Vite plugin serves IPX during development and preview only.',
      'Production needs an IPX server handler and the ipx dependency. Client provider options do not configure server storage or remote access.',
      'Set domains in both image configuration and the server handler for remote images. Static-directory paths must point to files available in the deployed server.'
    ],
    reference: 'https://github.com/unjs/ipx',
    factory: 'ipxProvider',
    example: {
      width: 800,
      height: 500
    },
    extra: [
      {
        title: 'SvelteKit production handler',
        language: 'ts',
        code: "// npm install ipx\n// src/hooks.server.ts\nimport { createDsImageHandle } from '@desource/image-svelte/server';\n\nexport const handle = createDsImageHandle({\n  dirs: ['static'],\n  domains: ['images.example.com']\n});"
      },
      {
        title: 'SvelteKit development',
        language: 'ts',
        code: "// vite.config.ts\nimport { defineConfig } from 'vite';\nimport { sveltekit } from '@sveltejs/kit/vite';\nimport { dsImage } from '@desource/image-svelte/vite';\n\nexport default defineConfig({\n  plugins: [dsImage({ dirs: ['static'] }), sveltekit()]\n});"
      }
    ]
  },
  cloudinary: {
    description: 'Deliver uploaded assets or fetch remote images through Cloudinary.',
    options: [
      {
        name: 'cloudName',
        value: 'demo',
        description: 'Your Cloudinary cloud name. Expands to https://res.cloudinary.com/{cloudName}/image/upload.'
      },
      {
        name: 'deliveryType',
        value: 'upload',
        description: 'Use upload for stored public IDs or fetch for absolute remote source URLs. Defaults to upload.'
      },
      {
        name: 'baseURL',
        value: null,
        description: 'Optional full delivery URL; overrides cloudName and supports auto-upload folders.'
      }
    ],
    src: 'sample',
    source: 'Pass an uploaded public ID, a Cloudinary upload URL, or an absolute remote URL when using fetch delivery.',
    modifiers:
      'Format and quality default to auto. Width, height and fit map to w, h and c. Additional modifiers include gravity, rotate, roundCorner, effect, flags, dpr, opacity, overlay, underlay, transformation, zoom, colorSpace and blur.',
    notes: [
      'Configure allowed fetch domains before using deliveryType: fetch. Auto-upload folders require a matching Cloudinary upload mapping.',
      'Standard fit values map to Cloudinary crop modes. Extra modes include minCover, minInside, coverLimit, thumbnail and cropping.',
      'Public upload IDs normally have their filename extension removed; format selects the output encoding.'
    ],
    reference: 'https://cloudinary.com/documentation/image_transformation_reference',
    factory: 'cloudinaryProvider',
    example: {
      width: 800,
      height: 500,
      format: 'webp',
      quality: 80,
      gravity: 'auto'
    },
    extra: []
  },
  imgix: {
    description: 'Generate transformation URLs for an Imgix source.',
    options: [
      {
        name: 'baseURL',
        value: 'https://your-source.imgix.net',
        description: 'The public image service URL, including any required account or asset path.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use an asset path under the Imgix source. Keep provider configuration pointed at its delivery hostname.',
    modifiers:
      'Width, height, format and quality map to w, h, fm and q. Supports auto, crop, pixelDensity, focalPointXPosition, focalPointYPosition, gaussianBlur, watermarkImageURL, textString and other mapped Imgix operations.',
    notes: [
      'Fit maps cover to crop, contain to fill, fill to scale, inside to max and outside to min.',
      'The adapter does not generate secure URL signatures. Signed sources need server-side URL generation compatible with your Imgix configuration.'
    ],
    reference: 'https://docs.imgix.com/apis/rendering',
    factory: 'imgixProvider',
    example: {
      width: 800,
      height: 500,
      format: 'webp',
      quality: 80,
      fit: 'cover'
    },
    extra: []
  },
  vercel: {
    description: 'Use the image endpoint supplied by a Vercel deployment.',
    options: [
      {
        name: 'path',
        value: '/_vercel/image',
        description: 'Optimizer endpoint. baseURL overrides this alias.'
      },
      {
        name: 'defaultQuality',
        value: 80,
        description: 'Fallback quality for requests without a quality modifier; the adapter otherwise uses 100.'
      }
    ],
    src: '/img/hero.jpg',
    source: 'Use a deployment-relative asset path or an allowed absolute remote image URL.',
    modifiers:
      'The adapter emits url, w and q. Height, fit and explicit format are not sent; output formats are configured on the hosting platform.',
    notes: [
      'Auto-detected on Vercel. The deployed project still needs image settings in its Build Output API configuration.',
      'Widths are matched against image.screens, rounded up to the next configured width, or capped at the largest. Match these values and density candidates to the deployment sizes.',
      'Remote hosts must be allowed in both the library source policy and deployment image configuration. Cache TTL and allowed formats belong to the deployment adapter.'
    ],
    reference: 'https://vercel.com/docs/build-output-api/v3/configuration#images',
    factory: 'vercelProvider',
    example: {
      width: 800,
      quality: 80
    },
    extra: [
      {
        title: 'SvelteKit deployment settings',
        language: 'js',
        code: "// svelte.config.js\nimport adapter from '@sveltejs/adapter-vercel';\n\nexport default {\n  kit: {\n    adapter: adapter({\n      images: {\n        sizes: [640, 768, 800, 1024, 1280, 1536, 1600],\n        domains: ['images.example.com'],\n        formats: ['image/avif', 'image/webp'],\n        minimumCacheTTL: 3600\n      }\n    })\n  }\n};"
      }
    ]
  },
  netlifyImageCdn: {
    description: 'Resize local and remote images through Netlify Image CDN.',
    options: [
      {
        name: 'path',
        value: '/.netlify/images',
        description: 'Endpoint path. Defaults to /.netlify/images; baseURL takes precedence.'
      }
    ],
    src: '/img/hero.jpg',
    source: 'Use a deployment-relative path or an absolute remote source allowed by Netlify.',
    modifiers:
      'Supports width, height, quality, format, fit and position. Fit accepts cover, contain or fill; position accepts top, right, bottom, left or center. JPEG maps to jpg.',
    notes: [
      'Auto-detected on Netlify unless the Large Media environment is present.',
      'Configure remote_images in netlify.toml for remote origins. Generating a URL does not create a local Netlify optimizer.'
    ],
    reference: 'https://docs.netlify.com/image-cdn/overview/',
    factory: 'netlifyImageCdnProvider',
    example: {
      width: 800,
      height: 500,
      format: 'webp',
      quality: 80,
      fit: 'cover'
    },
    extra: [
      {
        title: 'Allow a remote origin on Netlify',
        language: 'toml',
        code: "[images]\nremote_images = ['https://images\\.example\\.com/.*']"
      }
    ]
  },
  awsAmplify: {
    description: 'Generate requests for the Amplify Hosting image optimizer.',
    options: [
      {
        name: 'path',
        value: '/_amplify/image',
        description: 'Optimizer endpoint. baseURL takes precedence.'
      },
      {
        name: 'defaultQuality',
        value: 80,
        description: 'Default request quality; the adapter otherwise falls back to 100.'
      }
    ],
    src: '/img/hero.jpg',
    source:
      'Use a hosted local file or an absolute source URL allowed by your image configuration and Amplify deployment.',
    modifiers:
      'Maps width, height, quality, format and fit to the Amplify request. Width is rounded up to a configured screen width, or capped at the largest.',
    notes: [
      'Auto-detected on Amplify. Your framework deployment must expose /_amplify/image and configure imageSettings in its deployment manifest.',
      'Keep image.screens and generated density widths aligned with deployed imageSettings.sizes. Remote domains and formats must also be permitted by the deployment.',
      'Cache and allowed-format settings are deployment configuration; this provider generates request URLs.'
    ],
    reference: 'https://docs.aws.amazon.com/amplify/latest/userguide/integrate-image-optimization-framework.html',
    factory: 'awsAmplifyProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80
    },
    extra: []
  },
  imagekit: {
    description: 'Apply ImageKit transformations to images behind your URL endpoint.',
    options: [
      {
        name: 'baseURL',
        value: 'https://ik.imagekit.io/your-id',
        description: 'The public image service URL, including any required account or asset path.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use a path within the ImageKit endpoint, including any configured origin folder.',
    modifiers:
      'Width, height, format and quality map to w, h, f and q in the tr query. Supports focus, cropMode, aspectRatio, radius, border, rotate, blur, named, progressive, lossless and dpr.',
    notes: [
      'Fit maps cover to maintain_ratio, contain to pad_resize, fill to force, inside to at_max and outside to at_least.',
      'Use raw for an already composed ImageKit transformation string. This adapter does not generate URL signatures.'
    ],
    reference: 'https://imagekit.io/docs/image-transformation',
    factory: 'imagekitProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp',
      focus: 'auto'
    },
    extra: []
  },
  cloudflare: {
    description: 'Transform images through a Cloudflare zone using /cdn-cgi/image/.',
    options: [
      {
        name: 'baseURL',
        value: 'https://images.example.com',
        description: 'Your Cloudflare zone origin. The adapter appends /cdn-cgi/image automatically.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use an origin-relative path or a remote source allowed by your Cloudflare zone.',
    modifiers:
      'Supports width, height, quality, format, fit, gravity, background, blur, rotate and Cloudflare transformation parameters.',
    notes: [
      'Enable Image Transformations for the zone and allow the intended remote origins.',
      'This is the zone transformation provider. For uploaded Cloudflare image IDs and named variants, use cloudflareimages.',
      'No modifiers are added by default. With no requested transformations, the original absolute URL or baseURL-relative source is returned.'
    ],
    reference: 'https://developers.cloudflare.com/images/transform-images/transform-via-url/',
    factory: 'cloudflareProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      fit: 'cover'
    },
    extra: []
  },
  contentful: {
    description: 'Resize and encode assets with the Contentful Images API.',
    options: [
      {
        name: 'baseURL',
        value: 'https://images.ctfassets.net',
        description: 'Defaults to https://images.ctfassets.net. Set the correct regional delivery hostname if needed.'
      }
    ],
    src: '/space-id/asset-id/asset-hash/photo.jpg',
    source: 'Use the asset URL from Contentful or its complete path including space, asset ID, hash and filename.',
    modifiers:
      'Maps width, height, quality, format, focus, radius and background. Fit cover becomes crop, contain becomes fill, fill becomes scale and thumbnail becomes thumb.',
    notes: [
      'The adapter extracts the pathname from src and rebuilds the transformation query. Existing source query parameters are not retained.',
      'When using an absolute regional asset URL, also configure the matching baseURL.'
    ],
    reference: 'https://www.contentful.com/developers/docs/references/images-api/',
    factory: 'contentfulProvider',
    example: {
      width: 800,
      height: 500,
      format: 'webp',
      quality: 80,
      fit: 'cover'
    },
    extra: []
  },
  directus: {
    description: 'Request resized assets and transformation presets from Directus.',
    options: [
      {
        name: 'baseURL',
        value: 'https://cms.example.com/assets',
        description: 'Your Directus asset endpoint, including /assets.'
      }
    ],
    src: 'file-uuid',
    source:
      'Pass a Directus file ID, optionally followed by a filename. The example assumes the asset is publicly readable.',
    modifiers:
      'Supports width, height, quality, format, fit, withoutEnlargement, key and transforms. The transforms array is JSON-encoded; duplicate operations are removed.',
    notes: [
      'Asset permissions and transformation limits are enforced by Directus. Client configuration does not authenticate private files.',
      'Use key for a named Directus transform without combining it with other transformation modifiers.',
      'Use transforms for a Sharp operation pipeline such as [["rotate", 90], ["grayscale"]].'
    ],
    reference: 'https://directus.io/docs/guides/files/transform',
    factory: 'directusProvider',
    example: {
      width: 800,
      height: 500,
      format: 'webp',
      quality: 80,
      withoutEnlargement: true
    },
    extra: []
  },
  sanity: {
    description: 'Render Sanity image references, crop data and hotspots through the image CDN.',
    options: [
      {
        name: 'projectId',
        value: 'your-project',
        description: 'Project ID, required for image references. Can be extracted from an absolute Sanity URL.'
      },
      {
        name: 'dataset',
        value: 'production',
        description: 'Dataset name. Defaults to production when it cannot be inferred.'
      },
      {
        name: 'baseURL',
        value: 'https://cdn.sanity.io/images',
        description: 'The CDN image root, before project and dataset.'
      }
    ],
    src: 'image-assetid-1200x800-jpg',
    source: 'Pass an image asset _ref such as image-hash-1200x800-jpg, or an absolute Sanity image URL.',
    modifiers:
      'Supports width, height, quality, format, fit, background, crop and hotspot. Crop objects become a pixel rect using dimensions in the asset ID; hotspot objects set fp-x and fp-y.',
    notes: [
      'Format defaults to auto=format. Use crop and hotspot directly from Sanity image fields.',
      'Fit cover maps to crop; contain maps to fill with a white background unless overridden. Inside maps to min and outside to max.'
    ],
    reference: 'https://www.sanity.io/docs/image-urls',
    factory: 'sanityProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      fit: 'cover',
      hotspot: {
        x: 0.5,
        y: 0.4
      }
    },
    extra: []
  },
  storyblok: {
    description: 'Build Storyblok Image Service URLs for CMS assets.',
    options: [
      {
        name: 'baseURL',
        value: 'https://a.storyblok.com',
        description: 'Storyblok asset host. Set a regional host here when your assets use one.'
      }
    ],
    src: '/f/space-id/1200x800/asset-hash/photo.jpg',
    source: 'Pass a Storyblok asset URL or its full /f/... path.',
    modifiers:
      'Width and height form the resize path; one omitted dimension is represented by 0. Supports quality, format, smart, fit and a filters object.',
    notes: [
      'Use fit: in for Storyblok fit-in. The adapter passes other fit values directly into the path.',
      'Set smart: true for smart crop, filters.focal for a focal rectangle, or filters.fill for padding color.',
      'SVG sources ending in .svg skip raster resizing, format and quality processing.'
    ],
    reference: 'https://www.storyblok.com/docs/api/image-service',
    factory: 'storyblokProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp',
      smart: true
    },
    extra: []
  },
  shopify: {
    description: 'Transform product and content images delivered by Shopify CDN.',
    options: [
      {
        name: 'baseURL',
        value: '',
        description: 'Optional CDN prefix for relative paths. Absolute Storefront image URLs can be used directly.'
      }
    ],
    src: 'https://cdn.shopify.com/s/files/1/0000/0001/files/photo.jpg',
    source: 'Use the image URL from the Storefront API; its existing query parameters are preserved.',
    modifiers:
      'Supports width, height, format, quality, padColor, crop, cropLeft, cropTop, cropWidth and cropHeight. Use crop: region with region coordinates.',
    notes: [
      'Use Shopify crop values center, top, bottom, left, right or region.',
      'Use padColor for a padding color. Transformation availability is determined by Shopify CDN.'
    ],
    reference: 'https://shopify.dev/docs/api/liquid/filters/image_url',
    factory: 'shopifyProvider',
    example: {
      width: 800,
      height: 500,
      format: 'webp',
      crop: 'center'
    },
    extra: []
  },
  supabase: {
    description: 'Build image transformation URLs for a public Supabase Storage bucket.',
    options: [
      {
        name: 'baseURL',
        value: 'https://your-project.supabase.co/storage/v1/render/image/public/photos',
        description: 'Required render endpoint, including /storage/v1/render/image/public and your bucket name.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use the object path within the public bucket configured in baseURL.',
    modifiers:
      'Width, height and quality are forwarded. Fit maps to resize with cover, contain or fill. The format modifier can request origin to keep the original encoding.',
    notes: [
      'The adapter throws if baseURL is missing. An object/public download URL is not the transformation endpoint.',
      'Your Supabase project must have image transformations enabled. Check the service documentation for plan availability and dimension limits.',
      'This adapter does not authenticate private objects or sign URLs; use public bucket assets for this configuration.'
    ],
    reference: 'https://supabase.com/docs/guides/storage/serving/image-transformations',
    factory: 'supabaseProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      fit: 'cover'
    },
    extra: []
  },
  uploadcare: {
    description: 'Generate CDN image operations for Uploadcare file UUIDs.',
    options: [
      {
        name: 'cdnURL',
        value: 'https://ucarecdn.com',
        description:
          'CDN origin, including https://. Defaults to https://ucarecdn.com; set your custom delivery domain if needed.'
      }
    ],
    src: 'c160afba-8b42-45a9-a46a-d393248b0072',
    source: 'Pass an Uploadcare UUID or an absolute CDN file URL.',
    modifiers:
      'Width and height become resize. Fit cover uses scale_crop centered on the image, contain disables stretching, and other fit values use smart_resize. Supports format, quality, progressive, strip_meta, crop, border_radius, setfill and zoom_objects.',
    notes: [
      'Uploadcare quality uses named presets such as smart, smart_retina, normal, better, best, lighter and lightest. Pass those through modifiers rather than a numeric quality prop.',
      'Transformation values with multiple path segments can be supplied as arrays. Output URLs retain a trailing slash.'
    ],
    reference: 'https://uploadcare.com/docs/transformations/image/',
    factory: 'uploadcareProvider',
    example: {
      width: 800,
      height: 500,
      fit: 'cover',
      format: 'webp',
      quality: 'smart'
    },
    extra: []
  },
  unsplash: {
    description: 'Resize Unsplash image URLs while retaining their source query parameters.',
    options: [
      {
        name: 'baseURL',
        value: 'https://images.unsplash.com',
        description: 'Defaults to the Unsplash image CDN.'
      }
    ],
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    source: 'Use the image URL returned by the Unsplash API, including its ixid query parameter.',
    modifiers: 'Uses Imgix-style width, height, crop, format, auto, quality, fit and pixelDensity transformations.',
    notes: [
      'Existing query parameters, including ixid, are retained unless explicitly overridden.',
      'Use the image URL rather than the Unsplash photo webpage. Follow the Unsplash API guidelines for attribution and tracking.'
    ],
    reference: 'https://unsplash.com/documentation#dynamically-resizable-images',
    factory: 'unsplashProvider',
    example: {
      width: 800,
      height: 500,
      fit: 'cover',
      quality: 80
    },
    extra: []
  },
  aliyun: {
    description: 'Generate image_process requests for an Aliyun CDN image endpoint.',
    options: [
      {
        name: 'baseURL',
        value: 'https://images.example.com',
        description: 'The domain of your Aliyun CDN image service; defaults to /.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use a path on the configured CDN domain.',
    modifiers:
      'Width and height become the resize operation; quality becomes Q_{quality}. Use resize to supply an explicit resize expression, or rotate and bright for rotation and brightness.',
    notes: [
      'This adapter targets the CDN image_process API. Configure your CDN image processing service before requesting transformed URLs.'
    ],
    reference: 'https://help.aliyun.com/zh/cdn/user-guide/image-editing',
    factory: 'aliyunProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      rotate: 90
    },
    extra: []
  },
  bunny: {
    description: 'Generate query transformations for Bunny Optimizer.',
    options: [
      {
        name: 'baseURL',
        value: 'https://your-zone.b-cdn.net',
        description: 'Your Bunny delivery hostname. Absolute Bunny image URLs may also be passed as src.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use a path in the delivery zone or a complete Bunny image URL.',
    modifiers:
      'Supports width, height, quality, aspectRatio, crop, cropGravity, flip, flop, blur, sharpen, brightness, saturation and autoOptimize through the query API.',
    notes: [
      'Enable the image processing service for the delivery zone. Existing query parameters are retained and requested transformations are merged into them.'
    ],
    reference: 'https://docs.bunny.net/docs/stream-image-processing',
    factory: 'bunnyProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80
    },
    extra: []
  },
  builderio: {
    description: 'Transform images returned by the Builder.io Image API.',
    options: [],
    src: 'https://cdn.builder.io/api/v1/image/assets/your-space/your-asset',
    source: 'Pass the complete Builder.io asset URL; this adapter does not prepend a baseURL.',
    modifiers: 'Maps width, height, format, quality, fit and position to Builder.io query parameters.',
    notes: [
      'Source query parameters are preserved. Use WebP for fit and position transformations supported by the Builder.io API.'
    ],
    reference: 'https://www.builder.io/c/docs/image-api',
    factory: 'builderioProvider',
    example: {
      width: 800,
      height: 500,
      format: 'webp',
      quality: 80,
      fit: 'cover'
    },
    extra: []
  },
  caisy: {
    description: 'Build transformation URLs for Caisy asset images.',
    options: [],
    src: 'https://assets.caisy.io/assets/project-id/asset-id/photo.jpg',
    source: 'Use a complete Caisy asset URL, without existing transformation parameters.',
    modifiers:
      'Width, height and quality map to w, h and q. Other service parameters are serialized by name into the query.',
    notes: [
      'The adapter appends a new transformation query to src. Start with a clean source URL to avoid duplicate question marks.'
    ],
    reference: 'https://caisy.io/developer/docs/libraries/rendering-images',
    factory: 'caisyProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80
    },
    extra: []
  },
  cloudflareimages: {
    description: 'Deliver uploaded Cloudflare images by image ID, named variant or flexible transformation.',
    options: [
      {
        name: 'accountHash',
        value: 'your-account-hash',
        description: 'Required Cloudflare Images delivery account hash.'
      },
      {
        name: 'baseURL',
        value: 'https://imagedelivery.net/',
        description: 'Delivery root. Change this for a configured custom delivery domain.'
      }
    ],
    src: 'your-image-id',
    source: 'Use an uploaded image ID, not a zone-relative file path.',
    modifiers:
      'Pass variant for a named variant. With no modifiers, the provider uses public. Otherwise width, height, quality, fit and related modifiers create a flexible variant.',
    notes: [
      'A named variant takes precedence over all other transformation modifiers.',
      'Enable flexible variants before using arbitrary transformations. For /cdn-cgi/image on your own zone, choose cloudflare.'
    ],
    reference: 'https://developers.cloudflare.com/images/manage-images/create-variants/',
    factory: 'cloudflareImagesProvider',
    example: {
      width: 800,
      height: 500,
      fit: 'cover'
    },
    extra: []
  },
  cloudimage: {
    description: 'Proxy an image origin through a Cloudimage delivery token or custom CDN.',
    options: [
      {
        name: 'token',
        value: 'your-token',
        description: 'Public customer delivery token, required unless cdnURL is supplied.'
      },
      {
        name: 'apiVersion',
        value: '',
        description: 'API path version, empty by default. Use the version required by your token.'
      },
      {
        name: 'baseURL',
        value: 'https://images.example.com',
        description: 'Public source origin for relative paths. Falls back to the shared configuration baseURL.'
      },
      {
        name: 'cdnURL',
        value: null,
        description: 'Optional complete Cloudimage CDN URL, overriding the token-based URL.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use a relative source path with baseURL, or an absolute public source URL.',
    modifiers:
      'Fit maps to func, quality to q and format to force_format. Supports Cloudimage transformation parameters such as crop, face, cropfit, bound and boundmin.',
    notes: [
      'Absolute source URLs bypass baseURL. Relative sources must resolve to an origin that Cloudimage can fetch.',
      'Missing both token and cdnURL produces a development warning and an unusable placeholder URL.'
    ],
    reference: 'https://docs.cloudimage.io/go/cloudimage-documentation-v7/en/introduction',
    factory: 'cloudimageProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      fit: 'cover'
    },
    extra: []
  },
  edgeonePages: {
    description: 'Apply imageMogr2 transformations to files hosted on EdgeOne Pages.',
    options: [
      {
        name: 'baseURL',
        value: 'https://your-project.edgeone.app',
        description: 'Required publicly accessible EdgeOne Pages domain.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use the path of an image deployed to EdgeOne Pages.',
    modifiers:
      'Width and height map to thumbnail; fit supports contain, cover and fill. Supports quality, format, background, blur, crop, gravity, dx, dy, iradius, scrop, rotate, autoOrient, sharpen, strip, interlace and pad.',
    notes: [
      'Missing baseURL throws an error. The image must exist on the configured Pages domain.',
      'Crop offsets require a crop operation. Background padding is added when background is combined with dimensions.'
    ],
    reference: 'https://edgeone.ai/document/162498',
    factory: 'edgeonePagesProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp',
      fit: 'cover'
    },
    extra: []
  },
  fastly: {
    description: 'Generate Fastly Image Optimizer query parameters.',
    options: [
      {
        name: 'baseURL',
        value: 'https://images.example.com',
        description: 'Your Fastly image optimization service domain; defaults to /.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use a path served by the Fastly image service or an absolute image URL.',
    modifiers: 'Supports width, height, format, quality, fit, crop, dpr and other Fastly query operations.',
    notes: [
      'The Fastly service must have Image Optimizer configured. Existing source query parameters are merged with transformations.'
    ],
    reference: 'https://docs.fastly.com/en/guides/image-optimization-api',
    factory: 'fastlyProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp'
    },
    extra: []
  },
  filerobot: {
    description: 'Transform assets delivered by Scaleflex Filerobot.',
    options: [
      {
        name: 'baseURL',
        value: 'https://your-token.filerobot.com',
        description: 'Your Filerobot project delivery URL; required for relative asset paths.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use a project-relative asset path or an absolute Filerobot delivery URL.',
    modifiers:
      'Maps fit to func and quality to q, with width, height and Filerobot image transformation parameters passed through.',
    notes: [
      'Absolute source URLs bypass baseURL. Start with an untransformed source URL because the adapter appends its own query.'
    ],
    reference: 'https://docs.scaleflex.com/filerobot',
    factory: 'filerobotProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      fit: 'cover'
    },
    extra: []
  },
  flyimg: {
    description: 'Send transformation requests to a self-hosted or managed Flyimg server.',
    options: [
      {
        name: 'baseURL',
        value: 'https://flyimg.example.com',
        description: 'Your Flyimg server origin.'
      },
      {
        name: 'sourceURL',
        value: 'https://www.example.com',
        description: 'Public source origin used to make relative source paths absolute.'
      },
      {
        name: 'processType',
        value: 'upload',
        description: 'Processing route, defaults to upload.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use an absolute image source, or a relative path with sourceURL configured.',
    modifiers:
      'Supports width, height, quality, format, crop, gravity, rotate, strip, mozjpeg, preserveAspectRatio and preserveNaturalSize. Fit cover enables crop; fill disables aspect-ratio preservation.',
    notes: [
      'Fit outside is unsupported and ignored. Contain and inside use Flyimg default resizing.',
      'The server must be able to fetch the source URL. Configure allowed sources on Flyimg.',
      'When reverse proxying with nginx, preserve embedded https:// in the request path by setting merge_slashes off.',
      'Set strip, mozjpeg, preserveAspectRatio or preserveNaturalSize to false to opt out of their enabled defaults.'
    ],
    reference: 'https://flyimg.io/documentation',
    factory: 'flyimgProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp',
      fit: 'cover'
    },
    extra: []
  },
  github: {
    description: 'Request a GitHub avatar at a bounded square size.',
    options: [
      {
        name: 'baseURL',
        value: 'https://avatars.githubusercontent.com/',
        description: 'Defaults to the GitHub avatar host.'
      }
    ],
    src: '/u/1',
    source: 'Use a GitHub avatar path such as /u/{numeric-user-id}.',
    modifiers:
      'The greater of width and height selects s, clamped to 1\u2013460. The default is 460. The adapter also sets v=4.',
    notes: [
      'Quality, format, fit and other general image modifiers do not affect the generated URL.',
      'This provider serves avatars; it does not optimize arbitrary repository images.'
    ],
    reference: 'https://docs.github.com/en/rest/users/users',
    factory: 'githubProvider',
    example: {
      width: 128,
      height: 128
    },
    extra: []
  },
  glide: {
    description: 'Generate transformation URLs for a PHP Glide image server.',
    options: [
      {
        name: 'baseURL',
        value: 'https://images.example.com',
        description: 'The URL where your Glide server accepts image paths.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use the image path expected by your Glide server.',
    modifiers:
      'Supports width, height, quality, format, fit, orientation, flip, crop, dpr, blur, sharpen via sharp, brightness via bri, contrast via con, watermarks via mark and background.',
    notes: [
      'Fit maps cover to crop, inside to max, outside to stretch, and contain to contain.',
      'The adapter does not create a Glide server or URL signature. If your server requires signatures, generate the final signed URL on your server.'
    ],
    reference: 'https://glide.thephpleague.com/2.0/api/quick-reference/',
    factory: 'glideProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp',
      fit: 'cover'
    },
    extra: []
  },
  gumlet: {
    description: 'Generate transformations for a configured Gumlet image source.',
    options: [
      {
        name: 'baseURL',
        value: 'https://your-source.gumlet.io',
        description: 'Your Gumlet delivery domain.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use an asset path served by the Gumlet source.',
    modifiers:
      'Maps width, height, quality, format, fit, crop, auto, rotate, backgroundColor, focalPointXPosition, focalPointYPosition, pixelDensity and color adjustments.',
    notes: [
      'Fit maps cover to crop, contain to fill, fill to scale, inside to max and outside to min.',
      'Use a clean source path: the adapter appends a transformation query.'
    ],
    reference: 'https://docs.gumlet.com/reference/image-transformations',
    factory: 'gumletProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp',
      fit: 'cover'
    },
    extra: []
  },
  hygraph: {
    description: 'Transform assets from a Hygraph project delivery endpoint.',
    options: [
      {
        name: 'baseURL',
        value: 'https://eu-central-1-shared-euc1-02.graphassets.com/your-environment-id',
        description: 'Required asset base URL, optionally including the environment/base ID.'
      }
    ],
    src: 'your-asset-id',
    source: 'With the base ID in baseURL, pass the asset ID. Otherwise src must include both base ID and asset ID.',
    modifiers:
      'Supports width, height, fit, format and quality. Fit contain becomes max. Format defaults to auto_image; explicit formats use output=format:{format}.',
    notes: [
      'Quality is only included when an explicit output format is requested.',
      'Missing baseURL or an invalid source path throws an error. Copy the asset endpoint from your Hygraph project.'
    ],
    reference: 'https://hygraph.com/docs/api-reference/assets/working-with-assets',
    factory: 'hygraphProvider',
    example: {
      width: 800,
      height: 500,
      format: 'webp',
      quality: 80,
      fit: 'contain'
    },
    extra: []
  },
  imageengine: {
    description: 'Generate ImageEngine delivery directives under the imgeng query.',
    options: [
      {
        name: 'baseURL',
        value: 'https://your-engine.imgeng.in',
        description: 'The delivery address of your ImageEngine engine.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use a path resolved by the configured ImageEngine source.',
    modifiers:
      'Supports width, height, quality, format, fit, passThrough, sharpen, rotate, screenPercent, crop, metadata and maxDpr. Quality is converted to compression as 100 minus quality, capped at 99.',
    notes: [
      'Fit maps cover to cropbox, contain to letterbox, fill to stretch, and inside/outside to box. JPEG maps to jpg.',
      'The engine must be configured with access to the source image origin.'
    ],
    reference: 'https://support.imageengine.io/hc/en-us/articles/360058880672',
    factory: 'imageEngineProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp',
      fit: 'cover'
    },
    extra: []
  },
  imgproxy: {
    description: 'Generate encoded image paths for an imgproxy server, with optional HMAC signing.',
    options: [
      {
        name: 'baseURL',
        value: 'https://imgproxy.example.com',
        description: 'The imgproxy server origin.'
      },
      {
        name: 'key',
        value: null,
        description: 'Hex-encoded signing key. Keep this in server-only configuration.'
      },
      {
        name: 'salt',
        value: null,
        description: 'Hex-encoded signing salt. Keep this in server-only configuration.'
      }
    ],
    src: 'https://images.example.com/photo.jpg',
    source: 'Use the absolute source URL that imgproxy can fetch. The adapter encodes it as URL-safe Base64.',
    modifiers:
      'Supports width, height, fit, format, quality, resizingType, gravity, crop objects, dpr, enlarge, extend, rotate, blur, sharpen and metadata controls.',
    notes: [
      'Without both key and salt, the URL uses the unsafe signature segment. The server must permit unsigned URLs for the basic browser example.',
      'For a signed production endpoint, generate URLs on the server. Never put key or salt in browser code or serialize them to a page.',
      'Signing values must be non-empty, even-length hex strings. Rotate is rounded down to a multiple of 90 degrees.',
      'Fit cover selects fill, contain selects fit plus extension, and fill selects force when both dimensions are present.'
    ],
    reference: 'https://docs.imgproxy.net/usage/processing',
    factory: 'imgproxyProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp',
      fit: 'cover'
    },
    extra: [
      {
        title: 'Generate a signed URL on the server',
        language: 'ts',
        code: "// Server-only module; do not import it into browser code.\nimport { createImage } from '@desource/image';\nimport { imgproxyProvider } from '@desource/image/providers/imgproxy';\n\nconst image = createImage({\n  provider: 'imgproxy',\n  providers: {\n    imgproxy: imgproxyProvider({\n      baseURL: 'https://imgproxy.example.com',\n      key: process.env.IMGPROXY_KEY,\n      salt: process.env.IMGPROXY_SALT\n    })\n  }\n});\n\nexport const imageURL = image('https://images.example.com/photo.jpg', {\n  width: 800, format: 'webp', quality: 80\n});\n// Send only imageURL to the browser, then render it with provider: 'none'."
      }
    ]
  },
  ipxStatic: {
    description: 'Generate normalized IPX paths for pre-generated image assets.',
    options: [
      {
        name: 'path',
        value: '/_ipx',
        description: 'Output path prefix; defaults to /_ipx. baseURL takes precedence.'
      }
    ],
    src: '/img/hero.jpg',
    source: 'Use the same local or allowed remote sources as IPX.',
    modifiers:
      'Uses the IPX modifier syntax. Width and height combine into resize, and repeated slashes in the encoded source path are collapsed for static paths.',
    notes: [
      'This provider only generates URLs. It does not crawl pages, transform files during the build or write static output.',
      'A static deployment must pre-generate every requested transformation and publish files at the generated paths. Use ordinary IPX with a server handler for on-demand transformations.'
    ],
    reference: 'https://github.com/unjs/ipx',
    factory: 'ipxStaticProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp'
    },
    extra: []
  },
  netlify: {
    description: 'Use the netlify alias for the Netlify Image CDN provider.',
    options: [
      {
        name: 'path',
        value: '/.netlify/images',
        description: 'The Image CDN endpoint; baseURL takes precedence.'
      }
    ],
    src: '/img/hero.jpg',
    source: 'Use a local deployment path or a remote URL allowed in the Netlify configuration.',
    modifiers: 'Supports the same width, height, quality, format, fit and position modifiers as netlifyImageCdn.',
    notes: [
      'netlify is an alias for netlifyImageCdn. Auto-detection selects netlifyImageCdn explicitly.',
      'For deployment configuration and remote origin examples, see the Netlify Image CDN guide. Large Media has its own provider.'
    ],
    reference: 'https://docs.netlify.com/image-cdn/overview/',
    factory: 'netlifyProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp'
    },
    extra: []
  },
  netlifyLargeMedia: {
    description: 'Request transformations for images managed by Netlify Large Media.',
    options: [
      {
        name: 'baseURL',
        value: '/',
        description: 'Optional prefix for Large Media-managed asset paths; defaults to /.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use an image managed by Large Media in the deployed site.',
    modifiers:
      'Width and height map to w and h. Fit contain maps to nf_resize=fit; fill maps to smartcrop. Format is removed from requests.',
    notes: [
      'Auto-detection chooses this provider when NETLIFY_LFS_ORIGIN_URL is present.',
      'Smart crop requires both width and height. Without both dimensions, the adapter falls back to contain.',
      'Use netlifyImageCdn for the separate Image CDN endpoint.'
    ],
    reference: 'https://docs.netlify.com/large-media/transform-images/',
    factory: 'netlifyLargeMediaProvider',
    example: {
      width: 800,
      height: 500,
      fit: 'fill'
    },
    extra: []
  },
  picsum: {
    description: 'Request placeholder photographs from Lorem Picsum.',
    options: [
      {
        name: 'baseURL',
        value: 'https://picsum.photos',
        description: 'Defaults to https://picsum.photos.'
      }
    ],
    src: 'seed/desource',
    source: 'Use / for a random image, id/237 for a specific image, or seed/name for a stable selection.',
    modifiers:
      'Width and height become path segments. Supports grayscale and blur; blur is rounded and clamped to 1\u201310.',
    notes: [
      'Format, quality, fit and background are ignored. Unrecognized source paths request a random image.',
      'Height-only requests produce a square image; use width and height for a rectangle.'
    ],
    reference: 'https://picsum.photos/',
    factory: 'picsumProvider',
    example: {
      width: 800,
      height: 500,
      grayscale: true,
      blur: 2
    },
    extra: []
  },
  prepr: {
    description: 'Generate asset transformation paths for a Prepr project.',
    options: [
      {
        name: 'projectName',
        value: 'your-project',
        description: 'Required project name used in https://{projectName}.stream.prepr.io.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use a path on the project asset stream.',
    modifiers:
      'Maps width, height, quality, format and crop to Prepr path operations. Fit cover maps to crop, and jpeg becomes jpg.',
    notes: [
      'A missing or blank projectName throws an error.',
      'Only cover is mapped from the standard fit modes. Use Prepr-native modifiers for other supported operations.'
    ],
    reference: 'https://docs.prepr.io/reference/rest/v1/assets-resizing',
    factory: 'preprProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'jpeg',
      fit: 'cover'
    },
    extra: []
  },
  none: {
    description: 'Render the original source URL without provider transformations.',
    options: [],
    src: '/img/hero.jpg',
    source: 'Use any image URL that the browser can load.',
    modifiers:
      'The provider returns src unchanged. Width and height can still describe the rendered element, but quality, format, crop and other modifiers do not transform its bytes.',
    notes: [
      'Use this for SVG logos, already optimized assets, or URLs signed by a server.',
      'Responsive markup cannot create new image variants when every candidate resolves to the same URL.'
    ],
    reference: 'https://github.com/DeSource-Labs/image/blob/main/packages/core/src/providers/none.ts',
    factory: 'noneProvider',
    example: {
      width: 800,
      height: 500
    },
    extra: []
  },
  prismic: {
    description: 'Transform Prismic image fields while preserving editor-provided query parameters.',
    options: [
      {
        name: 'baseURL',
        value: 'https://images.prismic.io',
        description: 'Default Prismic image delivery root.'
      }
    ],
    src: 'https://images.prismic.io/your-repository/photo.jpg',
    source: 'Use the image URL returned by Prismic, including crop and other editor-generated parameters.',
    modifiers: 'Uses Imgix-style width, height, quality, format, crop and fit modifiers.',
    notes: [
      'Existing query parameters are preserved unless overridden by a requested modifier.',
      'Sources starting with the Unsplash CDN hostname are delegated to the Unsplash provider.'
    ],
    reference: 'https://prismic.io/docs/fields/image',
    factory: 'prismicProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp',
      fit: 'cover'
    },
    extra: []
  },
  strapi: {
    description: 'Select uploaded Strapi image variants by breakpoint filename.',
    options: [
      {
        name: 'baseURL',
        value: 'https://cms.example.com/uploads',
        description: 'Strapi upload root. The adapter defaults to http://localhost:1337/uploads.'
      }
    ],
    src: 'photo_hash.jpg',
    source: 'Use a filename relative to the uploads directory. A selected breakpoint is prepended to that filename.',
    modifiers:
      'The breakpoint modifier selects a pre-generated file, such as medium_photo_hash.jpg. Width, height, quality and format do not trigger image processing.',
    notes: [
      'Enable responsive upload variants in Strapi and select a breakpoint that exists for the asset.',
      'Without breakpoint, the original file is returned. Use strapi5 when working with the formats object and fallback variant selection.'
    ],
    reference: 'https://docs.strapi.io/cms/features/media-library',
    factory: 'strapiProvider',
    example: {
      width: 800,
      height: 500,
      breakpoint: 'medium'
    },
    extra: []
  },
  strapi5: {
    description: 'Select a Strapi media format with fallback to smaller available variants.',
    options: [
      {
        name: 'baseURL',
        value: 'https://cms.example.com/uploads',
        description: 'Upload root. Defaults to http://localhost:1337/uploads.'
      }
    ],
    src: '/uploads/photo_hash.jpg',
    source: 'Use the upload URL/path and pass the asset formats object as a modifier.',
    modifiers:
      'Use breakpoint, formats and optional breakpoints. Default order is large, medium, small, thumbnail. Selection starts at the requested breakpoint and tries subsequent formats.',
    notes: [
      'Missing breakpoint or formats returns the original. If no matching variant exists, the original is also returned.',
      'The leading /uploads/ path is removed before joining baseURL. Width, height, quality and format do not generate new files.'
    ],
    reference: 'https://docs.strapi.io/cms/features/media-library',
    factory: 'strapi5Provider',
    example: {
      width: 800,
      height: 500,
      breakpoint: 'medium',
      formats: {
        medium: {
          url: '/uploads/medium_photo_hash.jpg'
        },
        small: {
          url: '/uploads/small_photo_hash.jpg'
        }
      }
    },
    extra: []
  },
  twicpics: {
    description: 'Build ordered TwicPics transformation expressions.',
    options: [
      {
        name: 'baseURL',
        value: 'https://your-domain.twic.pics',
        description: 'TwicPics domain with a source path configured in its dashboard.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use a path under the configured TwicPics source.',
    modifiers:
      'Width, height and fit generate a resizing operation. Supports quality, format, focus, crop, cover, contain, resize, flip, turn, zoom, background and truecolor.',
    notes: [
      'Transformations are ordered. Place focus before crop or cover when the crop should use that focus point.',
      'Use a single dimension to preserve the source ratio. Outside uses a contain box based on the larger requested dimension.',
      'Use provider modifiers for TwicPics expressions such as focus: auto, cover: 16:9, turn: left or zoom: 1.5.'
    ],
    reference: 'https://www.twicpics.com/docs/api/transformations',
    factory: 'twicpicsProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      focus: 'auto'
    },
    extra: []
  },
  umbraco: {
    description: 'Generate ImageSharp query commands for Umbraco media assets.',
    options: [
      {
        name: 'baseURL',
        value: 'https://cms.example.com',
        description: 'Your Umbraco site origin. Defaults to an empty prefix.'
      }
    ],
    src: '/media/asset-id/photo.jpg',
    source: 'Use the complete /media/... path.',
    modifiers:
      'Supports width, height, format, quality, fit, sampler, anchorPosition and focalPointXY. Fit contain becomes max; cover becomes crop. A focal point is an x,y pair between 0 and 1.',
    notes: [
      'Set crops are not implemented. The adapter does not generate HMAC signatures for protected imaging endpoints.',
      'Umbraco imaging configuration can cap allowed resize dimensions.',
      'Use sampler for ImageSharp resampling and anchorPosition for an edge or corner crop anchor.'
    ],
    reference: 'https://docs.sixlabors.com/articles/imagesharp.web/processingcommands.html',
    factory: 'umbracoProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp',
      fit: 'cover',
      focalPointXY: '0.55,0.58'
    },
    extra: []
  },
  wagtail: {
    description: 'Build rendition filter paths for a Wagtail image-serving endpoint.',
    options: [
      {
        name: 'baseURL',
        value: 'https://cms.example.com/images',
        description: 'The endpoint in your Wagtail application that accepts image IDs and rendition filter specs.'
      }
    ],
    src: '42',
    source: 'Use the image identifier expected by your serving endpoint.',
    modifiers:
      'Both dimensions generate fill-{width}x{height}-c{focusZoom}. One dimension generates width or height; no dimensions uses original. Format defaults to webp and quality to 70.',
    notes: [
      'Your backend must implement an endpoint accepting these filter paths. The adapter does not create that route or sign Wagtail serve URLs.',
      'Use focusZoom to control cropping around the focal area. Generic fit is not read by this adapter.'
    ],
    reference: 'https://docs.wagtail.org/en/stable/advanced_topics/images/image_serve_view.html',
    factory: 'wagtailProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp',
      focusZoom: 20
    },
    extra: []
  },
  weserv: {
    description: 'Proxy publicly accessible source images through a Weserv service.',
    options: [
      {
        name: 'baseURL',
        value: 'https://www.example.com',
        description: 'Required public origin of your source images, including the scheme.'
      },
      {
        name: 'weservURL',
        value: 'https://wsrv.nl',
        description: 'Weserv service origin. Defaults to https://wsrv.nl.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use a relative path on your public origin or an absolute public image URL.',
    modifiers:
      'Supports width, height, fit, quality, format, background, pixelDensity, trimImage, sharpen, brightness, saturation, hue, filter, gamma, contrast, blur, mirror and rotate.',
    notes: [
      'Missing baseURL returns src unchanged with a development warning.',
      'The source must be reachable from the Weserv service. Localhost and private files cannot be fetched by the public service.',
      'The adapter supplies a filename and enables enlargement through the we flag.'
    ],
    reference: 'https://images.weserv.nl/docs/quick-reference.html',
    factory: 'weservProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp',
      fit: 'cover'
    },
    extra: []
  },
  sirv: {
    description: 'Apply Sirv image profiles and dynamic transformations.',
    options: [
      {
        name: 'baseURL',
        value: 'https://your-account.sirv.com',
        description: 'Your Sirv account delivery hostname or configured custom domain.'
      }
    ],
    src: '/photo.jpg',
    source: 'Use a path in your Sirv account.',
    modifiers:
      'Supports width, height, quality, format, fit, profile, canvas, sharpen, frame, rotate, grayscale, watermark and text overlays. Unmapped parameter names are passed through.',
    notes: [
      'Fit fill maps to ignore, inside and outside map to fill, and noUpscaling maps to noup.',
      'Use profile for a saved group of transformations. Sirv chooses its delivery format when you omit format.'
    ],
    reference: 'https://sirv.com/help/articles/dynamic-imaging/',
    factory: 'sirvProvider',
    example: {
      width: 800,
      height: 500,
      quality: 80,
      format: 'webp'
    },
    extra: []
  }
};
