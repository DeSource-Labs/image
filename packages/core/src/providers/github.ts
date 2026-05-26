import type { ImageProvider, ImageProviderResult } from '../types';
import { appendQuery } from '../utils';
import { providerBaseURL, sourceWithBase } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type GithubProviderOptions = GenericProviderOptions;

export function githubProvider(options: GithubProviderOptions = {}): ImageProvider<GithubProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? 'https://avatars.githubusercontent.com' };
  return {
    name: 'github',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const requested = Math.max(input.width ?? 0, input.height ?? 0);
      const size = Math.min(Math.max(1, requested || 460), 460);
      return {
        url: appendQuery(sourceWithBase(input.src, providerBaseURL(providerOptions, defaults)), { v: 4, s: size }),
        isOptimized: true
      };
    }
  };
}
