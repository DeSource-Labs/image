import { defineProvider, type ImageConfig, type ModifierValue } from '@desource/image';

export const imageComponentTestProvider = defineProvider({
  getImage(src, { modifiers }) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(modifiers)) {
      if (value !== undefined && value !== false) {
        query.set(key, stringifyModifierValue(value));
      }
    }

    return { url: query.size ? `${src}?${query}` : src };
  }
});

function stringifyModifierValue(value: Exclude<ModifierValue, undefined>): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    return value.map((entry) => (entry === undefined || entry === null ? '' : stringifyModifierValue(entry))).join(',');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return value.toString();
}

export const imageComponentTestConfig = {
  provider: 'test',
  providers: { test: imageComponentTestProvider },
  screens: { sm: 640, md: 768 },
  providerSizes: [320, 640, 768, 960, 1280],
  densities: [1, 2]
} satisfies ImageConfig;
