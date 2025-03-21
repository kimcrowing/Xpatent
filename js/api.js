// OpenRouter API调用
// 实际应用中API密钥应该从后端获取，不应该暴露在前端
const OPENROUTER_API_KEY = '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';

// 默认模型设置
window.CURRENT_MODEL = 'deepseek/deepseek-r1:free';

async function callOpenRouterAPI(message, systemPrompt = '') {
    // 如果未设置API密钥，则使用模拟响应
    if (OPENROUTER_API_KEY === 'YOUR_OPENROUTER_API_KEY') {
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
            const errorData = await response.json();
            throw new Error(`API请求失败: ${errorData.error || response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('API调用错误:', error);
        throw error;
    }
}

// 模拟API响应，用于测试或演示
function mockResponse(message, systemPrompt = '') {
    return new Promise((resolve) => {
        // 获取当前活动的专利功能
        const activeFeature = localStorage.getItem('activeFeature');
        
        // 模拟网络延迟
        setTimeout(() => {
            if (activeFeature === '专利查新') {
                resolve(`【专利查新分析】\n\n基于您提供的信息 "${message}"，我建议采用以下检索策略：\n\n1. 关键词组合：\n   - 主要词组：${message.split(' ').join(', ')}\n   - 同义词扩展：[相关术语]\n\n2. IPC分类号：可能相关的分类号包括 A、B、C 等领域\n\n3. 相关专利：\n   - CN123456A - 一种相关技术解决方案\n   - US7890123B2 - 另一种相关发明\n\n建议进一步细化您的技术描述以获得更精确的检索结果。`);
            } 
            else if (activeFeature === '专利撰写') {
                resolve(`【专利撰写建议】\n\n基于您描述的发明 "${message}"，我提供以下专利文件结构建议：\n\n**权利要求书草稿**：\n1. 一种[装置/方法]，其特征在于：[技术特征1]；[技术特征2]；所述[技术特征1]与[技术特征2]相连接...\n\n**说明书建议**：\n1. 技术领域：本发明涉及[领域]技术。\n2. 背景技术：目前该领域存在[问题1]和[问题2]。\n3. 发明内容：本发明旨在解决上述问题，提供一种[解决方案]。\n\n建议您进一步完善技术细节，尤其是发明的具体实施方式和技术效果描述。`);
            }
            else if (activeFeature === '专利答审') {
                resolve(`【审查意见回复建议】\n\n针对您提供的审查意见 "${message.substring(0, 50)}..."，我建议按以下方式回复：\n\n1. 关于创造性问题：\n   - 强调本申请与对比文件的区别特征\n   - 论述该区别特征带来的技术效果\n   - 说明该效果在现有技术中未被预见或暗示\n\n2. 关于权利要求修改建议：\n   - 建议将从属权利要求X的特征补充进独权\n   - 删除不清楚的技术特征[具体词语]\n\n3. 关于说明书补正：\n   - 建议补充实施例中[具体部分]的详细描述\n\n请根据实际审查意见内容调整上述建议。`);
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