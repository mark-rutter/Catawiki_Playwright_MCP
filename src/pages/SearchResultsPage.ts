import { Page } from '@playwright/test';

export class SearchResultsPage {
  constructor(private page: Page) {}

  async isOpen() {
    // Prefer role-based selector for a heading or results container
    // Try to find a heading with role 'heading' and text 'Search results' or similar
    const heading = this.page.getByRole('heading', { name: /search results|results|lots|found/i });
    if (await heading.isVisible().catch(() => false)) {
      return true;
    }
    // Fallback: check for a results container (e.g. role='list' or 'region')
    const resultsRegion = this.page.getByRole('region', { name: /results|lots|search/i });
    if (await resultsRegion.isVisible().catch(() => false)) {
      return true;
    }
    // Fallback: check URL
    const currentUrl = this.page.url();
    return currentUrl.includes('search');
  }

  async getResultsCount() {
    // Try role-based selector for lot cards
    const lotCards = this.page.getByRole('article');
    const count = await lotCards.count();
    console.log(`[SearchResults] getByRole('article') found ${count} elements`);
    if (count > 0) return count;
    // Fallback to previous selectors if needed
    const fallbackSelectors = [
      'a[href*="/lot/"]',
      'a[href*="lot"]',
      '[data-testid="lot-card"]',
    ];
    for (const selector of fallbackSelectors) {
      const fallbackCount = await this.page.locator(selector).count();
      console.log(`[SearchResults] Selector "${selector}" found ${fallbackCount} elements`);
      if (fallbackCount > 0) return fallbackCount;
    }
    return 0;
  }

  async openLotByIndex(index: number) {
    // Find lot links - try multiple selectors
    let lotLinks = this.page.locator('a[href*="/lot/"]');
    let count = await lotLinks.count();
    
    if (count === 0) {
      lotLinks = this.page.locator('a[href*="lot"]');
      count = await lotLinks.count();
    }
    
    if (count === 0) {
      throw new Error('No lots found on page');
    }
    
    if (index >= count) {
      throw new Error(`Lot index ${index} out of range. Found ${count} lots.`);
    }
    
    const lotLink = lotLinks.nth(index);
    const hrefAttr = await lotLink.getAttribute('href');
    console.log(`[SearchResults] Opening lot ${index}: ${hrefAttr}`);
    
    await lotLink.click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
  }
}
