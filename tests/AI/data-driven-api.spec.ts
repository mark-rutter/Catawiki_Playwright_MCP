import { test, expect } from '../baseTest';

/**
 * Data-Driven API Test Example
 * Tests multiple search terms to validate API behavior across different entity types
 * Entity types discovered: query_term, seller, category, auction, collection
 */

const searchTestCases = [
  { 
    keyword: 'train', 
    minSuggestions: 1,
    expectedEntityTypes: ['query_term', 'seller', 'category', 'auction'],
    description: 'Popular search term - should return mixed entity types'
  },
  { 
    keyword: 'watch', 
    minSuggestions: 1,
    expectedEntityTypes: ['query_term', 'seller', 'category', 'auction'],
    description: 'Common product search - should return sellers and categories'
  },
  { 
    keyword: 'art', 
    minSuggestions: 1,
    expectedEntityTypes: ['query_term', 'seller', 'collection', 'category'],
    description: 'Broad category - should include collections'
  },
  { 
    keyword: 'rolex', 
    minSuggestions: 1,
    expectedEntityTypes: ['query_term', 'seller', 'auction'],
    description: 'Brand name - should return brand-related entities'
  },
];

for (const testCase of searchTestCases) {
  test(`Search Suggest API - "${testCase.keyword}" (${testCase.description})`, async ({ consentedPage: page }) => {
    let apiResponse: any = null;

    // Intercept API call
    page.on('response', async (response) => {
      if (response.url().includes('/buyer/api/v1/search/suggest')) {
        apiResponse = await response.json().catch(() => null);
      }
    });

    // Trigger search
    const searchBox = page.getByRole('combobox', { name: /search/i });
    await searchBox.click();
    await searchBox.fill(testCase.keyword);
    await page.waitForTimeout(1500);

    // Validate API response
    await test.step(`✅ Validate "${testCase.keyword}" suggestions`, async () => {
      expect.soft(apiResponse, 'API should return a response').not.toBeNull();
      expect.soft(apiResponse?.query_terms, 'Response should have query_terms').toBeDefined();
      
      const suggestions = apiResponse?.query_terms || [];
      expect.soft(suggestions.length, `Should have at least ${testCase.minSuggestions} suggestion(s)`).toBeGreaterThanOrEqual(testCase.minSuggestions);

      // Collect and analyze entity types
      const entityTypeMap = new Map<string, string[]>();
      
      for (const suggestion of suggestions) {
        expect.soft(suggestion, 'Suggestion should have text').toHaveProperty('text');
        expect.soft(suggestion, 'Suggestion should have entity').toHaveProperty('entity');
        expect.soft(suggestion.entity, 'Entity should have type').toHaveProperty('type');
        
        const entityType = suggestion.entity?.type;
        if (entityType) {
          if (!entityTypeMap.has(entityType)) {
            entityTypeMap.set(entityType, []);
          }
          entityTypeMap.get(entityType)!.push(suggestion.text);
        }
      }

      // Verify entity type structure
      await test.step('🔍 Analyze Entity Types', async () => {
        const foundTypes = Array.from(entityTypeMap.keys());
        console.log(`📊 Found entity types: ${foundTypes.join(', ')}`);
        
        // Log samples for each entity type
        for (const [type, examples] of entityTypeMap.entries()) {
          console.log(`   ${type}: ${examples.slice(0, 2).join(', ')} (${examples.length} total)`);
          
          // Verify expected entity types are present (soft assertion)
          if (testCase.expectedEntityTypes.includes(type)) {
            console.log(`   ✅ Expected type "${type}" found`);
          }
        }

        // Check if at least one expected type is present
        const hasExpectedType = testCase.expectedEntityTypes.some(expected => foundTypes.includes(expected));
        expect.soft(hasExpectedType, `Should contain at least one of: ${testCase.expectedEntityTypes.join(', ')}`).toBe(true);
      });

      // Validate entity-specific structures
      await test.step('📋 Validate Entity Structures', async () => {
        for (const suggestion of suggestions.slice(0, 5)) {
          const entityType = suggestion.entity?.type;
          
          switch (entityType) {
            case 'query_term':
              // Query terms should have highlighted text
              expect.soft(suggestion, 'Query term should have highlighted field').toHaveProperty('highlighted');
              break;
            case 'seller':
            case 'auction':
              // Sellers and auctions should have text
              expect.soft(suggestion.text, 'Seller/Auction should have non-empty text').toBeTruthy();
              break;
            case 'category':
            case 'collection':
              // Categories and collections should have text
              expect.soft(suggestion.text, 'Category/Collection should have non-empty text').toBeTruthy();
              break;
          }
        }
      });
      
      // Attach detailed report
      test.info().attach(`${testCase.keyword} - Entity Analysis`, {
        body: JSON.stringify({
          keyword: testCase.keyword,
          totalSuggestions: suggestions.length,
          entityTypes: Object.fromEntries(
            Array.from(entityTypeMap.entries()).map(([type, examples]) => [
              type, 
              { count: examples.length, samples: examples.slice(0, 3) }
            ])
          ),
          expectedTypes: testCase.expectedEntityTypes,
          foundTypes: Array.from(entityTypeMap.keys())
        }, null, 2),
        contentType: 'application/json'
      });
    });
  });
}
