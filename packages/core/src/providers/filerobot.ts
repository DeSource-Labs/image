import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type FilerobotProviderOptions = GenericProviderOptions;

export function filerobotProvider(options: FilerobotProviderOptions = {}): ImageProvider<FilerobotProviderOptions> {
  return createMappedQueryProvider('filerobot', options, {
    fit: 'func',
    format: 'force_format',
    quality: 'q',
    width: 'w',
    height: 'h'
  }, {
    fit: {
      cover: 'crop',
      contain: 'fit',
      fill: 'cover',
      inside: 'bound',
      outside: 'boundmin'
    }
  });
}
