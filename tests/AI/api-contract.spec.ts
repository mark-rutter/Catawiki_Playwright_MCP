import { test, expect } from '../baseTest';

/**
 * API Contract Test Example
 * Validates that API responses match expected schema structure
 * Based on services discovered in discovery.spec.ts
 */

test('Search Suggest API - Contract Validation', async ({ consentedPage: page }) => {
  let searchSuggestResponse: any = null;

  // Intercept the search suggest API call
  page.on('response', async (response) => {
    if (response.url().includes('/buyer/api/v1/search/suggest')) {
      searchSuggestResponse = await response.json().catch(() => null);
    }
  });

  // Trigger the search suggest API by typing in search box
  const searchBox = page.getByRole('combobox', { name: /search/i });
  await searchBox.click();
  await searchBox.fill('train');

  // Wait for API to be called
  await page.waitForTimeout(2000);

  // Attach API response to report
  await test.step('📋 API Response Captured', async () => {
    test.info().attach('Search Suggest Response', {
      body: JSON.stringify(searchSuggestResponse, null, 2),
      contentType: 'application/json'
    });
  });

  // Contract Assertions
  await test.step('✅ Validate Response Schema', async () => {
    expect.soft(searchSuggestResponse).not.toBeNull();
    expect.soft(searchSuggestResponse).toHaveProperty('query_terms');
    expect.soft(Array.isArray(searchSuggestResponse.query_terms)).toBe(true);

    // Validate first suggestion structure
    if (searchSuggestResponse?.query_terms?.length > 0) {
      const firstSuggestion = searchSuggestResponse.query_terms[0];
      expect.soft(firstSuggestion).toHaveProperty('text');
      expect.soft(firstSuggestion).toHaveProperty('highlighted');
      expect.soft(firstSuggestion).toHaveProperty('entity');
      expect.soft(firstSuggestion.entity).toHaveProperty('type');
      
      console.log(`✅ Valid suggestion: "${firstSuggestion.text}"`);
    }
  });

  // Business Logic Validation
  await test.step('🔍 Validate Business Rules', async () => {
    const suggestions = searchSuggestResponse?.query_terms || [];
    expect.soft(suggestions.length, 'Should have at least one suggestion').toBeGreaterThan(0);
    
    // Log actual count for reference
    console.log(`📊 Received ${suggestions.length} suggestions (API may return more than UI limit)`);

    // Verify highlighted text contains the search term
    if (suggestions.length > 0) {
      const firstSuggestion = suggestions[0];
      expect.soft(firstSuggestion.highlighted.toLowerCase(), 'First suggestion should contain search term').toContain('train');
    }
  });
});
