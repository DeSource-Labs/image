import type { ImageProvider, ImageProviderResult, ModifierValue } from '../types';
import { stableModifiers } from '../utils';
import { cleanColor, isTransformable, mappedModifiers, providerBaseURL, sourceWithBase } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

export type TwicpicsProviderOptions = GenericProviderOptions;

export function twicpicsProvider(options: TwicpicsProviderOptions = {}): ImageProvider<TwicpicsProviderOptions> {
  const defaults = { baseURL: options.baseURL ?? '/' };
  return {
    name: 'twicpics',
    getImage(input, providerOptions = defaults): ImageProviderResult {
      const transforms: Record<string, ModifierValue> = mappedModifiers(input, {
        format: 'output',
        quality: 'quality',
        background: 'background',
        focus: 'focus',
        zoom: 'zoom'
      }, {
        background: cleanColor
      }, ['width', 'height', 'fit']);
      if (input.width || input.height) {
        const fit = input.modifiers?.fit === 'outside' ? 'contain' : input.modifiers?.fit ?? 'cover';
        transforms[String(fit)] = `${input.width ?? '-'}x${input.height ?? '-'}`;
      }
      const operations = stableModifiers(transforms).map(([key, value]) => `${key}=${value}`).join('/');
      return {
        url: sourceWithBase(input.src + (operations ? `?twic=v1/${operations}` : ''), providerBaseURL(providerOptions, defaults)),
        isOptimized: isTransformable(input)
      };
    }
  };
}
