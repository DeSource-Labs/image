import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';

export function defineFrameworkPlaywrightConfig(port: number) {
  const baseURL = `http://127.0.0.1:${port}`;

  return defineConfig({
    testDir: './test/e2e',
    outputDir: './test-results/playwright',
    fullyParallel: true,
    retries: process.env['CI'] ? 2 : 0,
    reporter: process.env['CI'] ? 'github' : 'list',
    use: {
      baseURL,
      trace: 'on-first-retry'
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] }
      }
    ],
    webServer: {
      command: 'pnpm dev --host 127.0.0.1',
      url: baseURL,
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000
    }
  });
}
