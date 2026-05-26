import type { ImageProvider } from '../types';
import { createMappedQueryProvider } from '../provider-utils';
import type { GenericProviderOptions } from '../provider-utils';

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
