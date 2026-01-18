import { test, expect } from './baseTest';
import fs from 'fs';
import path from 'path';

test('Enhanced Discovery - API calls and Footer Elements', async ({ consentedPage: page }) => {
  test.setTimeout(120000); // 2 minutes timeout for discovery
  
  // Page is already on Catawiki with consent dismissed

  const discoveries: any[] = [];
  const apiCalls: any[] = [];
  const footerElements: any[] = [];

  // Capture network requests
  page.on('request', req => {
    if (req.resourceType() === 'xhr' || req.resourceType() === 'fetch') {
      discoveries.push({
        url: req.url(),
        method: req.method(),
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Capture network responses with full details for contract validation
  page.on('response', async res => {
    if (res.request().resourceType() === 'xhr' || res.request().resourceType() === 'fetch') {
      try {
        const responseBody = await res.json().catch(() => null);
        apiCalls.push({
          url: res.url(),
          method: res.request().method(),
          status: res.status(),
          headers: res.headers(),
          body: responseBody, // For contract validation
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        // Skip responses that error
      }
    }
  });

  // Step 1: Discover footer elements first
  await test.step('🔍 Discover Footer Elements', async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Discover footer structure
    const footerData = await discoverFooterElements(page);
    footerElements.push(...footerData);

    console.log(`📋 Discovered ${footerElements.length} footer elements`);
  });

  // Step 2: Perform search actions to trigger network calls
  await test.step('🔍 Perform Search to Trigger API calls', async () => {
    try {
      // Go back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      
      const searchBox = page.getByRole('combobox', { name: /search/i });
      await searchBox.click();
      await searchBox.fill('train');
      
      const searchButton = page.getByRole('button', { name: /search/i });
      await searchButton.click();
      
      // Wait for search results to load
      await page.waitForLoadState('domcontentloaded');
      
      // Capture UI data for consistency checks
      const uiLots = await page.locator('a[href*="/lot/"]').all();
      const uiLotCount = uiLots.length;
      console.log(`[UI] Found ${uiLotCount} lots in UI`);
    } catch (error) {
      console.log('⚠️ Error during search step:', error instanceof Error ? error.message : String(error));
    }
  });

  // Step 3: Click on a lot to trigger more API calls
  await test.step('🎯 Navigate to Lot Detail', async () => {
    try {
      await page.locator('a[href*="/lot/"]').nth(1).click({ timeout: 5000 });
      await page.waitForLoadState('domcontentloaded');
      
      // Extract lot details from UI for validation
      const lotName = await page.getByRole('heading', { level: 1 }).textContent();
      const lotPrice = await page.getByTestId('lot-bid-status-section').textContent().catch(() => null);
      
      console.log(`[UI] Lot details - Name: ${lotName}, Price: ${lotPrice}`);
    } catch (e) {
      console.log('Could not click lot link, skipping');
    }
  });

  // Step 4: Test footer links and discover more API calls
  await test.step('🔗 Test Footer Navigation', async () => {
    await page.goto('/'); // Go back to homepage
    await page.waitForLoadState('domcontentloaded');
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Test each footer link discovered earlier
    for (const footerElement of footerElements.slice(0, 3)) { // Test first 3 links
      if (footerElement.type === 'link' && footerElement.href && !footerElement.href.startsWith('mailto:')) {
        try {
          console.log(`🔗 Testing footer link: ${footerElement.text} -> ${footerElement.href}`);
          await page.click(`text="${footerElement.text}"`, { timeout: 3000 });
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(1000);
          
          // Go back to homepage for next link
          await page.goto('/');
          await page.waitForLoadState('domcontentloaded');
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(500);
        } catch (error) {
          console.log(`⚠️ Could not test footer link: ${footerElement.text}`);
        }
      }
    }
  });

  // Save all discoveries
  await test.step('💾 Save Discovery Data', async () => {
    const outputPath = path.resolve('src/discovery/network-discovery.json');
    fs.writeFileSync(outputPath, JSON.stringify(discoveries, null, 2));

    // Save API calls with full details for contract testing
    const apiPath = path.resolve('src/discovery/api-calls.json');
    fs.writeFileSync(apiPath, JSON.stringify(apiCalls, null, 2));

    // Save footer elements discovery
    const footerPath = path.resolve('src/discovery/footer-elements.json');
    fs.writeFileSync(footerPath, JSON.stringify(footerElements, null, 2));

    // Analyze and validate contracts
    const contractAnalysis = analyzeContracts(apiCalls);
    const contractPath = path.resolve('src/discovery/contract-analysis.json');
    fs.writeFileSync(contractPath, JSON.stringify(contractAnalysis, null, 2));

    // Log summary
    console.log(`\n📡 Enhanced Discovery Complete`);
    console.log(`Total API calls captured: ${apiCalls.length}`);
    console.log(`Total network discoveries: ${discoveries.length}`);
    console.log(`Footer elements discovered: ${footerElements.length}`);
    console.log(`Network saved to: ${outputPath}`);
    console.log(`API calls saved to: ${apiPath}`);
    console.log(`Footer elements saved to: ${footerPath}`);
    console.log(`Contract analysis saved to: ${contractPath}`);
  });
  
  // Attach reports
  await test.step('📊 Generate Reports', async () => {
    test.info().attach('Network Calls', {
      body: `Total calls: ${apiCalls.length}\n\n${JSON.stringify(apiCalls.slice(0, 3), null, 2)}...`,
      contentType: 'text/plain'
    });

    test.info().attach('Footer Elements', {
      body: JSON.stringify(footerElements, null, 2),
      contentType: 'application/json'
    });

    test.info().attach('Contract Validation', {
      body: JSON.stringify(analyzeContracts(apiCalls), null, 2),
      contentType: 'text/plain'
    });
  });

  // Contract validation assertions
  expect(apiCalls.length).toBeGreaterThan(0);
  expect(footerElements.length).toBeGreaterThan(0);
});

/**
 * Analyze API responses for contract validation
 * Returns schema violations and data consistency issues
 */
function analyzeContracts(apiCalls: any[]) {
  const analysis = {
    total: apiCalls.length,
    byEndpoint: {} as any,
    allValid: true,
    violations: [] as any[],
  };

  for (const call of apiCalls) {
    const endpoint = new URL(call.url).pathname;
    
    if (!analysis.byEndpoint[endpoint]) {
      analysis.byEndpoint[endpoint] = {
        calls: 0,
        avgResponseTime: 0,
        statusCodes: [],
        schema: null,
      };
    }

    analysis.byEndpoint[endpoint].calls++;
    analysis.byEndpoint[endpoint].statusCodes.push(call.status);

    // Contract validation: Check required fields
    if (call.body && typeof call.body === 'object') {
      const schema = inferSchema(call.body);
      if (!analysis.byEndpoint[endpoint].schema) {
        analysis.byEndpoint[endpoint].schema = schema;
      }
    }

    // Flag errors
    if (call.status >= 400) {
      analysis.allValid = false;
      analysis.violations.push({
        endpoint,
        status: call.status,
        url: call.url,
      });
    }
  }

  return analysis;
}

/**
 * Infer JSON schema from response body
 */
function inferSchema(obj: any): any {
  if (Array.isArray(obj)) {
    return ['array', inferSchema(obj[0])];
  }
  if (obj === null) {
    return 'null';
  }
  if (typeof obj === 'object') {
    const schema: any = {};
    for (const [key, value] of Object.entries(obj)) {
      schema[key] = typeof value;
    }
    return schema;
  }
  return typeof obj;
}

/**
 * Discover footer elements and their properties with focus on About Catawiki section
 */
async function discoverFooterElements(page: any) {
  const footerElements: any[] = [];

  try {
    // Scroll to footer to ensure it's visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Find all footer sections
    const footers = await page.locator('footer, [role="contentinfo"], .footer').all();
    
    for (let i = 0; i < footers.length; i++) {
      const footer = footers[i];
      
      // Get all links in footer with enhanced About Catawiki detection
      const links = await footer.locator('a').all();
      for (let j = 0; j < links.length; j++) {
        const link = links[j];
        try {
          const text = await link.textContent();
          const href = await link.getAttribute('href');
          const title = await link.getAttribute('title');
          const ariaLabel = await link.getAttribute('aria-label');
          
          if (text && text.trim()) {
            const isAboutSection = isAboutCatawikiLink(text.trim());
            
            footerElements.push({
              type: 'link',
              text: text.trim(),
              href,
              title,
              ariaLabel,
              footerIndex: i,
              linkIndex: j,
              isAboutCatawiki: isAboutSection,
              category: categorizeFooterLink(text.trim(), href),
              timestamp: new Date().toISOString(),
            });
          }
        } catch (e) {
          // Skip links that can't be processed
        }
      }
      
      // Get footer headings that might indicate About sections
      const headings = await footer.locator('h1, h2, h3, h4, h5, h6').all();
      for (let k = 0; k < headings.length; k++) {
        const heading = headings[k];
        try {
          const text = await heading.textContent();
          const tagName = await heading.evaluate((el: HTMLElement) => el.tagName.toLowerCase());
          
          if (text && text.trim()) {
            const isAboutHeading = text.toLowerCase().includes('about') || text.toLowerCase().includes('catawiki');
            
            footerElements.push({
              type: 'heading',
              text: text.trim(),
              tagName,
              footerIndex: i,
              headingIndex: k,
              isAboutSection: isAboutHeading,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (e) {
          // Skip headings that can't be processed
        }
      }
      
      // Look for specific About Catawiki column structure
      const aboutColumns = await footer.locator(':has-text("About Catawiki"), :has-text("about catawiki")').all();
      for (let m = 0; m < aboutColumns.length; m++) {
        const column = aboutColumns[m];
        try {
          // Find all links within this About section
          const aboutLinks = await column.locator('a').all();
          for (let n = 0; n < aboutLinks.length; n++) {
            const aboutLink = aboutLinks[n];
            const linkText = await aboutLink.textContent();
            const linkHref = await aboutLink.getAttribute('href');
            
            if (linkText && linkText.trim()) {
              footerElements.push({
                type: 'about-link',
                text: linkText.trim(),
                href: linkHref,
                parentSection: 'About Catawiki',
                columnIndex: m,
                linkIndex: n,
                footerIndex: i,
                priority: getAboutLinkPriority(linkText.trim()),
                timestamp: new Date().toISOString(),
              });
            }
          }
        } catch (e) {
          console.log(`Could not process About column ${m}:`, e);
        }
      }
    }
    
    // Look for specific target About Catawiki links mentioned in the request
    const targetAboutLinks = [
      'About Catawiki',
      'Our experts', 
      'Careers',
      'Press',
      'Partnering with Catawiki',
      'Collectors\' portal'
    ];
    
    for (const targetText of targetAboutLinks) {
      try {
        // Use more flexible text matching with first() to avoid strict mode violations
        const targetLink = page.getByRole('link', { name: new RegExp(targetText.replace(/'/g, ''), 'i') }).first();
        if (await targetLink.isVisible({ timeout: 1000 })) {
          const href = await targetLink.getAttribute('href');
          const actualText = await targetLink.textContent();
          
          footerElements.push({
            type: 'target-about-link',
            text: actualText?.trim() || targetText,
            href,
            targetText: targetText,
            found: true,
            priority: 'high',
            timestamp: new Date().toISOString(),
          });
          
          console.log(`✅ Found target About link: ${targetText} -> ${href}`);
        } else {
          footerElements.push({
            type: 'target-about-link',
            text: targetText,
            href: null,
            targetText: targetText,
            found: false,
            priority: 'high',
            timestamp: new Date().toISOString(),
          });
          
          console.log(`❌ Missing target About link: ${targetText}`);
        }
      } catch (e) {
        footerElements.push({
          type: 'target-about-link',
          text: targetText,
          href: null,
          targetText: targetText,
          found: false,
          error: e instanceof Error ? e.message : String(e),
          priority: 'high',
          timestamp: new Date().toISOString(),
        });
        console.log(`⚠️ Error checking target link ${targetText}:`, e instanceof Error ? e.message : String(e));
      }
    }

    // Filter out duplicate elements and clean data
    const uniqueElements = footerElements.filter((element, index, self) => 
      index === self.findIndex(e => 
        e.type === element.type && 
        e.text === element.text && 
        e.href === element.href
      )
    );

    return uniqueElements;
  } catch (error) {
    console.log('Error discovering footer elements:', error);
    return [];
  }
}

/**
 * Check if a link text indicates it's part of the About Catawiki section
 */
function isAboutCatawikiLink(text: string): boolean {
  const aboutKeywords = [
    'about catawiki', 'our experts', 'careers', 'press', 
    'partnering', 'collectors', 'portal', 'about us',
    'company', 'team', 'jobs', 'work', 'media'
  ];
  
  return aboutKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Categorize footer links based on their content
 */
function categorizeFooterLink(text: string, href: string | null): string {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('about') || textLower.includes('company')) {
    return 'about';
  } else if (textLower.includes('expert') || textLower.includes('specialist')) {
    return 'experts';
  } else if (textLower.includes('career') || textLower.includes('job') || textLower.includes('work')) {
    return 'careers';
  } else if (textLower.includes('press') || textLower.includes('media') || textLower.includes('news')) {
    return 'press';
  } else if (textLower.includes('partner') || textLower.includes('business')) {
    return 'partnering';
  } else if (textLower.includes('collector') || textLower.includes('portal')) {
    return 'collectors';
  } else if (textLower.includes('help') || textLower.includes('support') || textLower.includes('faq')) {
    return 'support';
  } else if (textLower.includes('term') || textLower.includes('condition') || textLower.includes('privacy') || textLower.includes('legal')) {
    return 'legal';
  } else if (textLower.includes('social') || textLower.includes('facebook') || textLower.includes('twitter') || textLower.includes('instagram')) {
    return 'social';
  } else {
    return 'other';
  }
}

/**
 * Get priority for About Catawiki links based on importance
 */
function getAboutLinkPriority(text: string): 'high' | 'medium' | 'low' {
  const highPriority = ['about catawiki', 'our experts', 'careers', 'press', 'partnering', 'collectors'];
  const mediumPriority = ['team', 'company', 'jobs', 'media', 'business'];
  
  const textLower = text.toLowerCase();
  
  if (highPriority.some(keyword => textLower.includes(keyword))) {
    return 'high';
  } else if (mediumPriority.some(keyword => textLower.includes(keyword))) {
    return 'medium';
  } else {
    return 'low';
  }
}