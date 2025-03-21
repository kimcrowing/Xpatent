import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/styles/main.scss'

// 导入路由组件
import Home from './components/Home.vue'
import GoogleStyleHome from './components/GoogleStyleHome.vue'
import Login from './components/auth/Login.vue'
import Register from './components/auth/Register.vue'
import PatentWriter from './components/patent/PatentWriter.vue'
import PatentResponse from './components/patent/PatentResponse.vue'
import PatentSearch from './components/patent/PatentSearch.vue'
import UserProfile from './components/user/UserProfile.vue'
import AdminDashboard from './components/admin/Dashboard.vue'
import NotFound from './components/NotFound.vue'
import MainLayout from './components/layout/MainLayout.vue'
import Settings from './components/user/Settings.vue'

// 导入全局服务
import { initServices } from './services/initializer'

// 提前导入需要的存储，避免后续循环依赖
import { useAuthStore } from './stores/auth'
import { useConfigStore } from './stores/config'

// 创建路由
const routes = [
  { 
    path: '/', 
    component: MainLayout,
    children: [
      { path: '', component: GoogleStyleHome },
      { path: 'classic-home', component: Home },
      { 
        path: 'patent-writer', 
        component: PatentWriter,
        meta: { requiresAuth: true, requiresConfig: true } 
      },
      { 
        path: 'patent-response', 
        component: PatentResponse,
        meta: { requiresAuth: true, requiresConfig: true } 
      },
      {
        path: 'patent-search',
        component: PatentSearch,
        meta: { requiresAuth: true, requiresConfig: true }
      },
      {
        path: 'profile',
        component: UserProfile,
        meta: { requiresAuth: true }
      },
      { 
        path: 'admin', 
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresAdmin: true } 
      },
      {
        path: 'settings',
        component: Settings,
        meta: { requiresAuth: true }
      },
    ]
  },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/:pathMatch(.*)*', component: NotFound }
]

// 先创建应用
const app = createApp(App)

// 创建并注册Pinia状态管理（最先初始化）
const pinia = createPinia()
app.use(pinia)

// 创建并注册Router（在Pinia之后初始化）
const router = createRouter({
  history: createWebHistory(),
  routes
})
app.use(router)

// 初始化服务（在Pinia和Router之后）
initServices()

// 添加全局导航守卫
router.beforeEach(async (to, from, next) => {
  // 获取存储实例
  const authStore = useAuthStore()
  const configStore = useConfigStore()
  
  // 首次访问时检查是否已经认证
  if (!authStore.isAuthenticated && authStore.token) {
    try {
      // 验证token
      await authStore.validateToken()
    } catch (error) {
      console.error('Token验证失败', error)
    }
  }
  
  // 如果路由需要配置，检查配置是否完成
  if (to.meta.requiresConfig) {
    // 首次访问时加载配置
    if (configStore.configStatus === 'unchecked') {
      await configStore.fetchUserConfig()
    }
    
    // 如果需要配置而没有配置，重定向到个人资料页面
    if (!configStore.hasConfig && !authStore.isAdmin) {
      return next({ 
        path: '/profile', 
        query: { 
          redirect: to.fullPath,
          setup: 'api'
        } 
      })
    }
  }
  
  // 需要认证的路由
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    })
  } 
  
  // 需要管理员权限的路由
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ path: '/' })
  }
  
  // 调试路由
  console.log('访问路由:', to.path)
  
  next()
})

// 挂载应用
app.mount('#app') 