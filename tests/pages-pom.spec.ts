import { test, expect } from './baseTest';
import { HomePage } from '../src/pages/HomePage';
import { SearchResultsPage } from '../src/pages/SearchResultsPage';
import { LotPage } from '../src/pages/LotPage';

/**
 * Page Object Model Tests
 * Validates that updated POM classes work correctly with discovered selectors
 */

test('POM Test - Search flow using Page Objects', async ({ consentedPage: page }) => {
  test.setTimeout(60000); // Increase timeout for slow Catawiki loads
  
  // Initialize Page Objects
  const homePage = new HomePage(page);
  const searchPage = new SearchResultsPage(page);
  const lotPage = new LotPage(page);

  // Step 1: Navigate to homepage (already there via consentedPage)
  await test.step('🏠 Verify on HomePage', async () => {
    const url = page.url();
    console.log(`Current URL: ${url}`);
    expect(url).toContain('catawiki.com');
  });

  // Step 2: Perform search using HomePage POM
  await test.step('🔍 Search for "train" using HomePage POM', async () => {
    await homePage.search('train');
  });

  // Step 3: Verify on search results page
  await test.step('📋 Verify SearchResultsPage', async () => {
    const isOpen = await searchPage.isOpen();
    expect(isOpen, 'Should be on search results page').toBe(true);
    
    const resultsCount = await searchPage.getResultsCount();
    console.log(`Found ${resultsCount} search results`);
    expect(resultsCount, 'Should have search results').toBeGreaterThan(0);
  });

  // Step 4: Open first lot using SearchResultsPage POM
  await test.step('🎯 Open first lot using SearchResultsPage POM', async () => {
    await searchPage.openLotByIndex(0);
  });

  // Step 5: Verify on lot page and get details
  await test.step('📦 Verify LotPage and extract details', async () => {
    const isOpen = await lotPage.isOpen();
    expect(isOpen, 'Should be on lot details page').toBe(true);
    
    const details = await lotPage.getLotDetails();
    console.log('Lot details:', JSON.stringify(details, null, 2));
    
    // Attach to report
    test.info().attach('Lot Details via POM', {
      body: JSON.stringify(details, null, 2),
      contentType: 'application/json'
    });
    
    // Validate details were extracted
    expect.soft(details.name, 'Should have lot name').toBeTruthy();
    expect.soft(details.currentBid, 'Should have current bid').toBeTruthy();
    
    console.log(`✅ Lot: ${details.name}`);
    console.log(`💰 Bid: ${details.currentBid}`);
    if (details.favorites) {
      console.log(`❤️ ${details.favorites}`);
    }
  });
});
