<template>
  <div class="not-found">
    <div class="not-found-container">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-message">抱歉，您访问的页面不存在或已被移除。</p>
      <router-link to="/" class="btn">返回首页</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage'
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  text-align: center;
  padding: var(--spacing-md);
}

.not-found-container {
  max-width: 600px;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  margin: var(--spacing-md) 0;
  color: var(--dark-color);
}

.error-message {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: var(--spacing-xl);
}

.btn {
  display: inline-block;
  margin-top: var(--spacing-md);
}
</style> 