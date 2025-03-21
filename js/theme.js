document.addEventListener('DOMContentLoaded', () => {
    // 主题切换功能
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const DARK_THEME = 'dark-theme';
    const LIGHT_THEME = 'light-theme';
    const THEME_KEY = 'xpatent-preferred-theme';

    // 检查本地存储中是否有保存的主题偏好
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        applyTheme(savedTheme);
    }

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

    // 应用主题
    function applyTheme(theme) {
        if (theme === DARK_THEME) {
            body.classList.remove(LIGHT_THEME);
            body.classList.add(DARK_THEME);
        } else {
            body.classList.remove(DARK_THEME);
            body.classList.add(LIGHT_THEME);
        }
        // 保存主题偏好到本地存储
        localStorage.setItem(THEME_KEY, theme);
    }

    // 更新主题图标
    function updateThemeIcon() {
        const themeIcon = themeToggle.querySelector('.theme-icon');
        const themeText = themeToggle.querySelector('span');
        
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
}); 