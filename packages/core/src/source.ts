import type { LocalPattern, RemotePattern, ResolvedImageConfig, SourceValidationResult } from './types.js';
import {
  isDataSource,
  isLocalSource,
  isRemoteSource,
  stripLeadingSlashes,
  stripTrailingSlashes,
  trimSlashes
} from './utils.js';

export function normalizeImageSource(src: string, acceptsOpaqueSource = false): string {
  if (!src || isDataSource(src) || isLocalSource(src) || isRemoteSource(src) || src.startsWith('//')) {
    return src;
  }

  if (acceptsOpaqueSource || /^[a-z][a-z0-9+.-]*:/i.test(src)) {
    return src;
  }

  return `/${stripLeadingSlashes(src)}`;
}

export function resolveAlias(src: string, aliases: Record<string, string> = {}): string {
  for (const [alias, replacement] of Object.entries(aliases)) {
    const cleanAlias = trimSlashes(alias);
    if (src === `/${cleanAlias}`) {
      return replacement;
    }

    if (src.startsWith(`/${cleanAlias}/`)) {
      const suffix = src.slice(cleanAlias.length + 2);
      return `${stripTrailingSlashes(replacement)}/${suffix}`;
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
    return validateLocalSource(src, config);
  }

  if (isRemoteSource(src)) {
    return validateRemoteSource(src, config);
  }

  return {
    valid: false,
    reason: `Image source "${src}" must be an absolute local path, a data/blob URL, or an http(s) URL.`
  };
}

function validateLocalSource(src: string, config: ResolvedImageConfig): SourceValidationResult {
  if (!config.localPatterns?.length) {
    return { valid: true };
  }

  return config.localPatterns.some((pattern) => matchLocalPattern(src, pattern))
    ? { valid: true }
    : { valid: false, reason: `Local image source "${src}" does not match configured localPatterns.` };
}

function validateRemoteSource(src: string, config: ResolvedImageConfig): SourceValidationResult {
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

function matchLocalPattern(src: string, pattern: LocalPattern): boolean {
  return globToRegExp(pattern.pathname).test(src);
}

function matchRemotePattern(url: URL, pattern: RemotePattern): boolean {
  if (pattern.protocol && stripTrailingColon(pattern.protocol) !== stripTrailingColon(url.protocol)) {
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
  let pattern = '';
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index]!;
    if (char === '*') {
      if (glob[index + 1] === '*') {
        pattern += '.*';
        index += 1;
      } else {
        pattern += '[^/]*';
      }
      continue;
    }

    pattern += escapeRegExpChar(char);
  }
  return new RegExp(`^${pattern}$`);
}

function escapeRegExpChar(char: string): string {
  return '.+^${}()|[]\\'.includes(char) ? `\\${char}` : char;
}

function stripTrailingColon(value: string): string {
  return value.endsWith(':') ? value.slice(0, -1) : value;
}
