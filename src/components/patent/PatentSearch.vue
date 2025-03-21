# 创建专利查新组件
<template>
  <div class="patent-search">
    <h2>专利检索</h2>
    
    <!-- 检索表单 -->
    <div class="search-form card">
      <div class="form-group">
        <label>技术领域</label>
        <select v-model="searchForm.field" class="form-control">
          <option value="">请选择技术领域</option>
          <option v-for="item in fields" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>关键词</label>
        <textarea 
          v-model="searchForm.keywords" 
          class="form-control" 
          placeholder="请输入关键词，多个关键词用逗号分隔"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group date-range">
        <label>时间范围</label>
        <div class="date-inputs">
          <input 
            v-model="searchForm.startDate" 
            type="date" 
            class="form-control"
          >
          <span>至</span>
          <input 
            v-model="searchForm.endDate" 
            type="date" 
            class="form-control"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label>相似度阈值: {{ searchForm.similarity }}%</label>
        <input 
          v-model="searchForm.similarity" 
          type="range" 
          min="0" 
          max="100" 
          class="form-control"
        >
      </div>
      
      <div class="form-actions">
        <button class="btn btn-primary" @click="handleSearch" :disabled="isLoading">
          <span v-if="isLoading">检索中...</span>
          <span v-else>开始检索</span>
        </button>
        <button class="btn btn-secondary" @click="resetForm" :disabled="isLoading">重置</button>
      </div>
    </div>
    
    <!-- 检索结果 -->
    <div class="search-results card" v-if="results.length">
      <h3>检索结果</h3>
      <div class="results-table">
        <table>
          <thead>
            <tr>
              <th>专利名称</th>
              <th>公开日</th>
              <th>相似度</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paginatedResults" :key="index">
              <td>{{ item.title }}</td>
              <td>{{ item.publicationDate }}</td>
              <td>{{ item.similarity }}%</td>
              <td>
                <button class="btn btn-sm btn-outline" @click="viewDetail(item)">
                  查看详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination">
        <button 
          class="pagination-btn" 
          :disabled="currentPage === 1" 
          @click="handlePageChange(currentPage - 1)"
        >
          上一页
        </button>
        <span class="pagination-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          class="pagination-btn" 
          :disabled="currentPage === totalPages" 
          @click="handlePageChange(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
    
    <!-- 详情对话框 -->
    <div class="modal" v-if="detailVisible">
      <div class="modal-content">
        <div class="modal-header">
          <h4>专利详情</h4>
          <button class="modal-close" @click="detailVisible = false">&times;</button>
        </div>
        <div class="modal-body" v-if="currentPatent">
          <h4>{{ currentPatent.title }}</h4>
          <div class="patent-info">
            <p><strong>申请号：</strong>{{ currentPatent.applicationNumber }}</p>
            <p><strong>公开号：</strong>{{ currentPatent.publicationNumber }}</p>
            <p><strong>申请日：</strong>{{ currentPatent.applicationDate }}</p>
            <p><strong>公开日：</strong>{{ currentPatent.publicationDate }}</p>
            <p><strong>申请人：</strong>{{ currentPatent.applicant }}</p>
            <p><strong>发明人：</strong>{{ currentPatent.inventor }}</p>
          </div>
          <div class="patent-content">
            <h5>摘要</h5>
            <p>{{ currentPatent.abstract }}</p>
            <h5>主权项</h5>
            <p>{{ currentPatent.claims }}</p>
          </div>
          <div class="similarity-analysis">
            <h5>相似度分析</h5>
            <div class="progress">
              <div class="progress-bar" :style="{ width: currentPatent.similarity + '%' }"></div>
            </div>
            <p>相似特征：</p>
            <ul>
              <li v-for="(feature, index) in currentPatent.similarFeatures" :key="index">
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="detailVisible = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// 技术领域选项
const fields = [
  { value: 'computer', label: '计算机技术' },
  { value: 'communication', label: '通信技术' },
  { value: 'electronics', label: '电子技术' },
  { value: 'mechanics', label: '机械工程' },
  { value: 'chemistry', label: '化学工程' },
  { value: 'medical', label: '医药技术' }
]

// 检索表单
const searchForm = reactive({
  field: '',
  keywords: '',
  startDate: '',
  endDate: '',
  similarity: 70
})

// 检索状态和结果
const isLoading = ref(false)
const results = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 详情对话框
const detailVisible = ref(false)
const currentPatent = ref(null)

// 计算总页数
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(results.value.length / pageSize.value))
})

// 计算当前页的结果
const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return results.value.slice(start, end)
})

// 处理检索
const handleSearch = async () => {
  if (!searchForm.field || !searchForm.keywords) {
    alert('请填写技术领域和关键词')
    return
  }
  
  isLoading.value = true
  
  try {
    // 模拟API调用
    setTimeout(() => {
      // 模拟结果数据
      results.value = generateMockResults()
      total.value = results.value.length
      currentPage.value = 1
      isLoading.value = false
    }, 1500)
    
    // 实际API调用（注释掉）
    /*
    const response = await fetch('/api/patent/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        field: searchForm.field,
        keywords: searchForm.keywords,
        startDate: searchForm.startDate,
        endDate: searchForm.endDate,
        similarity: searchForm.similarity,
        page: currentPage.value,
        pageSize: pageSize.value
      })
    })
    
    if (!response.ok) {
      throw new Error('检索失败')
    }
    
    const data = await response.json()
    results.value = data.results
    total.value = data.total
    isLoading.value = false
    */
  } catch (error) {
    console.error('检索失败:', error)
    alert('检索失败: ' + error.message)
    isLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  searchForm.field = ''
  searchForm.keywords = ''
  searchForm.startDate = ''
  searchForm.endDate = ''
  searchForm.similarity = 70
  results.value = []
}

// 页码变化
const handlePageChange = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

// 查看详情
const viewDetail = (patent) => {
  currentPatent.value = patent
  detailVisible.value = true
}

// 生成模拟结果数据
const generateMockResults = () => {
  const mockResults = []
  const count = 15 + Math.floor(Math.random() * 10)
  
  for (let i = 0; i < count; i++) {
    mockResults.push({
      id: 'CN' + (100000000 + i),
      title: getRandomTitle(searchForm.field) + searchForm.keywords.split(',')[0],
      publicationDate: getRandomDate(2015, 2023),
      applicationNumber: 'CN' + (200000000 + i),
      publicationNumber: 'CN' + (100000000 + i),
      applicationDate: getRandomDate(2014, 2022),
      applicant: getRandomApplicant(),
      inventor: getRandomInventor(),
      abstract: getRandomAbstract(searchForm.field, searchForm.keywords),
      claims: getRandomClaims(searchForm.field, searchForm.keywords),
      similarity: Math.max(searchForm.similarity, Math.floor(60 + Math.random() * 40)),
      similarFeatures: getRandomSimilarFeatures(searchForm.keywords)
    })
  }
  
  return mockResults.sort((a, b) => b.similarity - a.similarity)
}

// 辅助函数
const getRandomTitle = (field) => {
  const titles = {
    'computer': ['一种计算机', '一种数据处理', '一种智能'],
    'communication': ['一种通信', '一种信号处理', '一种网络'],
    'electronics': ['一种电子', '一种集成电路', '一种半导体'],
    'mechanics': ['一种机械', '一种装置', '一种设备'],
    'chemistry': ['一种化学', '一种材料', '一种合成'],
    'medical': ['一种医疗', '一种药物', '一种治疗']
  }
  
  const fieldTitles = titles[field] || titles['computer']
  return fieldTitles[Math.floor(Math.random() * fieldTitles.length)]
}

const getRandomDate = (startYear, endYear) => {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1))
  const month = 1 + Math.floor(Math.random() * 12)
  const day = 1 + Math.floor(Math.random() * 28)
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

const getRandomApplicant = () => {
  const applicants = ['北京大学', '清华大学', '华为技术有限公司', '腾讯科技(深圳)有限公司', '阿里巴巴(中国)有限公司', '百度在线网络技术(北京)有限公司']
  return applicants[Math.floor(Math.random() * applicants.length)]
}

const getRandomInventor = () => {
  const inventors = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
  return inventors[Math.floor(Math.random() * inventors.length)] + '等'
}

const getRandomAbstract = (field, keywords) => {
  const keywordList = keywords.split(',')
  return `本发明公开了${getRandomTitle(field)}${keywordList[0]}，涉及${field}技术领域。本发明的目的在于解决现有${keywordList[0]}存在的问题，提供一种更加高效、可靠的${keywordList[0]}方法和装置。本发明通过结合${keywordList.join('和')}等技术，实现了更好的技术效果。`
}

const getRandomClaims = (field, keywords) => {
  const keywordList = keywords.split(',')
  return `1. 一种${getRandomTitle(field).substring(2)}${keywordList[0]}方法，其特征在于，包括：获取${keywordList[0]}相关数据；处理所述数据；输出处理结果。`
}

const getRandomSimilarFeatures = (keywords) => {
  const keywordList = keywords.split(',')
  const features = []
  
  for (let i = 0; i < keywordList.length && i < 3; i++) {
    features.push(`使用了${keywordList[i]}相关技术`)
  }
  
  features.push('应用领域相似')
  features.push('解决的技术问题相似')
  
  return features
}
</script>

<style scoped>
.patent-search {
  padding: 20px;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(58, 143, 247, 0.2);
}

.date-range {
  display: flex;
  flex-direction: column;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-inputs .form-control {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: #fff;
}

.btn-primary:hover {
  background-color: #2a7ee6;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #555;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: #fff;
}

/* 表格样式 */
.results-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  font-weight: 600;
  background-color: #f5f5f5;
  color: #333;
}

tr:hover {
  background-color: #f9f9f9;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.pagination-btn {
  padding: 6px 12px;
  border-radius: 4px;
  background-color: #f0f0f0;
  border: 1px solid #e0e0e0;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #666;
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  width: 70%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h4 {
  margin: 0;
  font-size: 18px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.patent-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.patent-content {
  margin-bottom: 20px;
}

.patent-content h5 {
  margin-top: 15px;
  margin-bottom: 10px;
  font-size: 16px;
}

.progress {
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-bar {
  height: 100%;
  background-color: var(--primary-color);
}

.similarity-analysis ul {
  padding-left: 20px;
}

.similarity-analysis li {
  margin-bottom: 5px;
}
</style> 