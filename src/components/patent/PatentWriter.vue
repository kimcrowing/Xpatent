<template>
  <div class="patent-writer">
    <h1 class="page-title">专利撰写助手</h1>
    
    <div class="page-content">
      <!-- 文件上传卡片 -->
      <div class="card upload-card" v-if="!hasDocument">
        <div class="card-header">
          <h2>上传文件</h2>
          <p class="card-description">上传Word或PDF文件，系统将提取文本内容并放入交底书中</p>
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
      
      <!-- 编辑器区域 -->
      <div class="editor-area" v-if="hasDocument && !loading">
        <div class="editor-toolbar">
          <div class="toolbar-title">
            <h2>专利文档编辑器</h2>
            <span class="document-title">{{ documentTitle }}</span>
          </div>
          
          <div class="toolbar-actions">
            <button class="btn btn-outline" @click="optimizeContent">
              <i class="fas fa-magic"></i> AI内容优化
            </button>
            <button class="btn btn-primary" @click="generateDocument">
              <i class="fas fa-file-alt"></i> 下载Word文档
            </button>
          </div>
        </div>
        
        <div class="editor-container">
          <!-- 分类导航 -->
          <div class="editor-sections">
            <div class="section-tab" 
                 :class="{ active: activeSection === 'background' }"
                 @click="setActiveSection('background')">
              背景技术
            </div>
            <div class="section-tab" 
                 :class="{ active: activeSection === 'technical_solution' }"
                 @click="setActiveSection('technical_solution')">
              技术方案
            </div>
            <div class="section-tab" 
                 :class="{ active: activeSection === 'beneficial_effects' }"
                 @click="setActiveSection('beneficial_effects')">
              有益效果
            </div>
            <div class="section-tab" 
                 :class="{ active: activeSection === 'embodiments' }"
                 @click="setActiveSection('embodiments')">
              实施例
            </div>
            <div class="section-tab" 
                 :class="{ active: activeSection === 'unclassified' }"
                 @click="setActiveSection('unclassified')">
              交底书
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
                  <div class="menu-title">图片标记</div>
                  <div class="menu-item" v-for="n in 10" :key="`fig-${n}`"
                       @click="markAsFigure(n)">
                    附图 {{ n }}
                  </div>
                </div>
                <div class="menu-group">
                  <div class="menu-title">AI优化</div>
                  <div class="menu-item" @click="optimizeSelectedContent">
                    优化选中内容
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 图片预览区 -->
        <div class="images-preview" v-if="documentImages && documentImages.length > 0">
          <h3>文档图片 ({{documentImages.length}})</h3>
          <div class="images-container">
            <div class="image-item" v-for="(image, index) in documentImages" :key="index">
              <div class="image-wrapper" @click="previewImage(image)">
                <img :src="image.url" :alt="`图片 ${image.number}`" />
                <div class="image-overlay">
                  <span class="image-number">{{image.number}}</span>
                  <span class="image-format">{{image.format}}</span>
                </div>
              </div>
              <div class="image-description">
                {{image.description}}
                <span v-if="image.page" class="image-page">第{{image.page}}页</span>
              </div>
            </div>
          </div>
          
          <!-- 图片预览弹窗 -->
          <div class="image-preview-modal" v-if="previewedImage" @click="closePreview">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h4>{{previewedImage.description}}</h4>
                <button class="close-btn" @click="closePreview">&times;</button>
              </div>
              <div class="modal-body">
                <img :src="previewedImage.url" :alt="previewedImage.description" />
              </div>
              <div class="modal-footer">
                <div class="image-info">
                  <span>图片 {{previewedImage.number}}</span>
                  <span v-if="previewedImage.page">第 {{previewedImage.page}} 页</span>
                  <span>格式: {{previewedImage.format}}</span>
                </div>
                <div class="action-buttons">
                  <button class="btn btn-outline" @click="insertImageReference(previewedImage)">
                    插入图片引用
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import FileProcessorService from '@/services/FileProcessorService'
import AIOptimizerService from '@/services/AIOptimizerService'

export default {
  name: 'PatentWriter',
  setup() {
    const authStore = useAuthStore()
    const fileInput = ref(null)
    const hasDocument = ref(false)
    const loading = ref(false)
    const documentTitle = ref('')
    const documentImages = ref([])
    const activeSection = ref('background')
    const previewedImage = ref(null)
    
    // 创建一个默认的部分内容对象，以便在需要时重置
    const defaultSections = {
      background: '',
      technical_solution: '',
      beneficial_effects: '',
      embodiments: '',
      unclassified: ''
    }
    
    // 各部分内容 - 确保始终初始化且不会变为undefined
    const sections = ref({...defaultSections})
    
    // 定义一个重置sections的函数，以便在需要时调用
    const resetSections = () => {
      console.log('重置 sections.value 为默认值');
      // 确保defaultSections的每个属性都是空字符串
      const safeDefaults = {
        background: '',
        technical_solution: '',
        beneficial_effects: '',
        embodiments: '',
        unclassified: ''
      };
      
      // 使用展开操作符创建一个新对象，避免引用问题
      sections.value = {...safeDefaults};
      
      console.log('sections.value已重置，当前属性:', Object.keys(sections.value).join(', '));
      return sections.value; // 返回重置后的对象以便链式调用
    }
    
    // 添加一个辅助函数，确保sections.value存在
    const ensureSections = () => {
      if (!sections.value || typeof sections.value !== 'object') {
        console.warn('检测到 sections.value 不是有效对象，正在重置');
        resetSections();
      } else {
        // 验证所有必需的属性是否存在
        const requiredKeys = ['background', 'technical_solution', 'beneficial_effects', 'embodiments', 'unclassified'];
        let needsReset = false;
        
        for (const key of requiredKeys) {
          if (!(key in sections.value) || typeof sections.value[key] !== 'string') {
            console.warn(`sections.value缺少属性 ${key} 或类型不正确，需要重置`);
            needsReset = true;
            break;
          }
        }
        
        if (needsReset) {
          resetSections();
        }
      }
      
      return sections.value; // 返回确保有效的对象
    }
    
    // 部分名称映射
    const sectionNames = {
      background: '背景技术',
      technical_solution: '技术方案',
      beneficial_effects: '有益效果',
      embodiments: '实施例',
      unclassified: '交底书'
    }
    
    // 计算属性：当前激活部分的内容
    const activeContent = computed({
      get: () => {
        // 先确保activeSection.value有效
        const sectionKey = activeSection.value && typeof activeSection.value === 'string' ? 
                          activeSection.value : 'unclassified';
        
        // 确保在读取属性之前 sections.value 已存在
        const sectionsVal = ensureSections();
        
        // 确保对应的部分存在，否则返回空字符串
        return (sectionKey in sectionsVal) ? sectionsVal[sectionKey] : '';
      },
      set: (val) => {
        // 确保val是字符串
        const safeVal = typeof val === 'string' ? val : String(val);
        
        // 先确保activeSection.value有效
        const sectionKey = activeSection.value && typeof activeSection.value === 'string' ?
                          activeSection.value : 'unclassified';
        
        // 确保在设置属性之前 sections.value 已存在
        const sectionsVal = ensureSections();
        
        // 确保对应的部分存在，然后设置值
        if (sectionKey in sectionsVal) {
          sectionsVal[sectionKey] = safeVal;
        } else {
          console.warn(`尝试设置不存在的部分 ${sectionKey}，将使用 unclassified 部分`);
          sectionsVal.unclassified = safeVal;
        }
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
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file) {
        processFile(file)
      }
    }
    
    const onFileSelected = (event) => {
      const file = event.target.files[0]
      if (file) {
        processFile(file)
      }
    }
    
    const processFile = async (file) => {
      if (!file) return
      
      console.log('开始处理文件:', file.name)
      documentTitle.value = file.name
      loading.value = true
      
      try {
        // 使用客户端文件处理服务
        const result = await FileProcessorService.processFile(file)
        
        // 更新内容和图片
        sections.value.unclassified = result.text
        documentImages.value = result.images
        hasDocument.value = true
        activeSection.value = 'unclassified'
        
        console.log('文件处理完成，提取了', result.text.length, '个字符和', result.images.length, '张图片')
      } catch (error) {
        console.error('处理文件失败:', error)
        alert(`处理文件失败: ${error.message}`)
        
        // 重置
        resetSections()
        documentImages.value = []
      } finally {
        loading.value = false
      }
    }
    
    // 切换当前编辑部分
    const setActiveSection = (section) => {
      activeSection.value = section
    }
    
    // AI内容优化
    const optimizeContent = async () => {
      if (!activeContent.value) {
        alert('当前没有内容可以优化')
        return
      }
      
      loading.value = true
      
      try {
        // 使用客户端AI优化服务
        const optimizedContent = await AIOptimizerService.optimizeContent(
          activeSection.value,
          activeContent.value
        )
        
        // 更新内容
        sections.value[activeSection.value] = optimizedContent
        alert('内容优化完成')
      } catch (error) {
        console.error('优化内容失败:', error)
        alert(`优化失败: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    // 生成Word文档
    const generateDocument = async () => {
      // 检查必要部分是否为空
      const requiredSections = ['technical_solution', 'beneficial_effects']
      const emptySections = requiredSections.filter(section => !sections.value[section])
      
      if (emptySections.length > 0) {
        const missingParts = emptySections.map(section => sectionNames[section]).join('、')
        if (!confirm(`${missingParts}部分为空，是否继续生成文档？`)) {
          return
        }
      }
      
      loading.value = true
      
      try {
        console.log('准备生成文档，数据处理中...')
        
        // 确保文档部分是完整的
        if (!sections.value) {
          console.error('生成文档失败: sections.value 是 undefined');
          throw new Error('文档部分内容未初始化，请重新上传文件');
        }
        
        // 准备图片数据，去除可能无法序列化的部分
        let processedImages = [];
        if (documentImages.value && documentImages.value.length > 0) {
          console.log(`处理 ${documentImages.value.length} 张图片数据`);
          processedImages = documentImages.value.map(img => {
            // 只保留可序列化的属性
            return {
              number: img.number,
              description: img.description,
              page: img.page
              // 注意：不传输 url，因为是 Blob URL
            }
          });
        }
        
        const response = await fetch('/api/patent/generate-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            sections: sections.value,
            images: processedImages
          })
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || '生成文档失败'
          } catch (e) {
            errorMessage = `生成文档失败: ${response.status} ${response.statusText}`
            console.error('服务器响应非JSON格式:', errorText)
          }
          throw new Error(errorMessage)
        }
        
        // 下载文档
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = documentTitle.value.replace(/\.[^/.]+$/, '') + '_专利申请文件.docx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        console.log('文档生成并下载成功')
        
      } catch (error) {
        console.error('生成文档失败:', error)
        alert(`生成失败: ${error.message}`)
      } finally {
        loading.value = false
      }
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
        // 确保 sections.value 存在
        ensureSections();
        
        // 从原文中删除选中内容
        const textArea = selectedRange.value.startContainer.parentElement.closest('textarea')
        if (textArea) {
          const start = textArea.selectionStart
          const end = textArea.selectionEnd
          const text = textArea.value
          textArea.value = text.substring(0, start) + text.substring(end)
          
          // 确保 sections.value 和 activeSection.value 存在且有效
          if (sections.value && activeSection.value) {
            sections.value[activeSection.value] = textArea.value
          }
        }
        
        // 添加到目标分类 - 确保 sections.value 和 category 存在且有效
        if (sections.value && category && category in sections.value) {
          sections.value[category] += (sections.value[category] ? '\n\n' : '') + selectedText.value
        }
        
        showMenu.value = false
      }
    }
    
    // 标记图片
    const markAsFigure = (figureNumber) => {
      if (selectedText.value && selectedRange.value) {
        // 确保 sections.value 存在
        ensureSections();
        
        const textArea = selectedRange.value.startContainer.parentElement.closest('textarea')
        if (textArea) {
          const start = textArea.selectionStart
          const end = textArea.selectionEnd
          const text = textArea.value
          const markedText = `[图${figureNumber}]${selectedText.value}[/图${figureNumber}]`
          textArea.value = text.substring(0, start) + markedText + text.substring(end)
          
          // 确保 sections.value 和 activeSection.value 存在且有效
          if (sections.value && activeSection.value) {
            sections.value[activeSection.value] = textArea.value
          }
        }
        showMenu.value = false
      }
    }
    
    // 选中内容优化
    const optimizeSelectedContent = async () => {
      // 获取选中的文本
      const selectedText = window.getSelection().toString().trim()
      
      if (!selectedText) {
        alert('请先选择要优化的文本内容')
        showMenu.value = false
        return
      }
      
      loading.value = true
      showMenu.value = false
      
      try {
        // 使用客户端AI优化服务优化选中内容
        const optimizedContent = await AIOptimizerService.optimizeContent(
          activeSection.value,
          selectedText
        )
        
        // 替换选中内容
        const textarea = document.querySelector('.editor-wrapper textarea')
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        
        const currentContent = activeContent.value
        sections.value[activeSection.value] = 
          currentContent.substring(0, start) + 
          optimizedContent + 
          currentContent.substring(end)
        
        alert('选中内容优化完成')
      } catch (error) {
        console.error('优化选中内容失败:', error)
        alert(`优化失败: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    // 图片预览
    const previewImage = (image) => {
      previewedImage.value = image
    }
    
    const closePreview = () => {
      previewedImage.value = null
    }
    
    // 插入图片引用
    const insertImageReference = (image) => {
      const reference = `[图${image.number}]`
      
      // 确保sections.value存在
      ensureSections()
      
      // 在当前激活的部分中插入图片引用
      if (sections.value && activeSection.value) {
        const currentText = sections.value[activeSection.value] || ''
        sections.value[activeSection.value] = currentText + (currentText ? '\n\n' : '') + reference
      }
      
      closePreview()
      // 提醒用户图片引用已插入
      alert(`图片引用 "${reference}" 已插入到${sectionNames[activeSection.value]}部分`)
    }
    
    return {
      fileInput,
      hasDocument,
      loading,
      documentTitle,
      documentImages,
      activeSection,
      activeContent,
      sectionNames,
      previewedImage,
      triggerFileInput,
      onDragOver,
      onDrop,
      onFileSelected,
      setActiveSection,
      optimizeContent,
      generateDocument,
      showMenu,
      menuPosition,
      selectedText,
      showContextMenu,
      handleTextSelection,
      classifyContent,
      markAsFigure,
      optimizeSelectedContent,
      previewImage,
      closePreview,
      insertImageReference
    }
  }
}
</script>

<style scoped>
.patent-writer {
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

/* 编辑器区域 */
.editor-area {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
}

.toolbar-title {
  display: flex;
  align-items: center;
}

.toolbar-title h2 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
}

.document-title {
  font-size: 0.9rem;
  color: #666;
  margin-left: 10px;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
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

/* 图片预览区 */
.images-preview {
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.images-preview h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 15px;
}

.images-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
}

.image-item {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  transition: transform 0.2s, box-shadow 0.2s;
}

.image-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.image-wrapper {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 5px 8px;
  background: rgba(0,0,0,0.5);
  color: white;
  font-size: 0.8rem;
}

.image-description {
  padding: 10px;
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-page {
  font-size: 0.8rem;
  color: #666;
  margin-left: 5px;
}

/* 图片预览模态框 */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h4 {
  margin: 0;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.modal-body img {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-info {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 10px;
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
  color: var(--primary-color);
}

.editor-wrapper {
  position: relative;
  height: 100%;
}
</style> 