import { expect, test, type Page } from '@playwright/test';
import { collectConsoleErrors } from './setup/browser';

export interface DemoE2EOptions {
  heading: string | RegExp;
  widthControlTestId: string;
  widthValueTestId: string;
}

export interface ResponsiveE2EOptions extends DemoE2EOptions {
  suiteName: string;
  testName: string;
}

interface ResponsiveAssertions {
  initial(page: Page): Promise<void>;
  updated(page: Page): Promise<void>;
}

export function testResponsiveDemo(options: ResponsiveE2EOptions, assertions: ResponsiveAssertions): void {
  test.describe(options.suiteName, () => {
    test(options.testName, async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page);
      await page.goto('/');
      await expect(page.getByRole('heading', { name: options.heading })).toBeVisible();
      await assertions.initial(page);

      await page.getByTestId(options.widthControlTestId).fill('880');
      await expect(page.getByTestId(options.widthValueTestId)).toHaveText('880px');
      await assertions.updated(page);

      expect(consoleErrors).toEqual([]);
    });
  });
}
