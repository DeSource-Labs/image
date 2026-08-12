import type { ImageProvider, ImageProviderResult } from '../types';
import { appendQuery, joinURL, stripLeadingSlash } from '../utils';
import { mappedModifiers, providerBaseURL } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type PicsumProviderOptions = GenericProviderOptions;

export function picsumProvider(options: PicsumProviderOptions = {}): ImageProvider<PicsumProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? 'https://picsum.photos' };
  return {
    name: 'picsum',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const parts: string[] = [];
      const source = stripLeadingSlash(input.src);
      if (source.startsWith('id/') || source.startsWith('seed/')) {
        parts.push(source);
      }
      if (input.width) {
        parts.push(String(input.width));
      }
      if (input.height) {
        parts.push(String(input.height));
      }
      return {
        url: appendQuery(
          joinURL(providerBaseURL(providerOptions, defaults), parts.join('/')),
          mappedModifiers(input, {}, {}, ['width', 'height', 'quality', 'format', 'fit', 'background'])
        ),
        isOptimized: true
      };
    }
  };
}
