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
    include: ['vue', 'vue-router', 'pinia', 'uuid', 'marked', 'dompurify']
  },
  build: {
    // 确保生成的文件使用相对路径
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将node_modules的代码分割到单独的chunk中
          if (id.includes('node_modules')) {
            // 把常用库分到不同的chunk中
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'framework'
            }
            if (id.includes('uuid') || id.includes('marked') || id.includes('dompurify')) {
              return 'utils'
            }
            return 'vendor'
          }
        },
        // 确保资源引用使用正确的路径格式
        format: 'es',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 对CSS代码进行分割
    cssCodeSplit: true,
    // 生成source map方便调试
    sourcemap: true,
    // 构建前清空输出目录
    emptyOutDir: true,
    // 提高对模块的兼容性
    target: 'es2015',
    // 确保chunk大小合理
    chunkSizeWarningLimit: 1000
  }
}) 