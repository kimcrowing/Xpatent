// 文档处理Worker - 在后台线程执行文档解析和处理
// 导入必要的库
importScripts('/pdfjs-dist/build/pdf.worker.min.js');
importScripts('/mammoth/mammoth.browser.min.js');

// PDF处理
async function processPdf(arrayBuffer) {
  try {
    const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdfDocument.numPages;
    
    let textContent = '';
    const images = [];
    const metadata = { title: '', pageCount: totalPages };
    
    // 提取元数据
    try {
      const info = await pdfDocument.getMetadata();
      metadata.title = info?.info?.Title || '';
      metadata.author = info?.info?.Author || '';
      metadata.creationDate = info?.info?.CreationDate || '';
    } catch (err) {
      console.error('提取元数据失败', err);
    }
    
    // 逐页提取内容
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdfDocument.getPage(i);
      
      // 提取文本
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      
      textContent += pageText + '\n\n';
      
      // 提取图片
      try {
        const operatorList = await page.getOperatorList();
        // 图像提取逻辑 - 简化版
        for (let j = 0; j < operatorList.fnArray.length; j++) {
          if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
            const imgIndex = operatorList.argsArray[j][0];
            // 这里需要更复杂的逻辑来提取实际图像数据
            images.push({
              page: i,
              index: imgIndex
            });
          }
        }
      } catch (err) {
        console.error(`提取第${i}页图像失败`, err);
      }
    }
    
    return {
      text: textContent,
      images,
      metadata
    };
  } catch (error) {
    throw new Error(`PDF处理失败: ${error.message}`);
  }
}

// Word文档处理
async function processDocx(arrayBuffer) {
  try {
    const result = await mammoth.extractRaw({ arrayBuffer });
    const content = result.value;
    
    // 处理提取的内容
    const paragraphs = content.split(/\n\s*\n/);
    
    // 提取图片 (Mammoth会提供图片数据)
    const images = [];
    if (result.images && result.images.length > 0) {
      result.images.forEach((image, index) => {
        images.push({
          index,
          data: image.buffer, // 图片二进制数据
          contentType: image.contentType
        });
      });
    }
    
    return {
      text: content,
      paragraphs,
      images,
      metadata: {
        title: '', // 从文档属性中提取
        pageCount: paragraphs.length // 粗略估计
      }
    };
  } catch (error) {
    throw new Error(`Word文档处理失败: ${error.message}`);
  }
}

// 专利内容分类
function classifyPatentContent(text) {
  // 这是一个基本的规则匹配分类器，可以在实际应用中使用机器学习方法提高准确性
  const categories = {
    background: [],
    technicalSolution: [],
    beneficialEffect: [],
    implementation: [],
    unclassified: []
  };
  
  // 将文本分成段落
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // 分类规则
  const rules = {
    background: [
      /背景技术/i,
      /现有技术/i,
      /技术背景/i,
      /技术领域/i,
      /存在的问题/i,
      /不足之处/i
    ],
    technicalSolution: [
      /技术方案/i,
      /发明内容/i,
      /解决的技术问题/i,
      /解决方案/i,
      /技术特征/i
    ],
    beneficialEffect: [
      /有益效果/i,
      /积极效果/i,
      /优点/i,
      /改进/i,
      /技术效果/i
    ],
    implementation: [
      /具体实施方式/i,
      /实施例/i,
      /实施方案/i,
      /优选实施例/i,
      /附图说明/i
    ]
  };
  
  // 对每个段落应用规则
  paragraphs.forEach(paragraph => {
    let categorized = false;
    
    // 检查每个类别的规则
    for (const [category, patterns] of Object.entries(rules)) {
      for (const pattern of patterns) {
        if (pattern.test(paragraph)) {
          categories[category].push(paragraph);
          categorized = true;
          break;
        }
      }
      if (categorized) break;
    }
    
    // 如果没有匹配任何类别，将段落归为未分类
    if (!categorized) {
      categories.unclassified.push(paragraph);
    }
  });
  
  return categories;
}

// 监听主线程消息
self.onmessage = async function(event) {
  const { id, action, file } = event.data;
  
  try {
    let result;
    
    switch (action) {
      case 'processPdf':
        result = await processPdf(file);
        break;
        
      case 'processDocx':
        result = await processDocx(file);
        break;
        
      case 'classifyContent':
        result = classifyPatentContent(file);
        break;
        
      default:
        throw new Error(`不支持的操作: ${action}`);
    }
    
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ 
      id, 
      error: {
        message: error.message,
        stack: error.stack
      } 
    });
  }
}; 