import type { DensityInput, GeneratedDensity, GeneratedSizes, ParsedSizes } from './types.js';
import { DEFAULT_PROVIDER_SIZES, DEFAULT_SCREENS } from './config.js';
import { toNumber, uniqueSorted } from './utils.js';

export function parseDensities(input: DensityInput | undefined, fallback: readonly number[] = [1, 2]): number[] {
  if (Array.isArray(input)) {
    return uniqueSorted(input);
  }

  if (typeof input === 'number') {
    return uniqueSorted([input]);
  }

  if (typeof input === 'string') {
    const densities = input
      .split(/[\s,]+/)
      .map((value) => value.trim().replace(/^x/i, '').replace(/x$/i, ''))
      .filter(Boolean)
      .map(Number);
    const parsed = uniqueSorted(densities);
    return parsed.length > 0 ? parsed : uniqueSorted(fallback);
  }

  return uniqueSorted(fallback);
}

export function parseSizes(input: string | undefined, screens: Record<string, number> = DEFAULT_SCREENS): ParsedSizes | undefined {
  if (!input?.trim()) {
    return undefined;
  }

  const entries = input
    .trim()
    .split(/\s+/)
    .map((token) => {
      const match = /^([a-zA-Z0-9_-]+):(.+)$/.exec(token);
      if (!match) {
        return { size: token };
      }

      const screen = match[1];
      const screenWidth = screen ? screens[screen] ?? Number.parseInt(screen, 10) : undefined;
      return {
        screen,
        minWidth: Number.isFinite(screenWidth) ? screenWidth : undefined,
        size: match[2] ?? ''
      };
    })
    .filter((entry) => entry.size && (!entry.screen || entry.minWidth !== undefined));

  if (entries.length === 0) {
    return undefined;
  }

  return {
    input,
    entries,
    sizes: toSizesAttribute(entries, screens)
  };
}

export function generateSizes(options: {
  width?: number;
  sizes?: string;
  screens?: Record<string, number>;
  providerSizes?: readonly number[];
  densities?: readonly number[];
}): GeneratedSizes {
  const providerSizes = options.providerSizes ?? DEFAULT_PROVIDER_SIZES;
  const parsed = parseSizes(options.sizes, options.screens);

  if (!parsed) {
    if (!options.width) {
      return { widths: [] };
    }

    const densities = options.densities ?? [1, 2];
    return {
      widths: uniqueSorted(densities.map((density) => Math.round(options.width! * density)))
    };
  }

  const densities = options.densities ?? [1, 2];
  const variants = getSizeVariants(parsed.entries, options.screens ?? DEFAULT_SCREENS);
  const candidates = variants.flatMap((variant) => densities.map((density) => Math.round(variant.width * density)));

  return {
    sizes: toNuxtSizesAttribute(variants),
    widths: uniqueSorted(candidates.length > 0 ? candidates : providerSizes)
  };
}

export function generateDensities(options: {
  width?: number;
  height?: number;
  densities?: DensityInput;
  fallback?: readonly number[];
}): GeneratedDensity[] {
  const densities = parseDensities(options.densities, options.fallback);
  return densities.map((density) => ({
    density,
    width: options.width ? Math.round(options.width * density) : undefined,
    height: options.height ? Math.round(options.height * density) : undefined
  }));
}

interface SizeVariant {
  size: string;
  screenMaxWidth: number;
  width: number;
}

function toSizesAttribute(entries: ParsedSizes['entries'], screens: Record<string, number>): string {
  return toNuxtSizesAttribute(getSizeVariants(entries, screens));
}

function getSizeVariants(entries: ParsedSizes['entries'], screens: Record<string, number>): SizeVariant[] {
  return entries
    .map((entry) => {
      const screenMaxWidth = entry.screen ? screens[entry.screen] ?? Number.parseInt(entry.screen, 10) : 1;
      const normalizedSize = normalizeSize(entry.size);
      const width = normalizedSize ? widthFromSize(normalizedSize, screenMaxWidth) : undefined;

      if (!screenMaxWidth || !normalizedSize || !width) {
        return undefined;
      }

      return {
        size: normalizedSize,
        screenMaxWidth,
        width
      };
    })
    .filter((entry): entry is SizeVariant => entry !== undefined)
    .sort((a, b) => a.screenMaxWidth - b.screenMaxWidth);
}

function toNuxtSizesAttribute(variants: SizeVariant[]): string {
  if (variants.length === 0) {
    return '100vw';
  }

  return variants.map((variant, index) => {
    const next = variants[index + 1];
    return next ? `(max-width: ${next.screenMaxWidth - 1}px) ${variant.size}` : variant.size;
  }).join(', ');
}

function normalizeSize(value: string): string | undefined {
  if (/^\d+$/.test(value)) {
    return `${value}px`;
  }

  if (value.endsWith('px') || value.endsWith('vw')) {
    return value;
  }

  return undefined;
}

function widthFromSize(size: string, screenMaxWidth: number): number | undefined {
  if (size.endsWith('vw')) {
    const percent = toNumber(size.slice(0, -2));
    return percent ? Math.round((percent / 100) * screenMaxWidth) : undefined;
  }

  const pixels = /^(\d+(?:\.\d+)?)px$/.exec(size)?.[1];
  return pixels ? toNumber(pixels) : undefined;
}
