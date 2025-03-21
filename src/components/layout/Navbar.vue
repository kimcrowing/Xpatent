<template>
  <nav class="navbar">
    <div class="container">
      <router-link to="/" class="navbar-brand">Xpatent</router-link>
      
      <button class="navbar-toggle" @click="toggleNav" v-if="isMobile">
        <span></span><span></span><span></span>
      </button>
      
      <ul class="navbar-nav" :class="{ 'active': navActive }">
        <li class="nav-item" v-if="isAuthenticated">
          <router-link to="/patent-writer" class="nav-link">专利撰写</router-link>
        </li>
        <li class="nav-item" v-if="isAuthenticated">
          <router-link to="/patent-response" class="nav-link">专利答审</router-link>
        </li>
        
        <!-- 未登录状态 -->
        <template v-if="!isAuthenticated">
          <li class="nav-item">
            <router-link to="/login" class="nav-link">登录</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/register" class="nav-link btn btn-outline">注册</router-link>
          </li>
        </template>
        
        <!-- 登录状态 -->
        <li class="nav-item dropdown" v-else>
          <div class="dropdown-toggle nav-link">
            {{ user.username }}
          </div>
          <div class="dropdown-menu">
            <router-link to="/profile" class="dropdown-item">个人资料</router-link>
            <router-link to="/admin" class="dropdown-item" v-if="isAdmin">管理系统</router-link>
            <a href="#" class="dropdown-item" @click.prevent="logout">注销</a>
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AppNavbar',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const navActive = ref(false)
    const isMobile = ref(window.innerWidth < 768)
    
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const isAdmin = computed(() => authStore.isAdmin)
    const user = computed(() => authStore.user)
    
    const toggleNav = () => {
      navActive.value = !navActive.value
    }
    
    const logout = async () => {
      await authStore.logout()
      router.push('/login')
    }
    
    const handleResize = () => {
      isMobile.value = window.innerWidth < 768
      if (!isMobile.value) navActive.value = false
    }
    
    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      isAuthenticated,
      isAdmin,
      user,
      navActive,
      isMobile,
      toggleNav,
      logout
    }
  }
}
</script>

<style scoped>
.navbar-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
}

.navbar-toggle span {
  display: block;
  width: 25px;
  height: 3px;
  background-color: var(--dark-color);
  margin: 4px 0;
  border-radius: 3px;
  transition: var(--transition);
}

@media (max-width: 768px) {
  .navbar-toggle {
    display: block;
  }
}
</style> 