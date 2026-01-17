import { test, expect } from '../baseTest';

/* First FAST exploration of UI with Playwright codegen */

test('test', async ({ consentedPage: page }) => {
  // Page is already on Catawiki with consent dismissed via baseTest fixture

  await page.getByRole('combobox', { name: 'Search for brand, model,' }).click();
  await page.getByRole('combobox', { name: 'Search for brand, model,' }).fill('train');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('link', { name: 'Märklin H0 - 2862 - Train set' })).toBeVisible();
  await page.getByRole('link', { name: 'Märklin H0 - 2862 - Train set' }).click();
  // Use flexible regex for watching count
  await expect(page.getByText(/\d+ other people are watching/)).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: 'Märklin H0 - 2862 - Train set' })).toBeVisible();
  await expect(page.getByTestId('lot-bid-status-section').getByText('€')).toBeVisible();
});