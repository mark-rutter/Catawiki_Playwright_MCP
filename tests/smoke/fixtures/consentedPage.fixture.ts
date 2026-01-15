import { test as base, Page } from '@playwright/test';

type ConsentedPageFixture = {
  consentedPage: Page;
};

/**
 * ConsentedPage Fixture
 * 
 * This fixture provides a browser page with cookie consent already handled.
 * Use this fixture in any test that doesn't want to deal with the cookie banner.
 * 
 * Usage:
 * ```
 * import { test, expect } from './fixtures/consentedPage.fixture';
 * 
 * test('my test', async ({ consentedPage }) => {
 *   // consentedPage is already on the homepage with cookies accepted
 *   // No cookie banner will appear
 * });
 * ```
 * 
 * The fixture:
 * - Navigates to the homepage (using baseURL from config)
 * - Waits for networkidle to ensure page is fully loaded
 * - Automatically detects and clicks the cookie acceptance button
 * - Waits for the cookie banner to disappear
 * - Provides a ready-to-use page object without cookie consent blocking
 */
export const test = base.extend<ConsentedPageFixture>({
  consentedPage: async ({ page }, use) => {
    // Navigate to the homepage using baseURL from config
    await page.goto('/', {
      waitUntil: 'networkidle',
    });

    console.log('[CONSENTED PAGE FIXTURE] Navigated to homepage');

    // Wait for page to stabilize
    await page.waitForTimeout(2000);

    // Check for and handle the cookie agreement button
    const agreeButton = page.getByRole('button', { name: 'Agree' });
    const cookieBarCount = await page.locator('aside[class*="CookiesBar"]').count();
    
    if (cookieBarCount > 0 || (await agreeButton.isVisible().catch(() => false))) {
      console.log('[CONSENTED PAGE FIXTURE] Cookie bar detected, clicking Agree...');
      try {
        await agreeButton.waitFor({ state: 'visible', timeout: 5000 });
        await agreeButton.click();
        console.log('[CONSENTED PAGE FIXTURE] Clicked Agree button');

        // Wait for the cookie bar to disappear
        const cookieBar = page.locator('aside[class*="CookiesBar"]');
        await cookieBar.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        console.log('[CONSENTED PAGE FIXTURE] Cookie bar dismissed');

        // Wait for consent cookies to be set in the browser
        try {
          await page.waitForFunction(() => {
            const cookieStr = document.cookie || '';
            return cookieStr.length > 0;
          }, { timeout: 3000 });
          console.log('[CONSENTED PAGE FIXTURE] Cookies confirmed set in browser');
        } catch (err) {
          console.warn('[CONSENTED PAGE FIXTURE] Timeout waiting for cookies, but continuing...');
        }
      } catch (error) {
        console.warn('[CONSENTED PAGE FIXTURE] Failed to handle cookie consent:', error);
      }
    } else {
      console.log('[CONSENTED PAGE FIXTURE] No cookie bar detected (cookies may already be set)');
    }

    // Verify cookies are present before test runs
    const cookies = await page.context().cookies();
    console.log(`[CONSENTED PAGE FIXTURE] Cookies available: ${cookies.length}`);
    
    // Give browser time to fully settle
    await page.waitForTimeout(500);

    console.log('[CONSENTED PAGE FIXTURE] Ready for test - passing page to test');

    // Pass the page to the test and keep it alive during test execution
    await use(page);
    
    console.log('[CONSENTED PAGE FIXTURE] Test completed, page cleanup');
  },
});

export { expect } from '@playwright/test';
