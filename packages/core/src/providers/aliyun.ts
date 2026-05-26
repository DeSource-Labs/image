import type { ImageProvider, ImageProviderResult } from '../types.js';
import { appendQuery, stableModifiers } from '../utils.js';
import { isTransformable, providerBaseURL, sourceWithBase } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type AliyunProviderOptions = GenericProviderOptions;

export function aliyunProvider(options: AliyunProviderOptions = {}): ImageProvider<AliyunProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? '/' };
  return {
    name: 'aliyun',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const operations: string[] = [];
      if (input.width && input.height) {
        operations.push(`resize,fw_${input.width},fh_${input.height}`);
      } else if (input.width) {
        operations.push(`resize,w_${input.width}`);
      } else if (input.height) {
        operations.push(`resize,h_${input.height}`);
      }
      if (input.quality) {
        operations.push(`quality,Q_${input.quality}`);
      }
      for (const [key, value] of stableModifiers(input.modifiers)) {
        if (!['width', 'height', 'quality', 'format'].includes(key)) {
          operations.push(`${key},${value}`);
        }
      }
      const baseURL = providerBaseURL(providerOptions, defaults);
      const url = sourceWithBase(input.src, baseURL);
      return {
        url: operations.length ? appendQuery(url, { image_process: operations.join('/') }) : url,
        isOptimized: isTransformable(input)
      };
    }
  };
}
