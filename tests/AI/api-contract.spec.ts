import { test, expect } from '../baseTest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * API Contract Test - Data-Driven
 * Validates that API responses match expected schema structure
 * Based on services discovered in discovery.spec.ts
 * Tests multiple search terms from JSON test data
 */

// Load test data from JSON
const testDataPath = path.join(__dirname, '../../src/testcases/trainFlowCases.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

testData.cases.forEach((testCase: any) => {
  test(`Search Suggest API Contract - ${testCase.description}`, async ({ consentedPage: page }) => {
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
    await searchBox.fill(testCase.keyword);

    // Wait for API to be called
    await page.waitForTimeout(2000);

    // Attach API response to report
    await test.step(`📋 API Response Captured for "${testCase.keyword}"`, async () => {
      test.info().attach('Search Suggest Response', {
        body: JSON.stringify(searchSuggestResponse, null, 2),
        contentType: 'application/json'
      });
    });

    // Contract Assertions
    await test.step('✅ Validate Response Schema', async () => {
      expect.soft(searchSuggestResponse, 'API response should not be null').not.toBeNull();
      expect.soft(searchSuggestResponse, 'Response should have query_terms').toHaveProperty('query_terms');
      expect.soft(Array.isArray(searchSuggestResponse.query_terms), 'query_terms should be array').toBe(true);

      // Validate first suggestion structure
      if (searchSuggestResponse?.query_terms?.length > 0) {
        const firstSuggestion = searchSuggestResponse.query_terms[0];
        expect.soft(firstSuggestion, 'Suggestion should have text').toHaveProperty('text');
        expect.soft(firstSuggestion, 'Suggestion should have highlighted').toHaveProperty('highlighted');
        expect.soft(firstSuggestion, 'Suggestion should have entity').toHaveProperty('entity');
        expect.soft(firstSuggestion.entity, 'Entity should have type').toHaveProperty('type');
        
        console.log(`✅ Valid suggestion for "${testCase.keyword}": "${firstSuggestion.text}"`);
      }
    });

    // Business Logic Validation
    await test.step('🔍 Validate Business Rules', async () => {
      const suggestions = searchSuggestResponse?.query_terms || [];
      expect.soft(suggestions.length, 'Should have at least one suggestion').toBeGreaterThan(0);
      
      // Log actual count for reference
      console.log(`📊 "${testCase.keyword}" returned ${suggestions.length} suggestions`);

      // Verify highlighted text contains the search term
      if (suggestions.length > 0) {
        const firstSuggestion = suggestions[0];
        expect.soft(
          firstSuggestion.highlighted.toLowerCase(), 
          `First suggestion should contain search term "${testCase.keyword}"`
        ).toContain(testCase.keyword.toLowerCase());
      }
    });

    // Data Type Validation
    await test.step('🔬 Validate Data Types', async () => {
      const suggestions = searchSuggestResponse?.query_terms || [];
      
      suggestions.slice(0, 3).forEach((suggestion: any, index: number) => {
        expect.soft(typeof suggestion.text, `[${index}] text should be string`).toBe('string');
        
        // highlighted can be string or object (some suggestions have complex highlighting)
        const highlightedType = typeof suggestion.highlighted;
        expect.soft(['string', 'object'].includes(highlightedType), 
          `[${index}] highlighted should be string or object, got ${highlightedType}`
        ).toBe(true);
        
        expect.soft(typeof suggestion.entity, `[${index}] entity should be object`).toBe('object');
        expect.soft(typeof suggestion.entity.type, `[${index}] entity.type should be string`).toBe('string');
      });
      
      console.log(`✅ Data type validation passed for "${testCase.keyword}"`);
    });
  });
});
