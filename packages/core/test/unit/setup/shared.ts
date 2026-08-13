import { createImage, resolveImageConfig, type ImageProviderContext } from '@src/index';

export const localProviderContext: ImageProviderContext = {
  options: resolveImageConfig({ baseURL: '/' }),
  $img: createImage(resolveImageConfig({ baseURL: '/' }))
};

export const referenceProviderContext = {
  options: {
    nuxt: { baseURL: '/' },
    screens: { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }
  },
  $img: () => ''
};

const sourceOverrides: Record<string, string> = {
  cloudflareimages: 'image-id',
  github: 'u/1',
  hygraph: '/base/image-id',
  picsum: 'id/42',
  sanity: 'image-abc-800x600-jpg',
  strapi: '/uploads/photo.jpg',
  strapi5: '/uploads/photo.jpg',
  uploadcare: '9dd2f080-cc52-442d-aa06-1d9eec7f40d1'
};

export function providerSourceFor(name: string): string {
  return sourceOverrides[name] ?? '/photo.jpg';
}

export function providerOptionsFor(name: string): Record<string, unknown> {
  return {
    modifiers: {
      width: 320,
      height: 180,
      quality: 75,
      format: 'webp',
      fit: 'cover',
      position: 'center',
      background: '#fff',
      blur: 3
    },
    baseURL:
      name === 'hygraph'
        ? 'https://eu-central-1.graphassets.com/base'
        : name === 'cloudinary'
          ? 'https://res.cloudinary.com/demo/image/upload'
          : 'https://images.example.com/base',
    accountHash: 'account',
    apiVersion: 'v7',
    cdnURL: 'https://cdn.example.com',
    dataset: 'production',
    endpoint: 'https://ik.imagekit.io/demo',
    processType: 'upload',
    projectId: 'project',
    projectName: 'project',
    sourceURL: 'https://source.example.com',
    token: 'demo',
    weservURL: 'https://wsrv.nl'
  };
}

export function clone<T>(value: T): T {
  return globalThis.structuredClone(value);
}
