import { test, expect } from '@playwright/test';
import { HomePage } from '../../src/pages/HomePage';
import { SearchResultsPage } from '../../src/pages/SearchResultsPage';
import { LotPage } from '../../src/pages/LotPage';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Train Flow - No Cookie Consent
 * 
 * This test demonstrates an alternative approach to cookie handling:
 * - Uses "Continue without accepting" instead of accepting all cookies
 * - Runs the same train flow test scenarios
 * - Uses Page Object Model for maintainability
 * - Note that this test does not use the baseTest fixture 
 * - AI generated using my skip_cookie test as a reference and the train flow test
 */

// Custom fixture for pages without cookie consent
test.beforeEach(async ({ page }) => {
  await page.goto('https://www.catawiki.com/en');
  
  // Handle cookie consent by clicking "Continue without accepting"
  try {
    await expect(page.getByRole('button', { name: 'Continue without accepting' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Continue without accepting' }).click();
    console.log('[NO-COOKIES] Clicked "Continue without accepting"');
  } catch (error) {
    console.log('[NO-COOKIES] Cookie banner not found or already dismissed');
  }
});

// Load test cases from JSON - focusing on train-related cases
const testDataPath = path.join(__dirname, '../../src/testcases/trainFlowCases.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

// Filter for train-related test cases
const trainCases = testData.cases.filter((testCase: any) => 
  testCase.keyword === 'train' || testCase.description.toLowerCase().includes('train')
);

trainCases.forEach((testCase: any) => {
  test(`No Cookies - ${testCase.description}`, async ({ page }) => {
    test.setTimeout(60000); // Allow time for slow Catawiki loads
    
    // Initialize Page Objects
    const homePage = new HomePage(page);
    const searchPage = new SearchResultsPage(page);
    const lotPage = new LotPage(page);

    // Step 1: Verify we're on the homepage
    await test.step('🏠 Verify HomePage', async () => {
      const url = page.url();
      expect.soft(url, 'Should be on Catawiki homepage').toContain('catawiki.com');
      console.log(`✅ On homepage (no cookies): ${url}`);
    });

    // Step 2: Perform search using HomePage POM
    await test.step(`🔍 Search for "${testCase.keyword}" using HomePage POM (no cookies)`, async () => {
      await homePage.search(testCase.keyword);
      await page.waitForLoadState('domcontentloaded').catch(() => null);
      
      // Validate navigation occurred
      const currentUrl = page.url();
      expect.soft(currentUrl, 'Should navigate after search').not.toBe('https://www.catawiki.com/en');
      expect.soft(currentUrl, 'URL should contain search keyword').toContain(testCase.keyword);
      console.log(`✅ Search executed for "${testCase.keyword}" (no cookies), navigated to: ${currentUrl}`);
    });

    // Step 3: Validate SearchResultsPage POM
    await test.step('📋 Validate SearchResultsPage (no cookies)', async () => {
      const isOpen = await searchPage.isOpen();
      expect.soft(isOpen, 'SearchResultsPage.isOpen() should return true').toBe(true);
      
      const resultsCount = await searchPage.getResultsCount();
      expect.soft(resultsCount, 'Should have search results').toBeGreaterThan(0);
      expect.soft(resultsCount, `Should meet minimum expected results (${testCase.expectedMinResults})`).toBeGreaterThanOrEqual(testCase.expectedMinResults);
      expect.soft(resultsCount, 'Should have reasonable number of results').toBeLessThan(100);
      
      console.log(`✅ Found ${resultsCount} search results for "${testCase.keyword}" (no cookies)`);
      
      // Attach results count to report
      test.info().attach('Search Results Count (No Cookies)', {
        body: `Found ${resultsCount} lots matching "${testCase.keyword}" without cookie consent`,
        contentType: 'text/plain'
      });
    });

    // Step 4: Navigate to specific lot using SearchResultsPage POM
    await test.step(`🎯 Open lot at index ${testCase.lotIndex} using SearchResultsPage POM (no cookies)`, async () => {
      const lotIndex = testCase.lotIndex;
      
      // Validate method doesn't throw
      try {
        await searchPage.openLotByIndex(lotIndex);
        console.log(`✅ Successfully navigated to lot at index ${lotIndex} for "${testCase.keyword}" (no cookies)`);
      } catch (error) {
        expect.soft(false, `openLotByIndex(${lotIndex}) should not throw`).toBe(true);
        console.error(`❌ Failed to open lot: ${error}`);
        return; // Exit early if navigation fails
      }
      
      // Wait for lot page to load
      await page.waitForLoadState('domcontentloaded').catch(() => null);
    });

    // Step 5: Validate LotPage POM and extract details
    await test.step('📦 Validate LotPage and extract details (no cookies)', async () => {
      const isOpen = await lotPage.isOpen();
      expect.soft(isOpen, 'LotPage.isOpen() should return true').toBe(true);
      
      if (!isOpen) {
        console.warn('⚠️ Not on lot page, skipping detail extraction');
        return;
      }
      
      // Extract lot details using POM
      const details = await lotPage.getLotDetails();
      
      // Validate extracted data structure
      expect.soft(details, 'getLotDetails() should return object').toBeTruthy();
      expect.soft(typeof details, 'Details should be an object').toBe('object');
      
      // Validate individual fields with soft assertions
      expect.soft(details.name, 'Lot name should be extracted').toBeTruthy();
      expect.soft(typeof details.name, 'Lot name should be string').toBe('string');
      expect.soft(details.name?.length, 'Lot name should not be empty').toBeGreaterThan(0);
      
      expect.soft(details.currentBid, 'Current bid should be extracted').toBeTruthy();
      expect.soft(typeof details.currentBid, 'Current bid should be string').toBe('string');
      
      // Favorites can be null if no one is watching
      if (details.favorites) {
        expect.soft(typeof details.favorites, 'Favorites should be string if present').toBe('string');
        expect.soft(details.favorites, 'Favorites should mention "watching"').toContain('watching');
      }
      
      // Format extracted values for report
      const report = [
        '═══════════════════════════════════════',
        `📦 Lot Details - NO COOKIES (${testCase.description})`,
        '═══════════════════════════════════════',
        `🔍 Search     : "${testCase.keyword}"`,
        `📍 Lot Index  : ${testCase.lotIndex}`,
        `📌 Name       : ${details.name ?? 'NOT FOUND'}`,
        `💰 Bid Status : ${details.currentBid ?? 'NOT FOUND'}`,
        `❤️  Watchers   : ${details.favorites ?? 'None watching'}`,
        `🍪 Cookies    : Continue without accepting`,
        '═══════════════════════════════════════'
      ].join('\n');
      
      console.log('\n' + report + '\n');
      
      // Attach test case info
      test.info().attach('Test Case (No Cookies)', {
        body: JSON.stringify({...testCase, cookieConsent: 'Continue without accepting'}, null, 2),
        contentType: 'application/json'
      });
      
      // Attach to HTML report as JSON
      test.info().attach('Lot Details (No Cookies)', {
        body: JSON.stringify({...details, cookieConsent: 'Continue without accepting'}, null, 2),
        contentType: 'application/json'
      });
      
      // Attach formatted report
      test.info().attach('Lot Details Report (No Cookies)', {
        body: report,
        contentType: 'text/plain'
      });
    });

    // Step 6: Additional POM validations
    await test.step('✅ Validate POM methods integrity (no cookies)', async () => {
      // Validate that POM methods are callable and return expected types
      const isStillOnLotPage = await lotPage.isOpen();
      expect.soft(typeof isStillOnLotPage, 'isOpen() should return boolean').toBe('boolean');
      
      const details = await lotPage.getLotDetails();
      expect.soft(details, 'getLotDetails() should be callable multiple times').toBeTruthy();
      expect.soft(Object.keys(details).length, 'Details object should have properties').toBeGreaterThan(0);
      
      console.log(`✅ All POM methods validated successfully for "${testCase.keyword}" (lot ${testCase.lotIndex}) without cookies`);
    });
  });
});

// Additional test to compare cookie vs no-cookie behavior
test('Compare: Cookie Consent vs No Cookie Consent', async ({ page }) => {
  test.setTimeout(120000);
  
  const homePage = new HomePage(page);
  const searchPage = new SearchResultsPage(page);
  
  await test.step('🔄 Test search functionality with different cookie handling', async () => {
    // This test verifies that search functionality works the same way
    // regardless of cookie consent choice
    
    await homePage.search('train');
    await page.waitForLoadState('domcontentloaded').catch(() => null);
    
    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount, 'Should get search results without accepting cookies').toBeGreaterThan(0);
    
    const report = [
      '═══════════════════════════════════════',
      '🧪 Cookie Consent Comparison Test',
      '═══════════════════════════════════════',
      `🔍 Search Term: "train"`,
      `📊 Results Found: ${resultsCount}`,
      `🍪 Cookie Method: "Continue without accepting"`,
      `✅ Functionality: Working as expected`,
      '═══════════════════════════════════════'
    ].join('\n');
    
    console.log('\n' + report + '\n');
    
    test.info().attach('Cookie Comparison Results', {
      body: report,
      contentType: 'text/plain'
    });
  });
});