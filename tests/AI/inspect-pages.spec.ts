import { test, expect } from '../baseTest';

test('Inspect HomePage elements', async ({ consentedPage: page }) => {
  // Page is already on Catawiki with consent dismissed via consentedPage fixture
  
  // Inspect search input (use first visible instance)
  const searchBox = page.getByRole('combobox', { name: /search/i }).first();
  
  // Log all attributes
  const attributes = await searchBox.evaluate((el) => {
    const attrs: any = {};
    for (const attr of el.attributes) {
      attrs[attr.name] = attr.value;
    }
    return attrs;
  });
  
  console.log('Search box attributes:', JSON.stringify(attributes, null, 2));
  
  // Check for data-testid
  const testId = await searchBox.getAttribute('data-testid');
  console.log('data-testid:', testId);
  
  // Get aria labels
  const ariaLabel = await searchBox.getAttribute('aria-label');
  console.log('aria-label:', ariaLabel);
  
  // Get placeholder
  const placeholder = await searchBox.getAttribute('placeholder');
  console.log('placeholder:', placeholder);
  
  // Get class names
  const className = await searchBox.getAttribute('class');
  console.log('class:', className);
  
  // Attach findings to report
  await test.step('📋 Search Box Inspection', async () => {
    test.info().attach('search-box-attributes', {
      contentType: 'application/json',
      body: JSON.stringify(attributes, null, 2)
    });
  });
  
  expect(searchBox).toBeVisible();
});

test('Inspect Search Results page', async ({ consentedPage: page }) => {
  // Page is already on Catawiki with consent dismissed
  
  // Perform search using discovered selectors (first visible instance)
  const searchBox = page.locator('[data-testid="search-field"]').first();
  await searchBox.fill('train');
  
  const searchButton = page.getByRole('button', { name: /search/i });
  await searchButton.click();
  
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000); // Wait for results to render
  
  // Find lot links
  const lotLinks = page.locator('a[href*="/l/"], a[href*="/lot/"]');
  const count = await lotLinks.count();
  console.log(`Found ${count} lot links`);
  
  // Inspect first lot structure if available
  if (count > 0) {
    const firstLot = lotLinks.first();
    const lotHtml = await firstLot.evaluate(el => el.outerHTML);
    console.log('First lot HTML (truncated):', lotHtml.substring(0, 500));
    
    // Get all data-testid attributes on the page
    const testIds = await page.locator('[data-testid]').evaluateAll((elements) => 
      elements.map(el => el.getAttribute('data-testid')).filter(Boolean)
    );
    console.log('Available data-testid values:', [...new Set(testIds)].slice(0, 20));
    
    // Try to find lot title
    const title = await firstLot.locator('h3, h4, [data-testid*="title"]').first().textContent().catch(() => null);
    console.log('Lot title:', title);
    
    // Try to find price
    const price = await firstLot.locator('[data-testid*="price"], .price, .bid').first().textContent().catch(() => null);
    console.log('Lot price:', price);
    
    // Attach lot structure to report
    await test.step('📦 Lot Structure Analysis', async () => {
      test.info().attach('available-testids', {
        contentType: 'application/json',
        body: JSON.stringify({ 
          count,
          testIds: [...new Set(testIds)],
          firstLotTitle: title,
          firstLotPrice: price
        }, null, 2)
      });
    });
  } else {
    console.warn('No lot links found - search may have failed or different page structure');
    
    // Debug: check what's on the page
    const pageText = await page.textContent('body');
    console.log('Page content sample:', pageText?.substring(0, 200));
  }
  
  expect.soft(count, 'Should find lot links on search results').toBeGreaterThan(0);
});

test('Inspect Lot Details page', async ({ consentedPage: page }) => {
  // Page is already on Catawiki with consent dismissed
  
  // Search using discovered selectors (first visible instance)
  const searchBox = page.locator('[data-testid="search-field"]').first();
  await searchBox.fill('train');
  
  const searchButton = page.getByRole('button', { name: /search/i });
  await searchButton.click();
  
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  // Click first lot (try multiple patterns)
  const lotLink = page.locator('a[href*="/l/"], a[href*="/lot/"]').first();
  const linkCount = await page.locator('a[href*="/l/"], a[href*="/lot/"]').count();
  
  if (linkCount > 0) {
    await lotLink.click({ timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Find all data-testid values on lot page
    const testIds = await page.locator('[data-testid]').evaluateAll((elements) => 
      elements.map(el => ({
        testId: el.getAttribute('data-testid'),
        tagName: el.tagName.toLowerCase(),
        text: el.textContent?.substring(0, 50)
      })).filter(item => item.testId)
    );
    
    console.log('Lot page data-testid values:', JSON.stringify(testIds.slice(0, 15), null, 2));
    
    // Try to find key elements
    const lotTitle = await page.getByRole('heading', { level: 1 }).textContent().catch(() => null);
    console.log('Lot title:', lotTitle);
    
    const bidStatus = await page.locator('[data-testid*="bid"], [data-testid*="price"]').first().textContent().catch(() => null);
    console.log('Bid status:', bidStatus);
    
    // Attach findings
    await test.step('📋 Lot Page Element Discovery', async () => {
      test.info().attach('lot-page-testids', {
        contentType: 'application/json',
        body: JSON.stringify({
          lotTitle,
          bidStatus,
          testIds
        }, null, 2)
      });
    });
    
    expect.soft(lotTitle, 'Lot page should have a title').toBeTruthy();
  } else {
    console.warn('No lot links found, skipping lot details inspection');
    expect.soft(linkCount, 'Should have lot links to click').toBeGreaterThan(0);
  }
});