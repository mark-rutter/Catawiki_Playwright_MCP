import { Page } from '@playwright/test';

export class ExpertsPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async isOpen(): Promise<boolean> {
    try {
      const url = this.page.url();
      // Based on discovery: Our experts -> /en/e
      return url.includes('/e') && (url.includes('/en/e') || url.endsWith('/e'));
    } catch {
      return false;
    }
  }

  async getPageTitle(): Promise<string | null> {
    try {
      const mainHeading = await this.page.getByRole('heading', { level: 1 }).first().textContent();
      return mainHeading || await this.page.title();
    } catch {
      try {
        return await this.page.title();
      } catch {
        return null;
      }
    }
  }

  async getExpertCount(): Promise<number> {
    try {
      // Look for expert cards, profiles, or images
      const expertSelectors = [
        '[data-testid*="expert"]',
        '.expert-card',
        '.expert-profile', 
        '.expert-item',
        '.expert img',
        '[class*="expert"]'
      ];
      
      let maxCount = 0;
      for (const selector of expertSelectors) {
        try {
          const count = await this.page.locator(selector).count();
          maxCount = Math.max(maxCount, count);
        } catch {
          continue;
        }
      }
      
      return maxCount;
    } catch {
      return 0;
    }
  }

  async getExpertCategories(): Promise<string[]> {
    try {
      const categorySelectors = [
        'h2, h3, h4',
        '.category-title',
        '[data-testid*="category"]',
        '.section-title',
        '.expert-category'
      ];
      
      let categories: string[] = [];
      for (const selector of categorySelectors) {
        try {
          const texts = await this.page.locator(selector).allTextContents();
          categories.push(...texts.filter(text => text.trim().length > 0));
        } catch {
          continue;
        }
      }
      
      // Remove duplicates and return unique categories
      return [...new Set(categories)].slice(0, 20); // Limit to reasonable number
    } catch {
      return [];
    }
  }

  async getExpertDetails(): Promise<{name: string, specialty: string}[]> {
    try {
      const experts: {name: string, specialty: string}[] = [];
      
      // Look for expert names and specialties
      const expertElements = await this.page.locator('.expert-card, .expert-profile, [class*="expert"]').all();
      
      for (let i = 0; i < Math.min(expertElements.length, 5); i++) { // Limit to first 5
        const element = expertElements[i];
        try {
          const name = await element.locator('h3, h4, .name, .expert-name').first().textContent();
          const specialty = await element.locator('.specialty, .category, .expertise').first().textContent();
          
          if (name) {
            experts.push({
              name: name.trim(),
              specialty: specialty?.trim() || 'Unknown'
            });
          }
        } catch {
          continue;
        }
      }
      
      return experts;
    } catch {
      return [];
    }
  }

  async hasSearchFunctionality(): Promise<boolean> {
    try {
      const searchElements = await this.page.locator('input[type="search"], [placeholder*="search"], .search-input').count();
      return searchElements > 0;
    } catch {
      return false;
    }
  }
}