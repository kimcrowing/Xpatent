document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    
    console.log('聊天组件已加载', {
        chatMessages: !!chatMessages,
        userInput: !!userInput,
        sendButton: !!sendButton
    });
    
    // 应用版本检查
    const APP_VERSION = '1.1';
    
    // 检查缓存版本
    function checkAppVersion() {
        const storedVersion = localStorage.getItem('appVersion');
        if (storedVersion !== APP_VERSION) {
            console.log(`版本不匹配: 存储=${storedVersion}, 当前=${APP_VERSION}`);
            // 清除缓存并更新版本号
            localStorage.setItem('appVersion', APP_VERSION);
            
            // 强制刷新页面 (只在版本不匹配时执行一次)
            if (storedVersion && !sessionStorage.getItem('refreshed')) {
                sessionStorage.setItem('refreshed', 'true');
                window.location.reload(true);
            }
        }
    }
    
    // 执行版本检查
    checkAppVersion();
    
    // 检查用户是否已登录
    function checkLoginStatus() {
        const token = localStorage.getItem('xpat_auth_token');
        if (!token) {
            // 用户未登录，显示登录提示
            showLoginPrompt();
        }
    }
    
    // 显示登录提示
    function showLoginPrompt() {
        // 清空欢迎消息
        chatMessages.innerHTML = '';
        
        // 创建登录提示
        const loginPrompt = document.createElement('div');
        loginPrompt.className = 'login-prompt';
        loginPrompt.innerHTML = `
            <h3>Xpat - 用简单的方式革新世界</h3>
            <p>请<a href="./subscriptions.html">订阅</a>或<a href="./login.html">登录</a>新世界</p>
        `;
        
        // 添加到聊天区域
        chatMessages.appendChild(loginPrompt);
        
        // 禁用输入框和发送按钮
        if (userInput) {
            userInput.disabled = true;
            userInput.placeholder = '请先登录或订阅后使用';
        }
        
        if (sendButton) {
            sendButton.disabled = true;
        }
    }
    
    // 页面加载后检查登录状态
    checkLoginStatus();
    
    // 添加用户消息到聊天界面
    function addUserMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-avatar user">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2C7.373 2 2 7.373 2 14C2 20.627 7.373 26 14 26C20.627 26 26 20.627 26 14C26 7.373 20.627 2 14 2ZM14 5C18.418 5 22 8.582 22 13C22 17.418 18.418 21 14 21C9.582 21 6 17.418 6 13C6 8.582 9.582 5 14 5Z" fill="white"></path>
                </svg>
            </div>
            <div class="message-content">${content}</div>
        `;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        
        // 调试信息
        console.log('用户消息已添加到UI，内容：', content);
        // 检查是否包含附件徽章
        if(content.includes('attachment-badge')) {
            console.log('消息中包含附件徽章');
        }
    }
    
    // 添加AI回复到聊天界面
    function addAIMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        messageDiv.innerHTML = `
            <div class="message-avatar ai">
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2C7.373 2 2 7.373 2 14C2 20.627 7.373 26 14 26C20.627 26 26 20.627 26 14C26 7.373 20.627 2 14 2ZM14 5C18.418 5 22 8.582 22 13C22 17.418 18.418 21 14 21C9.582 21 6 17.418 6 13C6 8.582 9.582 5 14 5Z" fill="#5865f2"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="message-actions">
                    <button class="action-btn" title="复制" onclick="copyMessageContent(this)">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 2V11H5V14H14V5H11V2H2ZM3 3H10V10H3V3ZM11 6H13V13H6V11H11V6Z" fill="white"/>
                        </svg>
                    </button>
                </div>
                ${formatMessage(content)}
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        
        // 添加复制功能
        addCopyFunctionality(messageDiv);
    }
    
    // 添加复制功能
    function addCopyFunctionality(messageDiv) {
        const copyBtn = messageDiv.querySelector('.action-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                const content = messageDiv.querySelector('.message-content');
                const textToCopy = content.innerText;
                
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        // 复制成功反馈
                        copyBtn.setAttribute('data-copied', 'true');
                        copyBtn.title = '已复制!';
                        
                        // 2秒后恢复
                        setTimeout(() => {
                            copyBtn.removeAttribute('data-copied');
                            copyBtn.title = '复制';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('复制失败:', err);
                    });
            });
        }
    }
    
    // 添加加载指示器
    function addLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message loading';
        loadingDiv.innerHTML = `
            <div class="message-avatar ai">
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2C7.373 2 2 7.373 2 14C2 20.627 7.373 26 14 26C20.627 26 26 20.627 26 14C26 7.373 20.627 2 14 2ZM14 5C18.418 5 22 8.582 22 13C22 17.418 18.418 21 14 21C9.582 21 6 17.418 6 13C6 8.582 9.582 5 14 5Z" fill="#5865f2"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(loadingDiv);
        scrollToBottom();
        return loadingDiv;
    }
    
    // 格式化消息，处理Markdown格式
    function formatMessage(content) {
        try {
            // 使用marked.js解析Markdown
            if (window.marked) {
                console.log('使用marked解析Markdown');
                
                // 配置marked选项
                marked.setOptions({
                    breaks: true, // 允许换行
                    gfm: true,    // 启用GitHub风格Markdown
                    headerIds: false, // 避免标题自动添加ID
                    mangle: false,
                    sanitize: false, // 不净化输出
                    silent: true  // 忽略错误
                });
                
                // 解析Markdown
                const parsed = marked.parse(content);
                
                // 处理代码块，添加水平滚动以适应移动设备
                return parsed.replace(/<pre><code>/g, '<pre><code class="responsive-code">');
            } else {
                console.warn('marked库未加载，使用基本格式化');
                // 回退到基本格式化
                // 处理换行
                content = content.replace(/\n/g, '<br>');
                
                // 处理链接
                content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
                
                // 处理代码块
                content = content.replace(/```([^`]+)```/g, '<pre><code class="responsive-code">$1</code></pre>');
                
                // 处理内联代码
                content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
                
                return content;
            }
        } catch (error) {
            console.error('Markdown解析错误:', error);
            // 出错时返回原始内容
            return content.replace(/\n/g, '<br>');
        }
    }
    
    // 滚动到底部
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 根据当前活动功能模式构建API请求
    function buildAPIRequest(message, specializedPrompt = null) {
        // 如果提供了专用提示词，直接使用
        if (specializedPrompt) {
            console.log('使用专用提示词模板:', specializedPrompt.substring(0, 50) + '...');
            return {
                message: message,
                systemPrompt: specializedPrompt
            };
        }
        
        // 否则使用聊天模式选择器提供的系统提示词
        let systemPrompt = '';
        
        // 如果聊天模式选择器功能可用
        if (window.getChatModeSystemPrompt && typeof window.getChatModeSystemPrompt === 'function') {
            systemPrompt = window.getChatModeSystemPrompt();
            
            // 检查当前聊天模式
            const currentModeId = localStorage.getItem('selected_chat_mode') || 'general';
            if (currentModeId !== 'general' && (!window.PROMPT_TEMPLATES || !window.PROMPT_TEMPLATES.chatModes)) {
                // 如果不是通用对话模式，且没有服务器提示词数据，则返回错误信息
                return { 
                    error: true, 
                    message: `当前选择的"${currentModeId}"模式需要连接到服务器才能使用。请确保服务器连接正常，或切换到通用对话模式。` 
                };
            }
        } else {
            // fallback到原来的功能
            const activeFeature = localStorage.getItem('activeFeature') || '通用对话';
            
            // 根据不同功能设置不同的系统提示
            switch(activeFeature) {
                case '通用对话':
                    systemPrompt = '你是Xpat助手，为用户提供各种问题的回答和帮助。请提供准确、有用的信息。';
                    break;
                case '内容创作':
                    systemPrompt = '你是Xpat创作助手，擅长帮助用户创作各类内容。根据用户的描述，提供创意建议、内容结构和详细内容。';
                    break;
                case '文档分析':
                    systemPrompt = '你是Xpat分析助手，擅长分析文档并提取重要信息。请分析用户提供的文本，归纳要点，并提供见解。';
                    break;
                default:
                    systemPrompt = '你是Xpat助手，为用户提供智能对话服务。';
            }
        }
        
        console.log('使用系统提示词:', systemPrompt);
        
        return {
            message: message,
            systemPrompt: systemPrompt
        };
    }
    
    // 全局变量，存储API配置
    let apiConfig = null;
    
    // 获取API配置
    async function getApiConfig() {
        // 如果配置已存在且未过期，直接返回
        if (apiConfig) {
            return apiConfig;
        }
        
        // 检查本地token，如果没有，尝试自动登录
        const token = localStorage.getItem('xpat_auth_token');
        if (!token) {
            console.log('未检测到登录令牌，尝试自动登录...');
            try {
                // 尝试使用默认管理员账号登录
                const loginRes = await fetch(`${window.API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email: 'kimcrowing@hotmail.com', password: 'www'})
                });
                
                if (loginRes.ok) {
                    const loginData = await loginRes.json();
                    if (loginData.token) {
                        localStorage.setItem('xpat_auth_token', loginData.token);
                        localStorage.setItem('xpat_user_info', JSON.stringify(loginData.user));
                        console.log('自动登录成功');
                    }
                } else {
                    console.error('自动登录失败');
                }
            } catch (loginError) {
                console.error('自动登录时出错:', loginError);
            }
        }
        
        // 再次获取token（可能是刚登录获取的）
        const currentToken = localStorage.getItem('xpat_auth_token');
        if (!currentToken) {
            throw new Error('未登录，请先登录');
        }
        
        try {
            // 先尝试检查API是否可访问
            try {
                await fetch(`${window.API_BASE_URL}/health`, {
                    method: 'GET',
                    mode: 'no-cors',  // 使用no-cors模式
                    cache: 'no-cache'
                });
            } catch (healthError) {
                console.error('API健康检查失败:', healthError);
                // 即使健康检查失败也继续尝试
            }
            
            // 尝试获取API配置
            const response = await fetch(`${window.API_BASE_URL}/chat/config`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${currentToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': '1'
                },
                mode: 'cors',  // 明确使用cors模式
                credentials: 'same-origin',
                cache: 'no-cache'
            });
            
            // 检查内容类型是否为JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn(`预期JSON响应，但收到: ${contentType}`);
                throw new Error('API返回了非JSON响应');
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || `${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            
            apiConfig = await response.json();
            return apiConfig;
        } catch (error) {
            console.error('获取API配置失败:', error);
            
            // 如果是CORS错误或网络错误，提供更具体的信息
            if (error.message.includes('NetworkError') || error.message.includes('network') || 
                error.message.includes('CORS') || error.name === 'TypeError') {
                console.error('CORS或网络错误，无法连接到API，使用本地模式');
                
                // 返回无密钥的本地配置，使用本地响应模式
                return {
                    apiKey: "",  // 不暴露API密钥
                    model: "deepseek/deepseek-r1:free",
                    endpoint: "https://openrouter.ai/api/v1/chat/completions",
                    referer: "http://localhost",
                    title: "Xpat",
                    localMode: true  // 标记为本地模式
                };
            }
            
            throw error;
        }
    }
    
    // 记录API使用情况
    async function logApiUsage(model, tokens) {
        const token = localStorage.getItem('xpat_auth_token');
        if (!token) {
            return; // 如果未登录，不记录
        }
        
        try {
            await fetch(`${window.API_BASE_URL}/chat/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    model,
                    tokens
                })
            });
        } catch (error) {
            console.error('记录API使用情况失败:', error);
        }
    }
    
    // 直接调用OpenRouter API
    async function callOpenRouterAPI(messages, model) {
        try {
            let config;
            
            // 确保messages包含系统和用户消息
            if (!messages.some(msg => msg.role === 'system')) {
                // 如果没有系统消息，添加一个默认的
                messages.unshift({
                    role: 'system',
                    content: '你是Xpat助手，为用户提供专业、准确的回答。'
                });
            }
            
            console.log('发送API请求，消息数:', messages.length);
            
            // 尝试从后端获取API配置
            try {
                // 清除先前缓存的API配置，确保获取最新配置
                apiConfig = null;
                
                // 获取API配置
                config = await getApiConfig();
            } catch (configError) {
                console.error('从后端获取API配置失败，使用本地配置:', configError);
                
                // 使用本地API配置 - 不包含API密钥
                config = {
                    apiKey: "",  // 空字符串，不泄露任何密钥
                    model: "deepseek/deepseek-r1:free",
                    endpoint: "https://openrouter.ai/api/v1/chat/completions",
                    referer: "http://localhost",
                    title: "Xpat",
                    localMode: true  // 标记为本地模式
                };
            }
            
            if (!config || !config.apiKey) {
                console.log('无API密钥，将使用本地模式');
                config = config || {};
                config.localMode = true;
            }
            
            if (!config || !config.apiKey) {
                throw new Error('无法获取有效的API配置或API密钥');
            }
            
            // 安全地显示API密钥（只显示前6位和后4位）
            const apiKeyStart = config.apiKey.substring(0, 6);
            const apiKeyEnd = config.apiKey.substring(config.apiKey.length - 4);
            const maskedApiKey = `${apiKeyStart}...${apiKeyEnd}`;
            
            console.log('正在使用API配置:', {
                endpoint: config.endpoint,
                model: model || config.model,
                apiKey: maskedApiKey  // 显示部分masked的API密钥
            });
            
            // 检测是否需要使用本地模拟响应
            if (!config.apiKey || config.localMode || config.apiKey.includes('-v1-7cc245d5abe2a4d')) {
                console.log('检测到无有效API密钥或本地模式，使用本地AI响应');
                // 模拟API延迟
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 获取用户最后一条消息
                const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
                
                // 模拟AI响应
                return generateLocalResponse(userMessage);
            }
            
            // 实际API调用
            // 处理标题中可能包含的非ISO-8859-1字符
            const safeTitle = encodeURIComponent(config.title);
            
            // 设置请求超时 (20秒)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);
            
            try {
                const response = await fetch(config.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.apiKey}`,
                        'HTTP-Referer': config.referer,
                        'X-Title': safeTitle
                    },
                    body: JSON.stringify({
                        model: model || config.model,
                        messages: messages,
                        max_tokens: 2000,
                        stream: false
                    }),
                    signal: controller.signal
                });
                
                // 清除超时
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || `状态码: ${response.status} - ${response.statusText}`;
                    throw new Error(`OpenRouter API请求失败: ${errorMessage}`);
                }
                
                const data = await response.json();
                
                // 记录API使用情况
                if (data.usage && data.usage.total_tokens) {
                    logApiUsage(data.model, data.usage.total_tokens);
                }
                
                return data.choices[0].message.content;
            } catch (fetchError) {
                // 如果是超时或网络问题，使用本地响应
                if (fetchError.name === 'AbortError' || fetchError.message.includes('network')) {
                    console.log('API请求超时或网络问题，使用本地响应');
                    const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
                    return generateLocalResponse(userMessage);
                }
                throw fetchError;
            }
        } catch (error) {
            console.error('调用API时出错:', error);
            // 出错时也返回本地响应
            const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
            return generateLocalResponse(userMessage);
        }
    }
    
    // 生成本地AI响应
    function generateLocalResponse(userMessage) {
        // 简单的响应逻辑
        userMessage = userMessage.toLowerCase();
        
        if (userMessage.includes('你好') || userMessage.includes('hello') || userMessage.includes('hi')) {
            return "你好！我是Xpat AI助手。由于当前无法连接到AI服务，我正在本地模式下运行。请登录后端管理界面配置API密钥，或联系系统管理员获取帮助。";
        }
        
        if (userMessage.includes('谁') && userMessage.includes('你')) {
            return "我是Xpat AI助手，目前运行在本地模式。由于未配置API密钥或连接问题，我无法使用云端AI能力。请联系管理员配置正确的API密钥。";
        }
        
        if (userMessage.includes('api') || userMessage.includes('密钥') || userMessage.includes('key')) {
            return "要配置API密钥，请按以下步骤操作：\n\n1. 登录系统管理后台\n2. 进入API配置页面\n3. 输入您的OpenRouter API密钥\n4. 保存配置\n\n如果您没有API密钥，请访问OpenRouter官网获取。如需更多帮助，请联系系统管理员。";
        }
        
        if (userMessage.includes('帮助') || userMessage.includes('help')) {
            return "我可以帮助回答问题、提供信息和进行简单对话。但由于当前未配置API密钥或存在连接问题，我只能提供有限的预设回复。要获得完整功能，请确保系统管理员已正确配置API密钥。";
        }
        
        if (userMessage.includes('时间') || userMessage.includes('日期')) {
            const now = new Date();
            return `当前时间是：${now.toLocaleString()}。请注意，我在本地模式下运行，功能有限。请联系管理员配置API密钥以获取完整功能。`;
        }
        
        if (userMessage.includes('天气')) {
            return "很抱歉，我目前无法获取实时天气信息。由于未配置API密钥或连接问题，我正在本地模式下运行。请联系系统管理员配置API密钥。";
        }
        
        // 默认响应
        return "我收到了您的消息，但当前我正在本地模式下运行，功能有限。这是因为系统未配置API密钥或与API的连接出现了问题。请联系系统管理员配置正确的API密钥，以便启用完整的AI对话功能。";
    }
    
    /**
     * 使用用户自己的API密钥直接调用模型
     * @param {string} prompt - 用户的提示词
     * @param {string} model - 模型名称
     * @returns {Promise<Object>} - 响应结果
     */
    async function callModelWithUserApiKey(prompt, model) {
        try {
            // 根据模型确定提供商
            let provider = 'openai';
            if (model.includes('claude')) provider = 'anthropic';
            if (model.includes('gemini')) provider = 'google';
            if (model.includes('gpt-4o')) provider = 'openai';
            if (model.includes('gpt-4')) provider = 'openai';
            if (model.includes('gpt-3.5')) provider = 'openai';
            if (model.includes('spark')) provider = 'xunfei';
            if (model.includes('qwen')) provider = 'ali';
            if (model.includes('baidu') || model.includes('ernie')) provider = 'baidu';
            
            // 获取用户的API密钥
            const apiKeyResponse = await fetch(`${window.API_BASE_URL}/api/apikeys/provider/${provider}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`
                }
            });
            
            if (!apiKeyResponse.ok) {
                // 如果用户没有配置API密钥，则回退到服务器端代理方式
                console.warn(`未找到${provider}的API密钥，将使用服务器端代理调用。`);
                return callModelViaServer(prompt, model);
            }
            
            const apiKeyData = await apiKeyResponse.json();
            const apiKey = apiKeyData.api_key;
            
            // 根据不同的提供商构建请求
            let endpoint, headers, payload, usageInfo;
            
            if (provider === 'openai') {
                endpoint = 'https://api.openai.com/v1/chat/completions';
                headers = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                };
                payload = {
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 2000
                };
            } else if (provider === 'anthropic') {
                endpoint = 'https://api.anthropic.com/v1/messages';
                headers = {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                };
                payload = {
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 2000
                };
            } else if (provider === 'google') {
                endpoint = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
                headers = {
                    'Content-Type': 'application/json'
                };
                payload = {
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                };
            } else {
                throw new Error(`不支持的提供商: ${provider}`);
            }
            
            // 发送请求
            const startTime = new Date();
            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error('API调用失败:', error);
                throw new Error(error.error?.message || error.message || '调用模型失败');
            }
            
            const result = await response.json();
            
            // 提取返回的文本内容
            let responseText = '';
            let usageData = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
            
            if (provider === 'openai') {
                responseText = result.choices[0]?.message?.content || '';
                usageData = result.usage || usageData;
            } else if (provider === 'anthropic') {
                responseText = result.content[0]?.text || '';
                // Anthropic目前不直接返回token计数，使用估算
                const estimatedPromptTokens = Math.ceil(prompt.length / 4);
                const estimatedCompletionTokens = Math.ceil(responseText.length / 4);
                usageData = {
                    prompt_tokens: estimatedPromptTokens,
                    completion_tokens: estimatedCompletionTokens,
                    total_tokens: estimatedPromptTokens + estimatedCompletionTokens
                };
            } else if (provider === 'google') {
                responseText = result.candidates[0]?.content?.parts[0]?.text || '';
                // Google API也不直接返回token计数，使用估算
                const estimatedPromptTokens = Math.ceil(prompt.length / 4);
                const estimatedCompletionTokens = Math.ceil(responseText.length / 4);
                usageData = {
                    prompt_tokens: estimatedPromptTokens,
                    completion_tokens: estimatedCompletionTokens,
                    total_tokens: estimatedPromptTokens + estimatedCompletionTokens
                };
            }
            
            // 记录API使用情况
            try {
                const endTime = new Date();
                const requestDuration = endTime - startTime;
                
                await fetch(`${window.API_BASE_URL}/api/chat/log`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model,
                        prompt_tokens: usageData.prompt_tokens,
                        completion_tokens: usageData.completion_tokens,
                        total_tokens: usageData.total_tokens,
                        request_duration: requestDuration
                    })
                });
            } catch (logError) {
                console.error('记录API使用情况失败:', logError);
                // 继续处理，不影响用户体验
            }
            
            return {
                text: responseText,
                usage: usageData
            };
        } catch (error) {
            console.error('使用用户API密钥调用模型失败:', error);
            // 出错时尝试回退到服务器调用
            console.warn('尝试回退到服务器代理调用...');
            try {
                return await callModelViaServer(prompt, model);
            } catch (fallbackError) {
                console.error('服务器代理调用也失败:', fallbackError);
                throw error; // 抛出原始错误
            }
        }
    }
    
    /**
     * 通过服务器代理调用模型（原始方法）
     * @param {string} prompt - 用户的提示词
     * @param {string} model - 模型名称
     * @returns {Promise<Object>} - 响应结果
     */
    async function callModelViaServer(prompt, model) {
        try {
            // 修正URL路径，移除重复的/api前缀
            // 获取API基础URL，确保不会重复添加/api
            let apiUrl = window.API_BASE_URL;
            // 如果API_BASE_URL已包含/api结尾，则不再添加
            const endpoint = apiUrl.endsWith('/api') ? '/chat/completions' : '/api/chat/completions';
            
            console.log('发送请求到:', apiUrl + endpoint);
            
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`,
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': '1'
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: "user", content: prompt }
                    ]
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '调用模型失败');
            }
            
            return await response.json();
        } catch (error) {
            console.error('通过服务器调用模型失败:', error);
            throw error;
        }
    }
    
    // 发送消息
    async function sendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        const attachmentText = window.getAttachmentText ? window.getAttachmentText() : '';
        
        if (!message && !attachmentText) {
            return; // 如果没有输入和附件，则不发送
        }
        
        // 清空输入框
        userInput.value = '';
        
        console.log('发送消息:', message);
        
        let detectedDomain = null;
        let specializedTemplate = null;
        
        // 检查是否有检测到的专利领域
        if (window.DETECTED_PATENT_DOMAIN && typeof window.DETECTED_PATENT_DOMAIN === 'string') {
            detectedDomain = window.DETECTED_PATENT_DOMAIN;
            console.log('检测到专利领域:', detectedDomain);
            
            // 尝试获取专利领域的专用提示词
            try {
                // 获取当前聊天模式
                const currentMode = localStorage.getItem('selected_chat_mode') || 'general';
                
                const response = await fetch(`${window.API_BASE_URL}/prompts/domain?domain=${encodeURIComponent(detectedDomain)}&mode=${encodeURIComponent(currentMode)}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('xpat_auth_token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.prompt) {
                        specializedTemplate = data.prompt;
                        console.log('使用专用模板:', specializedTemplate.substring(0, 50) + '...');
                    }
                }
            } catch (error) {
                console.error('获取专用提示词失败:', error);
            }
        }
        
        // 创建用户消息文本
        let fullMessage = '';
        
        // 如果有附件，将其添加到消息中
        if (attachmentText) {
            fullMessage = `${message}\n\n附件内容:\n${attachmentText}`;
        } else {
            fullMessage = message;
        }
        
        // 添加用户消息到聊天
        addUserMessage(message);
        
        // 添加加载指示器
        const loadingIndicator = addLoadingIndicator();
        
        try {
            // 构建请求
            const apiRequest = buildAPIRequest(fullMessage, specializedTemplate);
            
            if (apiRequest.error) {
                // 如果构建请求时发现错误，显示错误消息
                loadingIndicator.remove();
                addAIMessage(apiRequest.message);
                return;
            }
            
            let response;
            
            // 优先使用OpenRouter API
            try {
                // 获取当前选择的模型，如果未指定则使用默认
                const selectedModel = window.CURRENT_MODEL || 'deepseek/deepseek-r1:free';
                
                // 构建消息数组
                const messages = [];
                
                // 添加系统提示词
                if (apiRequest.systemPrompt && apiRequest.systemPrompt.trim()) {
                    messages.push({
                        role: 'system',
                        content: apiRequest.systemPrompt
                    });
                }
                
                // 添加用户消息
                messages.push({
                    role: 'user',
                    content: apiRequest.message
                });
                
                console.log('调用OpenRouter API');
                response = await callOpenRouterAPI(messages, selectedModel);
            } catch (openRouterError) {
                console.error('OpenRouter API调用失败:', openRouterError);
                
                // 回退到服务器端调用
                console.log('回退到服务器代理调用');
                const serverResponse = await callModelViaServer(apiRequest.message, window.CURRENT_MODEL);
                response = serverResponse.text;
            }
            
            // 移除加载指示器
            loadingIndicator.remove();
            
            // 添加AI回复到聊天
            addAIMessage(response);
        } catch (error) {
            console.error('处理消息失败:', error);
            
            // 移除加载指示器
            loadingIndicator.remove();
            
            // 添加错误消息
            addAIMessage(`很抱歉，我遇到了一个问题: ${error.message || '未知错误'}`);
        }
    }
    
    // 发送按钮点击事件
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            console.log('发送按钮点击');
            sendMessage();
        });
    } else {
        console.error('找不到发送按钮元素(sendButton)');
    }
    
    // Enter键发送消息
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('检测到Enter键按下');
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // 设置消息操作事件
    chatMessages.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('.action-btn');
        if (!actionBtn) return;
        
        const messageDiv = actionBtn.closest('.message');
        const messageContent = messageDiv.querySelector('.message-content').textContent;
        
        if (actionBtn.title === '复制') {
            navigator.clipboard.writeText(messageContent)
                .then(() => {
                    // 显示复制成功提示
                    actionBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.5 12L2 7.5L3.5 6L6.5 9L12.5 3L14 4.5L6.5 12Z" fill="#4CAF50"/>
                        </svg>
                    `;
                    setTimeout(() => {
                        actionBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 2V11H5V14H14V5H11V2H2ZM3 3H10V10H3V3ZM11 6H13V13H6V11H11V6Z" fill="white"/>
                            </svg>
                        `;
                    }, 2000);
                });
        }
    });
    
    // 添加系统消息的函数
    function addSystemMessage(content) {
        if (!content) return;
        
        const messagesContainer = document.getElementById('messages');
        
        // 创建系统消息元素
        const systemMessageElement = document.createElement('div');
        systemMessageElement.className = 'message system-message';
        
        // 创建消息文本元素
        const messageTextElement = document.createElement('div');
        messageTextElement.className = 'message-text';
        messageTextElement.textContent = content;
        
        // 将文本元素添加到系统消息元素
        systemMessageElement.appendChild(messageTextElement);
        
        // 将系统消息添加到消息容器
        messagesContainer.appendChild(systemMessageElement);
        
        // 滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}); 