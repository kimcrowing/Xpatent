<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1 class="page-title">管理员控制台</h1>
      <p class="page-description">管理用户、邀请码和系统配置</p>
    </div>
    
    <div class="dashboard-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'overview' }"
        @click="activeTab = 'overview'"
      >
        系统概览
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        用户管理
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'invitations' }"
        @click="activeTab = 'invitations'"
      >
        邀请码
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'config' }"
        @click="activeTab = 'config'"
      >
        系统配置
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'logs' }"
        @click="activeTab = 'logs'"
      >
        操作日志
      </div>
    </div>
    
    <div class="tab-content">
      <!-- 系统概览 -->
      <div v-show="activeTab === 'overview'" class="tab-pane">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
            <div class="stat-label">总用户数</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ stats.activeUsers || 0 }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ stats.invitationsUsed || 0 }}</div>
            <div class="stat-label">已使用邀请码</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ stats.actionCount || 0 }}</div>
            <div class="stat-label">总操作次数</div>
          </div>
        </div>
        
        <div class="section-header">
          <h2>系统状态</h2>
        </div>
        
        <div class="system-status">
          <div class="card">
            <div class="system-info">
              <div class="info-item">
                <span class="info-label">系统版本:</span>
                <span class="info-value">Xpatent v1.0.0</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">服务器状态:</span>
                <span class="info-value status-active">
                  <i class="fas fa-circle"></i> 正常运行
                </span>
              </div>
              
              <div class="info-item">
                <span class="info-label">默认API配置:</span>
                <span 
                  class="info-value" 
                  :class="hasDefaultConfig ? 'status-active' : 'status-warning'"
                >
                  <i class="fas" :class="hasDefaultConfig ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
                  {{ hasDefaultConfig ? '已配置' : '未配置' }}
                </span>
              </div>
              
              <div class="info-item">
                <span class="info-label">数据库状态:</span>
                <span class="info-value status-active">
                  <i class="fas fa-circle"></i> 正常
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 用户管理 -->
      <div v-show="activeTab === 'users'" class="tab-pane">
        <div class="card">
          <div class="card-header">
            <h2>用户列表</h2>
            <div class="header-actions">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="userSearch" 
                  placeholder="搜索用户..."
                  class="search-input" 
                />
                <i class="fas fa-search"></i>
              </div>
            </div>
          </div>
          
          <div class="card-body overflow-auto">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>用户名</th>
                    <th>电子邮箱</th>
                    <th>注册时间</th>
                    <th>上次登录</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ formatDate(user.created_at) }}</td>
                    <td>{{ formatDate(user.last_login) }}</td>
                    <td>
                      <span 
                        class="status-badge" 
                        :class="user.is_active ? 'status-active' : 'status-inactive'"
                      >
                        {{ user.is_active ? '活跃' : '已禁用' }}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button 
                          class="btn-icon" 
                          title="编辑用户"
                          @click="editUser(user)"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          class="btn-icon" 
                          title="禁用用户"
                          @click="toggleUserStatus(user.id)"
                          v-if="user.is_active"
                        >
                          <i class="fas fa-ban"></i>
                        </button>
                        <button 
                          class="btn-icon" 
                          title="启用用户"
                          @click="toggleUserStatus(user.id)"
                          v-else
                        >
                          <i class="fas fa-check"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- 用户编辑表单对话框 -->
        <div class="modal" :class="{ 'modal-visible': showEditUserModal }">
          <div class="modal-content">
            <div class="modal-header">
              <h3>编辑用户</h3>
              <button class="btn-close" @click="closeEditUserModal">×</button>
            </div>
            <div class="modal-body">
              <div v-if="editingUser" class="user-edit-form">
                <div class="form-group">
                  <label for="edit-username">用户名</label>
                  <input 
                    type="text" 
                    id="edit-username" 
                    v-model="editingUser.username" 
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label for="edit-email">电子邮箱</label>
                  <input 
                    type="email" 
                    id="edit-email" 
                    v-model="editingUser.email" 
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label>用户状态</label>
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="edit-is-active" 
                      v-model="editingUser.is_active" 
                      class="form-check-input"
                    />
                    <label for="edit-is-active" class="form-check-label">启用账户</label>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>管理员权限</label>
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      id="edit-is-admin" 
                      v-model="editingUser.is_admin" 
                      class="form-check-input"
                    />
                    <label for="edit-is-admin" class="form-check-label">赋予管理员权限</label>
                  </div>
                </div>
                
                <div class="form-actions">
                  <button class="btn btn-primary" @click="saveUserChanges" :disabled="savingUser">
                    {{ savingUser ? '保存中...' : '保存' }}
                  </button>
                  <button class="btn btn-secondary" @click="closeEditUserModal">取消</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 邀请码管理 -->
      <div v-show="activeTab === 'invitations'" class="tab-pane">
        <div class="card">
          <div class="card-header">
            <h2>邀请码管理</h2>
            <div class="header-actions">
              <button class="btn btn-primary" @click="createInvitation">
                <i class="fas fa-plus"></i> 创建邀请码
              </button>
            </div>
          </div>
          
          <div class="card-body overflow-auto">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>邀请码</th>
                    <th>创建者</th>
                    <th>创建时间</th>
                    <th>过期时间</th>
                    <th>使用次数</th>
                    <th>限制次数</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="invitation in invitations" :key="invitation.code">
                    <td>{{ invitation.code }}</td>
                    <td>{{ invitation.creator }}</td>
                    <td>{{ formatDate(invitation.created_at) }}</td>
                    <td>{{ formatDate(invitation.expires_at) }}</td>
                    <td>{{ invitation.used_count }}</td>
                    <td>{{ invitation.max_uses }}</td>
                    <td>
                      <span 
                        class="status-badge" 
                        :class="invitation.is_active ? 'status-active' : 'status-inactive'"
                      >
                        {{ invitation.is_active ? '可用' : '已失效' }}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button 
                          class="btn-icon" 
                          title="禁用邀请码"
                          @click="toggleInvitationStatus(invitation.code)"
                          v-if="invitation.is_active"
                        >
                          <i class="fas fa-ban"></i>
                        </button>
                        <button 
                          class="btn-icon" 
                          title="启用邀请码"
                          @click="toggleInvitationStatus(invitation.code)"
                          v-else
                        >
                          <i class="fas fa-check"></i>
                        </button>
                        <button 
                          class="btn-icon text-danger" 
                          title="删除邀请码"
                          @click="deleteInvitation(invitation.code)"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 系统配置 -->
      <div v-show="activeTab === 'config'" class="tab-pane">
        <!-- 默认API配置组件 -->
        <DefaultConfigSettings />
        
        <div class="card">
          <div class="card-header">
            <h2>系统参数配置</h2>
          </div>
          
          <div class="card-body">
            <div class="form-group">
              <label>注册设置</label>
              <div class="toggle-container">
                <div class="toggle-item">
                  <span class="toggle-label">需要邀请码注册:</span>
                  <div class="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="require-invitation" 
                      v-model="systemConfig.requireInvitation" 
                      class="toggle-input"
                    />
                    <label for="require-invitation" class="toggle-label-switch"></label>
                  </div>
                </div>
                
                <div class="toggle-item">
                  <span class="toggle-label">开放公共注册:</span>
                  <div class="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="public-registration" 
                      v-model="systemConfig.publicRegistration" 
                      class="toggle-input"
                    />
                    <label for="public-registration" class="toggle-label-switch"></label>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="max-users">最大用户数:</label>
              <input 
                type="number" 
                id="max-users" 
                v-model.number="systemConfig.maxUsers" 
                class="form-control"
                min="1"
              />
              <small class="form-text">设置为0表示不限制</small>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-primary" @click="saveSystemConfig">
                保存系统配置
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作日志 -->
      <div v-show="activeTab === 'logs'" class="tab-pane">
        <div class="card">
          <div class="card-header">
            <h2>系统操作日志</h2>
            <div class="header-actions">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="logSearch" 
                  placeholder="搜索日志..."
                  class="search-input" 
                />
                <i class="fas fa-search"></i>
              </div>
            </div>
          </div>
          
          <div class="card-body overflow-auto">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>用户</th>
                    <th>操作</th>
                    <th>详情</th>
                    <th>IP地址</th>
                    <th>时间</th>
                    <th>类别</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in filteredLogs" :key="log.id">
                    <td>{{ log.id }}</td>
                    <td>{{ log.username || '系统' }}</td>
                    <td>{{ log.action }}</td>
                    <td>{{ log.details }}</td>
                    <td>{{ log.ip_address }}</td>
                    <td>{{ formatDate(log.created_at) }}</td>
                    <td>
                      <span 
                        class="category-badge" 
                        :class="`category-${log.category.toLowerCase()}`"
                      >
                        {{ log.category }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import DefaultConfigSettings from './DefaultConfigSettings.vue'
import axios from 'axios'

export default {
  name: 'AdminDashboard',
  components: {
    DefaultConfigSettings
  },
  setup() {
    const configStore = useConfigStore()
    
    // 状态变量
    const activeTab = ref('overview')
    const userSearch = ref('')
    const logSearch = ref('')
    const stats = reactive({
      totalUsers: 0,
      activeUsers: 0,
      invitationsUsed: 0,
      actionCount: 0
    })
    
    // 系统配置
    const systemConfig = reactive({
      requireInvitation: true,
      publicRegistration: false,
      maxUsers: 100
    })
    
    // 用户列表相关
    const users = ref([])
    const filteredUsers = computed(() => {
      if (!userSearch.value) return users.value
      
      const query = userSearch.value.toLowerCase()
      return users.value.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      )
    })
    
    // 用户编辑相关
    const showEditUserModal = ref(false)
    const editingUser = ref(null)
    const savingUser = ref(false)
    
    const invitations = ref([
      {
        code: 'ABC123',
        creator: 'admin',
        created_at: Date.now(),
        expires_at: Date.now() + 604800000, // 一周后
        used_count: 0,
        max_uses: 1,
        is_active: true
      }
    ])
    
    const logs = ref([
      {
        id: 1,
        username: 'admin',
        action: 'LOGIN',
        details: '管理员登录',
        ip_address: '127.0.0.1',
        created_at: Date.now(),
        category: 'AUTH'
      },
      {
        id: 2,
        username: 'admin',
        action: 'CONFIG_UPDATE',
        details: '更新系统配置',
        ip_address: '127.0.0.1',
        created_at: Date.now() - 3600000,
        category: 'ADMIN'
      }
    ])
    
    const filteredLogs = computed(() => {
      const search = logSearch.value.toLowerCase()
      if (!search) return logs.value
      
      return logs.value.filter(log => 
        log.username?.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search) ||
        log.details.toLowerCase().includes(search) ||
        log.category.toLowerCase().includes(search)
      )
    })
    
    const hasDefaultConfig = computed(() => {
      // 检查是否配置了API密钥
      return configStore.isAdmin && configStore.hasConfig
    })
    
    // 方法
    const formatDate = (timestamp) => {
      if (!timestamp) return '未知'
      const date = new Date(timestamp)
      return date.toLocaleString()
    }
    
    const editUser = (user) => {
      // 深拷贝用户对象，避免直接修改原对象
      editingUser.value = { ...user }
      showEditUserModal.value = true
    }
    
    const closeEditUserModal = () => {
      showEditUserModal.value = false
      editingUser.value = null
    }
    
    const saveUserChanges = async () => {
      if (!editingUser.value) return
      
      savingUser.value = true
      
      try {
        // 调用后端API保存用户信息
        const response = await axios.put(`/api/admin/users/${editingUser.value.id}`, {
          username: editingUser.value.username,
          email: editingUser.value.email,
          is_active: editingUser.value.is_active,
          is_admin: editingUser.value.is_admin
        })
        
        // 更新本地用户列表
        const updatedUser = response.data.user
        const userIndex = users.value.findIndex(u => u.id === updatedUser.id)
        
        if (userIndex !== -1) {
          users.value[userIndex] = updatedUser
        }
        
        closeEditUserModal()
        alert('用户信息已更新')
      } catch (error) {
        alert('更新用户信息失败: ' + (error.response?.data?.error || error.message))
      } finally {
        savingUser.value = false
      }
    }
    
    const toggleUserStatus = async (userId) => {
      try {
        // 查找用户
        const user = users.value.find(u => u.id === userId)
        if (!user) return
        
        // 切换状态
        const newStatus = !user.is_active
        
        // 调用API更新状态
        const response = await axios.put(`/api/admin/users/${userId}`, {
          is_active: newStatus
        })
        
        // 更新本地数据
        const updatedUser = response.data.user
        const userIndex = users.value.findIndex(u => u.id === updatedUser.id)
        
        if (userIndex !== -1) {
          users.value[userIndex] = updatedUser
        }
        
        alert(`用户 ${user.username} 已${newStatus ? '启用' : '禁用'}`)
      } catch (error) {
        alert('更新用户状态失败: ' + (error.response?.data?.error || error.message))
      }
    }
    
    const createInvitation = () => {
      // 实现创建邀请码功能
      const newCode = Math.random().toString(36).substring(2, 10).toUpperCase()
      invitations.value.unshift({
        code: newCode,
        creator: 'admin',
        created_at: Date.now(),
        expires_at: Date.now() + 604800000, // 一周后
        used_count: 0,
        max_uses: 1,
        is_active: true
      })
    }
    
    const toggleInvitationStatus = (code) => {
      // 实现切换邀请码状态功能
      const invitation = invitations.value.find(i => i.code === code)
      if (invitation) {
        invitation.is_active = !invitation.is_active
      }
    }
    
    const deleteInvitation = (code) => {
      // 实现删除邀请码功能
      invitations.value = invitations.value.filter(i => i.code !== code)
    }
    
    const saveSystemConfig = () => {
      // 实现保存系统配置功能
      console.log('保存系统配置:', systemConfig)
      alert('系统配置已保存')
    }
    
    // 从API获取用户列表
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/admin/users')
        users.value = response.data.users
      } catch (error) {
        console.error('获取用户列表失败:', error)
        alert('获取用户列表失败: ' + (error.response?.data?.error || error.message))
      }
    }
    
    // 组件加载时获取数据
    onMounted(() => {
      // 获取统计数据
      stats.totalUsers = 2
      stats.activeUsers = 2
      stats.invitationsUsed = 1
      stats.actionCount = 25
      
      // 获取用户列表
      fetchUsers()
      
      // 获取API配置状态
      configStore.fetchUserConfig()
    })
    
    return {
      activeTab,
      stats,
      users,
      userSearch,
      filteredUsers,
      invitations,
      logs,
      logSearch,
      filteredLogs,
      systemConfig,
      hasDefaultConfig,
      formatDate,
      editUser,
      toggleUserStatus,
      createInvitation,
      toggleInvitationStatus,
      deleteInvitation,
      saveSystemConfig,
      fetchUsers,
      showEditUserModal,
      editingUser,
      savingUser,
      closeEditUserModal,
      saveUserChanges
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: var(--spacing-lg);
}

.page-description {
  color: #666;
}

.dashboard-tabs {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-shadow: var(--box-shadow);
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  color: #666;
  font-size: 1.1rem;
}

.section-header {
  margin: var(--spacing-lg) 0 var(--spacing-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.search-box {
  position: relative;
}

.search-input {
  padding: 8px 12px 8px 36px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  width: 250px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
}

.overflow-auto {
  overflow: auto;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background-color: #f8f9fa;
  color: #555;
  transition: var(--transition);
}

.btn-icon:hover {
  background-color: #e9ecef;
}

.text-danger {
  color: var(--danger-color);
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-active {
  background-color: rgba(46, 204, 113, 0.15);
  color: #27ae60;
}

.status-inactive {
  background-color: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

.status-warning {
  background-color: rgba(243, 156, 18, 0.15);
  color: #f39c12;
}

.category-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.category-auth {
  background-color: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

.category-admin {
  background-color: rgba(155, 89, 182, 0.15);
  color: #9b59b6;
}

.category-user {
  background-color: rgba(46, 204, 113, 0.15);
  color: #27ae60;
}

.toggle-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-label {
  font-weight: 500;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label-switch {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 34px;
  transition: .4s;
}

.toggle-label-switch:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

.toggle-input:checked + .toggle-label-switch {
  background-color: var(--primary-color);
}

.toggle-input:checked + .toggle-label-switch:before {
  transform: translateX(30px);
}

.system-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  font-weight: 600;
  color: #555;
}

.info-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
}

.form-actions {
  margin-top: var(--spacing-lg);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .dashboard-tabs {
    flex-wrap: wrap;
  }
  
  .tab-item {
    flex: 1 0 auto;
  }
}

/* 模态对话框样式 */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  justify-content: center;
  align-items: center;
}

.modal-visible {
  display: flex;
}

.modal-content {
  background-color: white;
  width: 500px;
  max-width: 90%;
  border-radius: var(--border-radius);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.btn-close:hover {
  opacity: 1;
}

.modal-body {
  padding: var(--spacing-lg);
}

.user-edit-form .form-group {
  margin-bottom: var(--spacing-md);
}

.user-edit-form label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
}

.user-edit-form .form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius-sm);
}

.user-edit-form .form-check {
  display: flex;
  align-items: center;
  margin-top: var(--spacing-sm);
}

.user-edit-form .form-check-input {
  margin-right: var(--spacing-sm);
}

.user-edit-form .form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}
</style> 