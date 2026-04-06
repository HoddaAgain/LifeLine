import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 실제 백엔드 서버 주소
        changeOrigin: true,
      }
    }
  }
})