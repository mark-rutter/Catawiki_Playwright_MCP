import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function globalSetup() {
  console.log('\n[GLOBAL SETUP] Preparing consented browser state...');

  const storagePath = path.resolve('playwright/.auth/storageState.json');
  const uiSmokePath = path.resolve('playwright/.auth/ui_smoke_state.json');

  // If ui_smoke_state.json exists (from a successful test run), use it as the base
  if (fs.existsSync(uiSmokePath)) {
    console.log('[GLOBAL SETUP] Found ui_smoke_state.json, using it as reference...');
    try {
      const uiSmokeData = JSON.parse(fs.readFileSync(uiSmokePath, 'utf-8'));
      // Copy it to storageState.json
      fs.writeFileSync(storagePath, JSON.stringify(uiSmokeData, null, 2));
      console.log('[GLOBAL SETUP] Copied ui_smoke_state.json to storageState.json');
      console.log(`[GLOBAL SETUP] Storage includes ${uiSmokeData.cookies.length} cookies`);
      console.log('[GLOBAL SETUP] Complete\n');
      return;
    } catch (err) {
      console.warn('[GLOBAL SETUP] Failed to use ui_smoke_state.json:', err);
    }
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {

    await page.goto('https://www.catawiki.com/en', {
      waitUntil: 'networkidle',
    });

    console.log('[GLOBAL SETUP] Page loaded (networkidle), waiting for cookie bar...');
    
    // Wait a bit for the cookie bar to appear/hydrate
    await page.waitForTimeout(3000);

    // Try multiple selectors for the cookie bar
    const cookieBarByClass = page.locator('aside[class*="CookiesBar"]');
    const cookieBarByRole = page.locator('complementary[role="complementary"], article');
    const agreeButton = page.getByRole('button', { name: 'Agree' });

    // Check if cookie bar exists in DOM with various selectors
    const cookieBarCount1 = await page.locator('aside[class*="CookiesBar"]').count();
    const allAsides = await page.locator('aside').count();
    console.log(`[GLOBAL SETUP] Cookie bar (aside with CookiesBar): ${cookieBarCount1}`);
    console.log(`[GLOBAL SETUP] All aside elements: ${allAsides}`);

    // Check for button
    const agreeCount = await page.getByRole('button', { name: 'Agree' }).count();
    console.log(`[GLOBAL SETUP] Agree buttons found: ${agreeCount}`);

    if (agreeCount > 0) {
      console.log('[GLOBAL SETUP] Agree button found, clicking...');
      await agreeButton.click().catch((e) => console.warn('[GLOBAL SETUP] Agree click failed', e));
      console.log('[GLOBAL SETUP] Clicked Agree');
      await page.waitForTimeout(1000);
    } else {
      console.log('[GLOBAL SETUP] No Agree button found');
    }

    // Wait for consent cookies to be set after clicking agree
    try {
      await page.waitForFunction(() => {
        const cookieStr = document.cookie || '';
        // Check for multiple consent cookie patterns
        return /enable_marketing_cookies|enable_analytical_cookies|cookie_preferences_used_cta/i.test(cookieStr);
      }, { timeout: 5000 });
      console.log('[GLOBAL SETUP] Consent cookies detected');
    } catch (err) {
      console.warn('[GLOBAL SETUP] Consent cookies not detected after 5s, proceeding anyway...');
    }

    // Ensure consent is persisted (check for common consent cookie names, any cookie, or cookie bar removal)
    try {
      await page.waitForFunction(() => {
        const cookieBarPresent = !!document.querySelector('aside[class*="CookiesBar"]');
        const cookieStr = document.cookie || '';
        const hasConsentCookie = /cw_abcpbs|consent|cookie|cw_consent/i.test(cookieStr);
        return !cookieBarPresent || hasConsentCookie || cookieStr.length > 0 || localStorage.length > 0;
      }, { timeout: 10000 });
    } catch (err) {
      // Diagnostic snapshot to help debugging if persistence isn't detected
      const diag = await page.evaluate(() => ({
        cookie: document.cookie || null,
        localStorageKeys: Object.keys(localStorage),
        cookieBarPresent: !!document.querySelector('aside[class*="CookiesBar"]')
      }));
      console.warn('[GLOBAL SETUP] Persistence detection timed out. Diagnostic:', diag);
    }

    // Save storage state
    const authDir = path.dirname(storagePath);
    fs.mkdirSync(authDir, { recursive: true });

    // Log the current storage state for debugging
    const preState = await context.storageState();
    console.log(`[GLOBAL SETUP] Current cookies before save: ${preState.cookies.length} cookies`);
    preState.cookies.slice(0, 5).forEach(c => {
      console.log(`  - ${c.name}: ${c.value.substring(0, 20)}...`);
    });

    await context.storageState({ path: storagePath });
    console.log(`[GLOBAL SETUP] Storage state saved: ${storagePath}`);

  } finally {
    await browser.close();
  }

  console.log('[GLOBAL SETUP] Complete\n');
}

export default globalSetup;
