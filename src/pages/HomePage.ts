import { Page } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    // Wait for page to stabilize
    await this.page.waitForLoadState('networkidle').catch(() => null);
    console.log('[HomePage] Page loaded');
  }

  async search(keyword: string) {
    // Cookie consent is handled by consentedPage fixture
    // Use discovered data-testid selector (use first visible instance)
    const searchInput = this.page.locator('[data-testid="search-field"]').first();
    
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    await searchInput.fill(keyword);
    
    // Click search button instead of pressing Enter
    const searchButton = this.page.getByRole('button', { name: /search/i });
    await searchButton.click();
    
    await this.page.waitForLoadState('domcontentloaded');
    console.log(`[HomePage] Searched for: "${keyword}" using UI`);
  }
}