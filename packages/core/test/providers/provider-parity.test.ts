import { describe, expect, it } from 'vitest';
import { clone, localProviderContext, providerOptionsFor, providerSourceFor, referenceProviderContext } from './shared';

interface ProviderModule {
  default?: () => {
    getImage(source: string, options: Record<string, unknown>, context: unknown): { url: string };
  };
}

const localModules = import.meta.glob<ProviderModule>('../../src/providers/*.ts', { eager: true });
const referenceModules = import.meta.glob<ProviderModule>(
  '../../../../node_modules/@nuxt/image/dist/runtime/providers/*.js',
  {
    eager: true
  }
);

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
      const local = localModules[`../../src/providers/${name}.ts`];
      expect(local?.default, `missing local provider ${name}`).toBeTypeOf('function');

      const source = providerSourceFor(name);
      const options = providerOptionsFor(name);
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
        const expected = reference.default!().getImage(source, clone(scenario.options), referenceProviderContext);
        const actual = local!.default!().getImage(source, clone(scenario.options), localProviderContext);
        expect(actual, scenario.label).toEqual(expected);
      }
    });
  }
});
