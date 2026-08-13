import { expect, test } from '@playwright/test';
import { collectConsoleErrors } from './browser';

export interface PictureComponentE2EOptions {
  heading: string | RegExp;
  pictureSelector: string;
  widthControlTestId: string;
  widthValueTestId: string;
  sourceCount: number;
  sourceTypes: readonly string[];
  fallbackSrc: RegExp;
  updatedFallbackSrc: RegExp;
}

export function testPictureComponent(options: PictureComponentE2EOptions): void {
  test.describe('Picture component', () => {
    test('renders responsive sources, fallback image attrs and reactive width updates', async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page);

      await page.goto('/');
      await expect(page.getByRole('heading', { name: options.heading })).toBeVisible();

      const picture = page.locator(options.pictureSelector);
      const image = picture.locator('img');
      const sources = picture.locator('source');

      await expect(picture).toHaveAttribute('data-ds-picture', '');
      await expect(sources).toHaveCount(options.sourceCount);
      for (const [index, type] of options.sourceTypes.entries()) {
        await expect(sources.nth(index)).toHaveAttribute('type', type);
      }

      await expect(image).toHaveAttribute('data-ds-picture-img', '');
      await expect(image).toHaveAttribute('src', options.fallbackSrc);

      await page.getByTestId(options.widthControlTestId).fill('880');
      await expect(page.getByTestId(options.widthValueTestId)).toHaveText('880px');
      await expect(image).toHaveAttribute('width', '880');
      await expect(image).toHaveAttribute('src', options.updatedFallbackSrc);

      expect(consoleErrors).toEqual([]);
    });
  });
}
