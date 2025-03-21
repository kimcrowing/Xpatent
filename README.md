# XPatent AI 专利助手

XPatent AI 专利助手是一个专门为专利工作者打造的AI对话界面，基于大型语言模型提供专业的专利相关服务。该项目采用纯前端技术（HTML, CSS和JavaScript）实现，可以轻松部署在GitHub Pages或任何Web服务器上。

## 项目概述

XPatent AI 专利助手集成了OpenRouter API，支持多种大型语言模型，能够帮助用户进行专利查新、专利撰写和专利答审等专业工作。应用采用现代化的UI设计，提供优雅的深色和浅色主题，并支持响应式布局以适配各种设备。

## 主要功能

- **多种专利服务功能**：
  - **专利查新**：提供专利检索策略、相关IPC分类号推荐和相似专利分析
  - **专利撰写**：根据用户输入的技术方案生成专利申请文件结构建议
  - **专利答审**：针对审查意见通知书提供专业的答复建议和修改方案

- **界面与交互**：
  - 优雅的暗色主题界面和亮色主题界面，支持一键切换
  - 响应式设计，完美适配桌面端、平板和移动设备
  - 模拟打字效果和智能加载状态提示
  - 支持消息格式化，自动识别代码块、链接等
  - 消息快捷操作：点赞、复制、重新生成等

- **AI模型与配置**：
  - 支持多种AI模型切换：Deepseek、Claude 3 Haiku、Gemma 7B、Llama 3 8B等
  - 内置智能模拟响应模式，在API不可用时也能正常工作
  - 完善的错误处理机制，提供友好的错误提示

- **数据存储与隐私**：
  - 本地存储用户偏好，包括主题设置、模型选择和活动功能
  - 无需后端服务器，所有数据存储在浏览器本地
  - 支持离线模拟响应模式，保护用户隐私

## 安装与部署

### 快速开始

1. 克隆此仓库
```bash
git clone https://github.com/kimcrowing/Xpatent.git
cd Xpatent
```

2. 使用任何HTTP服务器启动项目
```bash
# 使用Node.js的http-server
npx http-server

# 或使用Python内置HTTP服务器
python -m http.server
```

3. 在浏览器中访问 `http://localhost:8080` 即可使用

### GitHub Pages部署

1. Fork此仓库到您的GitHub账号
2. 在仓库设置中启用GitHub Pages，选择`grok-ui`分支作为源
3. 几分钟后，您的应用将可通过 `https://<您的用户名>.github.io/Xpatent` 访问

## 专利功能使用说明

### 专利查新功能

专利查新功能帮助用户快速获取专利检索策略和相关专利信息：

1. 点击导航栏右侧的菜单图标，选择"专利查新"
2. 在输入框中描述您需要查新的技术领域或关键词
3. 系统将分析您的输入，并提供以下信息：
   - 关键词组合及同义词扩展建议
   - 可能相关的IPC分类号
   - 相似专利案例及其技术方案
   - 专业的检索建议和数据库推荐

### 专利撰写功能

专利撰写功能帮助用户快速生成专利申请文件的框架：

1. 点击导航栏右侧的菜单图标，选择"专利撰写"
2. 详细描述您的发明或技术方案
3. 系统将为您生成包含以下内容的建议：
   - 权利要求书草稿结构
   - 说明书各章节内容提示
   - 撰写重点和注意事项

### 专利答审功能

专利答审功能帮助用户撰写审查意见答复：

1. 点击导航栏右侧的菜单图标，选择"专利答审"
2. 粘贴审查意见通知书内容
3. 系统将提供专业的答复策略，包括：
   - 针对创造性问题的论述思路
   - 权利要求修改建议
   - 说明书补正方案
   - 与对比文件的区别分析

## 配置说明

### OpenRouter API配置

项目默认集成了OpenRouter API，支持多种大型语言模型：

1. 默认已配置API密钥，可直接使用
2. 如需使用自己的API密钥，请在`js/api.js`文件中修改：

```javascript
const OPENROUTER_API_KEY = '您的OpenRouter API密钥';
```

3. 如API调用出现问题，应用将自动切换到模拟响应模式，并显示相应错误提示

### 自定义模型

您可以在`js/modelSelector.js`中自定义支持的模型列表：

```javascript
const models = [
    { id: 'deepseek/deepseek-r1:free', name: 'Deepseek', free: true },
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', free: false },
    // 添加更多模型...
];
```

## 界面自定义

XPatent AI专利助手提供了丰富的自定义选项：

- `css/style.css` - 主要样式定义
- `css/dark-theme.css` - 暗色主题设置
- `css/light-theme.css` - 亮色主题设置
- `js/theme.js` - 主题切换逻辑
- `js/featureMenu.js` - 专利功能菜单配置
- `js/api.js` - API调用和模拟响应逻辑

## 技术实现

XPatent AI专利助手采用纯前端技术实现，主要包括：

- **前端基础**：HTML5, CSS3, JavaScript (ES6+)
- **API集成**：OpenRouter API连接多种大型语言模型
- **本地存储**：localStorage保存用户偏好和设置
- **响应式设计**：适配各种设备尺寸
- **错误处理**：完善的错误处理机制和优雅降级策略

## 安全注意事项

- 应用默认在前端存储API密钥，在生产环境中建议使用后端API代理
- 考虑添加用户认证机制以保护您的API密钥和使用额度
- 定期更新API密钥以提高安全性

## 贡献指南

欢迎对XPatent AI专利助手项目做出贡献：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m '添加了一些很棒的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交Pull Request

## 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 联系方式

如有问题或建议，请通过GitHub Issues或直接联系项目维护者。

---

**注意**：XPatent AI专利助手仅提供专利相关的建议和辅助，不能替代专业专利代理人的工作。在实际专利申请和答复过程中，请务必咨询专业人士。 