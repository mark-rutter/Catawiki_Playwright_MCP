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
    // No need to handle it here

    // Try multiple selector patterns for the search combobox
    let searchInput = this.page.getByRole('combobox', { name: 'Search for brand, model,' });
    let isFound = await searchInput.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!isFound) {
      // Try with partial name match
      searchInput = this.page.getByRole('combobox', { name: /Search/i });
      isFound = await searchInput.isVisible({ timeout: 2000 }).catch(() => false);
    }
    
    if (!isFound) {
      // Try data-testid as fallback
      searchInput = this.page.locator('[data-testid="search-field"]');
      isFound = await searchInput.isVisible({ timeout: 2000 }).catch(() => false);
    }

    console.log(`[HomePage] Search input found: ${isFound}`);
    await searchInput.click();
    await searchInput.fill(keyword);
    await searchInput.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
    console.log(`[HomePage] Searched for: "${keyword}" using UI`);
  }
}