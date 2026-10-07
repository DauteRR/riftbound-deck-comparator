/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the project under /<repo-name>/
  base: '/riftbound-deck-comparator/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
