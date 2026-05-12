import { test, expect } from '@playwright/test'

test.describe('Blindspots Page', () => {
  test('loads with correct heading', async ({ page }) => {
    await page.goto('/blindspots')
    await expect(page.getByRole('heading', { name: /blindspot/i })).toBeVisible()
  })

  test('shows filter tabs', async ({ page }) => {
    await page.goto('/blindspots')
    await expect(page.getByText(/all blindspots/i)).toBeVisible()
    await expect(page.getByText(/missing left/i)).toBeVisible()
    await expect(page.getByText(/missing right/i)).toBeVisible()
  })

  test('shows explainer section', async ({ page }) => {
    await page.goto('/blindspots')
    await expect(page.getByText(/why do blindspots matter/i)).toBeVisible()
  })

  test('filter tabs are clickable', async ({ page }) => {
    await page.goto('/blindspots')
    await page.getByText(/missing left/i).click()
    await expect(page.getByText(/missing left/i)).toBeVisible()
  })
})
