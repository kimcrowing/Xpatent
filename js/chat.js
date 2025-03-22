document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const sendButton = document.getElementById('sendButton');
    
    console.log('聊天组件已加载', {
        chatMessages: !!chatMessages,
        userInput: !!userInput,
        sendBtn: !!sendBtn,
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
            <h3>请先登录</h3>
            <p>您需要登录后才能使用AI聊天功能。登录后您将获得API配额并能够跟踪使用情况。</p>
            <a href="./login.html" class="login-button">登录</a>
            <a href="./register.html" class="login-button" style="margin-left: 10px;">注册</a>
        `;
        
        // 添加到聊天区域
        chatMessages.appendChild(loginPrompt);
        
        // 禁用输入框和发送按钮
        if (userInput) {
            userInput.disabled = true;
            userInput.placeholder = '请先登录后使用';
        }
        
        if (sendBtn) {
            sendBtn.disabled = true;
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
                <div class="user-avatar">KQ</div>
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
                    <button class="action-btn" title="复制">
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
                return marked.parse(content);
            } else {
                console.warn('marked库未加载，使用基本格式化');
                // 回退到基本格式化
                // 处理换行
                content = content.replace(/\n/g, '<br>');
                
                // 处理链接
                content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
                
                // 处理代码块
                content = content.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
                
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
    function buildAPIRequest(message) {
        // 使用聊天模式选择器提供的系统提示词
        let systemPrompt = '';
        
        // 如果聊天模式选择器功能可用
        if (window.getChatModeSystemPrompt && typeof window.getChatModeSystemPrompt === 'function') {
            systemPrompt = window.getChatModeSystemPrompt();
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
        
        // 从后端获取配置
        const token = localStorage.getItem('xpat_auth_token');
        if (!token) {
            throw new Error('未登录，请先登录');
        }
        
        const response = await fetch(`${window.API_BASE_URL}/chat/config`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || `${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }
        
        apiConfig = await response.json();
        return apiConfig;
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
            // 清除先前缓存的API配置，确保获取最新配置
            apiConfig = null;
            
            // 获取API配置
            const config = await getApiConfig();
            
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
            
            // 处理标题中可能包含的非ISO-8859-1字符
            const safeTitle = encodeURIComponent(config.title);
            
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
                })
            });
            
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
        } catch (error) {
            console.error('调用API时出错:', error);
            throw error;
        }
    }
    
    // 发送消息
    async function sendMessage() {
        console.log('准备发送消息');
        if (!userInput) {
            console.error('找不到用户输入元素');
            return;
        }
        
        const message = userInput.value.trim();
        console.log('用户输入:', message);
        
        if (!message) {
            console.log('消息为空，不发送');
            return;
        }
        
        // 清空输入框
        userInput.value = '';
        
        // 获取附件内容（如果有）
        let fullMessage = message;
        if (window.getAttachmentText && typeof window.getAttachmentText === 'function') {
            try {
                const attachmentText = window.getAttachmentText();
                console.log('附件内容长度:', attachmentText ? attachmentText.length : 0);
                
                if (attachmentText) {
                    // 在用户消息后添加文档内容
                    fullMessage += "\n\n===== 附件内容 =====\n" + attachmentText;
                    
                    // 获取当前附件文件名
                    const attachmentFileName = document.getElementById('fileName').textContent;
                    
                    // 创建HTML元素直接添加到DOM，而非使用字符串连接
                    const userMessageText = document.createTextNode(message);
                    const userMessageDiv = document.createElement('div');
                    userMessageDiv.className = 'message user-message';
                    
                    // 创建头像
                    const avatarDiv = document.createElement('div');
                    avatarDiv.className = 'message-avatar user';
                    const userAvatar = document.createElement('div');
                    userAvatar.className = 'user-avatar';
                    userAvatar.textContent = 'KQ';
                    avatarDiv.appendChild(userAvatar);
                    
                    // 创建消息内容
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'message-content';
                    contentDiv.appendChild(userMessageText);
                    
                    // 创建附件徽章
                    const badgeSpan = document.createElement('span');
                    badgeSpan.className = 'attachment-badge';
                    badgeSpan.textContent = `[已上传附件: ${attachmentFileName}]`;
                    contentDiv.appendChild(document.createTextNode(' '));
                    contentDiv.appendChild(badgeSpan);
                    
                    // 组装消息
                    userMessageDiv.appendChild(avatarDiv);
                    userMessageDiv.appendChild(contentDiv);
                    
                    // 添加到聊天区域
                    chatMessages.appendChild(userMessageDiv);
                    scrollToBottom();
                    
                    console.log('附件消息已添加，附件名称:', attachmentFileName);
                } else {
                    // 没有附件，正常显示消息
                    addUserMessage(message);
                }
            } catch (e) {
                console.error('获取附件内容时出错:', e);
                addUserMessage(message);
            }
        } else {
            // 如果附件功能不可用，正常显示消息
            console.log('附件功能不可用');
            addUserMessage(message);
        }
        
        // 显示加载指示器
        const loadingIndicator = addLoadingIndicator();
        
        try {
            console.log('准备调用API');
            // 构建API请求 
            const request = buildAPIRequest(fullMessage);
            
            // 检查用户是否已登录
            const token = localStorage.getItem('xpat_auth_token');
            
            if (!token) {
                // 用户未登录，显示错误信息
                loadingIndicator.remove();
                addAIMessage("请先登录后再使用聊天功能。登录后您将获得API配额并能够跟踪使用情况。");
                return;
            }
            
            // 构建消息数组
            const messages = [];
            
            // 添加系统提示
            if (request.systemPrompt) {
                messages.push({
                    role: 'system',
                    content: request.systemPrompt
                });
            }
            
            // 添加用户消息
            messages.push({
                role: 'user',
                content: request.message
            });
            
            // 直接调用OpenRouter API
            const content = await callOpenRouterAPI(messages, window.CURRENT_MODEL);
            
            // 移除加载指示器
            loadingIndicator.remove();
            
            // 添加AI回复
            addAIMessage(content);
        } catch (error) {
            console.error('API调用出错:', error);
            // 移除加载指示器
            loadingIndicator.remove();
            
            // 如果是401错误，说明用户未登录或会话已过期
            if (error.message.includes('401')) {
                localStorage.removeItem('xpat_auth_token');
                localStorage.removeItem('xpat_user_info');
                addAIMessage("登录会话已过期，请重新登录。");
                return;
            }
            
            // 如果是403错误，说明API配额已用尽
            if (error.message.includes('403') && error.message.includes('配额已用尽')) {
                addAIMessage("您的API使用配额已用尽，请联系管理员或升级订阅计划。");
                return;
            }
            
            // 其他错误
            addAIMessage(`抱歉，发生了错误：${error.message}`);
        }
    }
    
    // 发送按钮点击事件
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            console.log('发送按钮(sendBtn)点击');
            sendMessage();
        });
    }
    
    // 新发送按钮点击事件
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            console.log('发送按钮(sendButton)点击');
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
}); 