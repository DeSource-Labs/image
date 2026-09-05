export function pathname(value: string | null): string {
  return new URL(value ?? '', 'https://image.test').pathname;
}

export function searchParam(value: string | null, key: string): string | null {
  return new URL(value ?? '', 'https://image.test').searchParams.get(key);
}
