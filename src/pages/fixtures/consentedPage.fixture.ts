import { test as base, expect, Page } from '@playwright/test';

type ConsentFixtures = {
  consentedPage: Page;
};

export const test = base.extend<ConsentFixtures>({
  consentedPage: async ({ page }, use) => {
    await page.goto('https://www.catawiki.com/en');

    const cookieBar = page.locator('aside[class*="CookiesBar"]');
    const agreeButton = page.locator('button.gtm-cookie-bar-agree');

    if (await cookieBar.isVisible().catch(() => false)) {
      await agreeButton.click();
      await cookieBar.waitFor({ state: 'detached' });
    }

    await use(page);
  },
});

export { expect };
