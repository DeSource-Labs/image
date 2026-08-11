import type { ImagePlaceholder, ImagePreload } from '@desource/image';

export function coerceNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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
  if (value === null || value === undefined || value === false || value === 'false') {
    return undefined;
  }

  if (value === '' || value === true || value === 'true') {
    return 'anonymous';
  }

  return value === 'anonymous' || value === 'use-credentials' ? value : undefined;
}

export function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

export function mergeClassNames(values: Array<string | undefined | false>): string | undefined {
  const className = values.filter(Boolean).join(' ');
  return className || undefined;
}

export function styleWithPlaceholder(style: string | undefined, placeholderSrc: string | undefined, loaded: boolean): string | undefined {
  if (!placeholderSrc || loaded) {
    return style;
  }

  const escaped = placeholderSrc.replace(/"/g, '%22');
  return [
    style,
    `background-image:url("${escaped}")`,
    'background-size:cover',
    'background-position:center'
  ].filter(Boolean).join(';');
}
