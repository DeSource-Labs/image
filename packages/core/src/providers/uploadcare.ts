import type { ImageProvider, ImageProviderResult } from '../types.js';
import { normalizeFormat, stableModifiers } from '../utils.js';
import { isTransformable, joinURLParts } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type UploadcareProviderOptions = GenericProviderOptions;

export function uploadcareProvider(options: UploadcareProviderOptions = {}): ImageProvider<UploadcareProviderOptions> {
  const defaults = { cdnURL: options.cdnURL ?? 'https://ucarecdn.com' };
  return {
    name: 'uploadcare',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const parts: string[] = [];
      if (input.width || input.height) {
        const operation = input.modifiers?.fit === 'cover' ? 'scale_crop' : 'resize';
        parts.push(`-/${operation}/${input.width ?? ''}x${input.height ?? ''}/`);
      }
      if (input.format) {
        parts.push(`-/format/${normalizeFormat(input.format)}/`);
      }
      if (input.quality) {
        parts.push(`-/quality/${input.quality}/`);
      }
      for (const [key, value] of stableModifiers(input.modifiers)) {
        if (!['fit', 'width', 'height', 'format', 'quality'].includes(key)) {
          parts.push(`-/${key}/${value}/`);
        }
      }
      const base = input.src.startsWith('http') ? '' : providerOptions.cdnURL ?? defaults.cdnURL;
      return {
        url: joinURLParts(base, input.src, parts.join('')),
        isOptimized: isTransformable(input)
      };
    }
  };
}
