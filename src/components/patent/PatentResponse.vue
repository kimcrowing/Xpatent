<template>
  <div class="patent-response">
    <h1 class="page-title">专利答审助手</h1>
    
    <div class="page-content">
      <!-- 文件上传卡片 -->
      <div class="card upload-card" v-if="!hasOpinion">
        <div class="card-header">
          <h2>上传审查意见通知书</h2>
          <p class="card-description">上传Word或PDF格式的审查意见通知书，系统将自动识别内容</p>
        </div>
        
        <div class="card-body">
          <div class="upload-zone" 
               @dragover.prevent="onDragOver" 
               @drop.prevent="onDrop">
            <input 
              type="file" 
              ref="fileInput" 
              accept=".docx,.doc,.pdf" 
              @change="onFileSelected" 
              class="file-input" 
            />
            <div class="upload-placeholder">
              <div class="upload-icon">
                <i class="fas fa-cloud-upload-alt"></i>
              </div>
              <p>拖放文件到此处，或</p>
              <button class="btn btn-primary" @click="triggerFileInput">选择文件</button>
              <p class="file-types">支持的文件类型: .docx, .doc, .pdf</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载中状态 -->
      <div class="loading-indicator" v-if="loading">
        <div class="spinner"></div>
        <p>正在处理文档，请稍候...</p>
      </div>
      
      <!-- 答复编辑区域 -->
      <div class="response-area" v-if="hasOpinion && !loading">
        <div class="response-header">
          <h2>审查意见答复</h2>
          <div class="document-info">
            <span class="document-title">{{ documentTitle }}</span>
            <span class="reference-ids" v-if="referenceDocuments.length">
              对比文件: {{ referenceDocuments.map(doc => doc.number).join(', ') }}
            </span>
          </div>
        </div>
        
        <!-- 对比文件列表 -->
        <div class="reference-documents" v-if="referenceDocuments.length">
          <h3>对比文件</h3>
          <div class="document-list">
            <div class="document-item" v-for="doc in referenceDocuments" :key="doc.number">
              <div class="document-info">
                <span class="document-number">{{ doc.number }}</span>
                <span class="document-title">{{ doc.title }}</span>
              </div>
              <button class="btn btn-outline" @click="viewDocument(doc.number)">
                <i class="fas fa-eye"></i> 查看文件
              </button>
            </div>
          </div>
        </div>
        
        <!-- 编辑区域 -->
        <div class="editor-container">
          <!-- 分类导航 -->
          <div class="editor-sections">
            <div class="section-tab" 
                 :class="{ active: activeSection === 'opinion' }"
                 @click="setActiveSection('opinion')">
              审查意见
            </div>
            <div class="section-tab" 
                 :class="{ active: activeSection === 'core_differences' }"
                 @click="setActiveSection('core_differences')">
              核心区别
            </div>
            <div class="section-tab" 
                 :class="{ active: activeSection === 'key_analysis' }"
                 @click="setActiveSection('key_analysis')">
              重点分析
            </div>
            <div class="section-tab" 
                 :class="{ active: activeSection === 'error_analysis' }"
                 @click="setActiveSection('error_analysis')">
              错漏分析
            </div>
          </div>
          
          <!-- 编辑区 -->
          <div class="editor-content">
            <div class="editor-wrapper" @contextmenu.prevent="showContextMenu">
              <textarea 
                v-model="activeContent" 
                :placeholder="`请在此输入${sectionNames[activeSection]}内容...`"
                @mouseup="handleTextSelection"
                @keyup="handleTextSelection"
              ></textarea>
              
              <!-- 右键菜单 -->
              <div v-if="showMenu" class="context-menu" :style="menuPosition">
                <div class="menu-group">
                  <div class="menu-title">内容分类</div>
                  <div class="menu-item" v-for="(name, key) in sectionNames" :key="key"
                       @click="classifyContent(key)">
                    {{ name }}
                  </div>
                </div>
                <div class="menu-group">
                  <div class="menu-title">AI分析</div>
                  <div class="menu-item" @click="analyzeSelectedContent">
                    分析选中内容
                  </div>
                  <div class="menu-item" @click="generateResponseForSelection">
                    生成答复建议
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="btn btn-outline" @click="analyzeOpinion">
            <i class="fas fa-magic"></i> AI分析意见
          </button>
          <button class="btn btn-primary" @click="generateResponse">
            <i class="fas fa-file-alt"></i> 生成答复文档
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'PatentResponse',
  setup() {
    const authStore = useAuthStore()
    const fileInput = ref(null)
    const hasOpinion = ref(false)
    const loading = ref(false)
    const documentTitle = ref('')
    const referenceDocuments = ref([])
    const activeSection = ref('opinion')
    
    // 各部分内容
    const sections = ref({
      opinion: '',
      core_differences: '',
      key_analysis: '',
      error_analysis: ''
    })
    
    // 部分名称映射
    const sectionNames = {
      opinion: '审查意见',
      core_differences: '核心区别',
      key_analysis: '重点分析',
      error_analysis: '错漏分析'
    }
    
    // 计算属性：当前激活部分的内容
    const activeContent = computed({
      get: () => sections.value[activeSection.value],
      set: (val) => {
        sections.value[activeSection.value] = val
      }
    })
    
    const showMenu = ref(false)
    const menuPosition = ref({ top: '0px', left: '0px' })
    const selectedText = ref('')
    const selectedRange = ref(null)
    
    // 文件上传方法
    const triggerFileInput = () => {
      fileInput.value.click()
    }
    
    const onDragOver = (event) => {
      event.preventDefault()
    }
    
    const onDrop = (event) => {
      const files = event.dataTransfer.files
      if (files.length > 0) {
        processFile(files[0])
      }
    }
    
    const onFileSelected = (event) => {
      const files = event.target.files
      if (files.length > 0) {
        processFile(files[0])
      }
    }
    
    const processFile = async (file) => {
      loading.value = true
      documentTitle.value = file.name
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/patent/analyze-opinion', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          },
          body: formData
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '文件处理失败')
        }
        
        const data = await response.json()
        
        // 更新审查意见内容
        if (data.content) {
          sections.value.opinion = data.content
        }
        
        // 更新对比文件信息
        if (data.reference_documents) {
          referenceDocuments.value = data.reference_documents
        }
        
        hasOpinion.value = true
      } catch (error) {
        console.error('处理文件失败:', error)
        alert(`处理文件失败: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    // 切换当前编辑部分
    const setActiveSection = (section) => {
      activeSection.value = section
    }
    
    // 显示右键菜单
    const showContextMenu = (event) => {
      event.preventDefault()
      if (selectedText.value) {
        showMenu.value = true
        menuPosition.value = {
          top: `${event.clientY}px`,
          left: `${event.clientX}px`
        }
      }
    }
    
    // 处理文本选择
    const handleTextSelection = () => {
      const selection = window.getSelection()
      if (selection.toString().trim()) {
        selectedText.value = selection.toString()
        selectedRange.value = selection.getRangeAt(0)
      } else {
        selectedText.value = ''
        selectedRange.value = null
        showMenu.value = false
      }
    }
    
    // 分类内容
    const classifyContent = (category) => {
      if (selectedText.value && selectedRange.value) {
        // 从原文中删除选中内容
        const textArea = selectedRange.value.startContainer.parentElement.closest('textarea')
        if (textArea) {
          const start = textArea.selectionStart
          const end = textArea.selectionEnd
          const text = textArea.value
          textArea.value = text.substring(0, start) + text.substring(end)
          sections.value[activeSection.value] = textArea.value
        }
        
        // 添加到目标分类
        sections.value[category] += (sections.value[category] ? '\n\n' : '') + selectedText.value
        
        showMenu.value = false
      }
    }
    
    // 分析选中内容
    const analyzeSelectedContent = async () => {
      if (!selectedText.value) return
      
      loading.value = true
      try {
        const response = await fetch('/api/patent/analyze-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            opinion_content: selectedText.value,
            reference_documents: referenceDocuments.value
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '分析失败')
        }
        
        const data = await response.json()
        
        // 更新分析结果
        if (data.core_differences) {
          sections.value.core_differences += (sections.value.core_differences ? '\n\n' : '') + data.core_differences
        }
        if (data.key_analysis) {
          sections.value.key_analysis += (sections.value.key_analysis ? '\n\n' : '') + data.key_analysis
        }
        if (data.error_analysis) {
          sections.value.error_analysis += (sections.value.error_analysis ? '\n\n' : '') + data.error_analysis
        }
        
      } catch (error) {
        console.error('分析失败:', error)
        alert(`分析失败: ${error.message}`)
      } finally {
        loading.value = false
        showMenu.value = false
      }
    }
    
    // 为选中内容生成答复建议
    const generateResponseForSelection = async () => {
      if (!selectedText.value) return
      
      loading.value = true
      try {
        const response = await fetch('/api/patent/generate-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            opinion_content: selectedText.value,
            classified_content: sections.value,
            reference_documents: referenceDocuments.value
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '生成答复建议失败')
        }
        
        const data = await response.json()
        
        // 在当前位置插入生成的答复建议
        const textArea = selectedRange.value.startContainer.parentElement.closest('textarea')
        if (textArea) {
          const start = textArea.selectionStart
          const end = textArea.selectionEnd
          const text = textArea.value
          textArea.value = text.substring(0, start) + data.response + text.substring(end)
          sections.value[activeSection.value] = textArea.value
        }
        
      } catch (error) {
        console.error('生成答复建议失败:', error)
        alert(`生成失败: ${error.message}`)
      } finally {
        loading.value = false
        showMenu.value = false
      }
    }
    
    // 分析整个审查意见
    const analyzeOpinion = async () => {
      if (!sections.value.opinion) {
        alert('请先上传审查意见通知书')
        return
      }
      
      loading.value = true
      try {
        const response = await fetch('/api/patent/analyze-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            opinion_content: sections.value.opinion,
            reference_documents: referenceDocuments.value
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '分析失败')
        }
        
        const data = await response.json()
        
        // 更新分析结果
        if (data.core_differences) sections.value.core_differences = data.core_differences
        if (data.key_analysis) sections.value.key_analysis = data.key_analysis
        if (data.error_analysis) sections.value.error_analysis = data.error_analysis
        
      } catch (error) {
        console.error('分析失败:', error)
        alert(`分析失败: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    // 生成完整答复文档
    const generateResponse = async () => {
      if (!sections.value.opinion) {
        alert('请先上传审查意见通知书')
        return
      }
      
      loading.value = true
      try {
        const response = await fetch('/api/patent/download-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            opinion_content: sections.value.opinion,
            classified_content: sections.value,
            reference_documents: referenceDocuments.value
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '生成文档失败')
        }
        
        // 下载文档
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = documentTitle.value.replace(/\.[^/.]+$/, '') + '_答复意见.docx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
      } catch (error) {
        console.error('生成文档失败:', error)
        alert(`生成失败: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    // 查看对比文件
    const viewDocument = async (docNumber) => {
      try {
        const response = await fetch(`/api/patent/view-document/${docNumber}`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '获取文件失败')
        }
        
        // 下载并打开文件
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
        
      } catch (error) {
        console.error('查看文件失败:', error)
        alert(`查看失败: ${error.message}`)
      }
    }
    
    return {
      fileInput,
      hasOpinion,
      loading,
      documentTitle,
      referenceDocuments,
      activeSection,
      activeContent,
      sectionNames,
      showMenu,
      menuPosition,
      selectedText,
      triggerFileInput,
      onDragOver,
      onDrop,
      onFileSelected,
      setActiveSection,
      showContextMenu,
      handleTextSelection,
      classifyContent,
      analyzeSelectedContent,
      generateResponseForSelection,
      analyzeOpinion,
      generateResponse,
      viewDocument
    }
  }
}
</script>

<style scoped>
.patent-response {
  width: 100%;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.page-content {
  width: 100%;
}

/* 卡片样式 */
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.card-header {
  padding: 20px 20px 0;
}

.card-header h2 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 10px;
}

.card-description {
  color: #666;
  margin-bottom: 15px;
}

.card-body {
  padding: 20px;
}

/* 上传区域样式 */
.upload-zone {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-zone:hover {
  border-color: #3a8ff7;
  background-color: rgba(58, 143, 247, 0.03);
}

.file-input {
  display: none;
}

.upload-icon {
  font-size: 48px;
  color: #ddd;
  margin-bottom: 15px;
}

.upload-placeholder p {
  margin-bottom: 15px;
  color: #666;
}

.file-types {
  font-size: 0.9rem;
  color: #999;
  margin-top: 15px;
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3a8ff7;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 答复区域 */
.response-area {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.response-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.response-header h2 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 10px;
}

.document-info {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #666;
}

.document-title {
  font-weight: 500;
}

/* 对比文件列表 */
.reference-documents {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.reference-documents h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 15px;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.document-number {
  font-weight: 500;
  margin-right: 10px;
}

/* 编辑器容器 */
.editor-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}

/* 分类导航 */
.editor-sections {
  display: flex;
  border-bottom: 1px solid #e9ecef;
}

.section-tab {
  padding: 12px 20px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
}

.section-tab:hover {
  color: #3a8ff7;
  background-color: #f8f9fa;
}

.section-tab.active {
  color: #3a8ff7;
  font-weight: 600;
}

.section-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #3a8ff7;
}

/* 编辑区域 */
.editor-content {
  flex: 1;
  padding: 20px;
}

.editor-content textarea {
  width: 100%;
  height: 100%;
  padding: 15px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 1rem;
  line-height: 1.6;
  resize: none;
}

.editor-content textarea:focus {
  outline: none;
  border-color: #3a8ff7;
  box-shadow: 0 0 0 2px rgba(58, 143, 247, 0.2);
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  min-width: 200px;
}

.menu-group {
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.menu-group:last-child {
  border-bottom: none;
}

.menu-title {
  padding: 5px 15px;
  color: #666;
  font-size: 0.9em;
  font-weight: 500;
}

.menu-item {
  padding: 8px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f8f9fa;
  color: #3a8ff7;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

.editor-wrapper {
  position: relative;
  height: 100%;
}
</style> 