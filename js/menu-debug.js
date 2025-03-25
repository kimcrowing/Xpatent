console.log('开始调试下拉菜单显示问题...');

// 在DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  console.log('菜单调试脚本已加载');
  
  // 等待页面完全加载，以确保菜单元素已加载
  setTimeout(function() {
    // 获取相关元素
    const userMenuBtn = document.getElementById('userMenuBtn');
    const languageBtn = document.getElementById('languageBtn');
    const userMenu = document.getElementById('userMenu');
    const languageMenu = document.getElementById('languageMenu');
    
    console.log('菜单元素状态:', {
      userMenuBtn: userMenuBtn ? '已找到' : '未找到',
      languageBtn: languageBtn ? '已找到' : '未找到',
      userMenu: userMenu ? '已找到' : '未找到',
      languageMenu: languageMenu ? '已找到' : '未找到'
    });

    // 添加强制CSS样式到head，确保菜单可见
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* 强制显示样式 */
      .user-menu.active, .language-menu.active {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        z-index: 999999 !important;
        pointer-events: auto !important;
        overflow: visible !important;
        position: absolute !important;
        clip: auto !important;
        clip-path: none !important;
        width: auto !important;
        height: auto !important;
      }
      
      .user-menu.active {
        top: 50px !important;
        right: 5px !important;
      }
      
      .language-menu.active {
        top: 50px !important;
        right: 55px !important;
      }
      
      /* 确保头部在正确的层级 */
      header.navbar {
        position: relative !important;
        z-index: 1000 !important;
      }
      
      /* 确保菜单触发按钮正常工作 */
      .user-btn, .language-btn {
        position: relative !important;
        z-index: 1001 !important;
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(styleEl);
    console.log('已添加强制菜单样式');

    // 强制修复所有菜单 
    function forceFixMenus() {
      console.log('执行菜单强制修复...');
      
      // 确保菜单存在于DOM中
      const header = document.querySelector('header');
      
      // 用户菜单强制修复
      if (userMenu) {
        userMenu.style.cssText = 'position: absolute !important; top: 50px !important; right: 5px !important; z-index: 999999 !important; display: none;';
        // 将菜单重新添加到头部，确保位置正确
        if (header && !header.contains(userMenu)) {
          header.appendChild(userMenu);
          console.log('用户菜单已重新附加到header');
        }
      }
      
      // 语言菜单强制修复
      if (languageMenu) {
        languageMenu.style.cssText = 'position: absolute !important; top: 50px !important; right: 55px !important; z-index: 999999 !important; display: none;';
        // 将菜单重新添加到头部，确保位置正确
        if (header && !header.contains(languageMenu)) {
          header.appendChild(languageMenu);
          console.log('语言菜单已重新附加到header');
        }
      }
      
      // 重新绑定点击事件 - 直接绕过原有事件处理器
      if (userMenuBtn) {
        // 移除之前的事件监听器
        const newUserMenuBtn = userMenuBtn.cloneNode(true);
        userMenuBtn.parentNode.replaceChild(newUserMenuBtn, userMenuBtn);
        
        // 添加新的事件监听器
        newUserMenuBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          console.log('用户菜单按钮点击 - 直接处理');
          
          // 关闭其他菜单
          if (languageMenu && languageMenu.classList.contains('active')) {
            languageMenu.classList.remove('active');
            languageMenu.style.display = 'none';
          }
          
          // 切换用户菜单
          if (userMenu) {
            const isActive = userMenu.classList.contains('active');
            if (isActive) {
              userMenu.classList.remove('active');
              userMenu.style.display = 'none';
            } else {
              userMenu.classList.add('active');
              userMenu.style.display = 'block';
              userMenu.style.visibility = 'visible';
              userMenu.style.opacity = '1';
            }
          }
        });
      }
      
      if (languageBtn) {
        // 移除之前的事件监听器
        const newLanguageBtn = languageBtn.cloneNode(true);
        languageBtn.parentNode.replaceChild(newLanguageBtn, languageBtn);
        
        // 添加新的事件监听器
        newLanguageBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          console.log('语言菜单按钮点击 - 直接处理');
          
          // 关闭其他菜单
          if (userMenu && userMenu.classList.contains('active')) {
            userMenu.classList.remove('active');
            userMenu.style.display = 'none';
          }
          
          // 切换语言菜单
          if (languageMenu) {
            const isActive = languageMenu.classList.contains('active');
            if (isActive) {
              languageMenu.classList.remove('active');
              languageMenu.style.display = 'none';
            } else {
              languageMenu.classList.add('active');
              languageMenu.style.display = 'block';
              languageMenu.style.visibility = 'visible';
              languageMenu.style.opacity = '1';
            }
          }
        });
      }
      
      // 点击其他区域关闭菜单
      document.addEventListener('click', function() {
        if (userMenu && userMenu.classList.contains('active')) {
          userMenu.classList.remove('active');
          userMenu.style.display = 'none';
        }
        
        if (languageMenu && languageMenu.classList.contains('active')) {
          languageMenu.classList.remove('active');
          languageMenu.style.display = 'none';
        }
      });
      
      console.log('菜单强制修复完成');
    }
    
    // 添加Alt+F快捷键来激活菜单修复
    document.addEventListener('keydown', function(e) {
      // Alt+F 强制修复菜单
      if (e.altKey && e.key.toLowerCase() === 'f') {
        console.log('检测到Alt+F快捷键，执行菜单强制修复');
        forceFixMenus();
        alert('已执行菜单强制修复！请再次尝试点击菜单按钮。');
      }
      
      // Alt+U 强制显示用户菜单
      if (e.altKey && e.key.toLowerCase() === 'u') {
        if (userMenu) {
          userMenu.classList.add('active');
          userMenu.style.display = 'block';
          userMenu.style.visibility = 'visible';
          userMenu.style.opacity = '1';
          alert('已强制显示用户菜单！');
        }
      }
      
      // Alt+L 强制显示语言菜单
      if (e.altKey && e.key.toLowerCase() === 'l') {
        if (languageMenu) {
          languageMenu.classList.add('active');
          languageMenu.style.display = 'block';
          languageMenu.style.visibility = 'visible'; 
          languageMenu.style.opacity = '1';
          alert('已强制显示语言菜单！');
        }
      }
    });
    
    // 初始执行一次菜单修复
    forceFixMenus();
    
  }, 500);
  
  // 全局监听点击事件，检查菜单状态
  document.addEventListener('click', function(e) {
    setTimeout(function() {
      const userMenu = document.getElementById('userMenu');
      const languageMenu = document.getElementById('languageMenu');
      
      const userMenuActive = userMenu && userMenu.classList.contains('active');
      const languageMenuActive = languageMenu && languageMenu.classList.contains('active');
      
      console.log('点击事件后菜单状态:', {
        userMenu: userMenuActive ? '激活' : '未激活',
        userMenuDisplay: userMenu ? window.getComputedStyle(userMenu).display : 'N/A',
        languageMenu: languageMenuActive ? '激活' : '未激活',
        languageMenuDisplay: languageMenu ? window.getComputedStyle(languageMenu).display : 'N/A'
      });
      
      // 检测并修复可能的样式问题
      if (userMenuActive && userMenu && window.getComputedStyle(userMenu).display === 'none') {
        userMenu.style.display = 'block';
        console.log('已修复用户菜单显示');
      }
      
      if (languageMenuActive && languageMenu && window.getComputedStyle(languageMenu).display === 'none') {
        languageMenu.style.display = 'block';
        console.log('已修复语言菜单显示');
      }
    }, 100);
  }, true);
  
  // 添加页面扫描函数，检查可能干扰菜单显示的元素
  function scanPageForOverlappingElements() {
    console.log('扫描页面元素寻找潜在干扰项...');
    
    const userMenu = document.getElementById('userMenu');
    const languageMenu = document.getElementById('languageMenu');
    
    // 检查从body开始的所有元素
    const allElements = document.querySelectorAll('body *');
    const problematicElements = [];
    
    allElements.forEach(el => {
      if (el === userMenu || el === languageMenu || 
          userMenu?.contains(el) || languageMenu?.contains(el)) {
        return; // 跳过菜单自身及其子元素
      }
      
      const style = window.getComputedStyle(el);
      
      // 检查是否有绝对/固定定位且z-index高的元素
      if ((style.position === 'absolute' || style.position === 'fixed') && 
          style.zIndex !== 'auto' && parseInt(style.zIndex) >= 5000) {
        
        // 检查元素位置是否可能与菜单重叠
        const rect = el.getBoundingClientRect();
        
        // 简单检查区域重叠
        const overlapUser = userMenu && 
                           rect.right > userMenu.getBoundingClientRect().left &&
                           rect.left < userMenu.getBoundingClientRect().right &&
                           rect.bottom > userMenu.getBoundingClientRect().top &&
                           rect.top < userMenu.getBoundingClientRect().bottom;
                           
        const overlapLang = languageMenu && 
                           rect.right > languageMenu.getBoundingClientRect().left &&
                           rect.left < languageMenu.getBoundingClientRect().right &&
                           rect.bottom > languageMenu.getBoundingClientRect().top &&
                           rect.top < languageMenu.getBoundingClientRect().bottom;
        
        if (overlapUser || overlapLang) {
          problematicElements.push({
            element: el,
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            position: style.position,
            zIndex: style.zIndex,
            display: style.display,
            visibility: style.visibility,
            overlapsUserMenu: overlapUser,
            overlapsLanguageMenu: overlapLang
          });
        }
      }
    });
    
    if (problematicElements.length > 0) {
      console.log('发现可能干扰菜单显示的元素:', problematicElements);
      
      // 尝试强制修复z-index问题
      problematicElements.forEach(info => {
        const el = info.element;
        if (el.style.zIndex && parseInt(el.style.zIndex) > 5000) {
          console.log(`将元素 ${el.tagName}#${el.id}.${el.className} 的z-index从 ${el.style.zIndex} 降低到 100`);
          el.style.zIndex = '100';
        }
      });
      
      return problematicElements;
    } else {
      console.log('未发现干扰菜单显示的元素');
      return [];
    }
  }
  
  // 启动时执行一次页面扫描
  setTimeout(() => {
    scanPageForOverlappingElements();
  }, 1000);
  
  // 每次用户点击菜单按钮时扫描
  const userMenuBtn = document.getElementById('userMenuBtn');
  const languageBtn = document.getElementById('languageBtn');
  
  userMenuBtn?.addEventListener('click', () => {
    setTimeout(() => {
      scanPageForOverlappingElements();
    }, 200);
  });
  
  languageBtn?.addEventListener('click', () => {
    setTimeout(() => {
      scanPageForOverlappingElements();
    }, 200);
  });
  
  console.log('调试脚本初始化完成');
});
