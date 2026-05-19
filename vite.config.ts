import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxyConfig = {
  '/api': {
    target: 'http://15.165.247.42',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: proxyConfig,
  },
  preview: {
    port: 4173,
    proxy: proxyConfig,
  },
})
