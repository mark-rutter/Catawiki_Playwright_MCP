// framework-health.spec.ts
// Smoke test for framework health
import { test, expect } from '@playwright/test';

test('Framework health check', async ({ page }) => {
  await page.goto('/');
  // Catawiki home page should load successfully
  const pageTitle = await page.title();
  expect(pageTitle.length).toBeGreaterThan(0);
  
});
