import { test, expect } from '@playwright/test';

test('search and lot page validation (non-blocking assertions)', async ({ page }) => {
  await page.goto('https://www.catawiki.com/en');

  // Search
  const searchBox = page.getByRole('combobox', { name: /search for brand, model/i });
  await searchBox.click();
  await searchBox.fill('train');

  await page.getByRole('button', { name: /search/i }).click();

  // --- Search results assertions ---
  const lotLink = page.getByRole('link', { name: 'Märklin H0 - 2862 - Train set' });

  await expect.soft(
    lotLink,
    'Expected specific Märklin train lot to appear in search results'
  ).toBeVisible();

  // Navigate only if link exists (defensive, avoids cascade failures)
  if (await lotLink.isVisible().catch(() => false)) {
    await lotLink.click();
  }

  // --- Lot page assertions ---
  await expect.soft(
    page.getByRole('heading', { name: 'Märklin H0 - 2862 - Train set' }),
    'Lot page should display correct heading'
  ).toBeVisible();

  await expect.soft(
    page.getByText(/other people are watching/i),
    'Lot page should show watchers count'
  ).toBeVisible();

  await expect.soft(
    page
      .getByTestId('lot-bid-status-section')
      .getByText('€'),
    'Lot page should show current bid in euros'
  ).toBeVisible();
});
