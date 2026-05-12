import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir:       './tests/e2e',
  fullyParallel: false,
  retries:       1,
  reporter:      'html',
  use: {
    baseURL:    'http://localhost:3000',
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile',   use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command:             'pnpm dev',
    url:                 'http://localhost:3000',
    reuseExistingServer: true,
    timeout:             120_000,
  },
})
