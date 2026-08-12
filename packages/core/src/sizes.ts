import type { DensityInput, GeneratedDensity, GeneratedSizes, ParsedSizes, SizesInput } from './types';
import { DEFAULT_PROVIDER_SIZES, DEFAULT_SCREENS } from './config';
import { toNumber, uniqueSorted } from './utils';

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

export function parseSizes(
  input: SizesInput | undefined,
  screens: Record<string, number> = DEFAULT_SCREENS
): ParsedSizes | undefined {
  if (input === undefined || input === null) {
    return undefined;
  }

  const rawEntries =
    typeof input === 'string'
      ? input
          .trim()
          .split(/[\s,]+/)
          .filter(Boolean)
          .map((token) => {
            const match = /^([a-zA-Z0-9_-]+):(.+)$/.exec(token);
            return match ? ([match[1] ?? '', match[2] ?? ''] as const) : ([undefined, token] as const);
          })
      : Object.entries(input);

  if (rawEntries.length === 0) {
    return undefined;
  }

  const entries = rawEntries
    .map((token) => {
      const [screen, size] = token;
      if (!screen) {
        return { size: String(size) };
      }

      const screenWidth = screen ? (screens[screen] ?? Number.parseInt(screen, 10)) : undefined;
      return {
        screen,
        minWidth: Number.isFinite(screenWidth) ? screenWidth : undefined,
        size: String(size)
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
  sizes?: SizesInput;
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
  const screens = options.screens ?? DEFAULT_SCREENS;
  const variants = getSizeVariants(parsed.entries, screens);
  const candidates = getCandidateWidths(variants, densities, providerSizes, screens);

  return {
    sizes: toResponsiveSizesAttribute(variants),
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
  screen?: string;
  size: string;
  screenMaxWidth: number;
  width: number;
  fluid: boolean;
}

function toSizesAttribute(entries: ParsedSizes['entries'], screens: Record<string, number>): string {
  return toResponsiveSizesAttribute(getSizeVariants(entries, screens));
}

function getSizeVariants(entries: ParsedSizes['entries'], screens: Record<string, number>): SizeVariant[] {
  return entries
    .map((entry) => {
      const screenMaxWidth = entry.screen ? (screens[entry.screen] ?? Number.parseInt(entry.screen, 10)) : 1;
      const normalizedSize = normalizeSize(entry.size);
      const width = normalizedSize ? widthFromSize(normalizedSize, screenMaxWidth) : undefined;

      if (!screenMaxWidth || !normalizedSize || !width) {
        return undefined;
      }

      const variant: SizeVariant = {
        size: normalizedSize,
        screenMaxWidth,
        width,
        fluid: normalizedSize.endsWith('vw')
      };

      if (entry.screen) {
        variant.screen = entry.screen;
      }

      return variant;
    })
    .filter((entry): entry is SizeVariant => entry !== undefined)
    .sort((a, b) => a.screenMaxWidth - b.screenMaxWidth);
}

function getCandidateWidths(
  variants: SizeVariant[],
  densities: readonly number[],
  providerSizes: readonly number[],
  screens: Record<string, number>
): number[] {
  const maxScreen = maxFinite(Object.values(screens)) ?? maxFinite(providerSizes) ?? 1536;

  return variants.flatMap((variant, index) => {
    const next = variants[index + 1];
    const viewportWidth = next ? next.screenMaxWidth - 1 : variant.screen ? variant.screenMaxWidth : maxScreen;
    const baseWidth = variant.fluid ? (widthFromSize(variant.size, viewportWidth) ?? variant.width) : variant.width;
    const densityWidths = densities.map((density) => Math.round(baseWidth * density));
    const maxDensityWidth = maxFinite(densityWidths) ?? baseWidth;
    const providerWidths = variant.fluid ? providerSizes.filter((width) => width <= maxDensityWidth) : [];

    return [...providerWidths, ...densityWidths];
  });
}

function toResponsiveSizesAttribute(variants: SizeVariant[]): string {
  if (variants.length === 0) {
    return '100vw';
  }

  return variants
    .map((variant, index) => {
      const next = variants[index + 1];
      return next ? `(max-width: ${next.screenMaxWidth - 1}px) ${variant.size}` : variant.size;
    })
    .join(', ');
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

function maxFinite(values: readonly number[]): number | undefined {
  return values
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)
    .at(-1);
}
