<template>
  <div class="login-container">
    <div class="login-page">
      <div class="card login-card">
        <h1 class="card-title">登录</h1>
        
        <div class="alert alert-danger" v-if="error">
          {{ error }}
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input 
              type="text" 
              id="username" 
              v-model="username" 
              required 
              autocomplete="username"
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label for="password">密码</label>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              required 
              autocomplete="current-password"
              :disabled="loading"
            />
          </div>
          
          <div class="form-actions">
            <router-link to="/forgot-password" class="forgot-password">
              忘记密码?
            </router-link>
            
            <button type="submit" class="btn" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </div>
        </form>
        
        <div class="card-footer">
          <p>还没有账号? <router-link to="/register">注册</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const configStore = useConfigStore()
    
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)
    
    const handleLogin = async () => {
      try {
        loading.value = true
        error.value = ''
        
        console.log('正在尝试登录:', username.value)
        
        const result = await authStore.login(username.value, password.value)
        console.log('登录结果:', result)
        
        if (result.success) {
          // 登录成功后获取用户配置
          await configStore.fetchUserConfig()
          
          // 重定向到请求的页面或首页
          const redirectPath = route.query.redirect || '/'
          router.push(redirectPath)
        } else {
          error.value = result.message || '登录失败，请检查用户名和密码'
        }
      } catch (err) {
        console.error('登录组件错误:', err)
        error.value = '登录过程中发生错误，请稍后重试'
      } finally {
        loading.value = false
      }
    }
    
    return {
      username,
      password,
      error,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.login-page {
  width: 100%;
  max-width: 500px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius);
  background-color: white;
  margin: 0 auto;
}

.card-title {
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.8rem;
  color: var(--dark-color);
}

.alert {
  margin-bottom: 20px;
  color: #d9534f;
  background-color: lighten(#e74c3c, 40%);
  padding: 12px;
  border-radius: var(--border-radius);
  border-left: 4px solid var(--danger-color);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 16px;
  transition: var(--transition);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
}

.forgot-password {
  font-size: 0.9em;
  color: var(--primary-color);
}

.btn {
  padding: 12px 25px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
}

.btn:hover {
  background-color: darken(#3498db, 10%);
  transform: translateY(-2px);
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.card-footer {
  margin-top: 30px;
  text-align: center;
  color: #666;
}
</style> 