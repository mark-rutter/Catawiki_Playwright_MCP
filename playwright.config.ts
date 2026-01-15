import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  globalSetup: './playwright/globalSetup.ts',

  use: {
    baseURL: 'https://www.catawiki.com/en',
    storageState: 'playwright/.auth/storageState.json',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

    reporter: [
    ['list'],           // verbose terminal output
    ['html', { open: 'never' }]
  ],

  webServer: undefined,
});
