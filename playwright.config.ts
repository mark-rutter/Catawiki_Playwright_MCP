import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  use: {
    baseURL: 'https://www.catawiki.com/en',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Catawiki requires headed mode to render the page properly
        // Headless browsers get Access Denied or different rendering
        headless: false,
      },
    },
  ],

  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
});
