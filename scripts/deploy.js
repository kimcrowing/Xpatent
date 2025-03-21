const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 设置颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

// 日志辅助函数
const log = {
  info: (msg) => console.log(`${colors.bright}${colors.green}INFO:${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.bright}${colors.yellow}WARN:${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.bright}${colors.red}ERROR:${colors.reset} ${msg}`),
};

// 获取项目根目录
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// 执行命令并记录输出
function execute(command, options = {}) {
  log.info(`执行命令: ${command}`);
  try {
    return execSync(command, {
      stdio: 'inherit',
      cwd: options.cwd || rootDir,
      env: { ...process.env, ...options.env },
    });
  } catch (error) {
    log.error(`命令执行失败: ${error.message}`);
    throw error;
  }
}

// 主函数
async function deploy() {
  try {
    // 清理之前的构建
    log.info('清理之前的构建...');
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }

    // 安装依赖
    log.info('安装依赖...');
    execute('npm install');
    execute('npm install uuid marked dompurify cross-env --save');

    // 构建项目
    log.info('构建项目...');
    execute('npm run build', {
      env: { NODE_ENV: 'production' },
    });

    // 检查构建结果
    if (!fs.existsSync(distDir)) {
      log.error('构建失败，dist目录不存在');
      process.exit(1);
    }

    // 切换到dist目录并进行Git操作
    log.info('准备Git仓库...');
    
    // 创建.nojekyll文件
    fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
    
    // 创建README.md
    const readmeContent = `# Xpatent - AI专利助手

这是Xpatent应用的GitHub Pages部署版本。

## 网站访问

访问地址：[https://kimcrowing.github.io/Xpatent/](https://kimcrowing.github.io/Xpatent/)

## 关于Xpatent

Xpatent是一个基于AI的专利助手应用，帮助用户优化专利文档并提供AI对话支持。

### 功能特点

- 谷歌风格的界面设计
- 专利文档处理与优化
- AI对话支持
- 文件上传与处理
- 多种AI模型选择

### 技术栈

- 前端：Vue 3 + Vite
- 后端：Flask/ASGI
- AI接口：OpenRouter API

## 源代码

查看源代码库：[https://github.com/kimcrowing/Xpatent](https://github.com/kimcrowing/Xpatent)`;
    fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);

    // 执行Git命令
    execute('git init', { cwd: distDir });
    execute('git add -A', { cwd: distDir });
    execute('git config --local user.name "Xpatent Deployment Bot"', { cwd: distDir });
    execute('git config --local user.email "deploy@example.com"', { cwd: distDir });
    execute('git commit -m "Deploy to GitHub Pages"', { cwd: distDir });
    
    // 推送到GitHub
    log.info('推送到GitHub Pages...');
    execute('git push -f https://github.com/kimcrowing/Xpatent.git master:gh-pages', { cwd: distDir });

    log.info('部署完成！');
    log.info('网站将在几分钟内可访问：https://kimcrowing.github.io/Xpatent/');
  } catch (error) {
    log.error(`部署过程中发生错误: ${error.message}`);
    process.exit(1);
  }
}

// 执行部署
deploy(); 