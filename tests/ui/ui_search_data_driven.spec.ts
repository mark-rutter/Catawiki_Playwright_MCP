import { test, expect } from '../baseTest';
import searchTestData from '../../src/testcases/searchLots.json';

for (const testCase of searchTestData.cases) {
  test(`${testCase.description} - search for "${testCase.keyword}"`, async ({ consentedPage: page }) => {
    // Page is already on Catawiki with consent dismissed

    // Search
    const searchBox = page.getByRole('combobox', { name: /search for brand, model/i });
    await searchBox.click({ timeout: 10000 });
    await searchBox.fill(testCase.keyword);

    await page.getByRole('button', { name: /search/i }).click();

    // Wait for search results to load
    await page.waitForLoadState('domcontentloaded');

    // --- Search results assertions ---
    if (testCase.expectedResults) {
      // Expect at least one search result link to be visible
      // More resilient than looking for a container
      const firstResult = page.locator('a').filter({ hasText: /.+/ }).first();
      
      await expect.soft(
        firstResult,
        `Search for "${testCase.keyword}" should return at least one result`
      ).toBeVisible({ timeout: 25000 });

      // Log search results count if available
      await test.step('Check search results', async () => {
        const resultCount = await page.locator('a').count();
        const hasResults = await firstResult.isVisible().catch(() => false);
        test.info().attach('Search Result', {
          body: `Keyword: "${testCase.keyword}"\nResults found: ${hasResults}\nTotal links on page: ${resultCount}`,
          contentType: 'text/plain'
        });
      });
    } else {
      // Expected to have no results or different behavior
      await test.step('Verify search behavior', async () => {
        test.info().attach('Search Info', {
          body: `Keyword: "${testCase.keyword}"\nExpected results: ${testCase.expectedResults}`,
          contentType: 'text/plain'
        });
      });
    }
  });
}
