import type { ImageProvider, ImageProviderResult } from '../types.js';
import { appendQuery, joinURL, normalizeFormat, stableModifiers } from '../utils.js';

export interface ImageKitProviderOptions {
  endpoint?: string;
  transformationPosition?: 'query' | 'path';
}

export function imagekitProvider(options: ImageKitProviderOptions = {}): ImageProvider<ImageKitProviderOptions> {
  return {
    name: 'imagekit',
    getImage(input, providerOptions = options): ImageProviderResult {
      const endpoint = providerOptions.endpoint ?? '';
      const source = endpoint && !input.src.startsWith('http') ? joinURL(endpoint, input.src) : input.src;
      const transformations = [
        input.width ? `w-${input.width}` : undefined,
        input.height ? `h-${input.height}` : undefined,
        input.quality ? `q-${input.quality}` : undefined,
        input.format ? `f-${normalizeFormat(input.format)}` : undefined,
        input.modifiers?.fit ? `c-${input.modifiers.fit}` : undefined,
        input.modifiers?.position ? `fo-${input.modifiers.position}` : undefined,
        input.modifiers?.background ? `bg-${input.modifiers.background}` : undefined,
        ...stableModifiers(input.modifiers)
          .filter(([key]) => !['fit', 'position', 'background'].includes(key))
          .map(([key, value]) => `${key}-${value}`)
      ].filter(Boolean).join(',');

      if (!transformations) {
        return { url: source, isOptimized: false };
      }

      if ((providerOptions.transformationPosition ?? 'query') === 'path') {
        return { url: joinURL(source, `tr:${transformations}`), isOptimized: true };
      }

      return { url: appendQuery(source, { tr: transformations }), isOptimized: true };
    }
  };
}
