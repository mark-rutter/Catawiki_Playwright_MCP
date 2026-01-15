import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.catawiki.com/en');
  await expect(page.getByRole('button', { name: 'Continue without accepting' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue without accepting' }).click();
  await page.getByRole('combobox', { name: 'Search for brand, model,' }).click();
  await page.getByRole('combobox', { name: 'Search for brand, model,' }).fill('train');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('heading', { name: 'train' }).click();
  await expect(page.locator('h1')).toContainText('train');
});