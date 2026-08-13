import { describe, expect, it } from 'vitest';
import type { ImageProviderContext, ImageProviderResult } from '@src/index';
import {
  BUILT_IN_PROVIDER_NAMES,
  createBuiltInProviders,
  createDefaultProviders,
  type BuiltInProviderName
} from '@src/providers';
import { clone, localProviderContext, providerOptionsFor, providerSourceFor } from '../setup/shared';

interface ProviderModule {
  default?: unknown;
}

interface ProviderLike {
  name?: string;
  getImage(source: string, options: Record<string, unknown>, context: ImageProviderContext): ImageProviderResult;
}

const providerModules = import.meta.glob<ProviderModule>('../../../src/providers/*.ts', { eager: true });
const nonProviderModuleNames = new Set(['default', 'index', 'registry']);
const providerSourceNames = Object.keys(providerModules)
  .map((path) => path.match(/([^/]+)\.ts$/)?.[1] ?? '')
  .filter((name) => name && !nonProviderModuleNames.has(name))
  .sort();

function asProvider(provider: unknown): ProviderLike {
  return provider as ProviderLike;
}

describe('built-in provider registry', () => {
  it('registers every provider source file exactly once', () => {
    expect([...new Set(BUILT_IN_PROVIDER_NAMES)]).toHaveLength(BUILT_IN_PROVIDER_NAMES.length);
    expect([...BUILT_IN_PROVIDER_NAMES].sort()).toEqual(providerSourceNames);
  });

  it('creates every registered built-in provider', () => {
    const providers = createBuiltInProviders();

    expect(Object.keys(providers).sort()).toEqual([...BUILT_IN_PROVIDER_NAMES].sort());

    for (const name of BUILT_IN_PROVIDER_NAMES) {
      expect(providers[name]?.getImage, name).toBeTypeOf('function');
    }
  });

  it('keeps default providers to the platform/local subset', () => {
    expect(Object.keys(createDefaultProviders()).sort()).toEqual(
      ['awsAmplify', 'ipx', 'ipxStatic', 'netlify', 'netlifyImageCdn', 'netlifyLargeMedia', 'none', 'vercel'].sort()
    );
  });

  for (const name of BUILT_IN_PROVIDER_NAMES) {
    it(`${name} satisfies the shared provider result contract`, () => {
      const provider = asProvider(createBuiltInProviders()[name]);
      const result = provider.getImage(providerSourceFor(name), clone(providerOptionsFor(name)), localProviderContext);

      expect(result.url).toBeTypeOf('string');
      expect(result.url.length).toBeGreaterThan(0);

      if (result.format !== undefined) {
        expect(result.format).toBeTypeOf('string');
      }

      if (result.isOptimized !== undefined) {
        expect(result.isOptimized).toBeTypeOf('boolean');
      }

      if (result.getMeta !== undefined) {
        expect(result.getMeta).toBeTypeOf('function');
      }
    });
  }

  it('preserves configured provider names except documented aliases', () => {
    const providers = createBuiltInProviders();
    const aliases: Partial<Record<BuiltInProviderName, string>> = {
      netlify: 'netlifyImageCdn'
    };

    for (const name of BUILT_IN_PROVIDER_NAMES) {
      expect(providers[name].name, name).toBe(aliases[name] ?? name);
    }
  });
});
