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
    const availableModels = ref([
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek (免费)' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
      { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 (8B)' },
      { id: 'google/gemma-7b-it', name: 'Gemma (7B)' }
    ])
    
    // 默认API设置
    const apiConfig = ref({
      apiKey: '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',
      baseUrl: 'https://openrouter.ai/api/v1/chat/completions'
    })
    
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
        
        // 直接调用OpenRouter API，不经过后端代理
        const response = await callOpenRouter(messages, selectedModel.value)
        
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
        await nextTick()
        scrollToBottom()
      }
    }
    
    // 直接调用OpenRouter API
    const callOpenRouter = async (messages, model) => {
      try {
        const response = await fetch(apiConfig.value.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiConfig.value.apiKey}`,
            'HTTP-Referer': window.location.origin,
            'OpenRouter-Bypass-Cache': 'true'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: false
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `请求失败：${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('OpenRouter API调用失败:', error);
        throw error;
      }
    }
    
    // 声音输入
    const startVoiceInput = () => {
      if (!window.webkitSpeechRecognition) {
        alert('很抱歉，您的浏览器不支持语音识别功能。请尝试使用Chrome浏览器。')
        return
      }
      
      const recognition = new window.webkitSpeechRecognition()
      recognition.lang = 'zh-CN'
      recognition.continuous = false
      recognition.interimResults = false
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        userInput.value += transcript
      }
      
      recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error)
      }
      
      recognition.start()
    }
    
    // 触发文件上传
    const triggerFileUpload = () => {
      fileInput.value.click()
    }
    
    // 处理文件上传
    const handleFileUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      // 文件大小检查 (最大20MB)
      if (file.size > 20 * 1024 * 1024) {
        alert('文件大小不能超过20MB')
        return
      }
      
      // 添加用户消息，表明上传了文件
      chatMessages.value.push({
        role: 'user',
        content: `上传文件: ${file.name}`,
        timestamp: new Date()
      })
      
      isLoading.value = true
      
      try {
        // 调用服务处理文件
        const result = await aiConversationService.processFile(file)
        
        // 添加AI回复
        chatMessages.value.push({
          role: 'assistant',
          content: `文件 ${file.name} 处理成功。\n\n${result.summary || ''}`,
          timestamp: new Date()
        })
      } catch (error) {
        console.error('文件处理失败:', error)
        
        // 添加错误信息
        chatMessages.value.push({
          role: 'assistant',
          content: `文件处理失败: ${error.message || '未知错误'}`,
          timestamp: new Date()
        })
      } finally {
        isLoading.value = false
        
        // 清空文件输入
        event.target.value = ''
        
        // 滚动到底部
        await nextTick()
        scrollToBottom()
      }
    }
    
    // "手气不错"功能
    const feelingLucky = async () => {
      // 预设问题列表
      const questions = [
        '请帮我分析一下专利申请的基本流程和注意事项',
        '什么是专利权的保护范围？如何确定？',
        '独立权利要求和从属权利要求有什么区别？',
        '如何避免在专利说明书中使用不当的用语？',
        '专利审查中遇到的常见问题有哪些？'
      ]
      
      // 随机选择一个问题
      const randomIndex = Math.floor(Math.random() * questions.length)
      userInput.value = questions[randomIndex]
      
      // 提交问题
      handleSubmit()
    }
    
    // 格式化消息内容（支持Markdown）
    const formatMessage = (content) => {
      // 将Markdown转换为HTML，并进行安全过滤
      const html = DOMPurify.sanitize(marked(content))
      return html
    }
    
    // 滚动聊天记录到底部
    const scrollToBottom = () => {
      if (chatHistoryRef.value) {
        chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
      }
    }
    
    // 生命周期钩子
    onMounted(async () => {
      // 初始化聚焦输入框
      if (inputRef.value) {
        inputRef.value.focus()
      }
      
      // 加载可用模型
      try {
        // 如果后端可用，可以从后端获取模型列表
        // const models = await aiConversationService.getAvailableModels()
        // availableModels.value = models
      } catch (error) {
        console.error('加载模型列表失败:', error)
      }
    })
    
    // 监听聊天消息变化，自动滚动到底部
    watch(chatMessages, () => {
      nextTick(() => scrollToBottom())
    })
    
    return {
      userInput,
      chatMessages,
      isLoading,
      selectedModel,
      availableModels,
      showAppsMenu,
      showAbout,
      showPrivacy,
      showTerms,
      isAuthenticated,
      user,
      canSubmit,
      inputRef,
      fileInput,
      chatHistoryRef,
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

/* 聊天框样式 - 增大尺寸 */
.chat-container {
  width: 100%;
  max-width: 800px; /* 增大最大宽度 */
}

.chat-history {
  max-height: 600px; /* 增大最大高度 */
  overflow-y: auto;
  margin-bottom: 30px;
  border-radius: 12px; /* 增大圆角 */
  box-shadow: 0 1px 8px rgba(32, 33, 36, 0.28); /* 增强阴影效果 */
  padding: 20px;
  background-color: #f8f9fa;
}

.chat-message {
  margin-bottom: 20px;
  padding: 15px; /* 增大内边距 */
  border-radius: 12px;
}

.chat-message.user {
  background-color: #e3f2fd;
  border: 1px solid #bbdefb;
  margin-left: 15%;
}

.chat-message.assistant {
  background-color: #f1f3f4;
  border: 1px solid #e8eaed;
  margin-right: 15%;
  box-shadow: 0 1px 4px rgba(32, 33, 36, 0.15);
}

.message-content {
  padding: 5px;
}

.message-text {
  line-height: 1.6;
  font-size: 1.05rem; /* 增大字体 */
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

/* 搜索框样式 - 更新为类似ChatGPT的对话框 */
.search-box {
  display: flex;
  align-items: center;
  max-width: 800px; /* 与聊天历史匹配 */
  margin: 0 auto;
  border: 1px solid #dfe1e5;
  border-radius: 24px;
  padding: 12px 18px; /* 增大内边距 */
  box-shadow: 0 1px 6px rgba(32, 33, 36, 0.18);
  transition: box-shadow 0.2s, border-color 0.2s;
  background-color: white;
}

.search-input {
  flex: 1;
  height: 38px; /* 增高输入框 */
  background-color: transparent;
  border: none;
  outline: none;
  font-size: 1.05rem; /* 增大字体 */
  color: #202124;
}

/* 模型选择器样式 - 更显眼 */
.model-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  font-size: 1rem;
  color: #3c4043;
  background-color: white;
  padding: 10px 15px;
  border-radius: 20px;
  box-shadow: 0 1px 4px rgba(32, 33, 36, 0.15);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.model-selector select {
  margin-left: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #dfe1e5;
  background-color: white;
  outline: none;
  font-size: 0.95rem;
  color: #202124;
  cursor: pointer;
}

.model-selector select:hover {
  border-color: #3498db;
}

/* 响应式调整 */
@media (max-width: 860px) {
  .chat-container, .search-box {
    max-width: 90%;
  }
  
  .chat-history {
    max-height: 500px;
  }
  
  .chat-message.user {
    margin-left: 5%;
  }
  
  .chat-message.assistant {
    margin-right: 5%;
  }
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