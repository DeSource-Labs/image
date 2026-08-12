import type { ImageProvider, ImageProviderResult } from '../types';
import { encodeRemoteOrPath, normalizeFormat, stableModifiers } from '../utils';
import { appendProviderModifiers, isTransformable } from '../provider-utils';

export interface CloudflareProviderOptions {
  baseURL?: string;
  path?: string;
}

export function cloudflareProvider(options: CloudflareProviderOptions = {}): ImageProvider<CloudflareProviderOptions> {
  return {
    name: 'cloudflare',
    getImage(input, providerOptions = options): ImageProviderResult {
      if (!isTransformable(input)) {
        return { url: input.src, isOptimized: false };
      }

      const path = providerOptions.path ?? '/cdn-cgi/image';
      const base = providerOptions.baseURL ? providerOptions.baseURL.replace(/\/+$/, '') : '';
      const optionsSegment = stableModifiers(
        appendProviderModifiers(
          {
            width: input.width,
            height: input.height,
            quality: input.quality,
            format: normalizeFormat(input.format),
            fit: input.modifiers?.fit,
            gravity: input.modifiers?.position,
            background: input.modifiers?.background
          },
          input.modifiers,
          ['fit', 'position', 'background']
        )
      )
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join(',');

      return {
        url: `${base}${path}/${optionsSegment}/${encodeRemoteOrPath(input.src)}`,
        isOptimized: true
      };
    }
  };
}
