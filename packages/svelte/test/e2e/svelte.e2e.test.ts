import { expect, test } from '@playwright/test';
import { collectConsoleErrors } from '../../../../common/test/e2e/browser';

test('renders and updates every Svelte image API', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Components, actions, and attachments in one engine.' })
  ).toBeVisible();

  const component = page.getByTestId('component');
  const action = page.getByTestId('action');
  const attachment = page.getByTestId('attachment');
  await expect(component).toHaveAttribute('data-ds-image', '');
  await expect(component).toHaveAttribute('src', /_ipx\//);
  await expect(action).toHaveAttribute('data-ds-image', '');
  await expect(action).toHaveAttribute('src', /s_720x540/);
  await expect(attachment).toHaveAttribute('src', /(?=.*720)(?=.*webp)/);

  await expect(page.getByTestId('picture-component').locator('source')).toHaveCount(2);
  await expect(page.getByTestId('picture-action').locator('source')).toHaveCount(1);
  await expect(page.locator('head link[rel="preload"][as="image"]')).toHaveCount(1);

  await page.getByTestId('width').fill('880');
  await expect(page.getByTestId('width-value')).toHaveText('880px');
  await expect(action).toHaveAttribute('src', /s_880x540/);
  await expect(attachment).toHaveAttribute('src', /880/);
  await expect(page.getByTestId('component-state')).toHaveText('decoded');

  const optimized = await page.request.get('/_ipx/w_32/hero.jpg');
  expect(optimized.ok()).toBe(true);
  expect(optimized.headers()['content-type']).toContain('image/');
  expect(consoleErrors).toEqual([]);
});
