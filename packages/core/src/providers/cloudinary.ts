import type { ImageProvider, ImageProviderResult } from '../types';
import { normalizeFormat, stableModifiers, stripLeadingSlash } from '../utils';

export interface CloudinaryProviderOptions {
  cloudName?: string;
  baseURL?: string;
  deliveryType?: 'upload' | 'fetch';
}

export function cloudinaryProvider(options: CloudinaryProviderOptions = {}): ImageProvider<CloudinaryProviderOptions> {
  return {
    name: 'cloudinary',
    getImage(input, providerOptions = options): ImageProviderResult {
      const baseURL =
        providerOptions.baseURL ??
        (providerOptions.cloudName ? `https://res.cloudinary.com/${providerOptions.cloudName}` : '');
      if (!baseURL) {
        return { url: input.src, isOptimized: false };
      }

      const deliveryType = providerOptions.deliveryType ?? (input.src.startsWith('http') ? 'fetch' : 'upload');
      const transforms = [
        input.format ? `f_${normalizeFormat(input.format)}` : undefined,
        input.quality ? `q_${input.quality}` : undefined,
        input.width ? `w_${input.width}` : undefined,
        input.height ? `h_${input.height}` : undefined,
        input.modifiers?.fit ? `c_${input.modifiers.fit}` : undefined,
        input.modifiers?.position ? `g_${input.modifiers.position}` : undefined,
        input.modifiers?.background ? `b_${input.modifiers.background}` : undefined,
        ...stableModifiers(input.modifiers)
          .filter(([key]) => !['fit', 'position', 'background'].includes(key))
          .map(([key, value]) => `${key}_${value}`)
      ]
        .filter(Boolean)
        .join(',');
      const source = deliveryType === 'fetch' ? encodeURIComponent(input.src) : stripLeadingSlash(input.src);
      return {
        url: `${baseURL.replace(/\/+$/, '')}/image/${deliveryType}/${transforms}/${source}`,
        isOptimized: true
      };
    }
  };
}
