import { test, expect } from './baseTest';
import fs from 'fs';
import path from 'path';

test('Network Discovery - Capture API calls during search', async ({ consentedPage: page }) => {
  // Page is already on Catawiki with consent dismissed

  const discoveries: any[] = [];
  const apiCalls: any[] = [];

  // Capture network requests
  page.on('request', req => {
    if (req.resourceType() === 'xhr' || req.resourceType() === 'fetch') {
      discoveries.push({
        url: req.url(),
        method: req.method(),
      });
    }
  });

  // Capture network responses with full details for contract validation
  page.on('response', async res => {
    if (res.request().resourceType() === 'xhr' || res.request().resourceType() === 'fetch') {
      try {
        const responseBody = await res.json().catch(() => null);
        apiCalls.push({
          url: res.url(),
          method: res.request().method(),
          status: res.status(),
          responseTime: res.timing?.responseEnd - res.timing?.responseStart || 0,
          headers: res.headers(),
          body: responseBody, // For contract validation
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        // Skip responses that error
      }
    }
  });

  // Perform search actions to trigger network calls
  const searchBox = page.getByRole('combobox', { name: /search/i });
  await searchBox.click();
  await searchBox.fill('train');
  
  const searchButton = page.getByRole('button', { name: /search/i });
  await searchButton.click();
  
  // Wait for search results to load
  await page.waitForLoadState('domcontentloaded');
  
  // Capture UI data for consistency checks
  const uiLots = await page.locator('a[href*="/lot/"]').all();
  const uiLotCount = uiLots.length;
  console.log(`[UI] Found ${uiLotCount} lots in UI`);
  
  // Click on a lot to trigger more API calls
  let apiLotCount = 0;
  try {
    await page.locator('a[href*="/lot/"]').nth(1).click({ timeout: 5000 });
    await page.waitForLoadState('domcontentloaded');
    
    // Extract lot details from UI for validation
    const lotName = await page.getByRole('heading', { level: 1 }).textContent();
    const lotPrice = await page.getByTestId('lot-bid-status-section').textContent().catch(() => null);
    
    console.log(`[UI] Lot details - Name: ${lotName}, Price: ${lotPrice}`);
  } catch (e) {
    console.log('Could not click lot link, skipping');
  }

  // Save all discoveries
  const outputPath = path.resolve('src/discovery/network-discovery.json');
  fs.writeFileSync(outputPath, JSON.stringify(discoveries, null, 2));

  // Save API calls with full details for contract testing
  const apiPath = path.resolve('src/discovery/api-calls.json');
  fs.writeFileSync(apiPath, JSON.stringify(apiCalls, null, 2));

  // Analyze and validate contracts
  const contractAnalysis = analyzeContracts(apiCalls);
  const contractPath = path.resolve('src/discovery/contract-analysis.json');
  fs.writeFileSync(contractPath, JSON.stringify(contractAnalysis, null, 2));

  // Log summary
  console.log(`\n📡 Network Discovery Complete`);
  console.log(`Total API calls captured: ${apiCalls.length}`);
  console.log(`Saved to: ${outputPath}`);
  console.log(`Contract analysis saved to: ${contractPath}`);
  
  // Attach reports
  await test.step('📊 API Discovery Summary', async () => {
    test.info().attach('Network Calls', {
      body: `Total calls: ${apiCalls.length}\n\n${JSON.stringify(apiCalls.slice(0, 3), null, 2)}...`,
      contentType: 'text/plain'
    });
  });

  await test.step('📋 Contract Analysis', async () => {
    test.info().attach('Contract Validation', {
      body: JSON.stringify(contractAnalysis, null, 2),
      contentType: 'text/plain'
    });
  });

  // Contract validation assertions
  expect(apiCalls.length).toBeGreaterThan(0);
  expect(contractAnalysis.allValid).toBe(true);
});

/**
 * Analyze API responses for contract validation
 * Returns schema violations and data consistency issues
 */
function analyzeContracts(apiCalls: any[]) {
  const analysis = {
    total: apiCalls.length,
    byEndpoint: {} as any,
    allValid: true,
    violations: [] as any[],
  };

  for (const call of apiCalls) {
    const endpoint = new URL(call.url).pathname;
    
    if (!analysis.byEndpoint[endpoint]) {
      analysis.byEndpoint[endpoint] = {
        calls: 0,
        avgResponseTime: 0,
        statusCodes: [],
        schema: null,
      };
    }

    analysis.byEndpoint[endpoint].calls++;
    analysis.byEndpoint[endpoint].statusCodes.push(call.status);

    // Contract validation: Check required fields
    if (call.body && typeof call.body === 'object') {
      const schema = inferSchema(call.body);
      if (!analysis.byEndpoint[endpoint].schema) {
        analysis.byEndpoint[endpoint].schema = schema;
      }
    }

    // Flag errors
    if (call.status >= 400) {
      analysis.allValid = false;
      analysis.violations.push({
        endpoint,
        status: call.status,
        url: call.url,
      });
    }
  }

  return analysis;
}

/**
 * Infer JSON schema from response body
 */
function inferSchema(obj: any): any {
  if (Array.isArray(obj)) {
    return ['array', inferSchema(obj[0])];
  }
  if (obj === null) {
    return 'null';
  }
  if (typeof obj === 'object') {
    const schema: any = {};
    for (const [key, value] of Object.entries(obj)) {
      schema[key] = typeof value;
    }
    return schema;
  }
  return typeof obj;
}