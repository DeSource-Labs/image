import type { ImageProvider, ImageProviderResult } from '../types.js';
import { joinURL, normalizeFormat } from '../utils.js';
import { providerBaseURL, sourceWithBase } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type WagtailProviderOptions = GenericProviderOptions;

export function wagtailProvider(options: WagtailProviderOptions = {}): ImageProvider<WagtailProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? '' };
  return {
    name: 'wagtail',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const width = input.width ?? 0;
      const height = input.height ?? 0;
      const format = normalizeFormat(input.format) ?? 'webp';
      const quality = input.quality ?? 70;
      const suffix = `|format-${format}|${format}quality-${quality}`;
      const operation = width && height
        ? `fill-${width}x${height}-c0${suffix}`
        : width
          ? `width-${width}${suffix}`
          : height
            ? `height-${height}${suffix}`
            : `original${suffix}`;
      return {
        url: sourceWithBase(joinURL(input.src, operation), providerBaseURL(providerOptions, defaults)),
        isOptimized: true
      };
    }
  };
}
