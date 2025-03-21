import React, { useState } from 'react';
import '../styles/Sidebar.css';

function Sidebar({ 
  open, 
  setOpen, 
  conversations, 
  activeConversation, 
  switchConversation, 
  deleteConversation, 
  createNewConversation,
  apiKey,
  setApiKey,
  selectedModel,
  setSelectedModel,
  models
}) {
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showingSettings, setShowingSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  const saveApiKey = () => {
    setApiKey(tempApiKey);
    setShowApiKeyInput(false);
  };

  const toggleSettings = () => {
    setShowingSettings(!showingSettings);
  };

  return (
    <div className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>对话</h2>
        <button 
          className="close-sidebar" 
          onClick={() => setOpen(false)}
          aria-label="关闭侧边栏"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <button 
        className="new-chat-button sidebar-new-chat" 
        onClick={createNewConversation}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        新对话
      </button>

      <div className="conversations-list">
        {conversations.map((conversation) => (
          <div 
            key={conversation.id} 
            className={`conversation-item ${activeConversation === conversation.id ? 'active' : ''}`}
            onClick={() => switchConversation(conversation.id)}
          >
            <div className="conversation-title">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>{conversation.title}</span>
            </div>
            <button 
              className="delete-conversation" 
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(conversation.id);
              }}
              aria-label="删除对话"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="settings-button" onClick={toggleSettings}>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          设置
        </button>
      </div>

      {showingSettings && (
        <div className="settings-panel">
          <h3>设置</h3>
          
          <div className="settings-group">
            <label>选择模型</label>
            <select 
              value={selectedModel ? selectedModel.id : ''}
              onChange={(e) => {
                const model = models.find(m => m.id === e.target.value);
                setSelectedModel(model);
              }}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="settings-group">
            <label>OpenRouter API密钥</label>
            {showApiKeyInput ? (
              <div className="api-key-input-group">
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="输入你的OpenRouter API密钥"
                />
                <div className="api-key-buttons">
                  <button onClick={saveApiKey}>保存</button>
                  <button onClick={() => setShowApiKeyInput(false)}>取消</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowApiKeyInput(true)}>
                {apiKey ? '更改API密钥' : '设置API密钥'}
              </button>
            )}
          </div>
          
          <div className="about-info">
            <p>Grok克隆 v0.1.0</p>
            <p>由OpenRouter API提供支持</p>
            <p>
              <a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub项目
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar; 