import type { LocalPattern, RemotePattern, ResolvedImageConfig, SourceValidationResult } from './types';
import { isDataSource, isLocalSource, isRemoteSource } from './utils';

export function resolveAlias(src: string, aliases: Record<string, string> = {}): string {
  for (const [alias, replacement] of Object.entries(aliases)) {
    const cleanAlias = alias.replace(/^\/+|\/+$/g, '');
    if (src === `/${cleanAlias}`) {
      return replacement;
    }

    if (src.startsWith(`/${cleanAlias}/`)) {
      const suffix = src.slice(cleanAlias.length + 2);
      return `${replacement.replace(/\/+$/, '')}/${suffix}`;
    }
  }

  return src;
}

export function validateSource(src: string, config: ResolvedImageConfig): SourceValidationResult {
  if (!src) {
    return { valid: false, reason: 'Image source is empty.' };
  }

  if (isDataSource(src)) {
    return { valid: true };
  }

  if (isLocalSource(src)) {
    if (!config.localPatterns || config.localPatterns.length === 0) {
      return { valid: true };
    }

    return config.localPatterns.some((pattern) => matchLocalPattern(src, pattern))
      ? { valid: true }
      : { valid: false, reason: `Local image source "${src}" does not match configured localPatterns.` };
  }

  if (isRemoteSource(src)) {
    let url: URL;
    try {
      url = new URL(src);
    } catch {
      return { valid: false, reason: `Remote image source "${src}" is not a valid URL.` };
    }

    if (config.domains?.includes(url.hostname)) {
      return { valid: true };
    }

    if (config.remotePatterns?.some((pattern) => matchRemotePattern(url, pattern))) {
      return { valid: true };
    }

    if (!config.domains?.length && !config.remotePatterns?.length) {
      return { valid: true };
    }

    return { valid: false, reason: `Remote image host "${url.hostname}" is not allowed by domains or remotePatterns.` };
  }

  return { valid: false, reason: `Image source "${src}" must be an absolute local path, a data/blob URL, or an http(s) URL.` };
}

function matchLocalPattern(src: string, pattern: LocalPattern): boolean {
  return globToRegExp(pattern.pathname).test(src);
}

function matchRemotePattern(url: URL, pattern: RemotePattern): boolean {
  if (pattern.protocol && pattern.protocol.replace(/:$/, '') !== url.protocol.replace(/:$/, '')) {
    return false;
  }

  if (!globToRegExp(pattern.hostname).test(url.hostname)) {
    return false;
  }

  if (pattern.port !== undefined && pattern.port !== url.port) {
    return false;
  }

  if (pattern.pathname && !globToRegExp(pattern.pathname).test(url.pathname)) {
    return false;
  }

  if (pattern.search !== undefined && pattern.search !== url.search) {
    return false;
  }

  return true;
}

function globToRegExp(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '___DOUBLE_STAR___')
    .replace(/\*/g, '[^/]*')
    .replace(/___DOUBLE_STAR___/g, '.*');
  return new RegExp(`^${escaped}$`);
}
