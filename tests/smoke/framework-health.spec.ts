// tests/smoke/framework-health.spec.ts
import { test, expect } from '../baseTest';

test('Framework health check', async ({ consentedPage }) => {
  const title = await consentedPage.title();
  console.log(`[HEALTH] Page title: ${title}`);

  expect(title.length).toBeGreaterThan(0);
});
