import { Page } from '@playwright/test';

export class LotPage {
  constructor(private page: Page) {}

  async isOpen() {
    // Wait for page to load
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
    const url = this.page.url();
    return url.includes('/l/') || url.includes('/lot/');
  }

  async getLotDetails() {
    // Wait for page to fully load
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
    await this.page.waitForTimeout(1000);
    
    const details: any = {};
    
    // Get lot name/title using h1
    try {
      const titleEl = this.page.getByRole('heading', { level: 1 });
      details.name = await titleEl.textContent({ timeout: 5000 }).catch(() => null);
      console.log(`[LotPage] Lot name: ${details.name}`);
    } catch (e) {
      details.name = null;
      console.warn('[LotPage] Could not find lot name');
    }
    
    // Get price/bid using data-testid (discovered from working tests)
    try {
      const bidSection = this.page.getByTestId('lot-bid-status-section');
      details.currentBid = await bidSection.textContent({ timeout: 5000 }).catch(() => null);
      console.log(`[LotPage] Current bid: ${details.currentBid}`);
    } catch (e) {
      details.currentBid = null;
      console.warn('[LotPage] Could not find bid status');
    }
    
    // Get favorites/watchers using regex pattern
    try {
      const favEl = this.page.getByText(/\d+ other people are watching/i);
      details.favorites = await favEl.textContent({ timeout: 5000 }).catch(() => null);
      console.log(`[LotPage] Favorites: ${details.favorites}`);
    } catch (e) {
      details.favorites = null;
      console.warn('[LotPage] Could not find favorites count');
    }
    
    return details;
  }
}
