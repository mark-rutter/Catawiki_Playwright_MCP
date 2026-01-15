import { Page } from '@playwright/test';

export class LotPage {
  constructor(private page: Page) {}

  async isOpen() {
    return this.page.url().includes('/lot/');
  }

  async getLotDetails() {
    // Wait for page to load
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
    
    const details: any = {};
    
    // Try to get lot name/title - look for h1 or other title elements
    try {
      const titleEl = this.page.locator('h1').first();
      details.name = await titleEl.textContent().catch(() => 'Not found');
    } catch (e) {
      details.name = 'Not found';
    }
    
    // Try to get price/bid information
    try {
      const priceEl = this.page.locator('[class*="price"], [class*="bid"]').first();
      details.currentBid = await priceEl.textContent().catch(() => 'Not found');
    } catch (e) {
      details.currentBid = 'Not found';
    }
    
    // Try to get favorites
    try {
      const favEl = this.page.locator('[class*="favorite"], [class*="like"], [class*="heart"]').first();
      details.favorites = await favEl.textContent().catch(() => 'Not found');
    } catch (e) {
      details.favorites = 'Not found';
    }
    
    return details;
  }
}
