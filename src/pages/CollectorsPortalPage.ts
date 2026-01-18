import { Page } from '@playwright/test';

export class CollectorsPortalPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async isOpen(): Promise<boolean> {
    try {
      const url = this.page.url();
      // Note: This was not found in discovery, so check multiple potential URLs
      return url.includes('/collectors') || url.includes('/portal') || 
             url.includes('/verzamelaars') || url.includes('/collector');
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

  async getFeatureCount(): Promise<number> {
    try {
      // Look for features, services, or benefits offered to collectors
      const featureSelectors = [
        '[data-testid*="feature"]',
        '.feature',
        '.benefit',
        '.service',
        '.tool',
        '.collector-feature',
        '[class*="feature"]'
      ];
      
      let maxCount = 0;
      for (const selector of featureSelectors) {
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

  async hasSignupButton(): Promise<boolean> {
    try {
      const signupButton = this.page.getByRole('button', { name: /sign up|register|join|create account/i }).or(
        this.page.getByRole('link', { name: /sign up|register|join|create account/i })
      );
      return await signupButton.isVisible();
    } catch {
      return false;
    }
  }

  async getCollectorServices(): Promise<string[]> {
    try {
      const serviceSelectors = [
        'h2, h3, h4',
        '.service',
        '.feature-title',
        '.collector-service',
        'text=/valuation|appraisal|selling|buying|collection/i'
      ];
      
      let services: string[] = [];
      for (const selector of serviceSelectors) {
        try {
          const texts = await this.page.locator(selector).allTextContents();
          services.push(...texts);
        } catch {
          continue;
        }
      }
      
      return services.filter(text => text.trim().length > 0).slice(0, 12);
    } catch {
      return [];
    }
  }

  async hasValuationService(): Promise<boolean> {
    try {
      const valuationElements = await this.page.locator('text=/valuation|appraisal|estimate|value/i').count();
      return valuationElements > 0;
    } catch {
      return false;
    }
  }

  async hasCollectionManagement(): Promise<boolean> {
    try {
      const collectionElements = await this.page.locator('text=/collection management|organize|catalog|inventory/i').count();
      return collectionElements > 0;
    } catch {
      return false;
    }
  }

  async getCollectorBenefits(): Promise<string[]> {
    try {
      const benefits = await this.page.locator('.benefit, .advantage, text=/benefit|advantage|exclusive/i').allTextContents();
      return benefits.filter(text => text.trim().length > 5).slice(0, 8);
    } catch {
      return [];
    }
  }

  async hasMarketInsights(): Promise<boolean> {
    try {
      const insightElements = await this.page.locator('text=/market insight|trend|price guide|analytics/i').count();
      return insightElements > 0;
    } catch {
      return false;
    }
  }

  async getAccessRequirements(): Promise<{membership?: string, subscription?: string, requirements?: string[]}> {
    try {
      const membership = await this.page.locator('text=/membership|member only|premium/i').first().textContent();
      const subscription = await this.page.locator('text=/subscription|monthly|yearly|plan/i').first().textContent();
      const reqElements = await this.page.locator('text=/requirement|must|need to|eligibility/i').allTextContents();
      
      return {
        membership: membership?.trim(),
        subscription: subscription?.trim(),
        requirements: reqElements.filter(text => text.trim().length > 0).slice(0, 5)
      };
    } catch {
      return {};
    }
  }

  // Method to check if this page even exists (since it wasn't found in discovery)
  async pageExists(): Promise<boolean> {
    try {
      // Check if we get a 404 or similar error
      const title = await this.page.title();
      const url = this.page.url();
      
      return !title.toLowerCase().includes('not found') && 
             !title.toLowerCase().includes('error') &&
             !url.includes('404');
    } catch {
      return false;
    }
  }
}