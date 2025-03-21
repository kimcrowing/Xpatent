<template>
  <div class="home-page">
    <!-- 品牌标志 -->
    <div class="logo-section">
      <h1 class="brand-logo">Xpatent</h1>
    </div>
    
    <!-- AI对话框部分 -->
    <div class="chat-container">
      <div class="chat-box">
        <!-- 聊天历史 -->
        <div class="chat-history" ref="chatHistoryRef">
          <div v-if="chatMessages.length === 0" class="welcome-message">
            <h2>欢迎使用Xpatent专利助手</h2>
            <p>您可以询问专利相关问题，或使用以下功能：</p>
            <div class="suggestion-buttons">
              <button class="suggestion-btn" @click="insertSuggestion('帮我撰写一份专利说明书')">
                <i class="fas fa-file-alt"></i> 撰写专利说明书
              </button>
              <button class="suggestion-btn" @click="insertSuggestion('分析这份审查意见通知书')">
                <i class="fas fa-search"></i> 分析审查意见
              </button>
              <button class="suggestion-btn" @click="insertSuggestion('撰写一份审查意见答复')">
                <i class="fas fa-reply"></i> 撰写审查意见答复
              </button>
            </div>
          </div>
          
          <div v-for="(message, index) in chatMessages" :key="index" :class="['chat-message', message.role]">
            <div class="message-avatar">
              <img v-if="message.role === 'user'" src="https://ui-avatars.com/api/?name=User&background=random" alt="User">
              <img v-else src="https://ui-avatars.com/api/?name=AI&background=5E81AC" alt="AI">
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          
          <div v-if="isLoading" class="chat-message assistant">
            <div class="message-avatar">
              <img src="https://ui-avatars.com/api/?name=AI&background=5E81AC" alt="AI">
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 聊天输入框 -->
        <div class="chat-input-container">
          <div class="input-wrapper">
            <textarea 
              ref="inputRef"
              v-model="userInput" 
              class="chat-input" 
              placeholder="询问专利相关问题，或描述您的需求..." 
              @keydown.enter.prevent="handleSubmit"
              :disabled="isLoading"
              rows="1"
              @input="autoResize"
            ></textarea>
            <div class="input-buttons">
              <button class="upload-button" @click="triggerFileUpload" :disabled="isLoading">
                <i class="fas fa-paperclip"></i>
              </button>
              <input 
                type="file" 
                ref="fileInput" 
                @change="handleFileUpload" 
                style="display: none"
                accept=".pdf,.doc,.docx,.txt"
              >
              <button class="send-button" @click="handleSubmit" :disabled="!canSubmit">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
          <div class="input-footer">
            <div class="model-selector">
              <span>模型:</span>
              <select v-model="selectedModel">
                <option value="deepseek/deepseek-r1:free">深度思考 R1</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3">Claude 3</option>
                <option value="gemini-pro">Gemini Pro</option>
                <option value="local">本地模型</option>
              </select>
            </div>
            <div class="input-tips">
              按Enter发送，Shift+Enter换行
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快捷功能按钮 -->
    <div class="quick-actions">
      <router-link to="/patent-writer" class="quick-action-btn">
        <i class="fas fa-file-alt"></i>
        <span>专利撰写</span>
      </router-link>
      <router-link to="/patent-response" class="quick-action-btn">
        <i class="fas fa-reply"></i>
        <span>专利答审</span>
      </router-link>
      <router-link to="/patent-search" class="quick-action-btn">
        <i class="fas fa-search"></i>
        <span>专利检索</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default {
  name: 'HomePage',
  setup() {
    const authStore = useAuthStore()
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    
    const userInput = ref('')
    const chatMessages = ref([])
    const isLoading = ref(false)
    const selectedModel = ref('deepseek/deepseek-r1:free')
    const inputRef = ref(null)
    const fileInput = ref(null)
    const chatHistoryRef = ref(null)
    
    const canSubmit = computed(() => {
      return userInput.value.trim().length > 0 && !isLoading.value
    })
    
    // 自动调整输入框高度
    const autoResize = () => {
      if (inputRef.value) {
        inputRef.value.style.height = 'auto'
        inputRef.value.style.height = `${Math.min(inputRef.value.scrollHeight, 150)}px`
      }
    }
    
    // 提交用户输入
    const handleSubmit = async () => {
      if (!canSubmit.value) return
      
      // 添加用户消息
      const userMessage = {
        role: 'user',
        content: userInput.value,
        timestamp: new Date()
      }
      chatMessages.value.push(userMessage)
      
      // 清空输入框并重置高度
      userInput.value = ''
      if (inputRef.value) {
        inputRef.value.style.height = 'auto'
      }
      
      // 滚动到底部
      await nextTick()
      scrollToBottom()
      
      // 模拟AI响应
      isLoading.value = true
      
      // 使用setTimeout模拟AI响应延迟
      setTimeout(() => {
        const assistantMessage = {
          role: 'assistant',
          content: generateResponse(userMessage.content),
          timestamp: new Date()
        }
        chatMessages.value.push(assistantMessage)
        isLoading.value = false
        
        // 滚动到底部
        nextTick(() => {
          scrollToBottom()
        })
      }, 1000)
    }
    
    // 模拟AI回复生成
    const generateResponse = (userMessage) => {
      const responses = [
        "我可以帮您撰写专利说明书。请提供您的发明概述和技术领域，我将为您生成初步的说明书框架。",
        "我已收到您的请求，专利答复需要考虑审查意见的具体内容。您可以上传审查意见通知书，我会帮您分析并提供答复建议。",
        "专利检索是专利申请前的重要步骤。请提供您想检索的技术关键词，我可以帮您生成检索策略。",
        "根据您提供的信息，我建议您从以下几个方面完善您的专利申请：\n\n1. 技术方案的详细描述\n2. 有益效果的具体阐述\n3. 权利要求的合理布局\n\n需要我详细解释其中任何一点吗？",
        "专利撰写需要注意技术方案的完整性和权利要求的合理性。您的发明点是什么？这将有助于我为您提供更具体的建议。"
      ]
      
      // 随机选择一个回复
      const randomIndex = Math.floor(Math.random() * responses.length)
      return responses[randomIndex]
    }
    
    // 滚动到聊天历史底部
    const scrollToBottom = () => {
      if (chatHistoryRef.value) {
        chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
      }
    }
    
    // 格式化消息内容（支持Markdown）
    const formatMessage = (content) => {
      // 将markdown转换为HTML并进行安全处理
      const rawHtml = marked(content)
      return DOMPurify.sanitize(rawHtml)
    }
    
    // 格式化时间
    const formatTime = (timestamp) => {
      return new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(timestamp)
    }
    
    // 触发文件上传
    const triggerFileUpload = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }
    
    // 处理文件上传
    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      // 在这里处理文件上传逻辑
      userInput.value += `\n\n[上传文件: ${file.name}]`
      
      // 重置文件输入
      if (fileInput.value) {
        fileInput.value.value = null
      }
    }
    
    // 插入建议到输入框
    const insertSuggestion = (text) => {
      userInput.value = text
      // 聚焦输入框
      if (inputRef.value) {
        inputRef.value.focus()
      }
    }
    
    return {
      isAuthenticated,
      userInput,
      chatMessages,
      isLoading,
      selectedModel,
      canSubmit,
      inputRef,
      fileInput,
      chatHistoryRef,
      autoResize,
      handleSubmit,
      formatMessage,
      formatTime,
      triggerFileUpload,
      handleFileUpload,
      insertSuggestion
    }
  }
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 20px;
  background-color: #f8f9fa;
}

.logo-section {
  margin-top: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.brand-logo {
  font-size: 40px;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0;
  letter-spacing: -1px;
}

.chat-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chat-box {
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-history {
  padding: 20px;
  height: 500px;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.welcome-message {
  text-align: center;
  padding: 30px 0;
  color: #555;
}

.welcome-message h2 {
  font-size: 24px;
  margin-bottom: 15px;
  color: #333;
}

.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.suggestion-btn {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestion-btn:hover {
  background-color: #f0f0f0;
}

.suggestion-btn i {
  color: var(--primary-color);
}

.chat-message {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
  overflow: hidden;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  flex-grow: 1;
  max-width: calc(100% - 55px);
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
}

.chat-message.user .message-text {
  background-color: var(--primary-color);
  color: white;
  border-top-right-radius: 4px;
}

.chat-message.assistant .message-text {
  background-color: #e9ecef;
  color: #333;
  border-top-left-radius: 4px;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  padding-left: 8px;
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  background-color: #e9ecef;
  padding: 12px 16px;
  border-radius: 18px;
  border-top-left-radius: 4px;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 2px;
  background-color: #999;
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% { transform: scale(1); }
  50% { transform: scale(1.5); }
  100% { transform: scale(1); }
}

.chat-input-container {
  border-top: 1px solid #e9ecef;
  padding: 15px;
  background-color: #fff;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  position: relative;
}

.chat-input {
  flex-grow: 1;
  min-height: 48px;
  max-height: 150px;
  padding: 12px 70px 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 15px;
  line-height: 24px;
  resize: none;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  word-wrap: break-word;
  overflow-y: auto;
}

.chat-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(58, 143, 247, 0.2);
}

.chat-input::placeholder {
  color: #aaa;
}

.input-buttons {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  gap: 8px;
}

.upload-button,
.send-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background-color: transparent;
  transition: background-color 0.2s;
}

.upload-button:hover,
.send-button:hover {
  background-color: #f0f0f0;
}

.upload-button:disabled,
.send-button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.send-button {
  color: var(--primary-color);
}

.input-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 15px 0;
  font-size: 12px;
  color: #888;
}

.model-selector {
  display: flex;
  align-items: center;
  gap: 5px;
}

.model-selector select {
  padding: 2px 5px;
  font-size: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.input-tips {
  font-style: italic;
}

.quick-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #555;
  padding: 15px;
  border-radius: 8px;
  transition: all 0.2s;
}

.quick-action-btn:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.quick-action-btn i {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--primary-color);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .chat-history {
    height: 400px;
  }
  
  .quick-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* 深色模式 */
:root.dark-mode .home-page {
  background-color: #333;
}

:root.dark-mode .chat-box {
  background-color: #444;
}

:root.dark-mode .chat-history {
  background-color: #3a3a3a;
}

:root.dark-mode .welcome-message {
  color: #e0e0e0;
}

:root.dark-mode .welcome-message h2 {
  color: #f0f0f0;
}

:root.dark-mode .suggestion-btn {
  background-color: #555;
  border-color: #666;
  color: #f0f0f0;
}

:root.dark-mode .suggestion-btn:hover {
  background-color: #666;
}

:root.dark-mode .chat-message.assistant .message-text {
  background-color: #555;
  color: #f0f0f0;
}

:root.dark-mode .typing-indicator {
  background-color: #555;
}

:root.dark-mode .chat-input-container {
  background-color: #444;
  border-top-color: #555;
}

:root.dark-mode .chat-input {
  background-color: #555;
  border-color: #666;
  color: #f0f0f0;
}

:root.dark-mode .chat-input::placeholder {
  color: #aaa;
}

:root.dark-mode .upload-button:hover,
:root.dark-mode .send-button:hover {
  background-color: #666;
}

:root.dark-mode .input-footer {
  color: #aaa;
}

:root.dark-mode .model-selector select {
  background-color: #555;
  border-color: #666;
  color: #f0f0f0;
}

:root.dark-mode .quick-action-btn {
  color: #e0e0e0;
}

:root.dark-mode .quick-action-btn:hover {
  background-color: #555;
}
</style> 