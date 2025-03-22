// OpenRouter API调用
// 实际应用中API密钥应该从后端获取，不应该暴露在前端
const OPENROUTER_API_KEY = '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'; // 默认API密钥

// 默认模型设置
window.CURRENT_MODEL = 'deepseek/deepseek-r1:free';

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
            systemPrompt = systemPrompt + "\n请使用Markdown格式回复，支持标题、列表、表格、代码块等Markdown语法。";
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        } else {
            // 如果没有提供系统提示，添加默认的Markdown格式指令
            messages.push({
                role: 'system',
                content: "请使用Markdown格式回复，支持标题、列表、表格、代码块等Markdown语法。"
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

// 修改系统提示词
function buildAPIRequest(message) {
    const activeFeature = localStorage.getItem('activeFeature') || '通用对话';
    let systemPrompt = '';
    
    // 检查消息中是否包含附件内容
    const hasAttachment = message.includes('===== 附件内容 =====');
    
    // 根据不同功能设置不同的系统提示
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
    
    return {
        message: message,
        systemPrompt: systemPrompt
    };
} 