import { describe, expect, it } from 'vitest';

interface ProviderModule {
  default?: () => {
    getImage(source: string, options: Record<string, unknown>, context: Record<string, unknown>): { url: string };
  };
}

const localModules = import.meta.glob<ProviderModule>('../src/providers/*.ts', { eager: true });
const referenceModules = import.meta.glob<ProviderModule>(
  '../../../node_modules/@nuxt/image/dist/runtime/providers/*.js',
  {
    eager: true
  }
);

const contexts = {
  local: {
    options: {
      baseURL: '/',
      screens: { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }
    },
    $img: () => ''
  },
  reference: {
    options: {
      nuxt: { baseURL: '/' },
      screens: { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }
    },
    $img: () => ''
  }
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

function optionsFor(name: string): Record<string, unknown> {
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

function clone<T>(value: T): T {
  return structuredClone(value);
}

const parityCases = Object.entries(referenceModules)
  .map(([path, module]) => ({ name: path.match(/([^/]+)\.js$/)?.[1] ?? '', reference: module }))
  .filter(({ name, reference }) => name && reference.default && name !== 'netlify')
  .sort((a, b) => a.name.localeCompare(b.name));

describe('pinned Nuxt Image provider parity', () => {
  it('covers every reference provider module', () => {
    expect(parityCases.map(({ name }) => name)).toHaveLength(45);
  });

  for (const { name, reference } of parityCases) {
    it(name, () => {
      const local = localModules[`../src/providers/${name}.ts`];
      expect(local?.default, `missing local provider ${name}`).toBeTypeOf('function');

      const source = sourceOverrides[name] ?? '/photo.jpg';
      const options = optionsFor(name);
      const scenarios = [
        { label: 'standard modifiers', options },
        { label: 'no modifiers', options: { ...options, modifiers: {} } },
        {
          label: 'alternate modifiers',
          options: {
            ...options,
            processType: 'path',
            modifiers: {
              width: 641,
              height: 359,
              quality: 0,
              format: 'jpg',
              fit: 'contain',
              position: 'top left',
              background: 'transparent',
              blur: 0,
              dpr: 2,
              withoutEnlargement: true
            }
          }
        }
      ];

      for (const scenario of scenarios) {
        const expected = reference.default!().getImage(source, clone(scenario.options), contexts.reference);
        const actual = local!.default!().getImage(source, clone(scenario.options), contexts.local);
        expect(actual, scenario.label).toEqual(expected);
      }
    });
  }
});
