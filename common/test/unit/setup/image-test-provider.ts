import { defineProvider, type ImageConfig } from '@desource/image';
import { stringifyModifierValue } from '@desource/image/kit';

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

export const imageComponentTestConfig = {
  provider: 'test',
  providers: { test: imageComponentTestProvider },
  screens: { sm: 640, md: 768 },
  providerSizes: [320, 640, 768, 960, 1280],
  densities: [1, 2]
} satisfies ImageConfig;
