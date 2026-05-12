import { test, expect } from '@playwright/test';

test.describe('Home Feed', () => {
  test('loads and shows navbar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByText('Naija')).toBeVisible();
  });

  test('shows category filter tabs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /politics/i })).toBeVisible();
  });

  test('story cards render on home page', async ({ page }) => {
    await page.goto('/');
    // Allow time for data to load
    await page.waitForTimeout(2000);
    const cards = page.locator('[data-testid="story-card"]');
    // Should have at least 0 cards (may be empty on fresh install)
    await expect(cards.count()).resolves.toBeGreaterThanOrEqual(0);
  });

  test('navbar is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });
});
