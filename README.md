# XPatent AI 对话界面

这是一个模仿高级AI对话界面的网页应用，使用HTML, CSS和JavaScript实现。该项目可以部署在GitHub Pages上，并连接到OpenRouter API进行AI对话。

## 特点

- 优雅的暗色主题界面
- 响应式设计，适配不同设备
- 连接到OpenRouter API进行实时AI对话
- 模拟打字效果和加载状态
- 支持消息格式化，包括代码块、链接等
- 提供消息操作按钮：点赞、复制等

## 使用方法

1. 克隆此仓库
2. 在`js/api.js`文件中设置你的OpenRouter API密钥
3. 部署到GitHub Pages或任何网络服务器

## OpenRouter API密钥设置

为了使用实际的AI对话功能，您需要：

1. 注册[OpenRouter](https://openrouter.ai/)账号并获取API密钥
2. 在`js/api.js`文件中将`OPENROUTER_API_KEY`变量的值替换为您的API密钥

```javascript
const OPENROUTER_API_KEY = '您的OpenRouter API密钥';
```

**注意**：在实际生产环境中，不应该在前端代码中直接包含API密钥。建议使用后端服务来处理API调用。

## 本地开发

您可以使用任何本地HTTP服务器运行此项目，例如：

```bash
# 如果您安装了Node.js，可以使用http-server
npx http-server

# 如果您安装了Python
python -m http.server
```

## 安全注意事项

- 不要在生产环境中直接在前端暴露API密钥
- 考虑使用后端服务或无服务器函数来处理API调用
- 考虑添加用户认证机制以保护API调用

## 自定义

您可以通过编辑以下文件来自定义界面：

- `css/style.css` - 主样式
- `css/dark-theme.css` - 暗色主题
- `js/api.js` - API调用和模型配置

## 许可证

[MIT](LICENSE) 