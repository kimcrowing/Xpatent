import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useConfigStore = defineStore('config', () => {
  // 状态
  const userConfig = ref({})
  const loading = ref(false)
  const error = ref(null)
  const configStatus = ref('unchecked') // unchecked, loaded, missing, error
  
  const authStore = useAuthStore()
  
  // 计算属性
  const hasConfig = computed(() => {
    return configStatus.value === 'loaded' && 
           Object.keys(userConfig.value).length > 0 &&
           userConfig.value.api_key // 至少需要API密钥
  })
  
  const isAdmin = computed(() => authStore.isAdmin)
  
  const needsConfig = computed(() => {
    // 用户已登录但没有配置
    return authStore.isAuthenticated && 
          !hasConfig.value && 
          configStatus.value !== 'unchecked' &&
          !isAdmin.value // 管理员会自动使用默认配置
  })
  
  // 动作
  const fetchUserConfig = async () => {
    if (!authStore.isAuthenticated) {
      configStatus.value = 'unchecked'
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get('/api/user/config')
      userConfig.value = response.data
      
      if (Object.keys(userConfig.value).length > 0 && userConfig.value.api_key) {
        configStatus.value = 'loaded'
      } else {
        configStatus.value = 'missing'
      }
    } catch (err) {
      console.error('获取用户配置失败:', err)
      error.value = '获取配置失败，请稍后重试'
      configStatus.value = 'error'
    } finally {
      loading.value = false
    }
  }
  
  const saveUserConfig = async (config) => {
    loading.value = true
    error.value = null
    
    try {
      await axios.post('/api/user/config', config)
      userConfig.value = config
      
      if (Object.keys(userConfig.value).length > 0 && userConfig.value.api_key) {
        configStatus.value = 'loaded'
      } else {
        configStatus.value = 'missing'
      }
      
      return { success: true }
    } catch (err) {
      console.error('保存用户配置失败:', err)
      error.value = '保存配置失败，请稍后重试'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  const fetchDefaultConfig = async () => {
    if (!authStore.isAdmin) {
      throw new Error('只有管理员可以获取默认配置')
    }
    
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get('/api/admin/default-config')
      return response.data
    } catch (err) {
      console.error('获取默认配置失败:', err)
      error.value = '获取默认配置失败，请稍后重试'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const saveDefaultConfig = async (config) => {
    if (!authStore.isAdmin) {
      throw new Error('只有管理员可以设置默认配置')
    }
    
    loading.value = true
    error.value = null
    
    try {
      await axios.post('/api/admin/default-config', config)
      return { success: true }
    } catch (err) {
      console.error('保存默认配置失败:', err)
      error.value = '保存默认配置失败，请稍后重试'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  const clearConfig = () => {
    userConfig.value = {}
    configStatus.value = 'unchecked'
    error.value = null
  }
  
  // 当用户登录状态变化时清除配置
  authStore.$subscribe((mutation, state) => {
    if (!state.isAuthenticated) {
      clearConfig()
    }
  })
  
  return {
    // 状态
    userConfig,
    loading,
    error,
    configStatus,
    
    // 计算属性
    hasConfig,
    needsConfig,
    isAdmin,
    
    // 动作
    fetchUserConfig,
    saveUserConfig,
    fetchDefaultConfig,
    saveDefaultConfig,
    clearConfig
  }
}) 