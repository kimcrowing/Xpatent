import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';
import CryptoJS from 'crypto-js';

class FileProcessorService {
  constructor() {
    this.initialized = false;
    this.processingConfig = null;
    this.baseURL = 'http://localhost:5000'; // 添加基础URL
  }

  // 初始化处理器
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // 初始化PDF.js
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
      pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      
      // 从服务器获取处理配置
      const response = await fetch(`${this.baseURL}/api/client/processing-config`, {
        headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
      });
      
      if (!response.ok) throw new Error('无法获取处理配置');
      this.processingConfig = await response.json();
      this.initialized = true;
      
      console.log('文件处理服务初始化完成');
      return true;
    } catch (error) {
      console.error('初始化文件处理服务失败:', error);
      return false;
    }
  }
  
  // 获取JWT令牌
  getAuthToken() {
    return localStorage.getItem('token') || '';
  }
  
  // 处理文件的主方法
  async processFile(file) {
    if (!this.initialized) await this.initialize();
    
    // 获取处理许可
    const approval = await this.getProcessingApproval(file);
    
    try {
      console.log(`开始在客户端处理文件: ${file.name}`);
      const fileExt = file.name.split('.').pop().toLowerCase();
      
      let result = { text: '', images: [] };
      
      // 根据文件类型选择处理方法
      if (fileExt === 'pdf') {
        result = await this.processPdf(file, approval.token);
      } else if (['doc', 'docx'].includes(fileExt)) {
        result = await this.processWord(file, approval.token);
      } else {
        throw new Error('不支持的文件格式');
      }
      
      // 加密结果
      const encryptedData = this.encryptContent(result.text);
      result.encryptedText = encryptedData.data;
      result.keyId = encryptedData.keyId;
      
      // 向服务器报告处理完成
      await this.reportProcessingComplete(approval.token, {
        success: true,
        textLength: result.text.length,
        imageCount: result.images.length
      });
      
      return result;
    } catch (error) {
      console.error('处理文件失败:', error);
      
      // 报告处理失败
      await this.reportProcessingComplete(approval.token, {
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }
  
  // 获取处理许可
  async getProcessingApproval(file) {
    try {
      const response = await fetch(`${this.baseURL}/api/client/request-processing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          filename: file.name,
          filesize: file.size,
          filetype: file.type,
          action: 'document_processing'
        })
      });
      
      if (!response.ok) throw new Error('服务器拒绝处理请求');
      return await response.json();
    } catch (error) {
      console.error('获取处理许可失败:', error);
      throw error;
    }
  }
  
  // 处理PDF文件
  async processPdf(file, approvalToken) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let text = '';
      const images = [];
      
      for (let i = 1; i <= numPages; i++) {
        // 报告进度
        await this.reportProgress(approvalToken, {
          stage: 'pdf_processing',
          progress: (i / numPages) * 100,
          currentPage: i,
          totalPages: numPages
        });
        
        // 提取页面文本
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        text += pageText + '\n\n';
        
        // PDF图像提取较复杂，这里使用简化实现
        try {
          // PDF.js的图像提取实现...
          // 如果有必要，后面可以完善
        } catch (imgError) {
          console.warn(`提取PDF页面 ${i} 的图像失败:`, imgError);
        }
      }
      
      return { text, images };
    } catch (error) {
      console.error('处理PDF文件失败:', error);
      throw error;
    }
  }
  
  // 处理Word文件
  async processWord(file, approvalToken) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      let text = '';
      const images = [];
      
      // 报告进度
      await this.reportProgress(approvalToken, {
        stage: 'word_processing',
        progress: 10,
        status: 'loading_document'
      });
      
      // 提取文本
      try {
        const documentXml = await zip.file('word/document.xml').async('string');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(documentXml, 'text/xml');
        
        // 获取段落
        const paragraphs = xmlDoc.getElementsByTagName('w:p');
        let paragraphCount = 0;
        
        for (let i = 0; i < paragraphs.length; i++) {
          // 定期报告进度
          if (i % 10 === 0) {
            await this.reportProgress(approvalToken, {
              stage: 'word_processing',
              progress: 10 + (i / paragraphs.length) * 40,
              processedParagraphs: i,
              totalParagraphs: paragraphs.length
            });
          }
          
          // 提取段落文本
          const paragraph = paragraphs[i];
          const textElements = paragraph.getElementsByTagName('w:t');
          let paragraphText = '';
          
          for (let j = 0; j < textElements.length; j++) {
            paragraphText += textElements[j].textContent;
          }
          
          // 添加非空段落
          if (paragraphText.trim().length > 0) {
            text += paragraphText + '\n';
            paragraphCount++;
          }
        }
        
        console.log(`成功从Word文档提取了 ${paragraphCount} 个非空段落`);
      } catch (error) {
        console.error('提取Word文本失败:', error);
        text = '无法提取文档文本内容';
      }
      
      // 提取图像
      try {
        await this.reportProgress(approvalToken, {
          stage: 'word_processing',
          progress: 50,
          status: 'extracting_images'
        });
        
        const relsXml = await zip.file('word/_rels/document.xml.rels').async('string');
        const parser = new DOMParser();
        const relsDoc = parser.parseFromString(relsXml, 'text/xml');
        
        // 获取图像关系
        const relationships = relsDoc.getElementsByTagName('Relationship');
        const imageRelations = [];
        
        for (let i = 0; i < relationships.length; i++) {
          const relationship = relationships[i];
          const type = relationship.getAttribute('Type');
          
          if (type.includes('image')) {
            imageRelations.push({
              id: relationship.getAttribute('Id'),
              target: relationship.getAttribute('Target')
            });
          }
        }
        
        console.log(`找到 ${imageRelations.length} 个图像关系`);
        
        // 处理每个图像
        for (let i = 0; i < imageRelations.length; i++) {
          await this.reportProgress(approvalToken, {
            stage: 'word_processing',
            progress: 50 + (i / imageRelations.length) * 40,
            processedImages: i,
            totalImages: imageRelations.length
          });
          
          const relation = imageRelations[i];
          const imagePath = 'word/' + relation.target.replace(/^\//, '');
          
          try {
            // 读取图像数据
            const imageData = await zip.file(imagePath).async('arraybuffer');
            
            // 确定图像类型
            let imageType = 'image/png';
            if (imagePath.endsWith('.jpeg') || imagePath.endsWith('.jpg')) {
              imageType = 'image/jpeg';
            } else if (imagePath.endsWith('.gif')) {
              imageType = 'image/gif';
            }
            
            // 创建Blob URL
            const blob = new Blob([imageData], { type: imageType });
            const url = URL.createObjectURL(blob);
            
            images.push({
              number: i + 1,
              url: url,
              format: imageType,
              size: imageData.byteLength,
              description: `图片 ${i + 1}`
            });
            
            console.log(`成功提取图片 #${i + 1}, 格式: ${imageType}, 大小: ${imageData.byteLength} 字节`);
          } catch (imgError) {
            console.warn(`提取图像 ${imagePath} 失败:`, imgError);
          }
        }
      } catch (error) {
        console.error('提取Word图像失败:', error);
      }
      
      // 报告完成
      await this.reportProgress(approvalToken, {
        stage: 'word_processing',
        progress: 100,
        status: 'completed'
      });
      
      return { text, images };
    } catch (error) {
      console.error('处理Word文件失败:', error);
      throw error;
    }
  }
  
  // 加密文本内容
  encryptContent(content) {
    // 生成随机密钥
    const key = CryptoJS.lib.WordArray.random(16).toString();
    const iv = CryptoJS.lib.WordArray.random(16).toString();
    
    // 使用AES加密
    const encrypted = CryptoJS.AES.encrypt(content, key, {
      iv: CryptoJS.enc.Hex.parse(iv)
    }).toString();
    
    // 保存密钥到会话存储
    const keyId = `doc_key_${Date.now()}`;
    sessionStorage.setItem(keyId, JSON.stringify({ key, iv }));
    
    return {
      data: encrypted,
      keyId,
      keyHash: CryptoJS.SHA256(key).toString().substring(0, 16)
    };
  }
  
  // 解密文本内容
  decryptContent(encryptedData, keyId) {
    const keyData = JSON.parse(sessionStorage.getItem(keyId));
    
    if (!keyData) throw new Error('找不到解密密钥');
    
    // 解密内容
    const decrypted = CryptoJS.AES.decrypt(encryptedData, keyData.key, {
      iv: CryptoJS.enc.Hex.parse(keyData.iv)
    }).toString(CryptoJS.enc.Utf8);
    
    return decrypted;
  }
  
  // 报告处理进度
  async reportProgress(approvalToken, progressData) {
    try {
      await fetch(`${this.baseURL}/api/client/processing-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          approvalToken,
          timestamp: Date.now(),
          ...progressData
        })
      });
    } catch (error) {
      console.warn('报告处理进度失败:', error);
      // 继续处理，不中断
    }
  }
  
  // 报告处理完成
  async reportProcessingComplete(approvalToken, resultData) {
    try {
      await fetch(`${this.baseURL}/api/client/processing-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          approvalToken,
          completionTime: Date.now(),
          ...resultData
        })
      });
    } catch (error) {
      console.warn('报告处理完成失败:', error);
    }
  }
}

export default new FileProcessorService(); 