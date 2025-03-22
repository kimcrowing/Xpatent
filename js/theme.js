document.addEventListener('DOMContentLoaded', () => {
    // 主题切换功能
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const DARK_THEME = 'dark-theme';
    const LIGHT_THEME = 'light-theme';
    const THEME_KEY = 'xpat-preferred-theme';

    // 清除之前的主题设置，强制使用暗色主题作为默认值
    localStorage.setItem(THEME_KEY, DARK_THEME);
    
    // 始终应用暗色主题作为默认主题
    applyTheme(DARK_THEME);
    
    // 只有当themeToggle元素存在时才继续初始化主题切换功能
    if (themeToggle) {
        console.log('找到主题切换按钮，初始化主题切换功能');
        
        // 初始化主题图标
        updateThemeIcon();

        // 为主题切换按钮添加点击事件
        themeToggle.addEventListener('click', () => {
            // 切换主题
            if (body.classList.contains(DARK_THEME)) {
                applyTheme(LIGHT_THEME);
            } else {
                applyTheme(DARK_THEME);
            }

            // 更新主题图标
            updateThemeIcon();
        });
    } else {
        console.log('未找到主题切换按钮 #themeToggle，跳过主题切换功能初始化');
    }

    // 应用主题
    function applyTheme(theme) {
        console.log('应用主题:', theme); // 添加日志以便调试
        
        // 移除所有主题类
        body.classList.remove(DARK_THEME, LIGHT_THEME);
        document.documentElement.classList.remove(DARK_THEME, LIGHT_THEME);
        
        // 添加指定的主题类到body和html根元素
        body.classList.add(theme);
        document.documentElement.classList.add(theme);
        
        // 保存主题偏好到本地存储
        localStorage.setItem(THEME_KEY, theme);
        
        // 添加调试信息
        console.log('应用主题后的body类名:', body.className);
        console.log('应用主题后的html根元素类名:', document.documentElement.className);
        console.log('当前应用的背景色:', getComputedStyle(body).backgroundColor);
        
        // 强制重新应用样式 - 使用RAF确保DOM更新
        requestAnimationFrame(() => {
            // 强制浏览器重排和重绘
            document.body.offsetHeight;
            document.documentElement.style.display = 'none';
            setTimeout(() => {
                document.documentElement.style.display = '';
            }, 5);
        });
    }

    // 更新主题图标
    function updateThemeIcon() {
        // 确保themeToggle元素存在
        if (!themeToggle) {
            console.log('更新主题图标失败：未找到主题切换按钮');
            return;
        }
        
        const themeIcon = themeToggle.querySelector('.theme-icon');
        const themeText = themeToggle.querySelector('span');
        
        // 确保找到了图标和文本元素
        if (!themeIcon) {
            console.log('更新主题图标失败：未找到.theme-icon元素');
            return;
        }
        
        if (!themeText) {
            console.log('更新主题图标失败：未找到span文本元素');
            return;
        }
        
        if (body.classList.contains(DARK_THEME)) {
            // 当前是暗色主题，显示太阳图标（表示可以切换到亮色主题）
            themeIcon.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M12 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M4 12L2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M22 12L20 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M19.7778 4.22266L17.5558 6.25424" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M4.22217 4.22266L6.44418 6.25424" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M6.44434 17.5557L4.22211 19.7779" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M19.7778 19.7773L17.5558 17.5551" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `;
            themeText.textContent = '切换到亮色模式';
        } else {
            // 当前是亮色主题，显示月亮图标（表示可以切换到暗色主题）
            themeIcon.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            themeText.textContent = '切换到暗色模式';
        }
    }
    
    // 添加主题变化检测
    console.log('当前主题:', body.classList.contains(DARK_THEME) ? '暗色' : '亮色');
}); 