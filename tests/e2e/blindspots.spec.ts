import { test, expect } from '@playwright/test';

test.describe('Blindspots Page', () => {
  test('blindspots page loads', async ({ page }) => {
    await page.goto('/blindspots');
    await expect(page).toHaveURL('/blindspots');
    await expect(page.getByRole('heading', { name: /blindspot/i })).toBeVisible();
  });

  test('shows filter tabs', async ({ page }) => {
    await page.goto('/blindspots');
    await expect(page.getByText(/missing left/i)).toBeVisible();
    await expect(page.getByText(/missing right/i)).toBeVisible();
  });
});
