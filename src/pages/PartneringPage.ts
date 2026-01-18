import { Page } from '@playwright/test';

export class PartneringPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async isOpen(): Promise<boolean> {
    try {
      const url = this.page.url();
      // Based on discovery: Partnering with Catawiki -> /en/pages/p/partnership
      return url.includes('/partnership') || url.includes('/partners') || url.includes('/partnering');
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

  async getPartnershipTypes(): Promise<string[]> {
    try {
      const typeSelectors = [
        'h2, h3, h4',
        '.partnership-type',
        '.partner-type',
        '[data-testid*="partner"]',
        '.service-type',
        '.collaboration-type'
      ];
      
      let types: string[] = [];
      for (const selector of typeSelectors) {
        try {
          const texts = await this.page.locator(selector).allTextContents();
          types.push(...texts);
        } catch {
          continue;
        }
      }
      
      return types.filter(text => text.trim().length > 0).slice(0, 10);
    } catch {
      return [];
    }
  }

  async hasContactForm(): Promise<boolean> {
    try {
      const formElements = this.page.locator('form').or(
        this.page.locator('input[type="email"]')
      ).or(
        this.page.locator('[data-testid*="contact"]')
      );
      
      return await formElements.first().isVisible();
    } catch {
      return false;
    }
  }

  async getPartnerBenefits(): Promise<string[]> {
    try {
      const benefitSelectors = [
        '.benefit',
        '.advantage',
        'text=/benefit|advantage|value|opportunity/i',
        '.partner-benefit',
        'li' // List items often contain benefits
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
      
      return benefits.filter(text => text.trim().length > 10).slice(0, 10);
    } catch {
      return [];
    }
  }

  async getPartnerRequirements(): Promise<string[]> {
    try {
      const reqSelectors = [
        'text=/requirement|criteria|qualification|must have/i',
        '.requirement',
        '.criteria',
        '.qualification'
      ];
      
      let requirements: string[] = [];
      for (const selector of reqSelectors) {
        try {
          const texts = await this.page.locator(selector).allTextContents();
          requirements.push(...texts);
        } catch {
          continue;
        }
      }
      
      return requirements.filter(text => text.trim().length > 0).slice(0, 8);
    } catch {
      return [];
    }
  }

  async hasPartnerApplication(): Promise<boolean> {
    try {
      const applicationElements = await this.page.locator('text=/apply|become a partner|join|application/i').count();
      return applicationElements > 0;
    } catch {
      return false;
    }
  }

  async getExistingPartners(): Promise<{name: string, type?: string}[]> {
    try {
      const partners: any[] = [];
      
      // Look for partner logos, names, or case studies
      const partnerElements = await this.page.locator('.partner, .partner-logo, .case-study, [data-testid*="partner"]').all();
      
      for (let i = 0; i < Math.min(partnerElements.length, 6); i++) {
        const element = partnerElements[i];
        try {
          const name = await element.locator('img[alt], .name, h3, h4').first().textContent() ||
                       await element.locator('img').first().getAttribute('alt');
          const type = await element.locator('.type, .category').first().textContent();
          
          if (name && name.trim()) {
            partners.push({
              name: name.trim(),
              type: type?.trim()
            });
          }
        } catch {
          continue;
        }
      }
      
      return partners;
    } catch {
      return [];
    }
  }

  async getContactInfo(): Promise<{email?: string, phone?: string, address?: string}> {
    try {
      const email = await this.page.locator('a[href^="mailto:"]').first().textContent();
      const phone = await this.page.locator('text=/phone|tel:/i').first().textContent();
      const address = await this.page.locator('text=/address|location/i').first().textContent();
      
      return {
        email: email?.trim(),
        phone: phone?.trim(),
        address: address?.trim()
      };
    } catch {
      return {};
    }
  }
}