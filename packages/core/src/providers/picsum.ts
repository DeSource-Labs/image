// https://picsum.photos/ - Lorem Picsum placeholder images

import { joinURL, withQuery } from 'ufo';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

interface PicsumModifiers {
  grayscale?: boolean;
  blur?: number;
}

interface PicsumOptions {
  baseURL?: string;
  modifiers?: PicsumModifiers;
}

export const picsumCDN = 'https://picsum.photos/';

const ignoredModifiers = new Set(['fit', 'format', 'quality', 'background']);

/**
 * Build the path
 * Picsum URL format: https://picsum.photos/[id/{id}/]{width}[/{height}]
 *
 * Examples:
 *   - Random: https://picsum.photos/200/300
 *   - Specific ID: https://picsum.photos/id/237/200/300
 *   - Square: https://picsum.photos/200
 */
function getPathParts(src: string, width: number | string | undefined, height: number | string | undefined): string[] {
  const parts: string[] = [];
  // If src is provided and not empty, it could be:
  // - "id/237" for a specific image
  // - "seed/picsum" for a seeded image
  if (src && src !== '/') {
    const [type, id] = (src.startsWith('/') ? src.slice(1) : src).split('/');
    if (type && (type === 'id' || type === 'seed')) {
      parts.push(`${type}/${id}`);
    }
  }
  // Add dimensions - these come after the ID/seed path
  if (width) parts.push(String(width));
  if (height) parts.push(String(height));
  return parts;
}

/** Build query parameters for modifiers */
function getQuery(
  grayscale: boolean | undefined,
  blur: number | undefined,
  otherModifiers: Record<string, unknown>
): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (grayscale) {
    query.grayscale = '';
  }
  if (blur !== undefined && blur > 0) {
    // Picsum blur accepts values from 1-10
    query.blur = Math.min(Math.max(Math.round(blur), 1), 10);
  }
  // Add any other custom modifiers (excluding standard ones that don't apply to picsum)
  for (const [key, value] of Object.entries(otherModifiers)) {
    if (value !== undefined && value !== null && !ignoredModifiers.has(key)) {
      query[key] = value as string | number;
    }
  }
  return query;
}

const providerSetup = defineProvider<PicsumOptions>({
  getImage: (src, { modifiers, baseURL = picsumCDN }) => {
    const { width, height, grayscale, blur, ...otherModifiers } = modifiers || {};
    const parts = getPathParts(src, width, height);
    const query = getQuery(grayscale, blur, otherModifiers);
    const url = joinURL(baseURL, ...parts);

    return {
      url: Object.keys(query).length > 0 ? withQuery(url, query) : url
    };
  }
});

export type PicsumProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function picsumProvider(options: PicsumProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'picsum');
}

export default providerSetup;
