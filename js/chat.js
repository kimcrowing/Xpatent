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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM10 4C6.68629 4 4 6.68629 4 10C4 13.3137 6.68629 16 10 16C13.3137 16 16 13.3137 16 10C16 6.68629 13.3137 4 10 4Z" fill="white"/>
                </svg>
            </div>
            <div class="message-content">${formatMessage(content)}</div>
            <div class="message-actions">
                <button class="action-btn" title="重新生成">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3V1L4 5L8 9V7C10.7614 7 13 9.23858 13 12C13 14.7614 10.7614 17 8 17C5.23858 17 3 14.7614 3 12H1C1 15.866 4.13401 19 8 19C11.866 19 15 15.866 15 12C15 8.13401 11.866 5 8 5V3Z" fill="white"/>
                    </svg>
                </button>
                <button class="action-btn" title="复制">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2V11H5V14H14V5H11V2H2ZM3 3H10V10H3V3ZM11 6H13V13H6V11H11V6Z" fill="white"/>
                    </svg>
                </button>
                <button class="action-btn" title="点赞">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 14L2 8C0.9 6.9 0.9 5.1 2 4C3.1 2.9 4.9 2.9 6 4L8 6L10 4C11.1 2.9 12.9 2.9 14 4C15.1 5.1 15.1 6.9 14 8L8 14Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="action-btn" title="踩">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 14L2 8C0.9 6.9 0.9 5.1 2 4C3.1 2.9 4.9 2.9 6 4L8 6L10 4C11.1 2.9 12.9 2.9 14 4C15.1 5.1 15.1 6.9 14 8L8 14Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="rotate(180 8 9)"/>
                    </svg>
                </button>
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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM10 4C6.68629 4 4 6.68629 4 10C4 13.3137 6.68629 16 10 16C13.3137 16 16 13.3137 16 10C16 6.68629 13.3137 4 10 4Z" fill="white"/>
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
            
            // 调用后端API获取回复
            const response = await fetch(`${window.API_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: request.message,
                    systemPrompt: request.systemPrompt,
                    model: window.CURRENT_MODEL // 使用当前选择的模型
                })
            });
            
            // 检查响应
            if (!response.ok) {
                // 解析错误信息
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || `${response.status}: ${response.statusText}`;
                
                // 如果是401错误，说明用户未登录或会话已过期
                if (response.status === 401) {
                    localStorage.removeItem('xpat_auth_token');
                    localStorage.removeItem('xpat_user_info');
                    // 提示用户登录
                    throw new Error('登录会话已过期，请重新登录');
                }
                
                // 如果是403错误，说明API配额已用尽
                if (response.status === 403 && errorData.error?.message?.includes('配额已用尽')) {
                    throw new Error('您的API使用配额已用尽，请联系管理员或升级订阅计划');
                }
                
                throw new Error(errorMessage);
            }
            
            // 解析成功响应
            const data = await response.json();
            console.log('API响应成功', data.content ? data.content.substring(0, 50) + '...' : '无响应');
            
            // 移除加载指示器
            loadingIndicator.remove();
            
            // 添加AI回复
            addAIMessage(data.content);
        } catch (error) {
            console.error('API调用出错:', error);
            // 移除加载指示器
            loadingIndicator.remove();
            
            // 显示错误信息
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