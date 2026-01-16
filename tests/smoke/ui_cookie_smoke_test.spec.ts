import { test, expect } from '../baseTest';
import fs from 'fs';
import path from 'path';

test('test', async ({ consentedPage: page }) => {
  // Page is already on Catawiki with consent dismissed
  await page.getByRole('combobox', { name: 'Search for brand, model,' }).click();
  await page.getByRole('combobox', { name: 'Search for brand, model,' }).fill('train');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('link', { name: 'Märklin H0 - 2862 - Train set' })).toBeVisible();
  await page.getByRole('link', { name: 'Märklin H0 - 2862 - Train set' }).click();
  // Use flexible regex to match "X other people are watching" regardless of exact count
  await expect(page.getByText(/\d+ other people are watching/)).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: 'Märklin H0 - 2862 - Train set' })).toBeVisible();
  await expect(page.getByTestId('lot-bid-status-section').getByText('€')).toBeVisible();


});