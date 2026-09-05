import { fileURLToPath } from 'node:url';
import { defineConfig, type ViteUserConfig } from 'vitest/config';

interface FrameworkVitestConfigOptions {
  configUrl: string;
  plugins?: ViteUserConfig['plugins'];
  conditions?: string[];
  aliases: Record<string, string>;
  environment: 'jsdom' | 'node';
  setupFiles?: string[];
  include: string[];
  coverage: {
    include: string[];
    exclude: string[];
    thresholds: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
  };
}

export function defineFrameworkVitestConfig(options: FrameworkVitestConfigOptions): ViteUserConfig {
  const aliases = {
    '@desource/image': '../../packages/core/src',
    '@common': '../../common',
    ...options.aliases
  };

  return defineConfig({
    ...(options.plugins ? { plugins: options.plugins } : {}),
    resolve: {
      ...(options.conditions ? { conditions: options.conditions } : {}),
      alias: Object.fromEntries(
        Object.entries(aliases).map(([name, path]) => [name, fileURLToPath(new URL(path, options.configUrl))])
      )
    },
    test: {
      environment: options.environment,
      ...(options.setupFiles ? { setupFiles: options.setupFiles } : {}),
      include: options.include,
      restoreMocks: true,
      coverage: {
        provider: 'v8',
        include: options.coverage.include,
        exclude: options.coverage.exclude,
        reporter: ['text', 'lcov'],
        thresholds: options.coverage.thresholds
      }
    }
  });
}
