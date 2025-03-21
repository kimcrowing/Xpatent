#!/bin/bash

# 部署前端到GitHub Pages
# 执行此脚本前，确保已经配置好了GitHub仓库

# 停止脚本如果命令失败
set -e

# 确保所有依赖都已安装
echo "检查依赖..."
npm install
npm install uuid marked dompurify --save

# 设置生产环境变量
export NODE_ENV=production

# 构建项目
echo "正在构建前端项目..."
npm run build

# 切换到构建输出目录
cd dist

# 创建.nojekyll文件，告诉GitHub Pages这不是一个Jekyll站点
echo "" > .nojekyll

# 添加CNAME文件（如果有自定义域名）
# echo "your-custom-domain.com" > CNAME

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