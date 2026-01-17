import { test as base, expect, Page } from '@playwright/test';
import { consentPageIfNeeded } from './fixtures/consentedPage.fixture';

/* Base test setup with consent handling */
/* Consent handling / Anti-bot features made early scripts difficult */
/* Suspect React CMP (Consent Management Platform) is a deep dive: todo */
/* This works but makes a new session to use for each test */
/* --headed is required slowing test runs down */
/* Remains true to the UI user flow focused test intent */

export type Fixtures = {
  consentedPage: Page;
};

export const test = base.extend<Fixtures>({
  consentedPage: async ({ page }, use) => {
    // Navigate using baseURL from playwright.config.ts
    await page.goto('/', { waitUntil: 'networkidle' });

    // Ensure cookie banner is dismissed
    await consentPageIfNeeded(page);

    // Hand over a usable page to the test
    await use(page);
  },
});

export { expect };
