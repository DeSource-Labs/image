import type { ImageProvider } from '../types.js';
import { createMappedQueryProvider } from '../provider-utils.js';
import type { GenericProviderOptions } from '../provider-utils.js';

export type SupabaseProviderOptions = GenericProviderOptions;

export function supabaseProvider(options: SupabaseProviderOptions = {}): ImageProvider<SupabaseProviderOptions> {
  return createMappedQueryProvider('supabase', options, {
    width: 'width',
    height: 'height',
    quality: 'quality',
    format: 'format',
    fit: 'resize'
  });
}
