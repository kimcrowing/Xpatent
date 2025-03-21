import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  
  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.isAdmin || false)
  
  // 动作
  const login = async (username, password) => {
    try {
      console.log('开始登录请求:', { username })
      
      const response = await axios.post('/api/auth/login', { username, password })
      console.log('登录响应:', response.data)
      
      token.value = response.data.token
      user.value = response.data.user
      
      // 保存到本地存储
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      
      // 设置全局请求头
      setAuthHeader(token.value)
      
      return { success: true }
    } catch (error) {
      console.error('登录失败详情:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      })
      
      return { 
        success: false, 
        message: error.response?.data?.error || '登录失败，请检查用户名和密码' 
      }
    }
  }
  
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData)
      
      token.value = response.data.token
      user.value = response.data.user
      
      // 保存到本地存储
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      
      // 设置全局请求头
      setAuthHeader(token.value)
      
      return { success: true }
    } catch (error) {
      console.error('注册失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '注册失败，请稍后重试' 
      }
    }
  }
  
  const logout = () => {
    // 清除状态
    token.value = null
    user.value = null
    
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 清除请求头
    setAuthHeader(null)
  }
  
  const requestPasswordReset = async (email) => {
    try {
      const response = await axios.post('/api/auth/request-reset', { email })
      return { 
        success: true, 
        message: response.data.message 
      }
    } catch (error) {
      console.error('密码重置请求失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '密码重置请求失败' 
      }
    }
  }
  
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        newPassword
      })
      return { 
        success: true, 
        message: response.data.message 
      }
    } catch (error) {
      console.error('密码重置失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '密码重置失败' 
      }
    }
  }
  
  // 更新用户信息
  const updateUser = (userData) => {
    user.value = userData
    // 保存到本地存储
    localStorage.setItem('user', JSON.stringify(user.value))
  }
  
  // 工具函数
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }
  
  // 初始化
  if (token.value) {
    setAuthHeader(token.value)
  }
  
  return {
    // 状态
    token,
    user,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    
    // 动作
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    updateUser
  }
}) 