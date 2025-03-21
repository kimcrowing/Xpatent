// OpenRouter API调用
// 实际应用中API密钥应该从后端获取，不应该暴露在前端
const OPENROUTER_API_KEY = 'YOUR_OPENROUTER_API_KEY';

async function callOpenRouterAPI(message) {
    // 如果未设置API密钥，则使用模拟响应
    if (OPENROUTER_API_KEY === 'YOUR_OPENROUTER_API_KEY') {
        return mockResponse(message);
    }
    
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin
            },
            body: JSON.stringify({
                model: 'anthropic/claude-3-haiku',
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 1000
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
function mockResponse(message) {
    return new Promise((resolve) => {
        // 模拟网络延迟
        setTimeout(() => {
            if (message.toLowerCase().includes('你好') || message.toLowerCase().includes('嗨')) {
                resolve('您好！我是XPatent AI助手。我可以回答您的问题，提供信息，或者与您进行对话。您今天有什么需要帮助的吗？');
            } else if (message.toLowerCase().includes('时间') || message.toLowerCase().includes('日期')) {
                const now = new Date();
                resolve(`当前时间是 ${now.toLocaleTimeString()}，日期是 ${now.toLocaleDateString()}`);
            } else if (message.toLowerCase().includes('天气')) {
                resolve('很抱歉，我无法获取实时天气信息。您可以查看本地天气应用或网站获取准确的天气预报。');
            } else if (message.toLowerCase().includes('你是谁') || message.toLowerCase().includes('介绍')) {
                resolve('我是XPatent AI助手，一个基于先进人工智能技术开发的对话系统。我可以回答问题、提供信息、进行对话，以及帮助您完成各种任务。有什么我可以帮助您的吗？');
            } else if (message.toLowerCase().includes('代码') || message.toLowerCase().includes('编程')) {
                resolve(`编程是一项很有趣的技能！以下是一个简单的JavaScript函数示例：

\`\`\`javascript
function greet(name) {
    return \`你好，\${name}！欢迎使用XPatent AI助手。\`;
}

console.log(greet('用户'));
\`\`\`

您需要关于特定编程语言或框架的帮助吗？`);
            } else {
                resolve('感谢您的提问。作为XPatent AI助手，我会尽力提供有用的信息和帮助。您有更多具体的问题或需求吗？');
            }
        }, 1500);
    });
} 