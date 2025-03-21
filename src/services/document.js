// 前端文档处理服务 - 负责文档解析、处理和生成
import { Document, Paragraph, TextRun, ImageRun, TableRow, TableCell, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

class DocumentService {
  constructor() {
    this.worker = null;
    this.callbacks = {};
    this.initWorker();
  }
  
  // 初始化Worker
  initWorker() {
    this.worker = new Worker('/src/workers/document-processor.worker.js');
    
    this.worker.onmessage = (event) => {
      const { id, result, error } = event.data;
      
      if (this.callbacks[id]) {
        if (error) {
          this.callbacks[id].reject(error);
        } else {
          this.callbacks[id].resolve(result);
        }
        
        // 清理回调
        delete this.callbacks[id];
      }
    };
    
    this.worker.onerror = (error) => {
      console.error('文档处理Worker错误:', error);
    };
  }
  
  // 向Worker发送消息
  async sendToWorker(action, data) {
    return new Promise((resolve, reject) => {
      const id = Date.now().toString();
      
      this.callbacks[id] = { resolve, reject };
      
      this.worker.postMessage({
        id,
        action,
        ...data
      });
    });
  }
  
  // 处理PDF文件
  async processPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    return this.sendToWorker('processPdf', { file: arrayBuffer });
  }
  
  // 处理Word文件
  async processDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    return this.sendToWorker('processDocx', { file: arrayBuffer });
  }
  
  // 分类专利内容
  async classifyContent(text) {
    return this.sendToWorker('classifyContent', { file: text });
  }
  
  // 生成专利文档
  async generatePatentDocument(patentData) {
    try {
      // 创建新文档
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: this._generatePatentContent(patentData)
          }
        ]
      });
      
      // 生成文档并下载
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${patentData.title || '专利文档'}.docx`);
      
      return { success: true };
    } catch (error) {
      console.error('生成文档失败:', error);
      return { 
        success: false, 
        message: `生成文档失败: ${error.message}` 
      };
    }
  }
  
  // 生成专利答复文档
  async generateResponseDocument(responseData) {
    try {
      // 创建新文档
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: this._generateResponseContent(responseData)
          }
        ]
      });
      
      // 生成文档并下载
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${responseData.title || '专利答复文档'}.docx`);
      
      return { success: true };
    } catch (error) {
      console.error('生成答复文档失败:', error);
      return { 
        success: false, 
        message: `生成答复文档失败: ${error.message}` 
      };
    }
  }
  
  // 私有方法：生成专利内容
  _generatePatentContent(data) {
    const children = [];
    
    // 标题
    children.push(
      new Paragraph({
        text: data.title || '发明专利',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER
      })
    );
    
    // 技术领域
    if (data.background && data.background.length > 0) {
      children.push(
        new Paragraph({
          text: '背景技术',
          heading: HeadingLevel.HEADING_2
        })
      );
      
      data.background.forEach(para => {
        children.push(
          new Paragraph({
            text: para
          })
        );
      });
    }
    
    // 技术方案
    if (data.technicalSolution && data.technicalSolution.length > 0) {
      children.push(
        new Paragraph({
          text: '技术方案',
          heading: HeadingLevel.HEADING_2
        })
      );
      
      data.technicalSolution.forEach(para => {
        children.push(
          new Paragraph({
            text: para
          })
        );
      });
    }
    
    // 有益效果
    if (data.beneficialEffect && data.beneficialEffect.length > 0) {
      children.push(
        new Paragraph({
          text: '有益效果',
          heading: HeadingLevel.HEADING_2
        })
      );
      
      data.beneficialEffect.forEach(para => {
        children.push(
          new Paragraph({
            text: para
          })
        );
      });
    }
    
    // 实施方式
    if (data.implementation && data.implementation.length > 0) {
      children.push(
        new Paragraph({
          text: '具体实施方式',
          heading: HeadingLevel.HEADING_2
        })
      );
      
      data.implementation.forEach(para => {
        children.push(
          new Paragraph({
            text: para
          })
        );
      });
    }
    
    return children;
  }
  
  // 私有方法：生成答复内容
  _generateResponseContent(data) {
    const children = [];
    
    // 标题
    children.push(
      new Paragraph({
        text: data.title || '专利审查意见答复',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER
      })
    );
    
    // 审查意见概述
    children.push(
      new Paragraph({
        text: '审查意见概述',
        heading: HeadingLevel.HEADING_2
      })
    );
    
    if (data.summary) {
      children.push(
        new Paragraph({
          text: data.summary
        })
      );
    }
    
    // 答复意见
    children.push(
      new Paragraph({
        text: '答复意见',
        heading: HeadingLevel.HEADING_2
      })
    );
    
    if (data.response) {
      children.push(
        new Paragraph({
          text: data.response
        })
      );
    }
    
    return children;
  }
}

// 导出单例
export const documentService = new DocumentService();
export default documentService; 