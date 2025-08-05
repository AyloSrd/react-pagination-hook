import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      name: 'react-pagination-hook',
      entry: ['lib/index.ts'],
      fileName: (format, entryName) => `react-pagination-hook-${entryName}.${format}.js`,
    },
  },
})
