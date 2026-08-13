import { expect, test } from '@playwright/test';
import { collectConsoleErrors } from '@common/test/e2e/setup/browser';

test.describe('imageAction', () => {
  test('renders and updates a native img element', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Components, actions, and attachments in one engine.' })
    ).toBeVisible();

    const image = page.getByTestId('image-action');
    await expect(image).toHaveAttribute('data-ds-image', '');
    await expect(image).toHaveAttribute('src', /s_720x540/);

    await page.getByTestId('width').fill('880');
    await expect(page.getByTestId('width-value')).toHaveText('880px');
    await expect(image).toHaveAttribute('src', /s_880x540/);

    expect(consoleErrors).toEqual([]);
  });
});
