<template>
  <div id="app" :class="{ 'dark-mode': darkMode }">
    <router-view></router-view>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const darkMode = ref(localStorage.getItem('darkMode') === 'true')
    
    onMounted(() => {
      document.documentElement.classList.toggle('dark-mode', darkMode.value)
    })
    
    return {
      darkMode
    }
  }
}
</script>

<style>
:root {
  --primary-color: #3a8ff7;
  --secondary-color: #2a7ee6;
  --dark-color: #333;
  --light-color: #f8f9fa;
  --border-color: #e9ecef;
  --border-radius: 8px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --transition: all 0.3s ease;
  --box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background-color: #f8f9fa;
}

#app {
  height: 100vh;
}

.dark-mode {
  --primary-color: #4a9dff;
  --secondary-color: #3a8ff7;
  --dark-color: #f8f9fa;
  --light-color: #333;
  --border-color: #444;
  
  background-color: #333;
  color: #f8f9fa;
}

.dark-mode .card,
.dark-mode .header,
.dark-mode .sidebar {
  background-color: #444;
  border-color: #555;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* 按钮样式 */
.btn {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: var(--secondary-color);
}

.btn-outline {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background-color: transparent;
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: #fff;
}

.btn-secondary {
  background-color: #6c757d;
  color: #fff;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

/* 卡片样式 */
.card {
  background-color: #fff;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: var(--spacing-md);
}

/* 加载指示器 */
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 表单元素 */
.form-control {
  display: block;
  width: 100%;
  padding: 8px 12px;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
}

.font-small {
  font-size: 14px;
}

.font-medium {
  font-size: 16px;
}

.font-large {
  font-size: 18px;
}
</style> 