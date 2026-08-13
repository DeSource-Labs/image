import { expect, test } from '@playwright/test';
import { collectConsoleErrors } from '@common/test/e2e/setup/browser';

test.describe('pictureAttachment', () => {
  test('renders and updates a native picture element', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Components, actions, and attachments in one engine.' })
    ).toBeVisible();

    const picture = page.getByTestId('picture-attachment');
    const image = picture.locator('img');
    await expect(picture).toHaveAttribute('data-ds-picture', '');
    await expect(picture.locator('source')).toHaveCount(1);
    await expect(picture.locator('source')).toHaveAttribute('type', 'image/avif');
    await expect(image).toHaveAttribute('data-ds-image', '');
    await expect(image).toHaveAttribute('src', /s_720x540/);

    await page.getByTestId('width').fill('880');
    await expect(page.getByTestId('width-value')).toHaveText('880px');
    await expect(image).toHaveAttribute('src', /s_880x540/);

    expect(consoleErrors).toEqual([]);
  });
});
