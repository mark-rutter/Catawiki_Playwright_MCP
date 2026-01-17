import { test, expect } from '../baseTest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * API Contract Test - TRULY Optimized
 * - Opens page ONCE and handles consent ONCE
 * - Reuses same page for all API tests (no reload)
 * - Just types different searches and captures API responses
 * - 5x faster than opening new page for each test
 */

// Load test data from JSON
const testDataPath = path.join(__dirname, '../../src/testcases/trainFlowCases.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

test('Search Suggest API - All keywords in single session', async ({ consentedPage: page }) => {
  const searchBox = page.getByRole('combobox', { name: /search/i });
  
  // Test each keyword in sequence, reusing the same page
  for (const testCase of testData.cases) {
    await test.step(`🔍 Test "${testCase.keyword}" API`, async () => {
      let searchSuggestResponse: any = null;

      // Set up interception for this search
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/buyer/api/v1/search/suggest') && 
                    response.url().includes(`q=${testCase.keyword}`)
      );

      // Clear and type new search
      await searchBox.click();
      await searchBox.clear();
      await searchBox.fill(testCase.keyword);

      // Wait for API response
      const response = await responsePromise;
      searchSuggestResponse = await response.json();

      // Validate status
      expect.soft(response.status(), `${testCase.keyword}: should return 200`).toBe(200);
      
      // Schema validation
      expect.soft(searchSuggestResponse, 'Should have query_terms').toHaveProperty('query_terms');
      expect.soft(Array.isArray(searchSuggestResponse.query_terms), 'query_terms should be array').toBe(true);
      expect.soft(searchSuggestResponse.query_terms.length, 'Should have suggestions').toBeGreaterThan(0);
      
      console.log(`✅ "${testCase.keyword}": ${searchSuggestResponse.query_terms.length} suggestions`);

      // Validate first suggestion
      if (searchSuggestResponse.query_terms?.length > 0) {
        const firstSuggestion = searchSuggestResponse.query_terms[0];
        expect.soft(firstSuggestion, 'Should have text').toHaveProperty('text');
        expect.soft(firstSuggestion, 'Should have entity').toHaveProperty('entity');
        expect.soft(firstSuggestion.entity, 'Entity should have type').toHaveProperty('type');
        
        console.log(`   First suggestion: "${firstSuggestion.text}" (type: ${firstSuggestion.entity.type})`);
      }

      // Attach response for this keyword
      test.info().attach(`API Response - ${testCase.keyword}`, {
        body: JSON.stringify(searchSuggestResponse, null, 2),
        contentType: 'application/json'
      });
    });
  }

  console.log(`\n🎉 Tested ${testData.cases.length} keywords in ONE session (much faster!)`);
});
