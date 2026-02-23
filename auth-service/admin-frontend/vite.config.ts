import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/auth/',
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    proxy: {
      '/auth/api': {
        target: 'http://localhost:8091',
        changeOrigin: true,
      },
    },
  },
})
