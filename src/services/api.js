import axios from 'axios';

const API_URL = 'https://openrouter.ai/api/v1';

export const sendMessage = async (messages, model, apiKey) => {
  if (!apiKey) {
    throw new Error('请提供OpenRouter API密钥');
  }
  
  try {
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'Grok克隆',
      },
      body: JSON.stringify({
        model: model.id,
        messages: messages,
        stream: true
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '请求失败');
    }
    
    return response.body;
  } catch (error) {
    console.error('API调用错误:', error);
    throw error;
  }
};

export const getModels = async (apiKey) => {
  if (!apiKey) {
    throw new Error('请提供OpenRouter API密钥');
  }
  
  try {
    const response = await axios.get(
      `${API_URL}/models`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.href,
          'X-Title': 'Grok克隆'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('获取模型列表失败:', error);
    throw error;
  }
}; 