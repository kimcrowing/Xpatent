<template>
  <div class="app-layout">
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="header-left">
          <button class="sidebar-toggle" @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
          <router-link to="/" class="app-brand">
            <span>Xpatent</span>
          </router-link>
        </div>
        
        <div class="user-menu">
          <!-- 功能菜单按钮 -->
          <div class="function-menu-button" @click="toggleFunctionMenu">
            <i class="fas fa-th"></i>
          </div>
          
          <!-- 功能菜单 -->
          <div class="function-menu" v-if="functionMenuOpen">
            <div class="function-menu-header">
              <h3>专利助手功能</h3>
            </div>
            <div class="function-menu-items">
              <router-link to="/patent-writer" class="function-menu-item">
                <i class="fas fa-file-alt"></i>
                <span>专利撰写</span>
              </router-link>
              <router-link to="/patent-response" class="function-menu-item">
                <i class="fas fa-comments"></i>
                <span>专利答审</span>
              </router-link>
              <router-link to="/patent-search" class="function-menu-item">
                <i class="fas fa-search"></i>
                <span>专利检索</span>
              </router-link>
            </div>
          </div>
          
          <!-- 用户头像和菜单 -->
          <div class="dropdown" v-if="isAuthenticated">
            <button class="dropdown-toggle user-avatar" @click="toggleUserMenu">
              <img src="https://ui-avatars.com/api/?name=User&background=random" alt="User Avatar">
            </button>
            <div class="dropdown-menu" v-if="userMenuOpen">
              <div class="dropdown-header">
                <strong>{{ user.username }}</strong>
              </div>
              <router-link to="/profile" class="dropdown-item">
                <i class="fas fa-user"></i> 个人资料
              </router-link>
              <router-link to="/settings" class="dropdown-item">
                <i class="fas fa-cog"></i> 设置
              </router-link>
              <router-link v-if="isAdmin" to="/admin" class="dropdown-item">
                <i class="fas fa-shield-alt"></i> 管理控制台
              </router-link>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item" @click.prevent="logout">
                <i class="fas fa-sign-out-alt"></i> 退出
              </a>
            </div>
          </div>
          <template v-else>
            <router-link to="/login" class="btn btn-outline">登录</router-link>
            <router-link to="/register" class="btn btn-primary">注册</router-link>
          </template>
        </div>
      </header>
      
      <!-- 侧边栏 -->
      <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-header">
          <h3>Xpatent 专利助手</h3>
        </div>
        
        <nav class="sidebar-menu">
          <ul>
            <li>
              <router-link to="/" exact class="sidebar-item">
                <i class="fas fa-home"></i>
                <span>首页</span>
              </router-link>
            </li>
            <li>
              <router-link to="/patent-writer" class="sidebar-item">
                <i class="fas fa-file-alt"></i>
                <span>专利撰写</span>
              </router-link>
            </li>
            <li>
              <router-link to="/patent-response" class="sidebar-item">
                <i class="fas fa-comments"></i>
                <span>专利答审</span>
              </router-link>
            </li>
            <li>
              <router-link to="/patent-search" class="sidebar-item">
                <i class="fas fa-search"></i>
                <span>专利检索</span>
              </router-link>
            </li>
            <li>
              <router-link to="/settings" class="sidebar-item">
                <i class="fas fa-cog"></i>
                <span>系统设置</span>
              </router-link>
            </li>
          </ul>
        </nav>
      </aside>
      
      <!-- 遮罩层，用于在侧边栏打开时点击关闭 -->
      <div class="sidebar-overlay" v-if="sidebarOpen" @click="toggleSidebar"></div>
      
      <!-- 页面内容 -->
      <main class="content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MainLayout',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const userMenuOpen = ref(false)
    const functionMenuOpen = ref(false)
    const sidebarOpen = ref(false)
    
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const isAdmin = computed(() => authStore.isAdmin)
    const user = computed(() => authStore.user)
    
    const toggleUserMenu = () => {
      userMenuOpen.value = !userMenuOpen.value
      functionMenuOpen.value = false
    }
    
    const toggleFunctionMenu = () => {
      functionMenuOpen.value = !functionMenuOpen.value
      userMenuOpen.value = false
    }
    
    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value
    }
    
    const logout = async () => {
      await authStore.logout()
      router.push('/login')
      userMenuOpen.value = false
    }
    
    // 点击外部关闭下拉菜单
    const closeMenuOnOutsideClick = (e) => {
      if (userMenuOpen.value && !e.target.closest('.dropdown')) {
        userMenuOpen.value = false
      }
      if (functionMenuOpen.value && !e.target.closest('.function-menu-button') && !e.target.closest('.function-menu')) {
        functionMenuOpen.value = false
      }
    }
    
    // 监听点击事件
    onMounted(() => {
      document.addEventListener('click', closeMenuOnOutsideClick)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', closeMenuOnOutsideClick)
    })
    
    return {
      isAuthenticated,
      isAdmin,
      user,
      userMenuOpen,
      functionMenuOpen,
      sidebarOpen,
      toggleUserMenu,
      toggleFunctionMenu,
      toggleSidebar,
      logout
    }
  }
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
  background-color: #f8f9fa;
}

/* 顶部导航样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 64px;
  background-color: #fff;
  border-bottom: 1px solid #e9ecef;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.sidebar-toggle {
  background: none;
  border: none;
  font-size: 20px;
  margin-right: 15px;
  cursor: pointer;
  color: #555;
}

.app-brand {
  font-size: 22px;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.function-menu-button {
  font-size: 20px;
  padding: 8px;
  border-radius: 50%;
  background-color: transparent;
  cursor: pointer;
  color: #555;
}

.function-menu-button:hover {
  background-color: #f0f0f0;
}

.function-menu {
  position: absolute;
  top: 60px;
  right: 60px;
  width: 300px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.function-menu-header {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
}

.function-menu-items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 15px;
}

.function-menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  text-align: center;
}

.function-menu-item:hover {
  background-color: #f5f5f5;
}

.function-menu-item i {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--primary-color);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  margin-top: 8px;
}

.dropdown-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-divider {
  height: 1px;
  background-color: #e9ecef;
  margin: 8px 0;
}

/* 侧边栏样式 */
.sidebar {
  position: fixed;
  top: 64px;
  left: -280px;
  width: 280px;
  height: calc(100vh - 64px);
  background-color: #fff;
  border-right: 1px solid #e9ecef;
  transition: left 0.3s ease;
  z-index: 999;
  overflow-y: auto;
}

.sidebar-open {
  left: 0;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
}

.sidebar-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
}

.sidebar-item i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.sidebar-item:hover,
.sidebar-item.router-link-active {
  background-color: #f5f5f5;
  color: var(--primary-color);
}

.sidebar-overlay {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* 内容区域样式 */
.main-content {
  height: 100vh;
}

.content {
  padding: 80px 20px 20px;
  height: 100%;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .function-menu {
    width: 260px;
    right: 10px;
  }
  
  .function-menu-items {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 