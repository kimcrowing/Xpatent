<template>
  <div class="document-processor">
    <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
      <input 
        type="file" 
        ref="fileInput" 
        @change="handleFileSelect" 
        accept=".docx"
        style="display: none"
      >
      <div class="upload-content">
        <i class="fas fa-file-word"></i>
        <p>拖拽Word文档到这里，或点击选择文件</p>
        <button class="btn btn-primary" @click="triggerFileInput">选择文件</button>
      </div>
    </div>

    <div v-if="processing" class="processing-status">
      <div class="spinner"></div>
      <p>正在处理文档...</p>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { saveToCache, getFromCache } from '@/utils/cache'

export default {
  name: 'DocumentProcessor',
  setup() {
    const fileInput = ref(null)
    const processing = ref(false)
    const error = ref('')
    const configStore = useConfigStore()

    // 触发文件选择
    const triggerFileInput = () => {
      fileInput.value.click()
    }

    // 处理文件选择
    const handleFileSelect = async (event) => {
      const file = event.target.files[0]
      if (file) {
        await processDocument(file)
      }
    }

    // 处理拖放
    const handleDrop = async (event) => {
      const file = event.dataTransfer.files[0]
      if (file) {
        await processDocument(file)
      }
    }

    // 处理文档
    const processDocument = async (file) => {
      if (!file.name.endsWith('.docx')) {
        error.value = '请上传Word文档(.docx)文件'
        return
      }

      try {
        processing.value = true
        error.value = ''

        // 检查缓存
        const cacheKey = `doc_${file.name}_${file.lastModified}`
        const cachedData = await getFromCache(cacheKey)
        
        if (cachedData) {
          emit('processed', cachedData)
          return
        }

        // 读取文件内容
        const arrayBuffer = await file.arrayBuffer()
        
        // 使用mammoth.js处理Word文档
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ arrayBuffer })
        
        // 提取图片
        const images = await extractImages(arrayBuffer)
        
        // 构建处理结果
        const processedData = {
          text: result.value,
          images: images,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            lastModified: file.lastModified,
            processedAt: Date.now()
          }
        }

        // 保存到缓存（1天有效期）
        await saveToCache(cacheKey, processedData, 24 * 60 * 60 * 1000)

        emit('processed', processedData)
      } catch (err) {
        error.value = '文档处理失败：' + err.message
        console.error('文档处理错误:', err)
      } finally {
        processing.value = false
      }
    }

    // 提取图片
    const extractImages = async (arrayBuffer) => {
      const images = []
      try {
        const docx = await import('docx')
        const doc = await docx.Document.load(arrayBuffer)
        
        for (const relationship of doc.relationships) {
          if (relationship.type === 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image') {
            const imageData = await relationship.getData()
            const imageType = relationship.target.split('.').pop().toLowerCase()
            
            images.push({
              data: imageData,
              type: imageType,
              name: relationship.target.split('/').pop()
            })
          }
        }
      } catch (err) {
        console.error('图片提取错误:', err)
      }
      return images
    }

    return {
      fileInput,
      processing,
      error,
      triggerFileInput,
      handleFileSelect,
      handleDrop
    }
  }
}
</script>

<style scoped>
.document-processor {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: var(--primary-color);
  background-color: rgba(52, 152, 219, 0.05);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-content i {
  font-size: 3rem;
  color: var(--primary-color);
}

.processing-status {
  margin-top: 1rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fee;
  color: #c00;
  border-radius: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 