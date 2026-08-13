import type { ImagePlaceholder, ImagePreload } from '@desource/image';
import { mergeClassNames, normalizeCrossorigin, stripUndefined, styleWithPlaceholder } from '@desource/image/kit';
import { parseSize } from '@desource/image';

export function coerceNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return typeof value === 'string' || typeof value === 'number' ? parseSize(value) : undefined;
}

export function coerceBoolean(value: unknown): boolean {
  return value === '' || value === true || value === 'true';
}

export function coercePlaceholder(value: unknown): ImagePlaceholder | undefined {
  if (value === null || value === undefined || value === false || value === 'false') {
    return undefined;
  }

  if (value === '' || value === true || value === 'true') {
    return true;
  }

  if (Array.isArray(value)) {
    return value as unknown as ImagePlaceholder;
  }

  return String(value);
}

export function coercePreload(value: unknown): ImagePreload | undefined {
  if (value === null || value === undefined || value === false || value === 'false') {
    return undefined;
  }

  if (value === '' || value === true || value === 'true') {
    return true;
  }

  if (typeof value === 'object') {
    return value as ImagePreload;
  }

  return undefined;
}

export function coerceCrossorigin(value: unknown): 'anonymous' | 'use-credentials' | undefined {
  return normalizeCrossorigin(value);
}

export { mergeClassNames, stripUndefined, styleWithPlaceholder };
