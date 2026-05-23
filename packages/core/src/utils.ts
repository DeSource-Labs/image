import type { ImageFormat, ImageModifiers, ModifierValue } from './types.js';

export function toNumber(value: number | string | null | undefined): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function clampQuality(value: number | string | null | undefined): number | undefined {
  const quality = toNumber(value);
  if (quality === undefined) {
    return undefined;
  }

  return Math.min(100, Math.max(1, Math.round(quality)));
}

export function uniqueSorted(values: readonly number[]): number[] {
  return [...new Set(values.filter((value) => Number.isFinite(value) && value > 0).map((value) => Math.round(value)))].sort((a, b) => a - b);
}

export function joinURL(base: string, path: string): string {
  if (!base) {
    return path;
  }

  if (!path) {
    return base;
  }

  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

export function appendQuery(url: string, params: Record<string, ModifierValue>): string {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== false && value !== '');
  if (entries.length === 0) {
    return url;
  }

  const query = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${query}`;
}

export function stableModifiers(modifiers: ImageModifiers | undefined): [string, Exclude<ModifierValue, undefined | null>][] {
  if (!modifiers) {
    return [];
  }

  return Object.entries(modifiers)
    .filter(([, value]) => value !== undefined && value !== null && value !== false && value !== '')
    .sort(([a], [b]) => a.localeCompare(b)) as [string, Exclude<ModifierValue, undefined | null>][];
}

export function isRemoteSource(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

export function isDataSource(src: string): boolean {
  return /^(data|blob):/i.test(src);
}

export function isLocalSource(src: string): boolean {
  return src.startsWith('/') && !src.startsWith('//');
}

export function stripLeadingSlash(src: string): string {
  return src.replace(/^\/+/, '');
}

export function normalizeFormat(format: ImageFormat | undefined): string | undefined {
  if (!format) {
    return undefined;
  }

  return format === 'jpg' ? 'jpeg' : String(format);
}

export function mimeForFormat(format: ImageFormat): string {
  const normalized = normalizeFormat(format);
  return normalized ? `image/${normalized}` : 'image/*';
}

export function encodeRemoteOrPath(src: string): string {
  return isRemoteSource(src) ? encodeURIComponent(src) : src;
}

export function mergeModifiers(...modifiers: Array<ImageModifiers | undefined>): ImageModifiers {
  return Object.assign({}, ...modifiers.filter(Boolean));
}
