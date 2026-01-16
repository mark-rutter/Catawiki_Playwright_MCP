// framework-health.spec.ts
// Smoke test for framework health
import { test, expect } from '../baseTest';

test('Framework health check', async ({ consentedPage }) => {
  const pageTitle = await consentedPage.title();

  console.log(`[HEALTH CHECK] Page title: "${pageTitle}"`);

  expect(pageTitle.length).toBeGreaterThan(0);
});