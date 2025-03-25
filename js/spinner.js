// 加载动画管理器
window.spinnerManager = {
    show: function(message = '加载中...') {
        // 创建或获取加载动画容器
        let spinner = document.getElementById('globalSpinner');
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'globalSpinner';
            spinner.className = 'spinner-container';
            spinner.innerHTML = `
                <div class="spinner-overlay"></div>
                <div class="spinner-content">
                    <div class="spinner"></div>
                    <div class="spinner-message">${message}</div>
                </div>
            `;
            document.body.appendChild(spinner);
        }
        spinner.style.display = 'flex';
    },
    
    hide: function() {
        const spinner = document.getElementById('globalSpinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    },
    
    updateMessage: function(message) {
        const messageEl = document.querySelector('#globalSpinner .spinner-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
    }
}; 