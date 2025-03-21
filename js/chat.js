document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
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
    
    // 格式化消息，处理换行、链接等
    function formatMessage(content) {
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
    
    // 滚动到底部
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 根据当前活动功能模式构建API请求
    function buildAPIRequest(message) {
        const activeFeature = localStorage.getItem('activeFeature');
        let systemPrompt = '';
        
        // 根据不同功能设置不同的系统提示
        switch(activeFeature) {
            case '专利查新':
                systemPrompt = '你是一位专业的专利检索专家，擅长通过关键词分析技术领域并找出相关专利。请基于用户的描述，提供可能的检索策略和相似专利分析。';
                break;
            case '专利撰写':
                systemPrompt = '你是一位专业的专利代理人，擅长专利申请文件的撰写。请根据用户的技术描述，帮助构建完整的专利申请文件，包括权利要求书和说明书的建议。';
                break;
            case '专利答审':
                systemPrompt = '你是一位专业的专利代理人，擅长应对专利审查意见。请分析用户提供的审查意见通知书内容，提供针对性的答复建议和修改方案。';
                break;
            default:
                systemPrompt = '你是XPatent AI助手，为用户提供专业的专利相关咨询和帮助。';
        }
        
        return {
            message: message,
            systemPrompt: systemPrompt
        };
    }
    
    // 发送消息
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // 清空输入框
        userInput.value = '';
        sendBtn.setAttribute('disabled', true);
        
        // 添加用户消息
        addUserMessage(message);
        
        // 显示加载指示器
        const loadingIndicator = addLoadingIndicator();
        
        try {
            // 构建API请求 
            const request = buildAPIRequest(message);
            
            // 调用API获取回复
            const response = await callOpenRouterAPI(request.message, request.systemPrompt);
            
            // 移除加载指示器
            loadingIndicator.remove();
            
            // 添加AI回复
            addAIMessage(response);
        } catch (error) {
            // 移除加载指示器
            loadingIndicator.remove();
            
            // 显示错误信息
            addAIMessage(`抱歉，发生了错误：${error.message}`);
        }
    }
    
    // 发送按钮点击事件
    sendBtn.addEventListener('click', sendMessage);
    
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