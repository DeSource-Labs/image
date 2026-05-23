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
      return {
        screen,
        minWidth: screen ? screens[screen] : undefined,
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
    sizes: toSizesAttribute(entries)
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

  const hasViewportSize = parsed.entries.some((entry) => /vw$/.test(entry.size));
  const fixedPixels = parsed.entries.map((entry) => pixelValue(entry.size)).filter((value): value is number => value !== undefined);
  const largestFixed = fixedPixels.length > 0 ? Math.max(...fixedPixels) : undefined;
  const cap = options.width ?? (hasViewportSize ? Math.max(...providerSizes) : largestFixed);

  const candidates = providerSizes.filter((size) => !cap || size <= cap);
  if (largestFixed) {
    candidates.push(largestFixed);
  }

  if (options.width) {
    candidates.push(options.width);
  }

  return {
    sizes: parsed.sizes,
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

function toSizesAttribute(entries: ParsedSizes['entries']): string {
  const defaults = entries.filter((entry) => !entry.screen);
  const conditional = entries
    .filter((entry) => entry.screen && entry.minWidth !== undefined)
    .sort((a, b) => (b.minWidth ?? 0) - (a.minWidth ?? 0));
  const fallback = defaults.at(-1)?.size ?? conditional.at(-1)?.size ?? '100vw';

  return [
    ...conditional.map((entry) => `(min-width: ${entry.minWidth}px) ${entry.size}`),
    fallback
  ].join(', ');
}

function pixelValue(value: string): number | undefined {
  const match = /^(\d+(?:\.\d+)?)px$/.exec(value);
  return match ? toNumber(match[1]) : undefined;
}
