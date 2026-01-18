import { Page } from '@playwright/test';

export class CareersPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async isOpen(): Promise<boolean> {
    try {
      const url = this.page.url();
      // Based on discovery: Careers -> https://catawiki.careers (external domain)
      return url.includes('catawiki.careers') || url.includes('/careers') || url.includes('/jobs');
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

  async getJobListings(): Promise<number> {
    try {
      // Look for job cards, listings, or positions
      const jobSelectors = [
        '[data-testid*="job"]',
        '.job-listing',
        '.job-card',
        '.position',
        '.vacancy',
        '.career-item',
        '[class*="job"]',
        'article'
      ];
      
      let maxCount = 0;
      for (const selector of jobSelectors) {
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

  async hasApplicationProcess(): Promise<boolean> {
    try {
      const processElements = await this.page.locator('text=/application process|how to apply|apply now/i').count();
      return processElements > 0;
    } catch {
      return false;
    }
  }

  async getJobCategories(): Promise<string[]> {
    try {
      const categories = await this.page.locator('h2, h3, .category, .department, .job-category').allTextContents();
      return categories.filter(text => text.trim().length > 0).slice(0, 10);
    } catch {
      return [];
    }
  }

  async getCompanyBenefits(): Promise<string[]> {
    try {
      const benefitSelectors = [
        '.benefit',
        '.perk',
        '.advantage',
        'text=/benefit|perk|advantage/i'
      ];
      
      let benefits: string[] = [];
      for (const selector of benefitSelectors) {
        try {
          const texts = await this.page.locator(selector).allTextContents();
          benefits.push(...texts);
        } catch {
          continue;
        }
      }
      
      return benefits.filter(text => text.trim().length > 0).slice(0, 15);
    } catch {
      return [];
    }
  }

  async hasApplyButton(): Promise<boolean> {
    try {
      const applyButton = this.page.getByRole('button', { name: /apply|join|submit/i }).or(
        this.page.getByRole('link', { name: /apply|join|submit/i })
      );
      return await applyButton.isVisible();
    } catch {
      return false;
    }
  }

  async getOfficeLocations(): Promise<string[]> {
    try {
      const locationTexts = await this.page.locator('text=/location|office|amsterdam|remote/i').allTextContents();
      return locationTexts.filter(text => text.trim().length > 0).slice(0, 5);
    } catch {
      return [];
    }
  }
}