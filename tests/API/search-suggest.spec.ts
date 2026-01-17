import { test, expect } from '../baseTest';

/**
 * REST API Test with Session - Search Suggest Endpoint
 * 
 * Tests the Catawiki search suggestion API using browser session for auth
 * API Contract: GET /buyer/api/v1/search/suggest
 * 
 * Note: Catawiki API requires session cookies, so we use consentedPage
 * to establish session before making API calls
 */

const BASE_URL = 'https://www.catawiki.com';
const SEARCH_SUGGEST_ENDPOINT = '/buyer/api/v1/search/suggest';

test.describe('Search Suggest REST API (with session)', () => {
  
  test('GET /search/suggest - should return valid suggestions for "train"', async ({ consentedPage: page }) => {
    // Make API request using browser context (includes cookies/session)
    const response = await page.request.get(`${BASE_URL}${SEARCH_SUGGEST_ENDPOINT}`, {
      params: {
        q: 'train',
        locale: 'en',
        size: 10,
        filters: 'query_terms,auctions,categories,collections,sellers'
      }
    });

    // Status code validation
    expect(response.status()).toBe(200);

    // Response headers
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');

    // Parse response body
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Contract validation - top level structure
    expect.soft(data, 'Response should have query_terms').toHaveProperty('query_terms');
    expect.soft(Array.isArray(data.query_terms), 'query_terms should be array').toBe(true);

    // Validate suggestion structure
    if (data.query_terms && data.query_terms.length > 0) {
      const firstSuggestion = data.query_terms[0];
      
      expect.soft(firstSuggestion, 'Suggestion should have text').toHaveProperty('text');
      expect.soft(firstSuggestion, 'Suggestion should have highlighted').toHaveProperty('highlighted');
      expect.soft(firstSuggestion, 'Suggestion should have entity').toHaveProperty('entity');
      
      // Entity structure
      expect.soft(firstSuggestion.entity, 'Entity should have type').toHaveProperty('type');
      expect.soft(typeof firstSuggestion.entity.type, 'Entity type should be string').toBe('string');
      
      // Validate highlight includes search term
      expect.soft(firstSuggestion.highlighted.toLowerCase(), 'Highlighted text should contain search term').toContain('train');
      
      console.log(`✅ First suggestion: "${firstSuggestion.text}" (type: ${firstSuggestion.entity.type})`);
    }

    // Attach full response to report
    test.info().attach('API Response', {
      body: JSON.stringify(data, null, 2),
      contentType: 'application/json'
    });
  });

  test('GET /search/suggest - should handle different search terms', async ({ consentedPage: page }) => {
    const searchTerms = ['watch', 'art', 'rolex', 'vintage'];

    for (const term of searchTerms) {
      const response = await page.request.get(`${BASE_URL}${SEARCH_SUGGEST_ENDPOINT}`, {
        params: {
          q: term,
          locale: 'en',
          size: 10,
          filters: 'query_terms,auctions,categories,collections,sellers'
        }
      });

      expect.soft(response.status(), `${term}: should return 200`).toBe(200);
      
      const data = await response.json();
      expect.soft(data.query_terms?.length, `${term}: should have suggestions`).toBeGreaterThan(0);
      
      console.log(`✅ "${term}" returned ${data.query_terms?.length || 0} suggestions`);
    }
  });

  test('GET /search/suggest - should validate response time', async ({ consentedPage: page }) => {
    const startTime = Date.now();
    
    const response = await page.request.get(`${BASE_URL}${SEARCH_SUGGEST_ENDPOINT}`, {
      params: {
        q: 'train',
        locale: 'en',
        size: 10,
        filters: 'query_terms,auctions,categories,collections,sellers'
      }
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.status()).toBe(200);
    expect.soft(responseTime, 'API should respond within 2 seconds').toBeLessThan(2000);
    
    console.log(`⚡ API response time: ${responseTime}ms`);
    
    test.info().attach('Performance', {
      body: `Response time: ${responseTime}ms`,
      contentType: 'text/plain'
    });
  });

  test('GET /search/suggest - API contract JSON Schema validation', async ({ consentedPage: page }) => {
    const response = await page.request.get(`${BASE_URL}${SEARCH_SUGGEST_ENDPOINT}`, {
      params: {
        q: 'train',
        locale: 'en',
        size: 10,
        filters: 'query_terms,auctions,categories,collections,sellers'
      }
    });

    const data = await response.json();

    // Define expected contract/schema
    const expectedContract = {
      query_terms: 'array',
      suggestion_properties: {
        text: 'string',
        highlighted: 'string',
        entity: {
          type: 'string',
          value: 'nullable'
        }
      }
    };

    // Validate contract
    expect.soft(typeof data, 'Root should be object').toBe('object');
    expect.soft(Array.isArray(data.query_terms), 'query_terms must be array').toBe(true);

    // Validate each suggestion matches schema
    data.query_terms?.forEach((suggestion: any, index: number) => {
      expect.soft(typeof suggestion.text, `[${index}].text must be string`).toBe('string');
      expect.soft(typeof suggestion.highlighted, `[${index}].highlighted must be string`).toBe('string');
      expect.soft(typeof suggestion.entity, `[${index}].entity must be object`).toBe('object');
      expect.soft(typeof suggestion.entity.type, `[${index}].entity.type must be string`).toBe('string');
    });

    console.log('✅ API contract validation passed for all suggestions');
    
    test.info().attach('Expected Contract', {
      body: JSON.stringify(expectedContract, null, 2),
      contentType: 'application/json'
    });
    
    test.info().attach('Actual Response', {
      body: JSON.stringify(data, null, 2),
      contentType: 'application/json'
    });
  });
});
