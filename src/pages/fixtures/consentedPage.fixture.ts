import { Page } from '@playwright/test';

/**
 * Dismiss the cookie consent overlay if present.
 * This function is AI-readable and handles consent in a straightforward manner.
 * No storage state or global setup required.
 */
export async function consentPageIfNeeded(page: Page) {
  console.log('[CONSENT] Checking for cookie consent overlay...');

  try {
    // Wait for page to fully load and cookie bar to potentially appear
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Look for the cookie bar using multiple strategies
    const cookieBar = page.locator('aside[class*="CookiesBar"]').first();
    const agreeButton = page.locator('#cookie_bar_agree_button');

    // Check if cookie bar is visible
    const isVisible = await cookieBar.isVisible().catch(() => false);

    if (isVisible) {
      console.log('[CONSENT] Cookie bar detected, dismissing...');

      // Click the agree button
      await agreeButton.click({ timeout: 5000 });
      console.log('[CONSENT] Clicked Agree button');

      // Wait for the overlay to disappear
      await cookieBar.waitFor({ state: 'hidden', timeout: 10000 });
      console.log('[CONSENT] Cookie bar dismissed successfully');

      // Give the page a moment to settle after consent
      await page.waitForTimeout(500);
    } else {
      console.log('[CONSENT] No cookie bar present (already consented or not shown)');
    }
  } catch (err) {
    console.warn('[CONSENT] Error handling cookie bar:', err);
    // Don't fail the test if consent handling has issues
  }
}
