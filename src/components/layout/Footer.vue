<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-copyright">
          &copy; {{ currentYear }} Xpatent - 版权所有
        </div>
        <div class="footer-links">
          <a href="#" @click.prevent="showAbout">关于我们</a>
          <a href="#" @click.prevent="showTerms">使用条款</a>
          <a href="#" @click.prevent="showPrivacy">隐私政策</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'AppFooter',
  setup() {
    const currentYear = computed(() => new Date().getFullYear())
    
    const showAbout = () => {
      // 实现显示关于我们的对话框
    }
    
    const showTerms = () => {
      // 实现显示使用条款的对话框
    }
    
    const showPrivacy = () => {
      // 实现显示隐私政策的对话框
    }
    
    return {
      currentYear,
      showAbout,
      showTerms,
      showPrivacy
    }
  }
}
</script>

<style scoped>
.footer {
  background-color: var(--dark-color);
  color: white;
  padding: var(--spacing-lg) 0;
  margin-top: var(--spacing-xl);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.footer-links {
  display: flex;
  gap: var(--spacing-lg);
}

.footer-links a {
  color: var(--light-color);
  
  &:hover {
    color: white;
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
}
</style> 