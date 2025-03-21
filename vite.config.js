import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 根据环境确定基础路径
const base = process.env.NODE_ENV === 'production' ? '/Xpatent/' : '/'

export default defineConfig({
  base, // 设置部署基础路径
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