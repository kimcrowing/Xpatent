# Xpatent - AI专利助手

Xpatent是一个基于AI的专利助手应用，帮助用户优化专利文档并提供AI对话支持。

## 功能特点

- 谷歌风格的界面设计
- 专利文档处理与优化
- AI对话支持
- 文件上传与处理
- 多种AI模型选择

## 技术栈

- 前端：Vue 3 + Vite
- 后端：Flask/ASGI
- AI接口：OpenRouter API

## 安装与使用

### 前端

```bash
# 安装依赖
cd frontend
npm install

# 开发环境运行
npm run dev

# 构建生产版本
npm run build
```

### 后端

```bash
# 安装依赖
cd backend
pip install -r requirements.txt

# 运行后端服务
python app.py
```

## 部署

可以使用以下命令将前端部署到GitHub Pages：

```bash
# 确保脚本有执行权限
chmod +x deploy-to-github.sh

# 执行部署脚本
./deploy-to-github.sh
```

## 配置

使用前需要在设置中配置：

1. OpenRouter API密钥
2. 选择合适的AI模型
3. 其他个性化设置

## 贡献

欢迎提交问题和功能请求！

## 许可证

[MIT](LICENSE) 