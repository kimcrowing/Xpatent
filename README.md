# 克隆

一个类似的AI聊天网站，使用React和API构建。该项目旨在提供类似Grok的用户界面，同时支持多种大型语言模型进行聊天对话。

## 功能特点

- 类Grok的现代UI界面
- 暗色/亮色主题切换
- 对话历史保存
- 支持多种AI模型选择（默认使用DeepSeek R1免费模型）
- 流式响应显示
- 支持Markdown格式输出
- 响应式设计，适配移动和桌面设备
- 预配置 API密钥，可直接使用

## 技术栈

- React 18
- GitHub Pages (用于部署)

## 本地开发

要在本地运行项目，请执行以下步骤：

1. 克隆仓库

```bash
git clone https://github.com/你的用户名/grok-clone.git
cd grok-clone
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm start
```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## API密钥说明

应用已预配置了一个OpenRouter API密钥，可以直接使用。如果您想使用自己的API密钥：

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册并创建API密钥
3. 在应用的侧边栏设置中替换API密钥

## DeepSeek R1免费模型

默认情况下，应用使用DeepSeek R1的免费模型。这是一个功能强大的开源模型，对于普通查询和对话非常有效。使用免费模型时请注意以下限制：

- 免费用户限制为每分钟20个请求
- 每天限制为200个请求

## 部署到GitHub Pages

1. 设置您的GitHub仓库

```bash
git init
git add .
git commit -m "初始提交"
git remote add origin https://github.com/你的用户名/grok-clone.git
git push -u origin master
```

2. 部署到GitHub Pages

```bash
npm run deploy
```

## 许可证

MIT 
