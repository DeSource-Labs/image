import type { PageServerLoad } from './$types';

const provider = `import {
  appendQuery,
  configureProvider,
  defineProvider,
  type ImageModifiers,
  type ProviderOptionsOf
} from '@desource/image';

interface AcmeModifiers extends ImageModifiers {
  sharpen?: number;
}

interface AcmeOptions {
  baseURL?: string;
  modifiers?: Partial<AcmeModifiers>;
}

const providerSetup = defineProvider<AcmeOptions>({
  validateDomains: true,
  getImage(src, { baseURL = 'https://images.acme.test/transform', modifiers }) {
    return {
      url: appendQuery(baseURL, {
        src,
        w: modifiers.width,
        h: modifiers.height,
        q: modifiers.quality,
        fm: modifiers.format === 'jpeg' ? 'jpg' : modifiers.format,
        fit: modifiers.fit,
        sharpen: modifiers.sharpen
      }),
      isOptimized: true
    };
  }
});

export type AcmeProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function acmeProvider(options: AcmeProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'acme');
}`;

const configuration = `import type { ImageConfig } from '@desource/image';
import { acmeProvider } from './acme-provider';

export const imageConfig = {
  provider: 'acme',
  domains: ['assets.example.com'],
  providers: {
    acme: acmeProvider({
      baseURL: 'https://images.acme.test/transform',
      modifiers: { quality: 75 }
    })
  }
} satisfies ImageConfig;`;

const examples = {
  core: `import { createImage } from '@desource/image';
import { imageConfig } from './image.config';

const image = createImage(imageConfig);

export const heroURL = image('https://assets.example.com/photo.jpg', {
  width: 960,
  height: 640,
  format: 'webp',
  sharpen: 2
});`,
  svelte: `<script lang="ts">
  import { DsImage, setDsImageConfig } from '@desource/image-svelte';
  import { imageConfig } from './image.config';

  setDsImageConfig(imageConfig);
</script>

<DsImage
  src="https://assets.example.com/photo.jpg"
  alt="Mountain ridge at sunrise"
  width={960}
  height={640}
  format="webp"
  modifiers={{ sharpen: 2 }}
/>`,
  react: `import { DsImage, DsImageProvider } from '@desource/image-react';
import { imageConfig } from './image.config';

export function HeroImage() {
  return (
    <DsImageProvider config={imageConfig}>
      <DsImage
        src="https://assets.example.com/photo.jpg"
        alt="Mountain ridge at sunrise"
        width={960}
        height={640}
        format="webp"
        modifiers={{ sharpen: 2 }}
      />
    </DsImageProvider>
  );
}`,
  angular: `import { Component } from '@angular/core';
import { DsImageComponent, provideDsImage } from '@desource/image-angular';
import { imageConfig } from './image.config';

@Component({
  selector: 'app-hero-image',
  imports: [DsImageComponent],
  providers: [provideDsImage(imageConfig)],
  template: \`
    <ds-image
      src="https://assets.example.com/photo.jpg"
      alt="Mountain ridge at sunrise"
      [width]="960"
      [height]="640"
      format="webp"
      [modifiers]="{ sharpen: 2 }"
    />
  \`
})
export class HeroImageComponent {}`
} as const;

const test = `import { describe, expect, it } from 'vitest';
import { createImage } from '@desource/image';
import { acmeProvider } from './acme-provider';

describe('acmeProvider', () => {
  it('maps standard and custom modifiers', () => {
    const image = createImage({
      provider: 'acme',
      domains: ['assets.example.com'],
      providers: {
        acme: acmeProvider({ baseURL: 'https://images.acme.test/transform' })
      }
    });

    expect(
      image('https://assets.example.com/photo.jpg', {
        width: 640,
        format: 'webp',
        sharpen: 2
      })
    ).toBe(
      'https://images.acme.test/transform' +
        '?src=https%3A%2F%2Fassets.example.com%2Fphoto.jpg&w=640&fm=webp&sharpen=2'
    );
  });
});`;

export const load: PageServerLoad = ({ url }) => ({
  origin: url.origin,
  provider,
  configuration,
  examples,
  test
});
