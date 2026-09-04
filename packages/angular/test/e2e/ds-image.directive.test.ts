import { expect, test } from '@playwright/test';
import { collectConsoleErrors } from '@common/test/e2e/setup/browser';

test.describe('DsImageDirective', () => {
  test('renders and updates a native img element', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Optimized images across four Angular surfaces.' })).toBeVisible();

    const image = page.getByTestId('image-directive');
    await expect(image).toHaveAttribute('data-ds-image', '');
    await expect(image).toHaveAttribute('srcset', /w=720/);
    await expect(image).toHaveAttribute('src', /hero\.jpg\?w=720&h=540/);

    await page.getByTestId('width').fill('880');
    await expect(page.getByTestId('width-value')).toHaveText('880px');
    await expect(image).toHaveAttribute('src', /hero\.jpg\?w=880&h=540/);

    expect(consoleErrors).toEqual([]);
  });
});
