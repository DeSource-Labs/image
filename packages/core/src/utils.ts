import type { ImageFormat, ImageModifiers, ModifierValue, OperationGeneratorConfig } from './types';

export interface Mapper<Key, Value> {
  (key: Key): Value | Key;
  (): undefined;
}

export function createMapper<Key extends string, Value>(
  map: Partial<Record<Key, Value>> & { missingValue?: Value }
): Mapper<Key, Value> {
  return ((key?: Key) => (key !== undefined ? (map[key] ?? key) : map.missingValue)) as Mapper<Key, Value>;
}

export function createOperationsGenerator<
  ModifierKey extends string,
  InputValue extends string | boolean | number = string | boolean | number,
  FinalKey = ModifierKey,
  FinalValue = InputValue
>(config: OperationGeneratorConfig<ModifierKey, InputValue, FinalKey, FinalValue> = {}) {
  const keyMap = config.keyMap ? createMapper(config.keyMap) : undefined;
  type ValueMapper =
    Mapper<Extract<InputValue, string>, FinalValue> | ((value: InputValue) => InputValue | FinalValue | undefined);
  const valueMap: Partial<Record<ModifierKey, ValueMapper>> = {};

  for (const key of Object.keys(config.valueMap ?? {}) as ModifierKey[]) {
    const mapper = config.valueMap?.[key];
    if (!mapper) {
      continue;
    }

    valueMap[key] =
      typeof mapper === 'function'
        ? (mapper as ValueMapper)
        : createMapper(mapper as Partial<Record<Extract<InputValue, string>, FinalValue>>);
  }

  return (
    modifiers: Partial<Record<ModifierKey | Extract<FinalKey, string>, InputValue | FinalValue | undefined>>
  ): string => {
    const operations: Array<[FinalKey, FinalValue]> = [];

    for (const rawKey in modifiers) {
      const value = modifiers[rawKey as keyof typeof modifiers];
      if (value === undefined) {
        continue;
      }

      const mapper = valueMap[rawKey as ModifierKey];
      const mappedValue = typeof mapper === 'function' ? mapper(value as InputValue) : value;

      if (mappedValue === undefined) {
        continue;
      }

      operations.push([(keyMap ? keyMap(rawKey as ModifierKey) : rawKey) as FinalKey, mappedValue as FinalValue]);
    }

    const formatter = config.formatter;
    if (formatter) {
      return operations.map(([key, value]) => formatter(key, value)).join(config.joinWith ?? '&');
    }

    return new URLSearchParams(operations.map(([key, value]) => [String(key), String(value)])).toString();
  };
}

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

export function parseSize(input: string | number | null | undefined): number | undefined {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : undefined;
  }

  if (typeof input !== 'string') {
    return undefined;
  }

  const normalized = input.trim().replace(/px$/i, '');
  return /^\d+$/.test(normalized) ? Number.parseInt(normalized, 10) : undefined;
}

export function checkDensities(densities: readonly number[]): void {
  if (densities.length === 0) {
    throw new Error('`densities` must not be empty, configure to `1` to render regular size only (DPR 1.0)');
  }

  if (densities.some((density) => density > 2) && typeof console !== 'undefined') {
    console.warn('[desource/image] Density values above `2` are not recommended.');
  }
}

export function clampQuality(value: number | string | null | undefined): number | undefined {
  const quality = toNumber(value);
  if (quality === undefined) {
    return undefined;
  }

  return Math.min(100, Math.max(1, Math.round(quality)));
}

export function uniqueSorted(values: readonly number[]): number[] {
  return [
    ...new Set(values.filter((value) => Number.isFinite(value) && value > 0).map((value) => Math.round(value)))
  ].sort((a, b) => a - b);
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
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== false && value !== ''
  );
  if (entries.length === 0) {
    return url;
  }

  const query = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${query}`;
}

export function stableModifiers(
  modifiers: ImageModifiers | undefined
): [string, Exclude<ModifierValue, undefined | null>][] {
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
