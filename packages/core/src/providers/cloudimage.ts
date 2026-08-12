import type { ImageProvider, ImageProviderResult } from '../types';
import { appendQuery, joinURL } from '../utils';
import { isTransformable, joinURLParts, mappedModifiers } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type CloudimageProviderOptions = GenericProviderOptions;

export function cloudimageProvider(options: CloudimageProviderOptions = {}): ImageProvider<CloudimageProviderOptions> {
  const defaults = {
    baseURL: options.baseURL,
    token: options.token,
    cdnURL: options.cdnURL
  };
  return {
    name: 'cloudimage',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const options = { ...defaults, ...providerOptions };
      const cdnURL = options.cdnURL ?? (options.token ? `https://${options.token}.cloudimg.io` : '');
      const src = input.src.startsWith('http')
        ? joinURL(cdnURL, input.src)
        : joinURLParts(cdnURL, options.baseURL ?? '', input.src);
      return {
        url: appendQuery(
          src || input.src,
          mappedModifiers(
            input,
            {
              fit: 'func',
              format: 'force_format',
              quality: 'q'
            },
            {
              fit: {
                cover: 'crop',
                contain: 'fit',
                fill: 'cover',
                inside: 'bound',
                outside: 'boundmin'
              }
            }
          )
        ),
        isOptimized: isTransformable(input)
      };
    }
  };
}
