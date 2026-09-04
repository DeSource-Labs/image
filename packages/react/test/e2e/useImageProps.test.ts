import { expect, test } from '@playwright/test';
import { collectConsoleErrors } from '@common/test/e2e/setup/browser';

test.describe('useImageProps', () => {
  test('renders and updates a native img element', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Optimized images for React and Next.js.' })).toBeVisible();

    const image = page.getByTestId('image-hook');
    await expect(image).toHaveAttribute('data-ds-image', '');
    await expect(image).toHaveAttribute('src', /(?=.*720)(?=.*webp)/);

    await page.getByTestId('width').fill('880');
    await expect(page.getByTestId('width-value')).toHaveText('880px');
    await expect(image).toHaveAttribute('src', /(?=.*880)(?=.*webp)/);

    expect(consoleErrors).toEqual([]);
  });
});
