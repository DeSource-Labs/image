import { expect, test } from '@playwright/test';
import { collectConsoleErrors } from '../../../../common/test/e2e/browser';

test.describe('DsPictureDirective', () => {
  test('renders and updates a native picture element', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'One image API, four Angular surfaces.' })).toBeVisible();

    const picture = page.getByTestId('picture-directive');
    const image = picture.locator('img');
    await expect(picture).toHaveAttribute('data-ds-picture', '');
    await expect(picture.locator('source')).toHaveCount(1);
    await expect(picture.locator('source')).toHaveAttribute('type', 'image/webp');
    await expect(image).toHaveAttribute('data-ds-picture-img', '');
    await expect(image).toHaveAttribute('src', /hero\.jpg\?w=720&h=540&fm=jpeg/);

    await page.getByTestId('width').fill('880');
    await expect(page.getByTestId('width-value')).toHaveText('880px');
    await expect(image).toHaveAttribute('src', /hero\.jpg\?w=880&h=540&fm=jpeg/);

    expect(consoleErrors).toEqual([]);
  });
});
