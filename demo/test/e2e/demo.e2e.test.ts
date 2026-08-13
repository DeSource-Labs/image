import { expect, test } from '@playwright/test';
import { collectConsoleErrors } from '../../../common/test/e2e/browser';

test('renders the SSR documentation site and exercises its live optimizer', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);
  const response = await page.goto('/');

  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle(/Desource Image/);
  await expect(page.getByRole('heading', { name: /Ship the right image/ })).toBeVisible();

  const hero = page.locator('.hero-visual picture img');
  await expect(hero).toHaveAttribute('src', /\/_ipx\//);
  await expect(hero).toHaveAttribute('srcset', /\/_ipx\//);

  const playground = page.locator('#playground');
  await playground.getByRole('slider', { name: /Width/ }).fill('1280');
  await playground.getByRole('slider', { name: /Quality/ }).fill('82');
  await expect(playground.getByRole('status', { name: 'Width' })).toHaveText('1280px');
  await expect(playground.locator('.url-output code')).toContainText('q_82');

  const optimized = await page.request.get('/_ipx/w_64/img/hero.jpg');
  expect(optimized.ok()).toBe(true);
  expect(optimized.headers()['content-type']).toContain('image/');
  expect(consoleErrors).toEqual([]);
});
