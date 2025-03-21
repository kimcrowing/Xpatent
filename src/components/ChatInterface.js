import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import '../styles/ChatInterface.css';
import '../styles/ChatInput.css';
import { sendMessage } from '../services/api';

function ChatInterface({ 
  messages, 
  setMessages, 
  isLoading, 
  setIsLoading,
  apiKey,
  selectedModel,
  updateConversation,
  darkMode
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const adjustTextareaHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    };

    adjustTextareaHeight();
  }, [input]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    if (!apiKey) {
      setError('请在设置中设置OpenRouter API密钥');
      return;
    }

    // Add user message
    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    updateConversation(updatedMessages);
    
    setInput('');
    setIsLoading(true);
    setError('');
    setShowRetry(false);

    try {
      const stream = await sendMessage(updatedMessages, selectedModel, apiKey);
      
      let assistantResponse = { role: 'assistant', content: '' };
      const reader = stream.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // 处理流式响应数据
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;
          
          try {
            // 移除 "data:" 前缀
            const jsonLine = line.replace(/^data: /, '');
            if (jsonLine === '[DONE]') continue;
            
            const data = JSON.parse(jsonLine);
            if (data.choices?.[0]?.delta?.content) {
              assistantResponse.content += data.choices[0].delta.content;
              setMessages([...updatedMessages, { ...assistantResponse }]);
            }
          } catch (err) {
            console.error('解析流式响应出错:', err, line);
          }
        }
      }
      
      // 添加完整的助手回复
      const finalMessages = [...updatedMessages, assistantResponse];
      setMessages(finalMessages);
      updateConversation(finalMessages);
      
    } catch (err) {
      console.error('发送消息时出错:', err);
      setShowRetry(true);
      setError(`Grok was unable to reply to your last message.\nPlease try regenerating a response.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Handle key presses (Enter to send)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };
  
  const handleRetry = () => {
    // 当重试按钮被点击时，重新发送最后一条用户消息
    if (messages.length > 0) {
      // 找到最后一条用户消息
      const lastUserMessageIndex = messages.map(m => m.role).lastIndexOf('user');
      if (lastUserMessageIndex !== -1) {
        // 移除最后一条助手消息（如果有）
        const messagesToKeep = messages.slice(0, lastUserMessageIndex + 1);
        setError('');
        setShowRetry(false);
        setMessages(messagesToKeep);
        
        // 重新发送最后一条用户消息的内容
        const lastUserMessage = messages[lastUserMessageIndex];
        setInput(lastUserMessage.content);
        
        // 手动触发发送
        setTimeout(() => {
          const event = { preventDefault: () => {} };
          setInput('');
          handleSendMessage(event);
        }, 100);
      }
    }
  };

  return (
    <div className="chat-interface">
      {messages.length === 0 ? (
        <>
          <div className="welcome-message">
            <h1>Good evening, Kim.</h1>
            <p>How can I help you today?</p>
          </div>
          
          <div className="action-buttons-container">
            <div className="action-buttons-row">
              <button className="action-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 18h10V16H7v2zm3-7h4v-2h-4v2zm-3 4h10v-2H7v2zm0-8v2h10V7H7z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                JFK files
              </button>
              <button className="action-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 14C16.1046 14 17 13.1046 17 12C17 10.8954 16.1046 10 15 10C13.8954 10 13 10.8954 13 12C13 13.1046 13.8954 14 15 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 8C10.1046 8 11 7.10457 11 6C11 4.89543 10.1046 4 9 4C7.89543 4 7 4.89543 7 6C7 7.10457 7.89543 8 9 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 20C10.1046 20 11 19.1046 11 18C11 16.8954 10.1046 16 9 16C7.89543 16 7 16.8954 7 18C7 19.1046 7.89543 20 9 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 16L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 8L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Research
              </button>
              <button className="action-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 10V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 10L14 3H10L5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create images
              </button>
            </div>
            
            <div className="action-buttons-row">
              <button className="action-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                How to
              </button>
              <button className="action-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21H3L12 3L21 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Analyze
              </button>
              <button className="action-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Code
              </button>
            </div>
          </div>
          
          <div className="personas-switch">
            <button className="personas-button">
              Switch to Personas
            </button>
          </div>
        </>
      ) : (
        <div className="messages-container">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              {message.role === 'user' ? (
                <div className="user-bubble">
                  {message.content}
                </div>
              ) : (
                <div className="assistant-content">
                  <div className="message-avatar">
                    {message.role === 'user' ? "你" : "AI"}
                  </div>
                  <div className="message-content">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <div className="message-actions">
                    <button className="message-action-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="message-action-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12M16 6L12 2M12 2L8 6M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="message-action-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="message-action-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="loading-indicator">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          )}
          
          {error && (
            <div className="error-container">
              <div className="error-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="error-message">
                {error.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              {showRetry && (
                <button className="retry-button" onClick={handleRetry}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.49 9C19.9828 7.56678 19.1209 6.2854 17.9845 5.27542C16.8482 4.26543 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Retry
                </button>
              )}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
      
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <div className="input-tools">
            <div className="input-tools-left">
              <div className="model-selector">
                <button 
                  className="model-selector-button"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                >
                  <span>{selectedModel?.name.split(' ')[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {showModelDropdown && (
                  <div className="model-dropdown">
                    {/* 这里可以添加模型选择列表 */}
                    <div className="model-dropdown-item selected">
                      <span>DeepSeek</span>
                      <span className="model-info">免费</span>
                    </div>
                    <div className="model-dropdown-item">
                      <span>Claude</span>
                      <span className="model-info">付费</span>
                    </div>
                  </div>
                )}
              </div>
              
              <button className="thinking-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 12C19.333 16.667 16 19 12 19C8 19 4.667 16.667 2 12C4.667 7.333 8 5 12 5C16 5 19.333 7.333 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Think</span>
              </button>
            </div>
          </div>
          
          <div className="chat-input">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={messages.length === 0 ? "What do you want to know?" : "How can Grok help?"}
              rows="1"
            />
            <button 
              type="submit" 
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim() || !apiKey}
              className="send-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          {messages.length === 0 && (
            <div className="grok-version">
              <button className="grok-version-button">
                Grok 3
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="grok-up-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatInterface; 