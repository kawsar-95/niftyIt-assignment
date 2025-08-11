import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Allow retries for slow connections
  workers: process.env.CI ? 2 : 4, // 4 parallel workers for local development, 2 for CI
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  timeout: 600000, // 10 minutes for comprehensive tests
  globalTimeout: 7200000, // 2 hours global timeout for parallel execution
  expect: {
    timeout: 30000, // 30 seconds for expects
  },
  use: {
    baseURL: 'https://portal.denowatts.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 90000, // 1.5 minutes for actions
    navigationTimeout: 180000, // 3 minutes for navigation
    // Optimize for slow connections and parallel execution
    ignoreHTTPSErrors: true,
    bypassCSP: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Additional optimizations for slow connections
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-ipc-flooding-protection',
            '--no-sandbox'
          ]
        }
      },
    },
  ],
  webServer: undefined,
});
