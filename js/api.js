// OpenRouter API调用
// 实际应用中API密钥应该从后端获取，不应该暴露在前端
const OPENROUTER_API_KEY = 'YOUR_OPENROUTER_API_KEY'; // 修改为空值，启用模拟响应

// 默认模型设置
window.CURRENT_MODEL = 'deepseek/deepseek-r1:free';

// 标记是否使用模拟响应
let usingMockResponse = false;

async function callOpenRouterAPI(message, systemPrompt = '') {
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
            messages.push({
                role: 'system',
                content: systemPrompt
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
                'X-Title': 'XPatent AI Chat'
            },
            body: JSON.stringify({
                model: window.CURRENT_MODEL, // 使用当前选择的模型
                messages: messages,
                max_tokens: 1000,
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
        // 获取当前活动的专利功能
        const activeFeature = localStorage.getItem('activeFeature') || '专利查新';
        
        // 模拟网络延迟
        setTimeout(() => {
            if (activeFeature === '专利查新') {
                resolve(generatePatentSearchResponse(message));
            } 
            else if (activeFeature === '专利撰写') {
                resolve(generatePatentWritingResponse(message));
            }
            else if (activeFeature === '专利答审') {
                resolve(generatePatentReviewResponse(message));
            }
            else if (message.toLowerCase().includes('你好') || message.toLowerCase().includes('嗨')) {
                resolve('您好！我是XPatent AI助手。我可以回答您的专利相关问题，提供专利查新、专利撰写和专利答审的帮助。请选择您需要的功能或直接提问。');
            } else if (message.toLowerCase().includes('专利') || message.toLowerCase().includes('发明')) {
                resolve(`关于专利申请流程，主要包括以下步骤：\n\n1. 撰写专利申请文件\n2. 提交专利申请并缴纳官费\n3. 进入实质审查阶段\n4. 答复审查意见\n5. 获得授权并缴纳登记费\n\n您需要了解具体哪个环节的详细信息？或者需要我帮您分析某个发明的可专利性吗？`);
            } else {
                resolve('感谢您的提问。作为XPatent AI助手，我会尽力提供专利相关的帮助和信息。您可以尝试使用顶部的专利功能菜单，选择专利查新、专利撰写或专利答审功能获得更专业的帮助。');
            }
        }, 1500);
    });
}

// 生成专利查新响应
function generatePatentSearchResponse(query) {
    const keywords = query.split(/\s+/).filter(word => word.length > 1);
    const randomIPC = ['A61K', 'B01D', 'C07D', 'G06F', 'H04L'][Math.floor(Math.random() * 5)];
    const randomNumber = Math.floor(Math.random() * 900000) + 100000;
    const randomUSNumber = Math.floor(Math.random() * 9000000) + 1000000;
    
    return `【专利查新分析】\n\n基于您提供的信息 "${query}"，我建议采用以下检索策略：\n\n1. 关键词组合：\n   - 主要词组：${keywords.join(', ')}\n   - 同义词扩展：${generateSynonyms(keywords)}\n\n2. IPC分类号：可能相关的分类号包括 ${randomIPC}${Math.floor(Math.random() * 100)}/00、${randomIPC}${Math.floor(Math.random() * 100)}/12 等领域\n\n3. 相关专利：\n   - CN${randomNumber}A - ${generateRandomTitle(keywords)}\n   - US${randomUSNumber}B2 - ${generateRandomTitle(keywords)}\n\n4. 检索建议：\n   - 建议使用SooPAT、Patsnap等数据库进行深度检索\n   - 重点关注${getRandomYear()}年后的相关专利文献\n\n建议进一步细化您的技术描述以获得更精确的检索结果。`;
}

// 生成专利撰写响应
function generatePatentWritingResponse(query) {
    const keywords = query.split(/\s+/).filter(word => word.length > 1);
    
    return `【专利撰写建议】\n\n基于您描述的发明 "${query}"，我提供以下专利文件结构建议：\n\n**权利要求书草稿**：\n1. 一种${keywords.length > 0 ? keywords[0] : '装置'}，其特征在于：[技术特征1]；[技术特征2]；所述[技术特征1]与[技术特征2]相连接...\n\n**说明书建议**：\n1. 技术领域：本发明涉及${keywords.length > 0 ? keywords[0] : '相关'}技术领域。\n2. 背景技术：目前该领域存在[问题1]和[问题2]。\n3. 发明内容：本发明旨在解决上述问题，提供一种[解决方案]。\n4. 附图说明：图1为本发明结构示意图...\n5. 具体实施方式：\n   - 实施例1：...\n   - 实施例2：...\n\n**撰写要点**：\n1. 确保权利要求清楚、完整，涵盖发明的所有关键技术特征\n2. 说明书中应详细描述每个技术特征的结构和功能\n3. 多提供实施例，增强专利保护范围\n\n建议您进一步完善技术细节，尤其是发明的具体实施方式和技术效果描述。`;
}

// 生成专利答审响应
function generatePatentReviewResponse(query) {
    return `【审查意见回复建议】\n\n针对您提供的审查意见 "${query.substring(0, 50)}..."，我建议按以下方式回复：\n\n1. 关于创造性问题：\n   - 强调本申请与对比文件的区别特征\n   - 论述该区别特征带来的技术效果\n   - 说明该效果在现有技术中未被预见或暗示\n\n2. 关于权利要求修改建议：\n   - 建议将从属权利要求X的特征补充进独权\n   - 删除不清楚的技术特征[具体词语]\n   - 考虑将独权拆分为两个独立权利要求\n\n3. 关于说明书补正：\n   - 建议补充实施例中[具体部分]的详细描述\n   - 增加有关技术效果的数据支持\n\n4. 对比文件分析：\n   - 对比文件1与本申请的区别：...\n   - 对比文件2与本申请的区别：...\n\n请根据实际审查意见内容调整上述建议。建议在回复时引用专利审查指南相关段落支持您的论点。`;
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