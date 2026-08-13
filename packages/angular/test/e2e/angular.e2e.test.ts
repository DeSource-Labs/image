import { expect, test } from '@playwright/test';
import { collectConsoleErrors } from '../../../../common/test/e2e/browser';

test('renders every Angular API and updates image URLs reactively', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'One image API, four Angular surfaces.' })).toBeVisible();

  const component = page.getByTestId('component').locator('img');
  const directive = page.getByTestId('directive');
  await expect(component).toHaveAttribute('data-ds-image', '');
  await expect(component).toHaveAttribute('src', /hero\.jpg\?w=\d+&h=\d+&q=82/);
  await expect(component).toHaveAttribute('sizes', /max-width/);
  await expect(directive).toHaveAttribute('data-ds-image', '');
  await expect(directive).toHaveAttribute('srcset', /w=720/);

  await page.getByTestId('width').fill('880');
  await expect(page.getByTestId('width-value')).toHaveText('880px');
  await expect(component).toHaveAttribute('width', '880');
  await expect(directive).toHaveAttribute('src', /w=880/);

  await expect(page.getByTestId('picture-component').locator('source')).toHaveCount(2);
  await expect(page.getByTestId('picture-directive').locator('source')).toHaveCount(1);
  await expect(page.locator('head link[rel="preload"][as="image"]')).toHaveCount(1);
  expect(consoleErrors).toEqual([]);
});
