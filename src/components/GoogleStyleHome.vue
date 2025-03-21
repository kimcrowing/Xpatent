<template>
  <div class="google-style-home">
    <!-- 顶部栏 -->
    <header class="header">
      <div class="logo">
        <router-link to="/">
          <h1>Xpatent</h1>
        </router-link>
      </div>
      <div class="header-right">
        <!-- 用户信息 -->
        <div class="user-info" v-if="isAuthenticated">
          <span>{{ user.username }}</span>
        </div>
        <!-- 应用菜单按钮 -->
        <div class="apps-menu-toggle" @click="toggleAppsMenu">
          <i class="fas fa-th"></i>
        </div>
        
        <!-- 应用菜单弹出窗口 -->
        <div class="apps-menu" v-if="showAppsMenu">
          <div class="apps-menu-header">
            <h3>专利功能</h3>
          </div>
          <div class="apps-grid">
            <router-link to="/patent-writer" class="app-item">
              <div class="app-icon"><i class="fas fa-file-alt"></i></div>
              <div class="app-name">专利撰写</div>
            </router-link>
            <router-link to="/patent-response" class="app-item">
              <div class="app-icon"><i class="fas fa-reply"></i></div>
              <div class="app-name">专利答审</div>
            </router-link>
            <router-link to="/patent-search" class="app-item">
              <div class="app-icon"><i class="fas fa-search"></i></div>
              <div class="app-name">专利检索</div>
            </router-link>
            <router-link to="/api-settings" class="app-item">
              <div class="app-icon"><i class="fas fa-cog"></i></div>
              <div class="app-name">API设置</div>
            </router-link>
            <router-link to="/document-analyzer" class="app-item">
              <div class="app-icon"><i class="fas fa-file-pdf"></i></div>
              <div class="app-name">文档分析</div>
            </router-link>
            <router-link to="/profile" class="app-item">
              <div class="app-icon"><i class="fas fa-user"></i></div>
              <div class="app-name">个人中心</div>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="main-content">
      <!-- 品牌 Logo 区域 -->
      <div class="brand-container">
        <div class="brand-logo">
          <h1>Xpatent</h1>
          <div class="brand-subtitle">AI专利助手</div>
        </div>
      </div>

      <!-- 聊天框区域 -->
      <div class="chat-container">
        <!-- 聊天历史 -->
        <div class="chat-history" ref="chatHistoryRef" v-if="chatMessages.length > 0">
          <div v-for="(message, index) in chatMessages" :key="index" :class="['chat-message', message.role]">
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
            </div>
          </div>
          
          <div v-if="isLoading" class="chat-message assistant">
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 搜索/聊天输入框 -->
        <div class="search-box-container">
          <div class="search-box">
            <div class="search-icon">
              <i class="fas fa-search"></i>
            </div>
            <input 
              type="text" 
              ref="inputRef"
              v-model="userInput" 
              class="search-input" 
              placeholder="向AI专利助手提问..." 
              @keydown.enter.prevent="handleSubmit"
              :disabled="isLoading"
            />
            <div class="search-actions">
              <button class="mic-button" title="语音输入" @click="startVoiceInput">
                <i class="fas fa-microphone"></i>
              </button>
              <button class="upload-button" title="上传文件" @click="triggerFileUpload">
                <i class="fas fa-paperclip"></i>
              </button>
              <input 
                type="file" 
                ref="fileInput" 
                @change="handleFileUpload" 
                style="display: none"
                accept=".pdf,.doc,.docx,.txt"
              >
            </div>
          </div>
          
          <!-- 发送按钮 -->
          <div class="search-buttons" v-if="!chatMessages.length">
            <button class="search-btn" @click="handleSubmit" :disabled="!canSubmit">AI 对话</button>
            <button class="search-btn" @click="feelingLucky">手气不错</button>
          </div>
          
          <!-- 模型选择器 -->
          <div class="model-selector" v-if="chatMessages.length > 0">
            <span>AI模型:</span>
            <select v-model="selectedModel">
              <option v-for="model in availableModels" :key="model.id" :value="model.id">{{ model.name }}</option>
            </select>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-links">
        <a href="#" @click.prevent="showAbout = true">关于</a>
        <a href="#" @click.prevent="showPrivacy = true">隐私</a>
        <a href="#" @click.prevent="showTerms = true">条款</a>
      </div>
    </footer>

    <!-- 模态窗口 -->
    <div class="modal" v-if="showAbout || showPrivacy || showTerms">
      <div class="modal-content">
        <div class="modal-header">
          <h2 v-if="showAbout">关于 Xpatent</h2>
          <h2 v-if="showPrivacy">隐私政策</h2>
          <h2 v-if="showTerms">使用条款</h2>
          <button class="modal-close" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div v-if="showAbout">
            <p>Xpatent 是一个AI驱动的专利助手，帮助用户撰写、分析和管理专利文档。</p>
            <p>版本: 1.0.0</p>
          </div>
          <div v-if="showPrivacy">
            <p>我们重视您的隐私。Xpatent 只会收集必要的信息用于提供服务。</p>
            <p>您上传的文档将在服务器安全处理，且不会用于训练模型。</p>
          </div>
          <div v-if="showTerms">
            <p>使用本服务即表示您同意我们的使用条款。</p>
            <p>请勿上传包含敏感或机密信息的文档，除非您已采取适当的安全措施。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { v4 as uuidv4 } from 'uuid'
import aiConversationService from '@/services/AIConversationService'

export default {
  name: 'GoogleStyleHome',
  setup() {
    const authStore = useAuthStore()
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user || {})
    
    // 状态变量
    const userInput = ref('')
    const chatMessages = ref([])
    const isLoading = ref(false)
    const selectedModel = ref('deepseek/deepseek-r1:free')
    const showAppsMenu = ref(false)
    const showAbout = ref(false)
    const showPrivacy = ref(false)
    const showTerms = ref(false)
    const currentConversationId = ref('')
    const availableModels = ref([])
    
    // DOM引用
    const inputRef = ref(null)
    const fileInput = ref(null)
    const chatHistoryRef = ref(null)
    
    // 计算属性
    const canSubmit = computed(() => {
      return userInput.value.trim().length > 0 && !isLoading.value
    })
    
    // 方法
    const toggleAppsMenu = () => {
      showAppsMenu.value = !showAppsMenu.value
    }
    
    const closeModals = () => {
      showAbout.value = false
      showPrivacy.value = false
      showTerms.value = false
    }
    
    // 初始化新对话
    const initNewConversation = () => {
      currentConversationId.value = uuidv4()
      chatMessages.value = []
    }
    
    // 加载对话历史
    const loadConversation = (conversationId) => {
      const conversation = aiConversationService.getConversation(conversationId)
      if (conversation) {
        currentConversationId.value = conversationId
        chatMessages.value = conversation.messages
      }
    }
    
    const handleSubmit = async () => {
      if (!canSubmit.value) return
      
      // 如果没有当前对话ID，创建一个新的
      if (!currentConversationId.value) {
        initNewConversation()
      }
      
      // 添加用户消息
      const userMessage = {
        role: 'user',
        content: userInput.value,
        timestamp: new Date()
      }
      chatMessages.value.push(userMessage)
      
      // 清空输入框
      userInput.value = ''
      
      // 滚动到底部
      await nextTick()
      scrollToBottom()
      
      // 调用AI服务
      isLoading.value = true
      
      try {
        // 准备发送给API的消息格式
        const messages = chatMessages.value.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
        
        // 调用API
        const response = await aiConversationService.sendMessage(
          messages,
          selectedModel.value,
          { temperature: 0.7 }
        )
        
        // 处理响应
        if (response && response.choices && response.choices[0]) {
          const assistantMessage = {
            role: 'assistant',
            content: response.choices[0].message.content,
            timestamp: new Date()
          }
          chatMessages.value.push(assistantMessage)
          
          // 保存对话历史
          aiConversationService.saveConversation(
            currentConversationId.value, 
            chatMessages.value
          )
        }
      } catch (error) {
        console.error('AI对话请求失败:', error)
        // 添加错误信息
        chatMessages.value.push({
          role: 'assistant',
          content: `对不起，处理您的请求时出现错误: ${error.message || '未知错误'}`,
          timestamp: new Date()
        })
      } finally {
        isLoading.value = false
        // 滚动到底部
        nextTick(() => {
          scrollToBottom()
        })
      }
    }
    
    const startVoiceInput = () => {
      alert('语音输入功能即将上线')
    }
    
    const triggerFileUpload = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }
    
    const handleFileUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      // 如果没有当前对话ID，创建一个新的
      if (!currentConversationId.value) {
        initNewConversation()
      }
      
      // 添加文件上传消息
      chatMessages.value.push({
        role: 'user',
        content: `上传文件: ${file.name}`,
        timestamp: new Date()
      })
      
      // 滚动到底部
      nextTick(() => {
        scrollToBottom()
      })
      
      // 处理文件
      isLoading.value = true
      
      try {
        const result = await aiConversationService.processFile(file)
        
        if (result.text) {
          // 添加文件处理结果
          chatMessages.value.push({
            role: 'assistant',
            content: `我已分析您上传的文件 "${file.name}"。\n\n文件内容摘要：\n\n${result.text.substring(0, 300)}${result.text.length > 300 ? '...' : ''}`,
            timestamp: new Date()
          })
          
          // 保存对话历史
          aiConversationService.saveConversation(
            currentConversationId.value, 
            chatMessages.value
          )
        } else {
          // 处理错误
          chatMessages.value.push({
            role: 'assistant',
            content: `我无法读取文件 "${file.name}" 的内容。请确保文件格式正确，然后重试。`,
            timestamp: new Date()
          })
        }
      } catch (error) {
        console.error('文件处理失败:', error)
        // 添加错误信息
        chatMessages.value.push({
          role: 'assistant',
          content: `处理文件时出现错误: ${error.message || '未知错误'}`,
          timestamp: new Date()
        })
      } finally {
        isLoading.value = false
        // 滚动到底部
        nextTick(() => {
          scrollToBottom()
        })
        // 清空文件选择器
        event.target.value = ''
      }
    }
    
    const feelingLucky = () => {
      const suggestions = [
        "如何提高专利授权率？",
        "专利权利要求书的撰写技巧",
        "怎样应对专利审查意见通知书？",
        "什么是专利侵权判定规则？",
        "如何进行专利布局？"
      ]
      
      // 随机选择一个建议
      userInput.value = suggestions[Math.floor(Math.random() * suggestions.length)]
      handleSubmit()
    }
    
    const scrollToBottom = () => {
      if (chatHistoryRef.value) {
        chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
      }
    }
    
    // 格式化消息内容（支持markdown）
    const formatMessage = (content) => {
      if (!content) return ''
      // 使用marked解析markdown
      const rawHtml = marked.parse(content)
      // 使用DOMPurify清理HTML
      return DOMPurify.sanitize(rawHtml)
    }
    
    // 初始化
    onMounted(async () => {
      // 获取可用的AI模型
      try {
        availableModels.value = await aiConversationService.getAvailableModels()
        console.log('获取可用模型成功:', availableModels.value)
      } catch (error) {
        console.error('获取模型列表失败:', error)
        // 使用默认模型列表
        availableModels.value = [
          { id: 'deepseek/deepseek-r1:free', name: '深度思考 R1' },
          { id: 'gpt-4', name: 'GPT-4' },
          { id: 'claude-3', name: 'Claude 3' },
          { id: 'gemini-pro', name: 'Gemini Pro' },
          { id: 'local', name: '本地模型' }
        ]
      }
      
      // 监听点击事件，关闭应用菜单
      document.addEventListener('click', (event) => {
        // 如果点击的不是应用菜单或其切换按钮，则关闭菜单
        const appsMenu = document.querySelector('.apps-menu')
        const appsToggle = document.querySelector('.apps-menu-toggle')
        
        if (showAppsMenu.value && 
            event.target !== appsMenu && 
            !appsMenu?.contains(event.target) &&
            event.target !== appsToggle &&
            !appsToggle?.contains(event.target)) {
          showAppsMenu.value = false
        }
      })
    })
    
    return {
      isAuthenticated,
      user,
      userInput,
      chatMessages,
      isLoading,
      selectedModel,
      showAppsMenu,
      showAbout,
      showPrivacy,
      showTerms,
      availableModels,
      inputRef,
      fileInput,
      chatHistoryRef,
      canSubmit,
      toggleAppsMenu,
      closeModals,
      handleSubmit,
      startVoiceInput,
      triggerFileUpload,
      handleFileUpload,
      feelingLucky,
      formatMessage
    }
  }
}
</script>

<style scoped>
.google-style-home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Roboto', Arial, sans-serif;
}

/* 顶部栏样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  height: 60px;
  border-bottom: 1px solid #e8eaed;
}

.logo {
  font-size: 1.2rem;
  font-weight: 500;
}

.logo a {
  text-decoration: none;
  color: #222;
}

.header-right {
  display: flex;
  align-items: center;
  position: relative;
}

.user-info {
  margin-right: 15px;
  font-size: 0.9rem;
}

.apps-menu-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #5f6368;
  font-size: 1.2rem;
}

.apps-menu-toggle:hover {
  background-color: rgba(60, 64, 67, 0.08);
}

/* 应用菜单样式 */
.apps-menu {
  position: absolute;
  top: 50px;
  right: 0;
  width: 320px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  padding: 16px;
}

.apps-menu-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #e8eaed;
  margin-bottom: 12px;
}

.apps-menu-header h3 {
  font-size: 1rem;
  font-weight: 500;
  color: #202124;
  margin: 0;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  text-decoration: none;
  color: #202124;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.app-item:hover {
  background-color: rgba(60, 64, 67, 0.08);
}

.app-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #5f6368;
}

.app-name {
  font-size: 0.8rem;
  text-align: center;
}

/* 主体内容样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.brand-container {
  margin-bottom: 30px;
  text-align: center;
}

.brand-logo {
  font-size: 2rem;
  font-weight: 400;
  color: #202124;
}

.brand-subtitle {
  font-size: 1rem;
  color: #5f6368;
  margin-top: 5px;
}

/* 聊天框样式 */
.chat-container {
  width: 100%;
  max-width: 650px;
}

.chat-history {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 30px;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(32, 33, 36, 0.18);
  padding: 16px;
}

.chat-message {
  margin-bottom: 16px;
  padding: 10px;
  border-radius: 8px;
}

.chat-message.user {
  background-color: #e3f2fd;
  border: 1px solid #bbdefb;
  margin-left: 20%;
}

.chat-message.assistant {
  background-color: #f8f9fa;
  border: 1px solid #e8eaed;
  margin-right: 20%;
}

.message-content {
  padding: 5px;
}

.message-text {
  line-height: 1.5;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #5f6368;
  opacity: 0.6;
  border-radius: 50%;
  animation: pulse 1.4s infinite ease-in-out;
  animation-fill-mode: both;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 80%, 100% { transform: scale(0.6); }
  40% { transform: scale(1); }
}

/* 搜索框样式 */
.search-box-container {
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  max-width: 650px;
  margin: 0 auto;
  border: 1px solid #dfe1e5;
  border-radius: 24px;
  padding: 8px 15px;
  box-shadow: 0 1px 6px rgba(32, 33, 36, 0.18);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.search-box:hover, .search-box:focus-within {
  box-shadow: 0 1px 8px rgba(32, 33, 36, 0.25);
  border-color: rgba(223, 225, 229, 0);
}

.search-icon {
  color: #9aa0a6;
  margin-right: 10px;
}

.search-input {
  flex: 1;
  height: 34px;
  background-color: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #202124;
}

.search-actions {
  display: flex;
  align-items: center;
}

.mic-button, .upload-button {
  background: none;
  border: none;
  color: #4285f4;
  font-size: 1.2rem;
  padding: 8px;
  margin-left: 5px;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.mic-button:hover, .upload-button:hover {
  background-color: rgba(66, 133, 244, 0.1);
}

.search-buttons {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 12px;
}

.search-btn {
  background-color: #f8f9fa;
  border: 1px solid #f8f9fa;
  border-radius: 4px;
  color: #3c4043;
  font-size: 14px;
  padding: 10px 16px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-btn:hover {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  border-color: #dadce0;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 模型选择器样式 */
.model-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
  font-size: 0.9rem;
  color: #5f6368;
}

.model-selector select {
  margin-left: 8px;
  padding: 5px 8px;
  border-radius: 4px;
  border: 1px solid #dfe1e5;
  background-color: white;
  outline: none;
}

/* 页脚样式 */
.footer {
  padding: 15px 30px;
  color: #70757a;
  font-size: 0.8rem;
  border-top: 1px solid #e8eaed;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.footer-links a {
  color: #70757a;
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}

/* 模态窗口样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8eaed;
}

.modal-header h2 {
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #5f6368;
}

.modal-body {
  padding: 20px;
  line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-content {
    padding: 30px 15px;
  }
  
  .brand-logo {
    font-size: 1.5rem;
  }
  
  .apps-menu {
    width: 280px;
  }
  
  .apps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chat-message.user {
    margin-left: 10%;
  }
  
  .chat-message.assistant {
    margin-right: 10%;
  }
}

/* 暗黑模式 */
:root.dark-mode .google-style-home {
  background-color: #202124;
  color: #e8eaed;
}

:root.dark-mode .header {
  border-bottom-color: #3c4043;
}

:root.dark-mode .logo a {
  color: #e8eaed;
}

:root.dark-mode .apps-menu-toggle {
  color: #9aa0a6;
}

:root.dark-mode .apps-menu {
  background-color: #303134;
}

:root.dark-mode .apps-menu-header {
  border-bottom-color: #3c4043;
}

:root.dark-mode .apps-menu-header h3 {
  color: #e8eaed;
}

:root.dark-mode .app-item {
  color: #e8eaed;
}

:root.dark-mode .app-icon {
  color: #9aa0a6;
}

:root.dark-mode .brand-logo {
  color: #e8eaed;
}

:root.dark-mode .brand-subtitle {
  color: #9aa0a6;
}

:root.dark-mode .chat-message.user {
  background-color: #3c4043;
  border-color: #5f6368;
}

:root.dark-mode .chat-message.assistant {
  background-color: #303134;
  border-color: #3c4043;
}

:root.dark-mode .search-box {
  background-color: #303134;
  border-color: #5f6368;
}

:root.dark-mode .search-input {
  color: #e8eaed;
}

:root.dark-mode .search-btn {
  background-color: #303134;
  border-color: #3c4043;
  color: #e8eaed;
}

:root.dark-mode .footer {
  border-top-color: #3c4043;
}

:root.dark-mode .modal-content {
  background-color: #303134;
}

:root.dark-mode .modal-header {
  border-bottom-color: #3c4043;
}
</style> 