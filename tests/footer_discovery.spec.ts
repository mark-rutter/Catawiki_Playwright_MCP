import { test, expect } from './baseTest';
import fs from 'fs';
import path from 'path';

test('Footer Elements Discovery', async ({ consentedPage: page }) => {
  test.setTimeout(90000);

  const footerElements: any[] = [];

  // Step 1: Discover footer elements
  await test.step('🔍 Discover Footer Elements', async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    console.log('📍 Starting footer discovery...');

    try {
      // Find footer container
      const footers = await page.locator('footer, [role="contentinfo"], .footer').all();
      console.log(`Found ${footers.length} footer container(s)`);

      for (let i = 0; i < footers.length; i++) {
        const footer = footers[i];
        console.log(`Processing footer ${i + 1}...`);

        // Get all links in footer
        const links = await footer.locator('a').all();
        console.log(`Found ${links.length} links in footer ${i + 1}`);

        for (let j = 0; j < links.length; j++) {
          const link = links[j];
          try {
            const text = await link.textContent();
            const href = await link.getAttribute('href');
            
            if (text && text.trim()) {
              footerElements.push({
                type: 'link',
                text: text.trim(),
                href: href || '',
                footerIndex: i,
                linkIndex: j,
                timestamp: new Date().toISOString(),
              });
              
              console.log(`  📎 Link: "${text.trim()}" -> ${href}`);
            }
          } catch (e) {
            console.log(`  ⚠️ Could not process link ${j}: ${e}`);
          }
        }

        // Get footer headings
        const headings = await footer.locator('h1, h2, h3, h4, h5, h6').all();
        console.log(`Found ${headings.length} headings in footer ${i + 1}`);

        for (let k = 0; k < headings.length; k++) {
          const heading = headings[k];
          try {
            const text = await heading.textContent();
            const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
            
            if (text && text.trim()) {
              footerElements.push({
                type: 'heading',
                text: text.trim(),
                tagName,
                footerIndex: i,
                headingIndex: k,
                timestamp: new Date().toISOString(),
              });
              
              console.log(`  📰 Heading (${tagName}): "${text.trim()}"`);
            }
          } catch (e) {
            console.log(`  ⚠️ Could not process heading ${k}: ${e}`);
          }
        }
      }

      // Look for "About Catawiki" sections specifically
      const aboutSections = await page.locator('text=/about catawiki/i').all();
      console.log(`Found ${aboutSections.length} 'About Catawiki' section(s)`);
      
      for (let m = 0; m < aboutSections.length; m++) {
        try {
          const element = aboutSections[m];
          const text = await element.textContent();
          
          footerElements.push({
            type: 'about-section',
            text: text?.trim() || '',
            sectionIndex: m,
            timestamp: new Date().toISOString(),
          });
          
          console.log(`  🏢 About section: "${text?.trim()}"`);
        } catch (e) {
          console.log(`  ⚠️ Could not process about section ${m}: ${e}`);
        }
      }

    } catch (error) {
      console.log('❌ Error during footer discovery:', error);
    }

    console.log(`✅ Discovered ${footerElements.length} footer elements total`);
  });

  // Step 2: Test some footer links
  await test.step('🔗 Test Footer Navigation', async () => {
    if (footerElements.length === 0) {
      console.log('⚠️ No footer elements found to test');
      return;
    }

    const linkElements = footerElements.filter(el => el.type === 'link' && el.href && !el.href.startsWith('mailto:'));
    console.log(`Found ${linkElements.length} testable links`);

    // Test first few links (limit to avoid long test times)
    const linksToTest = linkElements.slice(0, 3);
    
    for (const linkElement of linksToTest) {
      try {
        console.log(`🔗 Testing link: "${linkElement.text}" -> ${linkElement.href}`);
        
        await page.goto('/'); // Go back to homepage
        await page.waitForLoadState('domcontentloaded');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        
        // Click the link
        await page.click(`text="${linkElement.text}"`, { timeout: 5000 });
        await page.waitForLoadState('domcontentloaded');
        
        const newUrl = page.url();
        console.log(`  ✅ Successfully navigated to: ${newUrl}`);
        
        linkElement.testResult = 'success';
        linkElement.navigatedUrl = newUrl;
        
      } catch (error) {
        console.log(`  ❌ Failed to test link "${linkElement.text}": ${error}`);
        linkElement.testResult = 'failed';
        linkElement.error = String(error);
      }
    }
  });

  // Step 3: Save discovery data
  await test.step('💾 Save Footer Discovery Data', async () => {
    const footerPath = path.resolve('src/discovery/footer-elements-simple.json');
    
    try {
      // Ensure directory exists
      const dir = path.dirname(footerPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Save footer elements
      fs.writeFileSync(footerPath, JSON.stringify(footerElements, null, 2));
      
      // Generate summary report
      const summary = {
        totalElements: footerElements.length,
        links: footerElements.filter(el => el.type === 'link').length,
        headings: footerElements.filter(el => el.type === 'heading').length,
        aboutSections: footerElements.filter(el => el.type === 'about-section').length,
        testableLinks: footerElements.filter(el => el.type === 'link' && el.href && !el.href.startsWith('mailto:')).length,
        successfulTests: footerElements.filter(el => el.testResult === 'success').length,
        failedTests: footerElements.filter(el => el.testResult === 'failed').length,
        discoveryTime: new Date().toISOString(),
      };
      
      const summaryPath = path.resolve('src/discovery/footer-discovery-summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      
      console.log(`\n📊 Footer Discovery Summary:`);
      console.log(`   Total elements: ${summary.totalElements}`);
      console.log(`   Links: ${summary.links}`);
      console.log(`   Headings: ${summary.headings}`);
      console.log(`   About sections: ${summary.aboutSections}`);
      console.log(`   Testable links: ${summary.testableLinks}`);
      console.log(`   Successful tests: ${summary.successfulTests}`);
      console.log(`   Failed tests: ${summary.failedTests}`);
      console.log(`\n💾 Data saved to:`);
      console.log(`   Elements: ${footerPath}`);
      console.log(`   Summary: ${summaryPath}`);
      
      // Attach to test report
      test.info().attach('Footer Elements', {
        body: JSON.stringify(footerElements, null, 2),
        contentType: 'application/json'
      });
      
      test.info().attach('Discovery Summary', {
        body: JSON.stringify(summary, null, 2),
        contentType: 'application/json'
      });
      
    } catch (error) {
      console.log('❌ Error saving footer discovery data:', error);
    }
  });

  // Assertions
  expect(footerElements.length).toBeGreaterThan(0);
  console.log(`✅ Footer discovery test completed successfully!`);
});