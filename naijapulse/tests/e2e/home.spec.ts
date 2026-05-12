import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('loads navbar with NaijaPulse branding', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.getByText('Naija')).toBeVisible()
    await expect(page.getByText('Pulse')).toBeVisible()
  })

  test('shows markets ticker at top', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Markets')).toBeVisible()
  })

  test('category filter renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /politics/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /business/i })).toBeVisible()
  })

  test('sidebar shows Nigerian Lens on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await expect(page.getByText('Nigerian Lens')).toBeVisible()
  })

  test('story cards render (or empty state shown)', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    const cards    = page.locator('[data-testid="story-card"]')
    const empty    = page.getByText('No stories yet')
    const count    = await cards.count()
    if (count === 0) {
      await expect(empty).toBeVisible()
    } else {
      expect(count).toBeGreaterThan(0)
    }
  })

  test('footer renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('NaijaPulse')).toBeVisible()
  })
})

test.describe('Responsive', () => {
  test('mobile: navbar visible, hamburger shown', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.getByLabel('Toggle menu')).toBeVisible()
  })

  test('mobile: hamburger opens drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.getByLabel('Toggle menu').click()
    await expect(page.getByRole('navigation').last()).toBeVisible()
  })
})
