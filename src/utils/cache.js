// 缓存工具类
const CACHE_PREFIX = 'xpatent_cache_'

// 保存数据到缓存
export const saveToCache = async (key, data, expirationTime = 24 * 60 * 60 * 1000) => {
  try {
    const cacheKey = CACHE_PREFIX + key
    const cacheData = {
      data,
      timestamp: Date.now(),
      expirationTime
    }
    
    // 使用 IndexedDB 存储大文件
    if (data.images && data.images.length > 0) {
      const db = await openCacheDB()
      await saveToIndexedDB(db, cacheKey, cacheData)
    } else {
      // 小数据使用 localStorage
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    }
    
    return true
  } catch (error) {
    console.error('缓存保存失败:', error)
    return false
  }
}

// 从缓存获取数据
export const getFromCache = async (key) => {
  try {
    const cacheKey = CACHE_PREFIX + key
    
    // 尝试从 IndexedDB 获取
    const db = await openCacheDB()
    const indexedData = await getFromIndexedDB(db, cacheKey)
    if (indexedData) {
      return indexedData
    }
    
    // 尝试从 localStorage 获取
    const localData = localStorage.getItem(cacheKey)
    if (localData) {
      const { data, timestamp, expirationTime } = JSON.parse(localData)
      
      // 检查是否过期
      if (Date.now() - timestamp > expirationTime) {
        localStorage.removeItem(cacheKey)
        return null
      }
      
      return data
    }
    
    return null
  } catch (error) {
    console.error('缓存读取失败:', error)
    return null
  }
}

// 打开 IndexedDB 数据库
const openCacheDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('XPatentCache', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents')
      }
    }
  })
}

// 保存数据到 IndexedDB
const saveToIndexedDB = (db, key, data) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['documents'], 'readwrite')
    const store = transaction.objectStore('documents')
    const request = store.put(data, key)
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// 从 IndexedDB 获取数据
const getFromIndexedDB = (db, key) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['documents'], 'readonly')
    const store = transaction.objectStore('documents')
    const request = store.get(key)
    
    request.onsuccess = () => {
      const data = request.result
      if (data && Date.now() - data.timestamp > data.expirationTime) {
        // 数据已过期，删除它
        const deleteTransaction = db.transaction(['documents'], 'readwrite')
        const deleteStore = deleteTransaction.objectStore('documents')
        deleteStore.delete(key)
        resolve(null)
      } else {
        resolve(data?.data || null)
      }
    }
    
    request.onerror = () => reject(request.error)
  })
}

// 清理过期缓存
export const cleanExpiredCache = async () => {
  try {
    // 清理 localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(CACHE_PREFIX)) {
        const data = JSON.parse(localStorage.getItem(key))
        if (Date.now() - data.timestamp > data.expirationTime) {
          localStorage.removeItem(key)
        }
      }
    }
    
    // 清理 IndexedDB
    const db = await openCacheDB()
    const transaction = db.transaction(['documents'], 'readwrite')
    const store = transaction.objectStore('documents')
    const request = store.getAll()
    
    request.onsuccess = () => {
      const items = request.result
      items.forEach((item, key) => {
        if (Date.now() - item.timestamp > item.expirationTime) {
          store.delete(key)
        }
      })
    }
  } catch (error) {
    console.error('缓存清理失败:', error)
  }
} 