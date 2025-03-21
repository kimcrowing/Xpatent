<template>
  <div class="register-page">
    <div class="auth-container">
      <h1 class="page-title">注册账户</h1>
      
      <form @submit.prevent="registerUser" class="auth-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            required 
            placeholder="请输入用户名"
          />
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="请输入邮箱"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="请输入密码"
          />
        </div>
        
        <div class="form-group">
          <label for="invitation">邀请码</label>
          <input 
            type="text" 
            id="invitation" 
            v-model="invitationCode" 
            required 
            placeholder="请输入邀请码"
          />
          <small>注册需要邀请码，请联系管理员获取</small>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn" :disabled="isSubmitting">
            {{ isSubmitting ? '注册中...' : '注册' }}
          </button>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
      
      <div class="auth-links">
        已有账户？ <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'RegisterPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    
    // 表单数据
    const username = ref('')
    const email = ref('')
    const password = ref('')
    const invitationCode = ref('')
    const error = ref('')
    const isSubmitting = ref(false)
    
    // 注册方法
    const registerUser = async () => {
      try {
        isSubmitting.value = true
        error.value = ''
        
        // 调用注册接口
        await authStore.register({
          username: username.value,
          email: email.value,
          password: password.value,
          invitation_code: invitationCode.value
        })
        
        // 注册成功，重定向到之前页面或首页
        const redirectPath = route.query.redirect || '/'
        router.push(redirectPath)
      } catch (err) {
        // 显示错误信息
        error.value = err.response?.data?.error || '注册失败，请稍后重试'
      } finally {
        isSubmitting.value = false
      }
    }
    
    return {
      username,
      email,
      password,
      invitationCode,
      error,
      isSubmitting,
      registerUser
    }
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: var(--spacing-md);
}

.auth-container {
  width: 100%;
  max-width: 450px;
  padding: var(--spacing-xl);
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.page-title {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  color: var(--dark-color);
}

.auth-form {
  margin-bottom: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 16px;
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 0.8rem;
}

.form-actions {
  margin-top: var(--spacing-lg);
}

.error-message {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: var(--border-radius);
  text-align: center;
}

.auth-links {
  text-align: center;
  margin-top: var(--spacing-md);
  color: #666;
}

.auth-links a {
  color: var(--primary-color);
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}
</style> 