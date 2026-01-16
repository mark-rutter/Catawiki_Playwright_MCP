// tests/baseTest.ts
import { test as base, expect, Page } from '@playwright/test';

export type ConsentedPageFixture = {
  consentedPage: Page;
};

export const test = base.extend<ConsentedPageFixture>({
  consentedPage: async ({ page }, use) => {
    // Navigate using baseURL from playwright.config.ts
    await page.goto('/', { waitUntil: 'networkidle' });
    console.log('[CONSENTED PAGE FIXTURE] Navigated to homepage');

    // Small settle delay (React hydration / overlays)
    await page.waitForTimeout(2000);

    const cookieBar = page.locator('aside[class*="CookiesBar"]');
    const agreeButton = page.locator('#cookie_bar_agree_button');

    if (await cookieBar.count() > 0) {
      console.log('[CONSENTED PAGE FIXTURE] Cookie bar detected');

      try {
        await agreeButton.waitFor({ state: 'visible', timeout: 5000 });
        await agreeButton.click();
        console.log('[CONSENTED PAGE FIXTURE] Clicked Agree button');

        // Wait for overlay to disappear
        await cookieBar.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        console.log('[CONSENTED PAGE FIXTURE] Cookie bar dismissed');
      } catch (err) {
        console.warn('[CONSENTED PAGE FIXTURE] Failed to click Agree:', err);
      }
    } else {
      console.log('[CONSENTED PAGE FIXTURE] No cookie bar detected');
    }

    // Log cookies for debugging (React consent is often localStorage-backed)
    const cookies = await page.context().cookies();
    console.log(`[CONSENTED PAGE FIXTURE] Cookies count: ${cookies.length}`);

    // Hand control to the test
    await use(page);

    console.log('[CONSENTED PAGE FIXTURE] Test finished');
  },
});

export { expect };
