import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import './styles/App.css';

// 添加默认API密钥和模型配置
const DEFAULT_API_KEY = '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';

const MODELS = [
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (免费)' },
  { id: 'anthropic/claude-3-opus:beta', name: 'Claude 3 Opus' },
  { id: 'anthropic/claude-3-sonnet:beta', name: 'Claude 3 Sonnet' },
  { id: 'anthropic/claude-3-haiku:beta', name: 'Claude 3 Haiku' },
  { id: 'google/gemini-pro', name: 'Gemini Pro' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B' },
  { id: 'mistral/mistral-large', name: 'Mistral Large' }
];

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // 默认为深色模式
  const [apiKey, setApiKey] = useState(localStorage.getItem('openRouterApiKey') || DEFAULT_API_KEY);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('conversations');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeConversation, setActiveConversation] = useState(null);

  useEffect(() => {
    localStorage.setItem('openRouterApiKey', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [darkMode]);

  const createNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [],
      model: selectedModel
    };
    
    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversation.id);
    setMessages([]);
  };

  const deleteConversation = (id) => {
    setConversations(conversations.filter(conv => conv.id !== id));
    if (activeConversation === id) {
      const nextConv = conversations.find(conv => conv.id !== id);
      if (nextConv) {
        setActiveConversation(nextConv.id);
        setMessages(nextConv.messages);
      } else {
        createNewConversation();
      }
    }
  };

  const switchConversation = (id) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setActiveConversation(id);
      setMessages(conversation.messages);
      setSelectedModel(conversation.model);
    }
  };

  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    } else if (!activeConversation) {
      setActiveConversation(conversations[0].id);
      setMessages(conversations[0].messages);
    }
  }, [conversations]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateCurrentConversation = (newMessages) => {
    if (!activeConversation) return;

    setConversations(conversations.map(conv => {
      if (conv.id === activeConversation) {
        // 使用第一条用户消息来更新对话标题
        let title = conv.title;
        if (conv.title === '新对话' && newMessages.length > 0) {
          const firstUserMessage = newMessages.find(m => m.role === 'user');
          if (firstUserMessage) {
            title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
          }
        }
        return { 
          ...conv, 
          messages: newMessages,
          title,
          model: selectedModel
        };
      }
      return conv;
    }));
  };

  return (
    <div className="app">
      <TopBar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        setSidebarOpen={setSidebarOpen} 
        sidebarOpen={sidebarOpen}
        createNewConversation={createNewConversation}
      />
      
      <div className="main-container">
        <Sidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen}
          conversations={conversations}
          activeConversation={activeConversation}
          switchConversation={switchConversation}
          deleteConversation={deleteConversation}
          createNewConversation={createNewConversation}
          apiKey={apiKey}
          setApiKey={setApiKey}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          models={MODELS}
        />
        
        <main className={`chat-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <ChatInterface 
            messages={messages} 
            setMessages={setMessages} 
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            apiKey={apiKey}
            selectedModel={selectedModel}
            updateConversation={updateCurrentConversation}
            darkMode={darkMode}
          />
        </main>
      </div>
    </div>
  );
}

export default App; 