import { Page } from '@playwright/test';

export class SearchResultsPage {
  constructor(private page: Page) {}

  async isOpen() {
    // Wait for page to stabilize
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
    
    // Check URL contains search indicator (/s?q= or /search or /l/)
    const currentUrl = this.page.url();
    const isSearchPage = currentUrl.includes('/s?q=') || currentUrl.includes('search') || currentUrl.includes('/l/');
    console.log(`[SearchResults] Checking URL: ${currentUrl}, isSearchPage: ${isSearchPage}`);
    return isSearchPage;
  }

  async getResultsCount() {
    // Wait for results to render
    await this.page.waitForTimeout(2000);
    
    // Try multiple lot link patterns (both /l/ and /lot/ URLs)
    const lotLinks = this.page.locator('a[href*="/l/"], a[href*="/lot/"]');
    const count = await lotLinks.count();
    
    console.log(`[SearchResults] Found ${count} lot links`);
    return count;
  }

  async openLotByIndex(index: number) {
    // Find lot links - try multiple patterns
    const lotLinks = this.page.locator('a[href*="/l/"], a[href*="/lot/"]');
    const count = await lotLinks.count();
    
    console.log(`[SearchResults] Found ${count} lots, clicking index ${index}`);
    
    if (count === 0) {
      throw new Error('No lot links found on search results page');
    }
    
    if (index >= count) {
      throw new Error(`Lot index ${index} is out of range (0-${count - 1})`);
    }
    
    await lotLinks.nth(index).click();
    await this.page.waitForLoadState('domcontentloaded');
    console.log(`[SearchResults] Clicked lot at index ${index}`);
  }
}
