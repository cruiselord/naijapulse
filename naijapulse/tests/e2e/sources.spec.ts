import { test, expect } from '@playwright/test'

test.describe('Sources Page', () => {
  test('loads sources directory', async ({ page }) => {
    await page.goto('/sources')
    await expect(page.getByRole('heading', { name: /source directory/i })).toBeVisible()
  })

  test('shows bias legend', async ({ page }) => {
    await page.goto('/sources')
    await expect(page.getByText(/bias scale/i)).toBeVisible()
  })

  test('sources link navigates to source profile', async ({ page }) => {
    await page.goto('/sources')
    const sourceLinks = page.locator('a[href^="/source/"]')
    const count = await sourceLinks.count()
    if (count > 0) {
      await sourceLinks.first().click()
      await expect(page).toHaveURL(/\/source\//)
    }
  })
})
