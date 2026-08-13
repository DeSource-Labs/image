export function useRuntimeConfig() {
  return { public: { siteUrl: '/' } };
}

export function createError(input: { message?: string } | string): Error {
  return new Error(typeof input === 'string' ? input : (input.message ?? 'Image provider error'));
}
