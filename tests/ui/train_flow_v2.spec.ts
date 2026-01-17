import { test, expect } from '../baseTest';
import { HomePage } from '../../src/pages/HomePage';
import { SearchResultsPage } from '../../src/pages/SearchResultsPage';
import { LotPage } from '../../src/pages/LotPage';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Train Flow V2 - Data-Driven Using Page Object Models
 * 
 * Improvements over V1:
 * - Uses stable Page Object abstraction
 * - More comprehensive soft validations
 * - Better error handling and reporting
 * - Validates POM methods work correctly
 * - Data-driven: supports multiple keywords and lot indices
 */

// Load test cases from JSON
const testDataPath = path.join(__dirname, '../../src/testcases/trainFlowCases.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

testData.cases.forEach((testCase: any) => {
  test(`Train Flow V2 - ${testCase.description}`, async ({ consentedPage: page }) => {
    test.setTimeout(60000); // Allow time for slow Catawiki loads
    
    // Initialize Page Objects
    const homePage = new HomePage(page);
    const searchPage = new SearchResultsPage(page);
    const lotPage = new LotPage(page);

    // Step 1: Verify we're on the homepage
    await test.step('🏠 Verify HomePage', async () => {
      const url = page.url();
      expect.soft(url, 'Should be on Catawiki homepage').toContain('catawiki.com');
      console.log(`✅ On homepage: ${url}`);
    });

    // Step 2: Perform search using HomePage POM
    await test.step(`🔍 Search for "${testCase.keyword}" using HomePage POM`, async () => {
      await homePage.search(testCase.keyword);
      await page.waitForLoadState('domcontentloaded').catch(() => null);
      
      // Validate navigation occurred
      const currentUrl = page.url();
      expect.soft(currentUrl, 'Should navigate after search').not.toBe('https://www.catawiki.com/en');
      expect.soft(currentUrl, 'URL should contain search keyword').toContain(testCase.keyword);
      console.log(`✅ Search executed for "${testCase.keyword}", navigated to: ${currentUrl}`);
    });

    // Step 3: Validate SearchResultsPage POM
    await test.step('📋 Validate SearchResultsPage', async () => {
      const isOpen = await searchPage.isOpen();
      expect.soft(isOpen, 'SearchResultsPage.isOpen() should return true').toBe(true);
      
      const resultsCount = await searchPage.getResultsCount();
      expect.soft(resultsCount, 'Should have search results').toBeGreaterThan(0);
      expect.soft(resultsCount, `Should meet minimum expected results (${testCase.expectedMinResults})`).toBeGreaterThanOrEqual(testCase.expectedMinResults);
      expect.soft(resultsCount, 'Should have reasonable number of results').toBeLessThan(100);
      
      console.log(`✅ Found ${resultsCount} search results for "${testCase.keyword}"`);
      
      // Attach results count to report
      test.info().attach('Search Results Count', {
        body: `Found ${resultsCount} lots matching "${testCase.keyword}"`,
        contentType: 'text/plain'
      });
    });

    // Step 4: Navigate to specific lot using SearchResultsPage POM
    await test.step(`🎯 Open lot at index ${testCase.lotIndex} using SearchResultsPage POM`, async () => {
      const lotIndex = testCase.lotIndex;
      
      // Validate method doesn't throw
      try {
        await searchPage.openLotByIndex(lotIndex);
        console.log(`✅ Successfully navigated to lot at index ${lotIndex} for "${testCase.keyword}"`);
      } catch (error) {
        expect.soft(false, `openLotByIndex(${lotIndex}) should not throw`).toBe(true);
        console.error(`❌ Failed to open lot: ${error}`);
        return; // Exit early if navigation fails
      }
      
      // Wait for lot page to load
      await page.waitForLoadState('domcontentloaded').catch(() => null);
    });

    // Step 5: Validate LotPage POM and extract details
    await test.step('📦 Validate LotPage and extract details', async () => {
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
        `📦 Lot Details (${testCase.description})`,
        '═══════════════════════════════════════',
        `🔍 Search     : "${testCase.keyword}"`,
        `📍 Lot Index  : ${testCase.lotIndex}`,
        `📌 Name       : ${details.name ?? 'NOT FOUND'}`,
        `💰 Bid Status : ${details.currentBid ?? 'NOT FOUND'}`,
        `❤️  Watchers   : ${details.favorites ?? 'None watching'}`,
        '═══════════════════════════════════════'
      ].join('\n');
      
      console.log('\n' + report + '\n');
      
      // Attach test case info
      test.info().attach('Test Case', {
        body: JSON.stringify(testCase, null, 2),
        contentType: 'application/json'
      });
      
      // Attach to HTML report as JSON
      test.info().attach('Lot Details (JSON)', {
        body: JSON.stringify(details, null, 2),
        contentType: 'application/json'
      });
      
      // Attach formatted report
      test.info().attach('Lot Details (Formatted)', {
        body: report,
        contentType: 'text/plain'
      });
    });

    // Step 6: Additional POM validations
    await test.step('✅ Validate POM methods integrity', async () => {
      // Validate that POM methods are callable and return expected types
      const isStillOnLotPage = await lotPage.isOpen();
      expect.soft(typeof isStillOnLotPage, 'isOpen() should return boolean').toBe('boolean');
      
      const details = await lotPage.getLotDetails();
      expect.soft(details, 'getLotDetails() should be callable multiple times').toBeTruthy();
      expect.soft(Object.keys(details).length, 'Details object should have properties').toBeGreaterThan(0);
      
      console.log(`✅ All POM methods validated successfully for "${testCase.keyword}" (lot ${testCase.lotIndex})`);
    });
  });
});
