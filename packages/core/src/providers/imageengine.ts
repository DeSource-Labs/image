import type { ImageProvider, ImageProviderResult } from '../types';
import { isTransformable, pathOperations, providerBaseURL, sourceWithBase } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type ImageEngineProviderOptions = GenericProviderOptions;

export function imageEngineProvider(
  options: ImageEngineProviderOptions = {}
): ImageProvider<ImageEngineProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? '/' };
  return {
    name: 'imageengine',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const operations = pathOperations(
        input,
        {
          width: 'w',
          height: 'h',
          quality: 'cmpr',
          format: 'f',
          fit: 'm'
        },
        {
          quality(value) {
            return Math.min(99, Math.max(0, 100 - Number(value)));
          },
          fit: {
            cover: 'cropbox',
            contain: 'letterbox',
            fill: 'stretch',
            inside: 'box',
            outside: 'box'
          }
        },
        (key, value) => `${key}_${value}`,
        '/'
      );
      return {
        url: sourceWithBase(
          input.src + (operations ? `?imgeng=/${operations}` : ''),
          providerBaseURL(providerOptions, defaults)
        ),
        isOptimized: isTransformable(input)
      };
    }
  };
}
