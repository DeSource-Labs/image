import { expect } from '@playwright/test';
import { testResponsiveDemo, type DemoE2EOptions } from './Responsive';

interface DsImageE2EOptions extends DemoE2EOptions {
  suiteName: string;
  testName: string;
  imageSelector: string;
  initialSrc: RegExp;
  updatedSrc: RegExp;
  sizes?: RegExp;
  srcset?: RegExp;
  expectedWidth?: string;
  preloadCount?: number;
  decodedStateTestId?: string;
}

export interface DsImageComponentE2EOptions extends DemoE2EOptions {
  imageSelector: string;
  initialSrc: RegExp;
  updatedSrc: RegExp;
  preloadCount?: number;
  decodedStateTestId?: string;
}

export interface DsImageBindingE2EOptions extends DemoE2EOptions {
  name: string;
  imageSelector: string;
  initialSrc: RegExp;
  updatedSrc: RegExp;
  srcset?: RegExp;
}

export function testDsImageComponent(options: DsImageComponentE2EOptions): void {
  testDsImage({
    ...options,
    suiteName: 'DsImage component',
    testName: 'renders optimized attrs, preload hints and reactive width updates',
    sizes: /max-width|100vw/,
    expectedWidth: '880'
  });
}

export function testDsImageBinding(options: DsImageBindingE2EOptions): void {
  const { name, ...imageOptions } = options;
  testDsImage({
    ...imageOptions,
    suiteName: name,
    testName: 'renders and updates a native img element'
  });
}

function testDsImage(options: DsImageE2EOptions): void {
  testResponsiveDemo(options, {
    initial: async (page) => {
      const image = page.locator(options.imageSelector);
      await expect(image).toHaveAttribute('data-ds-image', '');
      await expect(image).toHaveAttribute('src', options.initialSrc);
      if (options.sizes) await expect(image).toHaveAttribute('sizes', options.sizes);
      if (options.srcset) await expect(image).toHaveAttribute('srcset', options.srcset);
      if (options.preloadCount !== undefined) {
        await expect(page.locator('head link[rel="preload"][as="image"]')).toHaveCount(options.preloadCount);
      }
    },
    updated: async (page) => {
      const image = page.locator(options.imageSelector);
      if (options.expectedWidth) await expect(image).toHaveAttribute('width', options.expectedWidth);
      await expect(image).toHaveAttribute('src', options.updatedSrc);
      if (options.decodedStateTestId) {
        await expect(page.getByTestId(options.decodedStateTestId)).toHaveText('decoded');
      }
    }
  });
}
