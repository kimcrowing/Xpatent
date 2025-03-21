#!/bin/bash

# 部署前端到GitHub Pages
# 执行此脚本前，确保已经配置好了GitHub仓库

# 停止脚本如果命令失败
set -e

# 确保所有依赖都已安装
echo "检查依赖..."
npm install
npm install uuid marked dompurify cross-env --save

# 设置生产环境变量
export NODE_ENV=production

# 修改package.json的构建脚本
sed -i 's/"build": "vite build"/"build": "cross-env NODE_ENV=production vite build"/g' package.json || echo "无法修改package.json，继续执行..."

# 构建项目
echo "正在构建前端项目..."
npm run build

# 检查是否成功构建
if [ ! -d "dist" ]; then
  echo "构建失败，dist目录不存在"
  exit 1
fi

# 切换到构建输出目录
cd dist

# 创建.nojekyll文件，告诉GitHub Pages这不是一个Jekyll站点
echo "" > .nojekyll

# 添加CNAME文件（如果有自定义域名）
# echo "your-custom-domain.com" > CNAME

# 检查构建后的index.html是否正确
echo "验证构建结果..."
if grep -q "Failed to resolve module specifier" index.html; then
  echo "警告：index.html中可能存在模块解析问题"
fi

# 初始化Git仓库
git init
git add -A
git config --local user.name "Xpatent Deployment Bot"
git config --local user.email "deploy@example.com"
git commit -m 'Deploy to GitHub Pages'

# 推送到远程仓库的gh-pages分支
# 请替换为你的GitHub仓库URL
git push -f https://github.com/kimcrowing/Xpatent.git master:gh-pages

cd -

echo "部署完成！网站将在几分钟内可访问："
echo "https://kimcrowing.github.io/Xpatent/"
echo "如果遇到模块解析问题，请检查浏览器控制台并刷新页面" 