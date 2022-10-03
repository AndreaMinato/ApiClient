// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'ApiClient',
      formats: ["cjs", "es", "umd"],
      // the proper extensions will be added
      fileName: 'api-client'
    },
  }
})
