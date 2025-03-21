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

// 添加.htaccess文件以确保MIME类型正确
function createHtaccess() {
  const htaccessContent = `
# 确保正确的MIME类型
<IfModule mod_mime.c>
  AddType text/javascript .js
  AddType text/javascript .mjs
  AddType application/javascript .js .mjs
  AddType text/css .css
</IfModule>

# 添加CORS头
<IfModule mod_headers.c>
  <FilesMatch "\.(js|mjs|css|json|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|webp)$">
    Header set Access-Control-Allow-Origin "*"
  </FilesMatch>
</IfModule>

# 使用HTML5 history模式的SPA需要重写URL
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /Xpatent/
  
  # 如果请求的文件或目录不存在
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # 重写所有请求到index.html
  RewriteRule ^ index.html [L]
</IfModule>
`;

  fs.writeFileSync(path.join(distDir, '.htaccess'), htaccessContent);
  log.info('已创建.htaccess文件以确保正确的MIME类型和URL重写');
}

// 添加web.config文件为Windows/IIS服务器
function createWebConfig() {
  const webConfigContent = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
      <remove fileExtension=".js" />
      <mimeMap fileExtension=".js" mimeType="text/javascript" />
    </staticContent>
    <rewrite>
      <rules>
        <rule name="SPA_Fallback" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.html" />
        </rule>
      </rules>
    </rewrite>
    <httpProtocol>
      <customHeaders>
        <add name="Access-Control-Allow-Origin" value="*" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>`;

  fs.writeFileSync(path.join(distDir, 'web.config'), webConfigContent);
  log.info('已创建web.config文件为Windows/IIS服务器配置');
}

// 检查并修复构建后的HTML文件中的导入映射
function checkAndFixImportMap() {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    log.error('index.html文件不存在');
    return;
  }

  let content = fs.readFileSync(indexPath, 'utf8');

  // 检查是否存在模块解析问题
  const hasModuleResolutionIssue = content.includes('Failed to resolve module specifier');
  if (hasModuleResolutionIssue) {
    log.warn('检测到模块解析问题，正在修复...');
    
    // 确保importmap被保留并正确配置
    if (!content.includes('type="importmap"')) {
      const importMapScript = `
  <script type="importmap">
    {
      "imports": {
        "vue": "https://unpkg.com/vue@3.2.47/dist/vue.esm-browser.prod.js",
        "vue-router": "https://unpkg.com/vue-router@4.1.6/dist/vue-router.esm-browser.js",
        "pinia": "https://unpkg.com/pinia@2.1.6/dist/pinia.esm-browser.js",
        "uuid": "https://unpkg.com/uuid@11.1.0/dist/esm-browser/index.js",
        "marked": "https://unpkg.com/marked@9.1.6/lib/marked.esm.js",
        "dompurify": "https://unpkg.com/dompurify@3.2.4/dist/purify.es.js"
      }
    }
  </script>`;
      
      // 在头部结束前插入importmap
      content = content.replace('</head>', `${importMapScript}\n</head>`);
      fs.writeFileSync(indexPath, content);
      log.info('已添加importmap到index.html');
    }
  }

  // 确保预加载和DNS预解析存在
  if (!content.includes('rel="preconnect"')) {
    const preconnect = `
  <link rel="preconnect" href="https://unpkg.com" crossorigin>
  <link rel="dns-prefetch" href="https://unpkg.com">`;
    
    // 在meta标签后插入
    content = content.replace('</title>', `</title>${preconnect}`);
    fs.writeFileSync(indexPath, content);
    log.info('已添加预连接和DNS预解析到index.html');
  }

  log.info('index.html检查和修复完成');
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

    // 检查和修复构建后的HTML文件
    checkAndFixImportMap();
    
    // 创建服务器配置文件以确保正确的MIME类型
    createHtaccess();
    createWebConfig();

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
    log.info('如果仍然遇到问题，请清除浏览器缓存或使用隐私模式访问');
  } catch (error) {
    log.error(`部署过程中发生错误: ${error.message}`);
    process.exit(1);
  }
}

// 执行部署
deploy(); 