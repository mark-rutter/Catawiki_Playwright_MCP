import { Page } from '@playwright/test';

export class AboutPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async isOpen(): Promise<boolean> {
    try {
      const url = this.page.url();
      // Based on discovery: About Catawiki -> /en/help/about
      return url.includes('/help/about') || url.includes('/about');
    } catch {
      return false;
    }
  }

  async getPageTitle(): Promise<string | null> {
    try {
      // Try main heading first, then fall back to page title
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

  async getPageContent(): Promise<string[]> {
    try {
      const paragraphs = await this.page.locator('p, .content-text, .about-text').allTextContents();
      return paragraphs.filter(text => text.trim().length > 10); // Filter out short/empty content
    } catch {
      return [];
    }
  }

  async hasNavigationMenu(): Promise<boolean> {
    try {
      const nav = this.page.locator('nav, [role="navigation"], .navigation').first();
      return await nav.isVisible();
    } catch {
      return false;
    }
  }

  async getCompanyInfo(): Promise<{founded?: string, established?: string, employees?: string, mission?: string}> {
    try {
      const companyInfo: any = {};
      
      // Look for company founding info
      const foundedText = await this.page.locator('text=/founded|established|since/i').first().textContent().catch(() => null);
      if (foundedText) {
        companyInfo.founded = foundedText.trim();
        companyInfo.established = foundedText.trim(); // Also provide established for backward compatibility
      }
      
      // Look for employee count
      const employeeText = await this.page.locator('text=/employees|team members|people/i').first().textContent().catch(() => null);
      if (employeeText) {
        companyInfo.employees = employeeText.trim();
      }
      
      // Look for mission statement or description
      const missionText = await this.page.locator('text=/mission|vision|purpose|about catawiki/i').first().textContent().catch(() => null);
      if (missionText) {
        companyInfo.mission = missionText.trim();
      }
      
      return companyInfo;
    } catch {
      return {};
    }
  }
}