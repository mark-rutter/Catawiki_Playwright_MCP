import { test } from '../../tests/baseTest';
import { writeFileSync } from 'fs';
import path from 'path';

test('Network Discovery - Capture API calls during search', async ({ consentedPage: page }) => {
  // Page is already on Catawiki with consent dismissed

  const discoveries: any[] = [];

  // Capture network requests
  page.on('request', req => {
    if (req.resourceType() === 'xhr' || req.resourceType() === 'fetch') {
      discoveries.push({
        url: req.url(),
        method: req.method(),
      });
    }
  });

  // Capture network responses
  page.on('response', async res => {
    if (res.request().resourceType() === 'xhr' || res.request().resourceType() === 'fetch') {
      discoveries.push({
        url: res.url(),
        status: res.status(),
      });
    }
  });

  // Perform search actions to trigger network calls
  const searchBox = page.getByRole('combobox', { name: /search/i });
  await searchBox.click();
  await searchBox.fill('train');
  
  const searchButton = page.getByRole('button', { name: /search/i });
  await searchButton.click();
  
  // Wait for search results to load
  await page.waitForLoadState('domcontentloaded');
  
  // Click on a lot to trigger more API calls
  try {
    await page.locator('a[href*="/lot/"]').nth(1).click({ timeout: 5000 });
    await page.waitForLoadState('domcontentloaded');
  } catch (e) {
    console.log('Could not click lot link, skipping');
  }

  // Save discoveries to file
  const outputPath = path.resolve('src/discovery/network-discovery.json');
  writeFileSync('output.json', JSON.stringify(discoveries, null, 2));

  // Log summary
  console.log(`\n📡 Network Discovery Complete`);
  console.log(`Total API calls captured: ${discoveries.length}`);
  console.log(`Saved to: ${outputPath}`);
  
  // Attach to report
  await test.step('API Discovery Summary', async () => {
    test.info().attach('Network Calls', {
      body: `Total calls: ${discoveries.length}\n\n${JSON.stringify(discoveries.slice(0, 5), null, 2)}...`,
      contentType: 'text/plain'
    });
  });
});
