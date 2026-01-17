import { test, expect } from '../baseTest';

/**
 * Performance Test Example
 * Monitors API response times and performance thresholds
 * Based on discovered services from discovery.spec.ts
 */

test('Search API - Performance Benchmarks', async ({ consentedPage: page }) => {
  const apiMetrics: any[] = [];

  // Capture API performance metrics
  page.on('response', async (response) => {
    const url = response.url();
    
    if (url.includes('/buyer/api/v1/search/')) {
      const request = response.request();
      const timing = request.timing();
      
      const metric = {
        endpoint: new URL(url).pathname,
        method: request.method(),
        status: response.status(),
        responseTime: timing.responseEnd - timing.requestStart,
        timestamp: new Date().toISOString(),
      };
      
      apiMetrics.push(metric);
      console.log(`⏱️  ${metric.endpoint}: ${metric.responseTime.toFixed(2)}ms`);
    }
  });

  // Perform search flow
  const searchBox = page.getByRole('combobox', { name: /search/i });
  await searchBox.click();
  await searchBox.fill('train');
  
  // Wait for autocomplete
  await page.waitForTimeout(2000);
  
  // Submit search
  const searchButton = page.getByRole('button', { name: /search/i });
  await searchButton.click();
  
  // Wait for search results
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Attach performance report
  await test.step('📊 Performance Report', async () => {
    const report = apiMetrics.map(m => 
      `${m.endpoint} (${m.method}): ${m.responseTime.toFixed(2)}ms - Status: ${m.status}`
    ).join('\n');
    
    test.info().attach('API Performance Metrics', {
      body: report,
      contentType: 'text/plain'
    });
  });

  // Performance Assertions
  await test.step('⚡ Validate Performance Thresholds', async () => {
    expect.soft(apiMetrics.length, 'Should have captured API metrics').toBeGreaterThan(0);

    for (const metric of apiMetrics) {
      // Search APIs should respond within 2 seconds
      expect.soft(metric.responseTime, `${metric.endpoint} should respond within 2s`).toBeLessThan(2000);
      
      // All APIs should return successful status
      expect.soft(metric.status, `${metric.endpoint} should return success status`).toBeLessThan(400);
      
      // Log performance
      if (metric.responseTime > 1000) {
        console.warn(`⚠️  Slow API: ${metric.endpoint} took ${metric.responseTime.toFixed(2)}ms`);
      } else {
        console.log(`✅ Fast API: ${metric.endpoint} took ${metric.responseTime.toFixed(2)}ms`);
      }
    }

    // Calculate average response time
    if (apiMetrics.length > 0) {
      const avgResponseTime = apiMetrics.reduce((sum, m) => sum + m.responseTime, 0) / apiMetrics.length;
      console.log(`\n📊 Average API Response Time: ${avgResponseTime.toFixed(2)}ms`);
      
      expect.soft(avgResponseTime, 'Average response time should be under 1.5s').toBeLessThan(1500);
    }
  });
});
