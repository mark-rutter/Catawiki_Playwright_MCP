// Smoke test for cookie consent handling
import { test, expect } from './fixtures/consentedPage.fixture';

test('Framework health check - consented page loads', async ({ consentedPage }) => {
  // consentedPage already:
  // - navigated to homepage
  // - dismissed cookie banner if present
  // - waited for network idle

  const pageTitle = await consentedPage.title();
  expect(pageTitle.length).toBeGreaterThan(0);
  console.log(`Page title: ${pageTitle}`);
});

test('No cookie banner visible after fixture consent', async ({ consentedPage }) => {
  // Verify that the cookie bar is no longer visible
  const cookieBar = consentedPage.locator('aside[class*="CookiesBar"]');
  const isVisible = await cookieBar.isVisible().catch(() => false);
  expect(isVisible).toBe(false);
  console.log('Cookie bar is not visible (consent fixture worked)');
});