import { expect } from '@playwright/test';
import { testResponsiveDemo, type DemoE2EOptions } from './Responsive';

interface DsPictureE2EOptions extends DemoE2EOptions {
  suiteName: string;
  testName: string;
  pictureSelector: string;
  sourceCount: number;
  sourceTypes: readonly string[];
  imageMarker: string;
  fallbackSrc: RegExp;
  updatedFallbackSrc: RegExp;
  expectWidth?: boolean;
}

export interface DsPictureComponentE2EOptions extends DemoE2EOptions {
  pictureSelector: string;
  sourceCount: number;
  sourceTypes: readonly string[];
  fallbackSrc: RegExp;
  updatedFallbackSrc: RegExp;
}

export interface DsPictureBindingE2EOptions extends DemoE2EOptions {
  name: string;
  pictureSelector: string;
  sourceType: string;
  imageMarker: string;
  fallbackSrc: RegExp;
  updatedFallbackSrc: RegExp;
}

export function testDsPictureComponent(options: DsPictureComponentE2EOptions): void {
  testDsPicture({
    ...options,
    suiteName: 'DsPicture component',
    testName: 'renders responsive sources, fallback image attrs and reactive width updates',
    imageMarker: 'data-ds-picture-img',
    expectWidth: true
  });
}

export function testDsPictureBinding(options: DsPictureBindingE2EOptions): void {
  const { name, sourceType, ...pictureOptions } = options;
  testDsPicture({
    ...pictureOptions,
    suiteName: name,
    testName: 'renders and updates a native picture element',
    sourceCount: 1,
    sourceTypes: [sourceType]
  });
}

function testDsPicture(options: DsPictureE2EOptions): void {
  testResponsiveDemo(options, {
    initial: async (page) => {
      const picture = page.locator(options.pictureSelector);
      const image = picture.locator('img');
      const sources = picture.locator('source');

      await expect(picture).toHaveAttribute('data-ds-picture', '');
      await expect(sources).toHaveCount(options.sourceCount);
      for (const [index, type] of options.sourceTypes.entries()) {
        await expect(sources.nth(index)).toHaveAttribute('type', type);
      }
      await expect(image).toHaveAttribute(options.imageMarker, '');
      await expect(image).toHaveAttribute('src', options.fallbackSrc);
    },
    updated: async (page) => {
      const image = page.locator(`${options.pictureSelector} img`);
      if (options.expectWidth) await expect(image).toHaveAttribute('width', '880');
      await expect(image).toHaveAttribute('src', options.updatedFallbackSrc);
    }
  });
}
