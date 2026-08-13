import { expect, test } from '@playwright/test';
import { collectConsoleErrors } from './setup/browser';

export interface ImageComponentE2EOptions {
  heading: string | RegExp;
  imageSelector: string;
  widthControlTestId: string;
  widthValueTestId: string;
  initialSrc: RegExp;
  updatedSrc: RegExp;
  preloadCount?: number;
  decodedStateTestId?: string;
}

export function testImageComponent(options: ImageComponentE2EOptions): void {
  test.describe('Image component', () => {
    test('renders optimized attrs, preload hints and reactive width updates', async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page);

      await page.goto('/');
      await expect(page.getByRole('heading', { name: options.heading })).toBeVisible();

      const image = page.locator(options.imageSelector);
      await expect(image).toHaveAttribute('data-ds-image', '');
      await expect(image).toHaveAttribute('src', options.initialSrc);
      await expect(image).toHaveAttribute('sizes', /max-width|100vw/);

      if (options.preloadCount !== undefined) {
        await expect(page.locator('head link[rel="preload"][as="image"]')).toHaveCount(options.preloadCount);
      }

      await page.getByTestId(options.widthControlTestId).fill('880');
      await expect(page.getByTestId(options.widthValueTestId)).toHaveText('880px');
      await expect(image).toHaveAttribute('width', '880');
      await expect(image).toHaveAttribute('src', options.updatedSrc);

      if (options.decodedStateTestId) {
        await expect(page.getByTestId(options.decodedStateTestId)).toHaveText('decoded');
      }

      expect(consoleErrors).toEqual([]);
    });
  });
}
