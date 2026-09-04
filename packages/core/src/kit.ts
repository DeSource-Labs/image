import type { ImageConfig, ResolvedImageConfig } from './types.js';

export {
  escapeCssSelectorValue,
  isPathUnderBasePath,
  normalizeBasePath,
  parseRequestPath,
  stringifyModifierValue,
  stripLeadingSlashes,
  stripTrailingSlashes,
  trimSlashes
} from './utils.js';

export {
  createDsImageServer,
  type DsImageNodeMiddleware,
  type DsImageNodeRequest,
  type DsImageServer,
  type DsImageServerOptions,
  type DsImageServerRuntime,
  type DsImageWebHandler
} from './server.js';

export type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | readonly ClassValue[]
  | Readonly<Record<string, boolean | null | undefined>>;

export function isResolvedImageConfig(config: ImageConfig | ResolvedImageConfig): config is ResolvedImageConfig {
  return (
    typeof config.provider === 'string' &&
    Array.isArray(config.densities) &&
    Array.isArray(config.providerSizes) &&
    typeof config.screens === 'object' &&
    config.screens !== null &&
    typeof config.providers === 'object' &&
    config.providers !== null &&
    typeof config.providerOptions === 'object' &&
    config.providerOptions !== null
  );
}

export function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

export function normalizeCrossorigin(value: unknown): 'anonymous' | 'use-credentials' | undefined {
  if (value === true || value === '' || value === 'true') {
    return 'anonymous';
  }

  return value === 'anonymous' || value === 'use-credentials' ? value : undefined;
}

export function mergeClassNames(...values: ClassValue[]): string | undefined {
  const classes: string[] = [];

  const visit = (value: ClassValue): void => {
    if (!value) return;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
      classes.push(value.toString());
      return;
    }
    if (typeof value === 'boolean') return;
    if (Array.isArray(value)) {
      for (const entry of value) visit(entry);
      return;
    }
    for (const [name, enabled] of Object.entries(value)) {
      if (enabled) classes.push(name);
    }
  };

  for (const value of values) visit(value);
  return classes.join(' ') || undefined;
}

export function styleWithPlaceholder(
  style: string | null | undefined,
  placeholderSrc: string | undefined,
  loaded: boolean
): string | undefined {
  if (!placeholderSrc || loaded) return style ?? undefined;

  const escaped = placeholderSrc.replaceAll('"', '%22');
  return [style, `background-image:url("${escaped}")`, 'background-size:cover', 'background-position:center']
    .filter(Boolean)
    .join(';');
}
