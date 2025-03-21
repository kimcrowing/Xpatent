<template>
  <div class="config-manager">
    <h2>系统配置</h2>
    
    <!-- API配置 -->
    <el-card class="config-section">
      <template #header>
        <div class="card-header">
          <span>API配置</span>
        </div>
      </template>
      
      <el-form :model="config.api" label-width="120px">
        <el-form-item label="API基础URL">
          <el-input v-model="config.api.base_url" :disabled="!isAdmin" />
        </el-form-item>
        
        <el-form-item label="API密钥">
          <el-input v-model="config.api.api_key" type="password" show-password />
        </el-form-item>
        
        <el-form-item label="超时时间(秒)">
          <el-input-number v-model="config.api.timeout" :min="5" :max="60" :disabled="!isAdmin" />
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 搜索配置 -->
    <el-card class="config-section">
      <template #header>
        <div class="card-header">
          <span>搜索配置</span>
        </div>
      </template>
      
      <el-form :model="config.search" label-width="120px">
        <el-form-item label="默认每页数量">
          <el-input-number 
            v-model="config.search.default_page_size"
            :min="5"
            :max="config.search.max_page_size"
            :disabled="!isAdmin"
          />
        </el-form-item>
        
        <el-form-item label="最大每页数量">
          <el-input-number
            v-model="config.search.max_page_size"
            :min="10"
            :max="100"
            :disabled="!isAdmin"
          />
        </el-form-item>
        
        <el-form-item label="默认相似度">
          <el-slider
            v-model="config.search.default_similarity"
            :min="config.search.min_similarity"
            :max="config.search.max_similarity"
          />
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 缓存配置 -->
    <el-card class="config-section">
      <template #header>
        <div class="card-header">
          <span>缓存配置</span>
        </div>
      </template>
      
      <el-form :model="config.cache" label-width="120px">
        <el-form-item label="启用缓存">
          <el-switch v-model="config.cache.enabled" :disabled="!isAdmin" />
        </el-form-item>
        
        <el-form-item label="过期时间(秒)">
          <el-input-number
            v-model="config.cache.expire_time"
            :min="300"
            :max="86400"
            :disabled="!isAdmin"
          />
        </el-form-item>
        
        <el-form-item label="最大缓存条数">
          <el-input-number
            v-model="config.cache.max_size"
            :min="100"
            :max="10000"
            :disabled="!isAdmin"
          />
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 技术领域配置 -->
    <el-card class="config-section">
      <template #header>
        <div class="card-header">
          <span>技术领域配置</span>
          <el-button
            v-if="isAdmin"
            type="text"
            @click="addField"
          >
            添加领域
          </el-button>
        </div>
      </template>
      
      <el-table :data="config.technical_fields" style="width: 100%">
        <el-table-column prop="name" label="领域名称">
          <template #default="scope">
            <el-input
              v-if="isAdmin"
              v-model="config.technical_fields[scope.$index]"
              size="small"
            />
            <span v-else>{{ scope.row }}</span>
          </template>
        </el-table-column>
        
        <el-table-column v-if="isAdmin" label="操作" width="120">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              @click="removeField(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 操作按钮 -->
    <div class="actions">
      <el-button type="primary" @click="saveConfig">保存配置</el-button>
      <el-button @click="resetConfig">重置配置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 配置数据
const config = ref({
  api: {
    base_url: '',
    api_key: '',
    timeout: 30
  },
  search: {
    default_page_size: 10,
    max_page_size: 50,
    min_similarity: 0,
    max_similarity: 100,
    default_similarity: 70
  },
  cache: {
    enabled: true,
    expire_time: 3600,
    max_size: 1000
  },
  technical_fields: []
})

// 用户角色
const isAdmin = ref(false)
const userId = ref('')

// 初始化
onMounted(async () => {
  // TODO: 从用户会话获取用户信息
  userId.value = 'current_user_id'
  isAdmin.value = false // 或从用户会话获取
  
  await loadConfig()
})

// 加载配置
const loadConfig = async () => {
  try {
    const response = await fetch(`/api/config?user_id=${userId.value}&is_admin=${isAdmin.value}`)
    const data = await response.json()
    
    if (data.success) {
      config.value = data.config
    } else {
      ElMessage.error(data.message || '加载配置失败')
    }
  } catch (error) {
    console.error('加载配置失败：', error)
    ElMessage.error('加载配置失败')
  }
}

// 保存配置
const saveConfig = async () => {
  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId.value,
        is_admin: isAdmin.value,
        config: config.value
      })
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success('配置保存成功')
    } else {
      ElMessage.error(data.message || '保存配置失败')
    }
  } catch (error) {
    console.error('保存配置失败：', error)
    ElMessage.error('保存配置失败')
  }
}

// 重置配置
const resetConfig = async () => {
  try {
    const response = await fetch('/api/config/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId.value,
        is_admin: isAdmin.value
      })
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success('配置重置成功')
      await loadConfig()
    } else {
      ElMessage.error(data.message || '重置配置失败')
    }
  } catch (error) {
    console.error('重置配置失败：', error)
    ElMessage.error('重置配置失败')
  }
}

// 添加技术领域
const addField = () => {
  if (isAdmin.value) {
    config.value.technical_fields.push('新技术领域')
  }
}

// 删除技术领域
const removeField = (index) => {
  if (isAdmin.value) {
    config.value.technical_fields.splice(index, 1)
  }
}
</script>

<style scoped>
.config-manager {
  padding: 20px;
}

.config-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  margin-top: 20px;
  text-align: center;
}

.el-form-item {
  margin-bottom: 18px;
}

.el-card {
  margin-bottom: 20px;
}

.el-slider {
  width: 100%;
}
</style> 