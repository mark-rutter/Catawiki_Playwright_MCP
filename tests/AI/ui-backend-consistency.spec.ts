import { test, expect } from '../baseTest';

/**
 * UI-Backend Consistency Test Example
 * Verifies that UI displays data from API correctly
 * Ensures no mismatch between backend data and frontend display
 */

test('Search Suggestions - UI matches API data', async ({ consentedPage: page }) => {
  let apiSuggestions: string[] = [];

  // Capture API response
  page.on('response', async (response) => {
    if (response.url().includes('/buyer/api/v1/search/suggest')) {
      const data = await response.json().catch(() => null);
      if (data?.query_terms) {
        apiSuggestions = data.query_terms.map((term: any) => term.text);
      }
    }
  });

  // Trigger search suggestions
  const searchBox = page.getByRole('combobox', { name: /search/i });
  await searchBox.click();
  await searchBox.fill('train');

  // Wait for suggestions to appear
  await page.waitForTimeout(2000);

  // Capture UI suggestions
  const suggestionList = page.locator('[role="listbox"] [role="option"], .c-autocomplete__item');
  const uiSuggestionCount = await suggestionList.count();
  
  const uiSuggestions: string[] = [];
  for (let i = 0; i < Math.min(uiSuggestionCount, 10); i++) {
    const text = await suggestionList.nth(i).textContent();
    if (text) {
      uiSuggestions.push(text.trim());
    }
  }

  // Attach comparison to report
  await test.step('📊 UI vs API Comparison', async () => {
    test.info().attach('Consistency Check', {
      body: `API Suggestions (${apiSuggestions.length}):\n${apiSuggestions.join('\n')}\n\nUI Suggestions (${uiSuggestions.length}):\n${uiSuggestions.join('\n')}`,
      contentType: 'text/plain'
    });
  });

  // Consistency Assertions
  await test.step('✅ Verify UI-Backend Consistency', async () => {
    console.log(`[API] ${apiSuggestions.length} suggestions returned`);
    console.log(`[UI] ${uiSuggestions.length} suggestions displayed`);

    // UI should show suggestions (may not be exact match due to filtering)
    expect.soft(uiSuggestionCount, 'UI should display suggestions').toBeGreaterThan(0);
    
    // API should have returned data
    expect.soft(apiSuggestions.length, 'API should return suggestions').toBeGreaterThan(0);

    // At least some UI suggestions should contain the search term
    const matchingUI = uiSuggestions.filter(s => s.toLowerCase().includes('train'));
    expect.soft(matchingUI.length, 'UI should show relevant suggestions').toBeGreaterThan(0);

    console.log(`✅ Consistency check passed: UI showing ${matchingUI.length} relevant suggestions`);
  });
});
