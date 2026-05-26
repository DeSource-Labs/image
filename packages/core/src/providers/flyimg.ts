import type { ImageProvider, ImageProviderResult } from '../types';
import { joinURL } from '../utils';
import { isTransformable, pathOperations } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type FlyimgProviderOptions = GenericProviderOptions;

export function flyimgProvider(options: FlyimgProviderOptions = {}): ImageProvider<FlyimgProviderOptions> {
  const defaults = {
    baseURL: options.baseURL,
    sourceURL: options.sourceURL,
    processType: options.processType ?? 'upload'
  };
  return {
    name: 'flyimg',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const options = { ...defaults, ...providerOptions };
      const src = input.src.startsWith('http') || !options.sourceURL ? input.src : joinURL(options.sourceURL, input.src);
      const operations = pathOperations(input, {
        width: 'w',
        height: 'h',
        quality: 'q',
        format: 'o',
        rotate: 'r',
        background: 'bg'
      }, {}, (key, value) => `${key}_${value}`) || '-';

      return {
        url: joinURL(options.baseURL ?? '/', `${options.processType ?? 'upload'}/${operations}/${src}`),
        isOptimized: isTransformable(input)
      };
    }
  };
}
