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
                    
                    // 创建一个Promise数组来跟踪所有页面处理
                    const pagePromises = [];
                    
                    for (let i = 1; i <= numPages; i++) {
                        const pagePromise = pdf.getPage(i).then(function(page) {
                            return page.getTextContent().then(function(content) {
                                // 提取当前页面的文本
                                const pageText = content.items.map(item => item.str).join(' ');
                                return { pageNum: i, text: pageText };
                            });
                        });
                        
                        pagePromises.push(pagePromise);
                    }
                    
                    // 等待所有页面处理完成
                    Promise.all(pagePromises)
                        .then(function(pagesData) {
                            // 按页码顺序排列
                            pagesData.sort((a, b) => a.pageNum - b.pageNum);
                            
                            // 合并所有页面文本
                            textContent = pagesData.map(page => page.text).join('\n\n');
                            
                            // 设置提取的文本
                            extractedText = textContent;
                            console.log('PDF文本提取完成，共', numPages, '页，字符数:', textContent.length);
                            
                            // 提取完成后进行专利领域识别，但不在界面显示
                            if (typeof identifyPatentDomain === 'function') {
                                const domain = identifyPatentDomain(textContent);
                                window.DETECTED_PATENT_DOMAIN = domain;
                                console.log('PDF内容专利领域识别结果:', domain);
                            }
                        })
                        .catch(function(error) {
                            console.error('处理PDF页面时出错:', error);
                        });
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
                        console.log('Word文本提取完成，字符数:', result.value.length);
                        
                        // 提取完成后进行专利领域识别，但不在界面显示
                        if (typeof identifyPatentDomain === 'function') {
                            const domain = identifyPatentDomain(result.value);
                            window.DETECTED_PATENT_DOMAIN = domain;
                            console.log('Word内容专利领域识别结果:', domain);
                        }
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
        console.log('获取附件文本内容，长度：', extractedText ? extractedText.length : 0);
        console.log('附件文本内容前50个字符：', extractedText ? extractedText.substring(0, 50) + '...' : '无内容');
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
    
    // 专利领域识别函数，根据文本内容识别可能的专利技术领域
    window.identifyPatentDomain = function(text) {
        if (!text || typeof text !== 'string' || text.length < 100) {
            return '未知领域';
        }
        
        // 定义技术领域关键词
        const domainKeywords = {
            '电子信息': ['计算机', '网络', '芯片', '半导体', '通信', '存储', '图像处理', '信号处理', '云计算', '人工智能', '大数据', '机器学习', '5G', '物联网', 'CPU', 'GPU'],
            '生物医药': ['医药', '药物', '生物', '治疗', '疾病', '临床', '蛋白质', '基因', '抗体', '诊断', '疫苗', '细胞', '组织', '酶', '医疗器械'],
            '新材料': ['材料', '聚合物', '合金', '纳米', '复合材料', '薄膜', '涂层', '陶瓷', '表面处理', '高分子', '石墨烯', '催化剂'],
            '机械工程': ['机械', '设备', '装置', '机构', '齿轮', '轴承', '液压', '气动', '传动', '制造', '模具', '车床', '铣床', '焊接', '铸造'],
            '能源环保': ['能源', '电池', '发电', '储能', '风力', '太阳能', '光伏', '新能源', '环保', '节能', '减排', '污染', '废水', '废气', '固废'],
            '化学化工': ['化学', '化合物', '分子', '合成', '反应', '催化', '蒸馏', '萃取', '结晶', '高分子', '聚合', '有机', '无机', '电化学'],
            '农业食品': ['农业', '农产品', '粮食', '种植', '养殖', '肥料', '农药', '食品', '饲料', '保鲜', '发酵', '灌溉', '土壤', '种子'],
            '交通运输': ['车辆', '飞机', '船舶', '铁路', '公路', '航空', '航天', '运输', '导航', '轨道', '自动驾驶', '电动车', '充电', '燃料']
        };
        
        // 统计各领域关键词出现次数
        const counts = {};
        const textLower = text.toLowerCase();
        
        for (const [domain, keywords] of Object.entries(domainKeywords)) {
            counts[domain] = 0;
            for (const keyword of keywords) {
                // 使用正则表达式匹配关键词（考虑中英文混合情况）
                const regex = new RegExp(keyword, 'gi');
                const matches = textLower.match(regex);
                if (matches) {
                    counts[domain] += matches.length;
                }
            }
        }
        
        // 找出关键词出现次数最多的领域
        let maxCount = 0;
        let detectedDomain = '未知领域';
        
        for (const [domain, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                detectedDomain = domain;
            }
        }
        
        // 如果没有匹配到足够的关键词，返回未知领域
        if (maxCount < 3) {
            return '未知领域';
        }
        
        console.log('专利领域识别结果统计:', counts);
        return detectedDomain;
    };
}); 