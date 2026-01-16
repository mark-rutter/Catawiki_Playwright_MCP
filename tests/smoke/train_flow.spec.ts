import { test, expect } from '../baseTest';

test('lot details are visible and values are logged', async ({ consentedPage: page }) => {
  // Page is already on Catawiki with consent dismissed

  // --- Search ---
  const searchBox = page.getByRole('combobox', { name: /search for brand, model/i });
  await searchBox.fill('train');
  await page.getByRole('button', { name: /search/i }).click();

  const lotLink = page.getByRole('link', { name: /märklin h0 - 2862 - train set/i });

  await expect.soft(
    lotLink,
    'Expected Märklin train lot to appear in search results'
  ).toBeVisible();

  // Navigate defensively
  if (await lotLink.isVisible().catch(() => false)) {
    await lotLink.click();
  } else {
    console.warn('⚠️ Lot link not visible, skipping lot page value extraction');
    return;
  }

  // --- Lot Page Locators ---
  const lotName = page.getByRole('heading', { level: 1 });
  const favorites = page.getByText(/people are watching/i);
  const currentBid = page
    .getByTestId('lot-bid-status-section')
    .locator('text=/€|EUR/');

  // --- Soft Assertions ---
  await expect.soft(lotName, 'Lot name should be visible').toBeVisible();
  await expect.soft(favorites, 'Favorites counter should be visible').toBeVisible();
  await expect.soft(currentBid, 'Current bid should be visible').toBeVisible();

  // --- Value Extraction (defensive) ---
  const lotNameValue = await lotName.textContent().catch(() => null);
  const favoritesValue = await favorites.textContent().catch(() => null);
  const currentBidValue = await currentBid.textContent().catch(() => null);

  // --- Console Output ---
  console.log('\n📦 Lot Page Values');
  console.log('------------------------');
  console.log(`📌 Lot name     : ${lotNameValue ?? 'NOT FOUND'}`);
  console.log(`❤️ Favorites   : ${favoritesValue ?? 'NOT FOUND'}`);
  console.log(`💰 Current bid : ${currentBidValue ?? 'NOT FOUND'}`);
  console.log('------------------------\n');
});
