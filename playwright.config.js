import { defineConfig, devices } from '@playwright/test';

const externalBaseURL = process.env.SEEKLUME_BASE_URL;
const smokePort = process.env.SEEKLUME_SMOKE_PORT || '8931';
const localBaseURL = `http://localhost:${smokePort}`;

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 10000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL: externalBaseURL || localBaseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  ...(externalBaseURL ? {} : {
    webServer: {
      command: `python3 -m http.server ${smokePort}`,
      url: `${localBaseURL}/docs/`,
      reuseExistingServer: !process.env.CI,
      timeout: 15000
    }
  }),
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 }
      }
    }
  ]
});
