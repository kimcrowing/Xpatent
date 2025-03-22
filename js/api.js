// OpenRouter API调用
// 实际应用中API密钥应该从后端获取，不应该暴露在前端
// 使用简单加密存储API密钥
const ENCRYPTED_API_KEY = 'tl.ps.w2.6:2:67c:4:4358b9778fefbd87dd6889b4ca:c8b775584e5e766aa9:6:c878c5e67g2';
const API_KEY_SALT = 'xpat-2024';

// 加密API密钥的函数 (仅开发使用，不应在生产环境使用)
function encryptApiKey(apiKey, salt) {
    try {
        let encrypted = '';
        const saltChars = salt.split('');
        let saltIndex = 0;
        
        for (let i = 0; i < apiKey.length; i++) {
            // 保留特殊字符
            if (apiKey[i] === '-' || apiKey[i] === ':' || apiKey[i] === '.') {
                encrypted += apiKey[i];
                continue;
            }
            
            // 使用salt字符进行简单加密
            const char = apiKey.charCodeAt(i);
            const saltChar = saltChars[saltIndex].charCodeAt(0);
            saltIndex = (saltIndex + 1) % saltChars.length;
            
            // 字符偏移加密
            const encryptedChar = String.fromCharCode(char + (saltChar % 7));
            encrypted += encryptedChar;
        }
        
        return encrypted;
    } catch (error) {
        console.error('API密钥加密失败:', error);
        return '';
    }
}

// 解密API密钥的函数
function decryptApiKey(encryptedKey, salt) {
    // 简单的解密算法，将加密的密钥转换回原始密钥
    // 注意：这种方法只能提供基本混淆，不是真正的安全加密
    try {
        let decrypted = '';
        const saltChars = salt.split('');
        let saltIndex = 0;
        
        for (let i = 0; i < encryptedKey.length; i++) {
            // 跳过特殊字符
            if (encryptedKey[i] === '-' || encryptedKey[i] === ':' || encryptedKey[i] === '.') {
                decrypted += encryptedKey[i];
                continue;
            }
            
            // 使用salt字符进行简单解密
            const char = encryptedKey.charCodeAt(i);
            const saltChar = saltChars[saltIndex].charCodeAt(0);
            saltIndex = (saltIndex + 1) % saltChars.length;
            
            // 字符偏移解密
            const decryptedChar = String.fromCharCode(char - (saltChar % 7));
            decrypted += decryptedChar;
        }
        
        return decrypted;
    } catch (error) {
        console.error('API密钥解密失败:', error);
        return '';
    }
}

// 默认模型设置
window.CURRENT_MODEL = 'deepseek/deepseek-r1:free';

// 获取解密后的API密钥
let OPENROUTER_API_KEY = '';
try {
    OPENROUTER_API_KEY = decryptApiKey(ENCRYPTED_API_KEY, API_KEY_SALT);
} catch (error) {
    console.error('API密钥初始化失败:', error);
    OPENROUTER_API_KEY = '';
}

// 开发者工具 - 控制台加密API密钥
window.encryptMyApiKey = function(apiKey) {
    if (!apiKey) {
        console.error('请提供有效的API密钥');
        return;
    }
    
    const encrypted = encryptApiKey(apiKey, API_KEY_SALT);
    console.log('加密后的API密钥:');
    console.log(encrypted);
    console.log('将此加密密钥添加到源代码中的ENCRYPTED_API_KEY变量');
    
    return encrypted;
};

// 使用方法说明
console.log('开发者可以通过控制台调用 window.encryptMyApiKey("你的API密钥") 来获取加密后的密钥');

// 标记是否使用模拟响应
let usingMockResponse = false;

async function callOpenRouterAPI(message, systemPrompt = '') {
    // 在控制台输出完整的消息内容，方便调试
    console.log('========= 发送给API的消息内容 =========');
    console.log(message);
    console.log('=======================================');
    
    // 如果未设置API密钥，则使用模拟响应
    if (OPENROUTER_API_KEY === 'YOUR_OPENROUTER_API_KEY') {
        console.log('使用模拟响应，API密钥未设置或无效');
        usingMockResponse = true;
        // 在页面顶部显示提示
        showAPIKeyWarning();
        return mockResponse(message, systemPrompt);
    }
    
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    
    try {
        const messages = [];
        
        // 如果提供了系统提示，添加系统消息
        if (systemPrompt) {
            // 添加Markdown格式指令到系统提示
            if (window.PROMPT_TEMPLATES && window.PROMPT_TEMPLATES.formatInstruction) {
                if (!systemPrompt.includes('Markdown')) {
                    systemPrompt = systemPrompt + " " + window.PROMPT_TEMPLATES.formatInstruction;
                }
            } else {
                // 使用默认格式指令
                systemPrompt = systemPrompt + "\n请使用Markdown格式回复，支持标题、列表、表格、代码块等Markdown语法。";
            }
            
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        } else {
            // 如果没有提供系统提示，添加默认的Markdown格式指令
            const formatInstruction = window.PROMPT_TEMPLATES ? 
                window.PROMPT_TEMPLATES.formatInstruction : 
                "请使用Markdown格式回复，支持标题、列表、表格、代码块等Markdown语法。";
                
            messages.push({
                role: 'system',
                content: formatInstruction
            });
        }
        
        // 添加用户消息
        messages.push({
            role: 'user',
            content: message
        });
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Xpat'
            },
            body: JSON.stringify({
                model: window.CURRENT_MODEL, // 使用当前选择的模型
                messages: messages,
                max_tokens: 2000,  // 增加token数量以支持更长的Markdown内容
                stream: false
            })
        });
        
        if (!response.ok) {
            // 处理特定的错误类型
            if (response.status === 401) {
                console.error('API授权失败：API密钥无效或已过期，切换到模拟响应模式');
                usingMockResponse = true;
                showAPIKeyWarning('API密钥认证失败（401错误）：请检查您的API密钥是否有效');
                return mockResponse(message, systemPrompt);
            } else if (response.status === 429) {
                console.error('API请求过多或额度用尽，切换到模拟响应模式');
                usingMockResponse = true;
                showAPIKeyWarning('API请求限制（429错误）：请求过多或额度已用尽');
                return mockResponse(message, systemPrompt);
            } else if (response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504) {
                console.error('API服务器错误，切换到模拟响应模式');
                usingMockResponse = true;
                showAPIKeyWarning(`API服务器错误（${response.status}错误）：请稍后再试`);
                return mockResponse(message, systemPrompt);
            }
            
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || `状态码: ${response.status} - ${response.statusText}`;
            
            console.error(`API请求失败: ${errorMessage}`);
            usingMockResponse = true;
            showAPIKeyWarning(`API请求失败: ${errorMessage}`);
            return mockResponse(message, systemPrompt);
        }
        
        // 成功获取API响应，清除警告
        if (usingMockResponse) {
            usingMockResponse = false;
            hideAPIKeyWarning();
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('API调用错误:', error);
        // 对于网络错误等其他错误，也使用模拟响应
        usingMockResponse = true;
        const errorMessage = error.message || '未知网络错误';
        showAPIKeyWarning(`API连接错误: ${errorMessage}，已切换到模拟响应`);
        console.log('出现错误，切换到模拟响应模式');
        return mockResponse(message, systemPrompt);
    }
}

// 显示API密钥警告
function showAPIKeyWarning(message = 'API密钥未设置，正在使用模拟响应') {
    let warningElement = document.getElementById('api-warning');
    
    if (!warningElement) {
        warningElement = document.createElement('div');
        warningElement.id = 'api-warning';
        warningElement.style.cssText = 'position: fixed; top: 50px; width: 100%; text-align: center; background-color: #f44336; color: white; padding: 5px 0; z-index: 9999; font-size: 14px;';
        
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = 'margin-left: 15px; cursor: pointer; float: right; padding-right: 15px;';
        closeButton.onclick = hideAPIKeyWarning;
        
        warningElement.appendChild(closeButton);
        document.body.appendChild(warningElement);
    }
    
    // 更新警告内容
    warningElement.innerHTML = message + '<span style="margin-left: 15px; cursor: pointer; float: right; padding-right: 15px;" onclick="hideAPIKeyWarning()">&times;</span>';
    warningElement.style.display = 'block';
}

// 隐藏API密钥警告
function hideAPIKeyWarning() {
    const warningElement = document.getElementById('api-warning');
    if (warningElement) {
        warningElement.style.display = 'none';
    }
}

// 将hideAPIKeyWarning函数添加到全局作用域
window.hideAPIKeyWarning = hideAPIKeyWarning;

// 模拟API响应，用于测试或演示
function mockResponse(message, systemPrompt = '') {
    return new Promise((resolve) => {
        // 获取当前活动的功能
        const activeFeature = localStorage.getItem('activeFeature') || '通用对话';
        
        // 模拟网络延迟
        setTimeout(() => {
            if (activeFeature === '通用对话') {
                resolve(generateMarkdownResponse(message));
            } 
            else if (activeFeature === '内容创作') {
                resolve(generateCreativeResponse(message));
            }
            else if (activeFeature === '文档分析') {
                resolve(generateDocumentAnalysisResponse(message));
            }
            else if (message.toLowerCase().includes('你好') || message.toLowerCase().includes('嗨')) {
                resolve('# 你好！👋\n\n我是Xpat助手，很高兴为您服务。我可以：\n\n- 回答您的各种问题\n- 提供信息检索\n- 协助内容创作\n- 分析文档内容\n\n您今天需要什么帮助？');
            } else {
                resolve('# 感谢您的提问\n\n我会尽力提供最准确的信息。您可以尝试使用界面顶部的菜单选择不同功能以获得针对性的帮助。\n\n需要了解更多信息吗？');
            }
        }, 1500);
    });
}

// 生成一般Markdown响应
function generateMarkdownResponse(query) {
    const topics = ['技术', '科学', '艺术', '历史', '文化'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    return `# 关于"${query}"的信息

## 主要内容

这是关于${query}的模拟回答，使用了Markdown格式。

### 要点分析

- 第一个要点：${randomTopic}与${query}的关系
- 第二个要点：常见问题解析
- 第三个要点：未来发展趋势

## 示例代码

\`\`\`javascript
// 这是一个JavaScript代码示例
function analyze(topic) {
  console.log("分析主题：" + topic);
  return {
    relevance: Math.random() * 100,
    complexity: "中等",
    recommendation: "深入学习"
  };
}

const result = analyze("${query}");
console.log(result);
\`\`\`

## 表格数据

| 项目 | 描述 | 重要性 |
|------|------|--------|
| 项目一 | ${query}基础概念 | 高 |
| 项目二 | 应用场景分析 | 中 |
| 项目三 | 未来发展方向 | 中 |

希望这些信息对您有所帮助！如果需要更多细节，请告诉我。`;
}

// 生成创意内容响应
function generateCreativeResponse(query) {
    return `# ${query} - 创意内容

## 内容构思

以下是关于"${query}"的创意构思：

1. **核心理念**：融合创新与实用
2. **目标受众**：对${query}感兴趣的专业人士和爱好者
3. **表达方式**：图文结合，深入浅出

## 内容大纲

### 第一部分：引言
- 背景介绍
- 问题陈述
- 解决思路

### 第二部分：主体内容
- 关键点1：概念解析
- 关键点2：实践应用
- 关键点3：案例分析

### 第三部分：总结与展望
- 成果回顾
- 未来方向
- 行动建议

## 风格参考

> "${query}"不仅是一个概念，更是一种思维方式和解决问题的途径。

希望这个创意大纲对您有所启发！需要进一步完善某个部分吗？`;
}

// 生成文档分析响应
function generateDocumentAnalysisResponse(query) {
    return `# 文档分析报告

## 文档概述

分析对象：${query.length > 30 ? query.substring(0, 30) + '...' : query}

## 主要发现

### 内容结构
- **完整性**：中等
- **组织逻辑**：良好
- **主题明确度**：高

### 语言分析
- **风格**：专业/技术性
- **可读性**：中等
- **术语使用**：适当

### 核心内容提取

1. 首要要点：...
2. 次要要点：...
3. 背景信息：...

## 改进建议

| 问题 | 严重程度 | 改进建议 |
|------|---------|---------|
| 结构不够清晰 | 中 | 增加小标题和过渡段落 |
| 部分论述缺乏依据 | 高 | 添加数据支持和引用 |
| 结论部分过于简略 | 低 | 扩展并强化核心观点 |

## 总体评价

文档质量整体处于中上水平，具有一定的专业性和参考价值。建议根据上述分析进行有针对性的修改，以提升文档整体质量。

需要对特定部分进行更深入的分析吗？`;
}

// 辅助函数：生成同义词
function generateSynonyms(keywords) {
    const synonymPairs = [
        ['装置', '设备', '系统', '仪器'],
        ['方法', '工艺', '流程', '技术'],
        ['控制', '调节', '管理', '操作'],
        ['数据', '信息', '参数', '记录'],
        ['处理', '加工', '运算', '计算']
    ];
    
    let result = [];
    keywords.forEach(keyword => {
        // 尝试为每个关键词找到同义词
        for (const synonyms of synonymPairs) {
            if (synonyms.includes(keyword)) {
                const others = synonyms.filter(s => s !== keyword);
                result.push(others[Math.floor(Math.random() * others.length)]);
                return;
            }
        }
        // 如果没有找到匹配的同义词，生成一个随机替代词
        result.push(keyword + (Math.random() > 0.5 ? '系统' : '方法'));
    });
    
    return result.join(', ');
}

// 辅助函数：生成随机标题
function generateRandomTitle(keywords) {
    const prefixes = ['一种', '基于', '用于', '关于'];
    const suffixes = ['的方法', '的系统', '的装置', '的设备', '的工艺'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    if (keywords.length > 0) {
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        return prefix + randomKeyword + suffix;
    } else {
        const defaultKeywords = ['智能', '高效', '新型', '改进'];
        const randomDefault = defaultKeywords[Math.floor(Math.random() * defaultKeywords.length)];
        return prefix + randomDefault + '专利技术' + suffix;
    }
}

// 辅助函数：获取随机年份
function getRandomYear() {
    return (new Date().getFullYear() - Math.floor(Math.random() * 5)).toString();
}

// 分析文本内容，识别专利技术领域
function identifyPatentDomain(text) {
    // 如果没有文本，返回默认领域
    if (!text || text.trim().length === 0) {
        return 'general';
    }
    
    // 将文本转为小写，用于匹配
    const lowerText = text.toLowerCase();
    
    // 各领域关键词匹配规则
    const domainKeywords = {
        'electronics': ['电路', '芯片', '半导体', '集成电路', '微处理器', '传感器', '信号处理', 
                        'PCB', '电子设备', '通信协议', '无线', '5G', '网络', '服务器', '路由', 
                        '算法', '软件', '程序', '代码', '接口', 'API', '数据库', '云计算', 
                        '人工智能', '机器学习', '深度学习', '神经网络', '计算机视觉'],
                        
        'mechanical': ['机械', '结构', '装置', '设备', '齿轮', '轴承', '阀门', '泵', '液压', 
                       '气动', '传动', '连接件', '紧固件', '模具', '机床', '工具', '夹具', 
                       '弹性', '应力', '强度', '刚度', '摩擦', '润滑', '密封'],
                       
        'chemical': ['化学', '化合物', '聚合物', '催化剂', '反应', '合成', '分子', '原子', 
                     '溶液', '溶剂', '浓度', 'pH值', '酸', '碱', '盐', '氧化', '还原', 
                     '材料', '陶瓷', '金属', '合金', '复合材料', '涂层', '薄膜'],
                     
        'medical': ['医药', '药物', '治疗', '诊断', '检测', '生物', '基因', '蛋白质', '抗体', 
                    '酶', '细胞', '组织', '器官', '疫苗', '给药', '剂量', '配方', '制剂', 
                    '药效', '药代动力学', '临床', '疾病', '病症', '病理'],
                    
        'energy': ['能源', '发电', '储能', '电池', '太阳能', '风能', '水能', '地热', 
                  '生物质能', '核能', '燃料', '燃烧', '燃气', '热交换', '保温', '节能', 
                  '电网', '输电', '配电', '变压器', '电动机', '发动机', '涡轮'],
                  
        'aerospace': ['航空', '航天', '飞机', '直升机', '卫星', '火箭', '发射器', '推进剂', 
                     '轨道', '姿态控制', '导航', '制导', '气动', '流体', '空气动力学', 
                     '结构强度', '复合材料', '热防护', '降落系统']
    };
    
    // 计算各领域匹配分数
    const scores = {};
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
        scores[domain] = 0;
        for (const keyword of keywords) {
            // 统计关键词出现次数
            const regex = new RegExp(keyword, 'gi');
            const matches = lowerText.match(regex);
            if (matches) {
                scores[domain] += matches.length;
            }
        }
    }
    
    // 找出得分最高的领域
    let maxScore = 0;
    let detectedDomain = 'general';
    
    for (const [domain, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            detectedDomain = domain;
        }
    }
    
    // 只在控制台输出识别结果，不在界面显示
    console.log('识别的专利领域:', detectedDomain);
    console.log('各领域匹配分数:', scores);
    
    return detectedDomain;
}

// 修改fetchPromptTemplates函数，添加领域提示词
async function fetchPromptTemplates() {
    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 返回模拟的提示词数据
        return {
            success: true,
            data: {
                chatModes: [
                    { 
                        id: 'general', 
                        name: '通用对话', 
                        systemPrompt: '你是Xpat助手，为用户提供各种问题的回答和帮助。请提供准确、有用的信息。'
                    },
                    { 
                        id: 'patent-search', 
                        name: '专利查询', 
                        systemPrompt: '你是Xpat专利查询助手，专注于帮助用户检索、理解和分析专利信息。请解释专利概念、提供检索策略，并分析相关专利文献。'
                    },
                    { 
                        id: 'patent-writing', 
                        name: '专利撰写', 
                        systemPrompt: '你是Xpat专利撰写助手，专注于帮助用户撰写高质量的专利申请文件。请根据用户的技术描述，提供专利申请书的结构、权利要求书的写法、说明书的组织等方面的建议。'
                    },
                    { 
                        id: 'patent-response', 
                        name: '专利答审', 
                        systemPrompt: '你是Xpat专利答审助手，专注于帮助用户应对专利审查意见。请分析审查意见书内容，提供修改建议，解释如何针对审查员的不同意见进行有效答复。'
                    }
                ],
                attachmentPrompts: {
                    general: '用户提供了附件内容，请认真阅读并基于附件内容回答问题。',
                    content: '用户提供了附件内容，请将附件内容作为参考或素材进行创作。',
                    document: '请重点分析用户提供的附件内容，提取关键信息，归纳要点，并提供深入见解。用户问题可能是针对附件内容提出的，请优先考虑附件内容进行回答。'
                },
                domainPrompts: {
                    'electronics': '你是专精于电子、通信和计算机技术的专利助手。请注重算法、系统架构的描述，关注软硬结合点，避免纯软件方法，使用图表说明，区分功能性特征。',
                    'mechanical': '你是专精于机械结构和工程设计的专利助手。请详细描述部件形状、结构、材料和连接关系，明确配合方式和相对位置，突出新颖结构的技术效果。',
                    'chemical': '你是专精于材料科学和化学技术的专利助手。请准确描述材料成分、比例和制备方法，详细说明实验参数和步骤，提供充分实施例和验证数据。',
                    'medical': '你是专精于医药和生物技术的专利助手。请详细描述活性化合物结构或生物序列，提供实验数据支持，明确给药途径和剂量，严格区分预防性撰写和已验证效果。',
                    'energy': '你是专精于能源和环保技术的专利助手。请突出技术方案的节能环保效果，详细描述能量转换过程，提供性能参数和比较数据，关注技术与法规的符合性。',
                    'aerospace': '你是专精于航空航天技术的专利助手。请强调方案的可靠性和安全性，详细说明材料选择和结构设计，提供系统集成和控制逻辑，区分关键技术点。'
                },
                formatInstruction: '请使用Markdown格式回复，支持标题、列表、表格、代码块等Markdown语法。'
            }
        };
    } catch (error) {
        console.error('获取提示词模板失败:', error);
        // 失败时返回默认值
        return {
            success: false,
            error: '获取提示词失败',
            data: null
        };
    }
}

// 全局缓存提示词数据
window.PROMPT_TEMPLATES = null;

// 初始化提示词数据
async function initPromptTemplates() {
    if (!window.PROMPT_TEMPLATES) {
        const result = await fetchPromptTemplates();
        if (result.success) {
            window.PROMPT_TEMPLATES = result.data;
            console.log('提示词模板加载成功');
        } else {
            console.error('提示词模板加载失败，将使用默认值');
        }
    }
    return window.PROMPT_TEMPLATES;
}

// 页面加载时初始化提示词
document.addEventListener('DOMContentLoaded', function() {
    initPromptTemplates();
});

// 修改buildAPIRequest函数，集成领域特定提示词
function buildAPIRequest(message) {
    const activeFeature = localStorage.getItem('activeFeature') || '通用对话';
    let systemPrompt = '';
    
    // 检查消息中是否包含附件内容
    const hasAttachment = message.includes('===== 附件内容 =====');
    
    // 获取当前识别的专利领域(如果有)
    const detectedDomain = window.DETECTED_PATENT_DOMAIN || 'general';
    
    // 如果已加载提示词模板，则使用模板中的提示词
    if (window.PROMPT_TEMPLATES) {
        // 根据当前聊天模式获取提示词
        const currentModeId = localStorage.getItem('selected_chat_mode') || 'general';
        const chatMode = window.PROMPT_TEMPLATES.chatModes.find(mode => mode.id === currentModeId);
        
        if (chatMode) {
            systemPrompt = chatMode.systemPrompt;
            
            // 添加领域特定提示词，如果有的话
            if (detectedDomain !== 'general' && window.PROMPT_TEMPLATES.domainPrompts 
                && window.PROMPT_TEMPLATES.domainPrompts[detectedDomain]) {
                systemPrompt += ' ' + window.PROMPT_TEMPLATES.domainPrompts[detectedDomain];
            }
            
            // 如果有附件，添加附件相关提示
            if (hasAttachment) {
                if (currentModeId === 'general') {
                    systemPrompt += ' ' + window.PROMPT_TEMPLATES.attachmentPrompts.general;
                } else if (currentModeId === 'patent-writing') {
                    systemPrompt += ' ' + window.PROMPT_TEMPLATES.attachmentPrompts.content;
                } else {
                    systemPrompt += ' ' + window.PROMPT_TEMPLATES.attachmentPrompts.document;
                }
            }
        } else {
            // 后备到默认提示词
            systemPrompt = window.PROMPT_TEMPLATES.chatModes[0].systemPrompt;
        }
    } else {
        // 如果模板未加载，使用原有的提示词逻辑
        switch(activeFeature) {
            case '通用对话':
                systemPrompt = '你是Xpat助手，为用户提供各种问题的回答和帮助。请提供准确、有用的信息。';
                if (hasAttachment) {
                    systemPrompt += '用户提供了附件内容，请认真阅读并基于附件内容回答问题。';
                }
                break;
            case '内容创作':
                systemPrompt = '你是Xpat创作助手，擅长帮助用户创作各类内容。根据用户的描述，提供创意建议、内容结构和详细内容。';
                if (hasAttachment) {
                    systemPrompt += '用户提供了附件内容，请将附件内容作为参考或素材进行创作。';
                }
                break;
            case '文档分析':
                systemPrompt = '你是Xpat分析助手，擅长分析文档并提取重要信息。';
                if (hasAttachment) {
                    systemPrompt += '请重点分析用户提供的附件内容，提取关键信息，归纳要点，并提供深入见解。用户问题可能是针对附件内容提出的，请优先考虑附件内容进行回答。';
                } else {
                    systemPrompt += '请分析用户提供的文本，归纳要点，并提供见解。';
                }
                break;
            default:
                systemPrompt = '你是Xpat助手，为用户提供智能对话服务。';
                if (hasAttachment) {
                    systemPrompt += '用户提供了附件内容，请认真阅读并基于附件内容回答问题。';
                }
        }
    }
    
    console.log('使用系统提示词:', systemPrompt);
    console.log('检测到的专利领域:', detectedDomain);
    
    return {
        message: message,
        systemPrompt: systemPrompt
    };
} 