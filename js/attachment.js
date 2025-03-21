// 附件上传和文本提取功能
document.addEventListener('DOMContentLoaded', function() {
    // 清除浏览器缓存函数
    function clearBrowserCache() {
        // 尝试刷新应用缓存
        if (window.applicationCache) {
            window.applicationCache.update();
        }
        // 为XHR请求添加随机参数，避免缓存
        window.addEventListener('fetch', function(event) {
            if (event.request && event.request.method === 'GET') {
                event.respondWith(
                    fetch(event.request.url + '?_=' + new Date().getTime())
                );
            }
        }, { capture: true });
        console.log('缓存清理逻辑已执行');
    }
    
    // 执行缓存清理
    clearBrowserCache();
    
    // 设置PDF.js workerSrc
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }
    
    const attachButton = document.getElementById('attachButton');
    const fileUpload = document.getElementById('fileUpload');
    const attachmentInfo = document.getElementById('attachmentInfo');
    const fileName = document.getElementById('fileName');
    const removeAttachment = document.getElementById('removeAttachment');
    const userInput = document.getElementById('userInput');
    
    // 存储提取的文档文本
    let extractedText = '';
    
    // 点击附件按钮触发文件上传
    attachButton.addEventListener('click', function() {
        fileUpload.click();
    });
    
    // 监听文件选择
    fileUpload.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // 显示文件名
            fileName.textContent = file.name;
            attachmentInfo.style.display = 'flex';
            
            // 根据文件类型提取文本
            extractTextFromFile(file);
        }
    });
    
    // 移除附件
    removeAttachment.addEventListener('click', function() {
        fileUpload.value = '';
        attachmentInfo.style.display = 'none';
        extractedText = '';
    });
    
    // 从文件中提取文本
    function extractTextFromFile(file) {
        const fileType = file.name.split('.').pop().toLowerCase();
        
        if (fileType === 'pdf') {
            extractTextFromPDF(file);
        } else if (fileType === 'doc' || fileType === 'docx') {
            extractTextFromWord(file);
        } else {
            console.error('不支持的文件类型');
            alert('仅支持PDF、DOC和DOCX格式的文件');
            fileUpload.value = '';
            attachmentInfo.style.display = 'none';
        }
    }
    
    // 从PDF中提取文本
    function extractTextFromPDF(file) {
        // 使用pdfjsLib库提取PDF文本
        // 注意：需要添加PDF.js库，这里展示基本逻辑
        if (typeof pdfjsLib !== 'undefined') {
            const reader = new FileReader();
            reader.onload = function(event) {
                const arrayBuffer = event.target.result;
                
                // 加载PDF文档
                pdfjsLib.getDocument(arrayBuffer).promise.then(function(pdf) {
                    let textContent = '';
                    
                    // 遍历所有页面
                    const numPages = pdf.numPages;
                    let pagesProcessed = 0;
                    
                    for (let i = 1; i <= numPages; i++) {
                        pdf.getPage(i).then(function(page) {
                            page.getTextContent().then(function(content) {
                                // 提取当前页面的文本
                                const pageText = content.items.map(item => item.str).join(' ');
                                textContent += pageText + '\n\n';
                                
                                pagesProcessed++;
                                // 当所有页面都处理完后，更新提取的文本
                                if (pagesProcessed === numPages) {
                                    extractedText = textContent;
                                    console.log('PDF文本提取完成');
                                }
                            });
                        });
                    }
                }).catch(function(error) {
                    console.error('PDF解析错误:', error);
                    alert('无法解析PDF文件，请尝试其他文件');
                });
            };
            reader.readAsArrayBuffer(file);
        } else {
            // 如果没有PDF.js库，简单处理
            extractedText = `[提取自PDF文件: ${file.name}] 内容无法解析，请在消息中描述文件内容。`;
            console.log('PDF.js库未加载，无法提取PDF文本');
        }
    }
    
    // 从Word文档中提取文本
    function extractTextFromWord(file) {
        // 由于浏览器内无法直接解析Word文档
        // 可以使用mammoth.js或其他库
        if (typeof mammoth !== 'undefined') {
            const reader = new FileReader();
            reader.onload = function(event) {
                const arrayBuffer = event.target.result;
                
                mammoth.extractRawText({arrayBuffer: arrayBuffer})
                    .then(function(result) {
                        extractedText = result.value;
                        console.log('Word文本提取完成');
                    })
                    .catch(function(error) {
                        console.error('Word解析错误:', error);
                        alert('无法解析Word文件，请尝试其他文件');
                    });
            };
            reader.readAsArrayBuffer(file);
        } else {
            // 如果没有mammoth.js库，简单处理
            extractedText = `[提取自Word文件: ${file.name}] 内容无法解析，请在消息中描述文件内容。`;
            console.log('Mammoth.js库未加载，无法提取Word文本');
        }
    }
    
    // 修改发送消息函数，添加文档内容
    window.getAttachmentText = function() {
        return extractedText;
    };
    
    // 检查是否有文件解析库
    window.addEventListener('load', function() {
        if (typeof pdfjsLib === 'undefined') {
            console.warn('未检测到PDF.js库，PDF文本提取功能将不可用');
        }
        
        if (typeof mammoth === 'undefined') {
            console.warn('未检测到Mammoth.js库，Word文本提取功能将不可用');
        }
    });
}); 