<template>
  <div class="default-config-settings">
    <div class="card">
      <div class="card-header">
        <h2>系统默认API配置</h2>
        <p class="admin-note">
          <i class="fas fa-info-circle"></i> 
          这些设置将作为管理员用户的默认配置，普通用户仍需自行设置API参数
        </p>
      </div>
      
      <div class="card-body">
        <APIConfig />
      </div>
    </div>
  </div>
</template>

<script>
import APIConfig from '@/components/settings/APIConfig.vue'

export default {
  name: 'DefaultConfigSettings',
  components: {
    APIConfig
  }
}
</script>

<style scoped>
.default-config-settings {
  margin-bottom: var(--spacing-xl);
}

.card-header {
  margin-bottom: var(--spacing-md);
}

.admin-note {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(52, 152, 219, 0.1);
  border-radius: var(--border-radius);
  color: var(--primary-color);
  font-weight: 500;
  display: flex;
  align-items: center;
}

.admin-note i {
  margin-right: var(--spacing-sm);
}
</style> 