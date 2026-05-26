import type { ImageModifiers, ImageProvider, ImageProviderInput, ImageProviderResult, ModifierValue } from './types.js';
import { appendQuery, joinURL, normalizeFormat, stableModifiers } from './utils.js';

export interface GenericProviderOptions {
  baseURL?: string;
  path?: string;
  token?: string;
  cdnURL?: string;
  sourceURL?: string;
  accountHash?: string;
  variant?: string;
  projectName?: string;
  processType?: 'upload' | 'path';
  defaultParams?: Record<string, ModifierValue>;
}

export type ModifierKeyMap = Record<string, string>;
export type ModifierValueMap = Record<string, Record<string, ModifierValue> | ((value: Exclude<ModifierValue, undefined | null>) => ModifierValue)>;

export function isTransformable(input: ImageProviderInput): boolean {
  return Boolean(input.width || input.height || input.quality || input.format || (input.modifiers && Object.keys(input.modifiers).length > 0));
}

export function withStandardParams(input: ImageProviderInput, aliases: Record<string, ModifierValue>): Record<string, ModifierValue> {
  return {
    ...aliases,
    w: input.width,
    h: input.height,
    q: input.quality,
    f: normalizeFormat(input.format)
  };
}

export function appendProviderModifiers(params: Record<string, ModifierValue>, modifiers: ImageModifiers | undefined, reserved: readonly string[] = []): Record<string, ModifierValue> {
  const result = { ...params };
  const reservedSet = new Set(reserved);
  for (const [key, value] of stableModifiers(modifiers)) {
    if (!reservedSet.has(key)) {
      result[key] = value;
    }
  }

  return result;
}

export function providerBaseURL<T extends GenericProviderOptions>(providerOptions: T | undefined, defaults: T): string {
  return providerOptions?.baseURL ?? defaults.baseURL ?? '';
}

export function sourceWithBase(src: string, baseURL = ''): string {
  return baseURL && !src.startsWith('http') ? joinURL(baseURL, src) : src;
}

export function joinURLParts(...parts: Array<string | number | undefined | null>): string {
  return parts
    .filter((part) => part !== undefined && part !== null && part !== '')
    .map(String)
    .reduce((url, part) => url ? joinURL(url, part) : part, '');
}

export function sourcePath(src: string): string {
  try {
    return new URL(src).pathname;
  } catch {
    return src;
  }
}

function standardModifierObject(input: ImageProviderInput): Record<string, ModifierValue> {
  return {
    ...input.modifiers,
    width: input.width,
    height: input.height,
    quality: input.quality,
    format: normalizeFormat(input.format) ?? input.modifiers?.format ?? input.modifiers?.f
  };
}

export function mappedModifiers(input: ImageProviderInput, keyMap: ModifierKeyMap = {}, valueMap: ModifierValueMap = {}, reserved: readonly string[] = []): Record<string, ModifierValue> {
  const result: Record<string, ModifierValue> = {};
  const reservedSet = new Set(reserved);

  for (const [key, rawValue] of stableModifiers(standardModifierObject(input))) {
    if (reservedSet.has(key)) {
      continue;
    }

    const mapper = valueMap[key];
    const value = typeof mapper === 'function'
      ? mapper(rawValue)
      : mapper && typeof rawValue === 'string'
        ? mapper[rawValue] ?? rawValue
        : rawValue;

    result[keyMap[key] ?? key] = value;
  }

  return result;
}

export function mappedQueryURL(input: ImageProviderInput, options: GenericProviderOptions, keyMap: ModifierKeyMap = {}, valueMap: ModifierValueMap = {}): string {
  const src = sourceWithBase(input.src, options.baseURL);
  const params = {
    ...options.defaultParams,
    ...mappedModifiers(input, keyMap, valueMap)
  };
  return appendQuery(src, params);
}

export function createMappedQueryProvider(name: string, defaults: GenericProviderOptions = {}, keyMap: ModifierKeyMap = {}, valueMap: ModifierValueMap = {}): ImageProvider<GenericProviderOptions> {
  return {
    name,
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const options = { ...defaults, ...providerOptions };
      return {
        url: mappedQueryURL(input, options, keyMap, valueMap),
        isOptimized: isTransformable(input)
      };
    }
  };
}

export function pathOperations(input: ImageProviderInput, keyMap: ModifierKeyMap = {}, valueMap: ModifierValueMap = {}, formatter: (key: string, value: Exclude<ModifierValue, undefined | null>) => string = (key, value) => `${key}_${value}`, joinWith = ','): string {
  return stableModifiers(mappedModifiers(input, keyMap, valueMap))
    .map(([key, value]) => formatter(key, value))
    .join(joinWith);
}

export function cleanColor(value: Exclude<ModifierValue, undefined | null>): ModifierValue {
  return typeof value === 'string' && value.startsWith('#') ? value.slice(1) : value;
}

export const formatJpgValue = {
  jpeg: 'jpg'
};

export const defaultFitValue = {
  cover: 'crop',
  contain: 'fill',
  fill: 'scale',
  inside: 'min',
  outside: 'max'
};
