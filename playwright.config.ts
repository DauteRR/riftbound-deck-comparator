import { defineConfig } from '@playwright/test'

const PORT = 4173

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}/riftbound-deck-comparator/`,
  },
  webServer: {
    command: `pnpm build && pnpm preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}/riftbound-deck-comparator/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
