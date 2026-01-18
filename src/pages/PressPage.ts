import { Page } from '@playwright/test';

export class PressPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async isOpen(): Promise<boolean> {
    try {
      const url = this.page.url();
      // Based on discovery: Press -> /en/press
      return url.includes('/press') || url.includes('/media') || url.includes('/news');
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

  async getPressReleaseCount(): Promise<number> {
    try {
      // Look for press releases, news articles, or media items
      const pressSelectors = [
        '[data-testid*="press"]',
        '.press-release',
        '.news-item',
        '.media-item',
        'article',
        '.press-item',
        '[class*="press"]'
      ];
      
      let maxCount = 0;
      for (const selector of pressSelectors) {
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

  async hasContactInfo(): Promise<boolean> {
    try {
      const contactElements = await this.page.locator('text=/contact|email|press@|media@/i').count();
      return contactElements > 0;
    } catch {
      return false;
    }
  }

  async getPressContacts(): Promise<{name?: string, email?: string, phone?: string}[]> {
    try {
      const contacts: any[] = [];
      
      // Look for press contact information
      const contactSections = await this.page.locator('.contact, .press-contact, [data-testid*="contact"]').all();
      
      for (let i = 0; i < Math.min(contactSections.length, 3); i++) {
        const section = contactSections[i];
        try {
          const name = await section.locator('text=/name|contact person/i').first().textContent();
          const email = await section.locator('a[href^="mailto:"]').first().textContent();
          const phone = await section.locator('text=/phone|tel|call/i').first().textContent();
          
          contacts.push({
            name: name?.trim(),
            email: email?.trim(),
            phone: phone?.trim()
          });
        } catch {
          continue;
        }
      }
      
      return contacts;
    } catch {
      return [];
    }
  }

  async getPressReleases(): Promise<{title: string, date?: string, summary?: string}[]> {
    try {
      const releases: any[] = [];
      
      const releaseElements = await this.page.locator('article, .press-release, .news-item').all();
      
      for (let i = 0; i < Math.min(releaseElements.length, 5); i++) {
        const element = releaseElements[i];
        try {
          const title = await element.locator('h1, h2, h3, .title').first().textContent();
          const date = await element.locator('.date, time, [datetime]').first().textContent();
          const summary = await element.locator('p, .summary, .excerpt').first().textContent();
          
          if (title) {
            releases.push({
              title: title.trim(),
              date: date?.trim(),
              summary: summary?.trim()
            });
          }
        } catch {
          continue;
        }
      }
      
      return releases;
    } catch {
      return [];
    }
  }

  async hasDownloadableAssets(): Promise<boolean> {
    try {
      const downloadLinks = await this.page.locator('a[download], a[href*=".pdf"], a[href*=".zip"], text=/download|asset/i').count();
      return downloadLinks > 0;
    } catch {
      return false;
    }
  }

  async getMediaKit(): Promise<{logos: number, images: number, documents: number}> {
    try {
      const logos = await this.page.locator('img[alt*="logo"], a[href*="logo"]').count();
      const images = await this.page.locator('img[alt*="image"], .gallery img').count();
      const documents = await this.page.locator('a[href*=".pdf"], a[href*=".doc"]').count();
      
      return { logos, images, documents };
    } catch {
      return { logos: 0, images: 0, documents: 0 };
    }
  }
}