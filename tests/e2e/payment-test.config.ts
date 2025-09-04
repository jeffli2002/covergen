import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/creem-payment-full.spec.ts',
  fullyParallel: false, // Payment tests should run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for payment tests
  reporter: [
    ['html', { outputFolder: 'payment-test-results' }],
    ['json', { outputFile: 'payment-test-results.json' }],
    ['list']
  ],
  
  timeout: 60000, // 60 seconds for payment operations
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Payment-specific settings
    actionTimeout: 15000, // 15 seconds for actions
    navigationTimeout: 30000, // 30 seconds for navigation
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Ensure cookies and storage persist for payment flows
        storageState: undefined,
        // Viewport for payment forms
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },
  ],

  // Payment test specific setup
  globalSetup: './payment-test-setup.ts',
  globalTeardown: './payment-test-teardown.ts',

  // Environment variables for payment testing
  use: {
    extraHTTPHeaders: {
      // Add any required headers for payment testing
      'X-Test-Mode': 'true',
    },
  },
});