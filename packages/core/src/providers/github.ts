import { encodeQueryItem, joinURL } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  joinWith: '&',
  formatter: (key, value) => encodeQueryItem(key, value)
});

interface GitHubOptions {
  baseURL?: string;
}

const providerSetup = defineProvider<GitHubOptions>({
  getImage: (src, { modifiers, baseURL = 'https://avatars.githubusercontent.com/' }) => {
    let size = 460; // Default size
    // Calculate size based on width/height
    const requestedSize = Math.max(Number(modifiers?.height ?? 0), Number(modifiers?.width ?? 0));
    if (requestedSize > 0) {
      size = Math.min(Math.max(1, requestedSize), 460);
    }

    const operations = operationsGenerator({
      v: 4,
      s: size
    });

    return {
      url: joinURL(baseURL, src + '?' + operations)
    };
  }
});

export type GithubProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function githubProvider(options: GithubProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'github');
}

export default providerSetup;
