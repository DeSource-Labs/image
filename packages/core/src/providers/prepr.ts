import type { ImageProvider, ImageProviderResult } from '../types.js';
import { formatJpgValue, isTransformable, joinURLParts, pathOperations } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type PreprProviderOptions = GenericProviderOptions;

export function preprProvider(options: PreprProviderOptions = {}): ImageProvider<PreprProviderOptions> {
  const defaults = { projectName: options.projectName };
  return {
    name: 'prepr',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const projectName = providerOptions.projectName ?? '';
      const operations = pathOperations(input, {
        crop: 'c',
        format: 'format',
        height: 'h',
        quality: 'q',
        width: 'w'
      }, { format: formatJpgValue }, (key, value) => value === true ? key : `${key}_${value}`);
      const baseURL = projectName ? `https://${projectName}.stream.prepr.io` : '';
      return {
        url: joinURLParts(baseURL, operations, input.src),
        isOptimized: isTransformable(input)
      };
    }
  };
}
