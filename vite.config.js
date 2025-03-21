import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.vue', '.json']
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws'
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia']
  }
}) 