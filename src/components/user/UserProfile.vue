<template>
  <div class="user-profile">
    <div class="profile-header">
      <h1 class="page-title">个人设置</h1>
      <p class="page-description">管理您的账户信息和API配置</p>
    </div>
    
    <div class="profile-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'profile' }"
        @click="activeTab = 'profile'"
      >
        账户信息
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'api' }"
        @click="activeTab = 'api'"
      >
        API配置
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'security' }"
        @click="activeTab = 'security'"
      >
        安全设置
      </div>
    </div>
    
    <div class="tab-content">
      <!-- 账户信息标签内容 -->
      <div v-show="activeTab === 'profile'" class="tab-pane">
        <div class="card">
          <div class="card-body">
            <h2 class="section-title">基本信息</h2>
            
            <div class="form-group">
              <label for="username">用户名</label>
              <input 
                type="text" 
                id="username" 
                v-model="profileData.username" 
                class="form-control"
                disabled
              />
            </div>
            
            <div class="form-group">
              <label for="email">电子邮箱</label>
              <input 
                type="email" 
                id="email" 
                v-model="profileData.email" 
                class="form-control"
                :disabled="saving"
              />
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                class="btn btn-primary" 
                @click="saveProfile"
                :disabled="saving"
              >
                {{ saving ? '保存中...' : '保存信息' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- API配置标签内容 -->
      <div v-show="activeTab === 'api'" class="tab-pane">
        <APIConfig />
      </div>
      
      <!-- 安全设置标签内容 -->
      <div v-show="activeTab === 'security'" class="tab-pane">
        <div class="card">
          <div class="card-body">
            <h2 class="section-title">修改密码</h2>
            
            <div v-if="passwordError" class="alert alert-danger">
              {{ passwordError }}
            </div>
            
            <div v-if="passwordSuccess" class="alert alert-success">
              {{ passwordSuccess }}
            </div>
            
            <div class="form-group">
              <label for="current-password">当前密码</label>
              <input 
                type="password" 
                id="current-password" 
                v-model="passwordData.currentPassword" 
                class="form-control"
                :disabled="passwordSaving"
              />
            </div>
            
            <div class="form-group">
              <label for="new-password">新密码</label>
              <input 
                type="password" 
                id="new-password" 
                v-model="passwordData.newPassword" 
                class="form-control"
                :disabled="passwordSaving"
              />
            </div>
            
            <div class="form-group">
              <label for="confirm-password">确认新密码</label>
              <input 
                type="password" 
                id="confirm-password" 
                v-model="passwordData.confirmPassword" 
                class="form-control"
                :disabled="passwordSaving"
              />
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                class="btn btn-primary" 
                @click="changePassword"
                :disabled="passwordSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword"
              >
                {{ passwordSaving ? '更新中...' : '更新密码' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import APIConfig from '@/components/settings/APIConfig.vue'
import axios from 'axios'

export default {
  name: 'UserProfile',
  components: {
    APIConfig
  },
  setup() {
    const authStore = useAuthStore()
    const configStore = useConfigStore()
    
    // 状态
    const activeTab = ref('profile')
    const saving = ref(false)
    const passwordSaving = ref(false)
    const error = ref(null)
    const passwordError = ref(null)
    const passwordSuccess = ref(null)
    
    // 表单数据
    const profileData = reactive({
      username: '',
      email: ''
    })
    
    const passwordData = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // 当组件加载时获取用户信息
    onMounted(() => {
      if (authStore.user) {
        profileData.username = authStore.user.username
        profileData.email = authStore.user.email || ''
      }
      
      // 同时检查是否需要配置API
      configStore.fetchUserConfig()
    })
    
    // 保存个人资料
    const saveProfile = async () => {
      error.value = null
      saving.value = true
      
      try {
        // 调用实际API更新用户信息
        const response = await axios.put('/api/user/profile', {
          username: profileData.username,
          email: profileData.email
        })
        
        // 更新本地存储的用户信息
        authStore.updateUser(response.data.user)
      } catch (err) {
        error.value = '更新个人信息失败: ' + (err.response?.data?.error || err.message || '未知错误')
      } finally {
        saving.value = false
      }
    }
    
    // 更改密码
    const changePassword = async () => {
      passwordError.value = null
      passwordSuccess.value = null
      passwordSaving.value = true
      
      try {
        // 验证新密码
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          throw new Error('两次输入的新密码不匹配')
        }
        
        if (passwordData.newPassword.length < 8) {
          throw new Error('新密码长度不能少于8个字符')
        }
        
        // 调用API更新密码
        await axios.put('/api/user/password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
        
        // 清空密码字段
        passwordData.currentPassword = ''
        passwordData.newPassword = ''
        passwordData.confirmPassword = ''
        
        // 显示成功消息
        passwordSuccess.value = '密码已成功更新'
      } catch (err) {
        passwordError.value = err.response?.data?.error || err.message || '更改密码失败'
      } finally {
        passwordSaving.value = false
      }
    }
    
    return {
      activeTab,
      profileData,
      passwordData,
      saving,
      passwordSaving,
      error,
      passwordError,
      passwordSuccess,
      saveProfile,
      changePassword
    }
  }
}
</script>

<style scoped>
.user-profile {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: var(--spacing-lg);
}

.page-description {
  color: #666;
}

.profile-tabs {
  display: flex;
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.tab-item {
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  border-bottom: 2px solid transparent;
}

.tab-item:hover {
  background-color: #f8f9fa;
}

.tab-item.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-content {
  margin-top: var(--spacing-md);
}

.tab-pane {
  animation: fadeIn 0.3s ease-in-out;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-lg);
  color: var(--dark-color);
}

.form-actions {
  margin-top: var(--spacing-lg);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 