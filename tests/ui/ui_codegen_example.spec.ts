import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.catawiki.com/en');
  // Cookie consent is already handled by consentedPage fixture
  // so the Agree button won't appear
  // const agreeBtn = page.getByRole('button', { name: 'Agree' });
  // if (await agreeBtn.isVisible().catch(() => false)) {
  //   await agreeBtn.click();
  // }


  await page.getByRole('combobox', { name: 'Search for brand, model,' }).click();
  await page.getByRole('combobox', { name: 'Search for brand, model,' }).fill('train');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('link', { name: 'Märklin H0 - 2862 - Train set' })).toBeVisible();
  await page.getByRole('link', { name: 'Märklin H0 - 2862 - Train set' }).click();
  await expect(page.getByText('27 other people are watching')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Märklin H0 - 2862 - Train set' })).toBeVisible();
  await expect(page.getByTestId('lot-bid-status-section').getByText('€')).toBeVisible();
});