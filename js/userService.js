/**
 * 用户服务 - 提供用户资料和API密钥管理功能
 * 预留后端接口，目前使用本地存储模拟
 */

// 用户服务对象
const UserService = (function() {
    // 私有变量，模拟数据库
    let _userData = {
        userId: 'user_' + Date.now(),
        displayName: '默认用户',
        email: '',
        avatar: null,
        role: 'user',
        settings: {
            theme: 'dark',
            language: 'zh-CN',
            notifications: true
        },
        subscription: {
            plan: 'free',
            validUntil: null,
            features: {}
        },
        apiKeys: {
            openrouter: {
                key: '',
                active: false,
                lastUsed: null,
                usage: {
                    total: 0,
                    lastMonth: 0
                }
            },
            openai: {
                key: '',
                active: false,
                lastUsed: null,
                usage: {
                    total: 0,
                    lastMonth: 0
                }
            },
            anthropic: {
                key: '',
                active: false,
                lastUsed: null,
                usage: {
                    total: 0,
                    lastMonth: 0
                }
            }
        }
    };
    
    // 本地存储键名
    const STORAGE_KEY = 'xpatent_user_data';
    
    // 加载用户数据
    const _loadUserData = function() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                _userData = JSON.parse(savedData);
                console.log('已从本地存储加载用户数据');
            }
        } catch (error) {
            console.error('加载用户数据失败:', error);
        }
    };
    
    // 保存用户数据
    const _saveUserData = function() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_userData));
            return true;
        } catch (error) {
            console.error('保存用户数据失败:', error);
            return false;
        }
    };
    
    // 遮蔽API密钥，只显示前几位和后几位
    const _maskApiKey = function(key, visibleStart = 5, visibleEnd = 4) {
        if (!key || key.length < (visibleStart + visibleEnd)) {
            return '';
        }
        
        const start = key.substring(0, visibleStart);
        const end = key.substring(key.length - visibleEnd);
        const masked = '*'.repeat(Math.min(10, key.length - visibleStart - visibleEnd));
        
        return `${start}${masked}${end}`;
    };
    
    // 公共API
    return {
        // 初始化
        init: function() {
            _loadUserData();
            console.log('用户服务已加载');
            return Promise.resolve();
        },
        
        // 用户资料相关
        getUserProfile: function() {
            // 预留API接口，模拟异步操作
            return new Promise((resolve) => {
                setTimeout(() => {
                    const profile = {
                        userId: _userData.userId,
                        displayName: _userData.displayName,
                        email: _userData.email,
                        avatar: _userData.avatar,
                        role: _userData.role,
                        settings: _userData.settings
                    };
                    resolve(profile);
                }, 100);
            });
        },
        
        updateUserProfile: function(profileData) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        // 更新用户资料
                        if (profileData.displayName !== undefined) {
                            _userData.displayName = profileData.displayName;
                        }
                        
                        if (profileData.email !== undefined) {
                            _userData.email = profileData.email;
                        }
                        
                        if (profileData.avatar !== undefined) {
                            _userData.avatar = profileData.avatar;
                        }
                        
                        // 更新用户设置
                        if (profileData.settings) {
                            _userData.settings = {
                                ..._userData.settings,
                                ...profileData.settings
                            };
                        }
                        
                        // 保存到本地存储
                        if (_saveUserData()) {
                            resolve({success: true});
                        } else {
                            reject(new Error('保存用户资料失败'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                }, 200);
            });
        },
        
        // API密钥相关
        getApiKeys: function() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // 返回带有遮蔽的API密钥
                    const maskedKeys = {};
                    
                    Object.keys(_userData.apiKeys).forEach(provider => {
                        const keyData = _userData.apiKeys[provider];
                        maskedKeys[provider] = {
                            key: keyData.key ? _maskApiKey(keyData.key) : '',
                            active: keyData.active,
                            lastUsed: keyData.lastUsed,
                            usage: keyData.usage
                        };
                    });
                    
                    resolve(maskedKeys);
                }, 100);
            });
        },
        
        updateApiKey: function(provider, key, active = true) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        if (!_userData.apiKeys[provider]) {
                            _userData.apiKeys[provider] = {
                                key: '',
                                active: false,
                                lastUsed: null,
                                usage: {
                                    total: 0,
                                    lastMonth: 0
                                }
                            };
                        }
                        
                        _userData.apiKeys[provider].key = key;
                        _userData.apiKeys[provider].active = active;
                        
                        if (_saveUserData()) {
                            resolve({success: true});
                        } else {
                            reject(new Error(`更新 ${provider} API密钥失败`));
                        }
                    } catch (error) {
                        reject(error);
                    }
                }, 200);
            });
        },
        
        deleteApiKey: function(provider) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        if (_userData.apiKeys[provider]) {
                            _userData.apiKeys[provider].key = '';
                            _userData.apiKeys[provider].active = false;
                            
                            if (_saveUserData()) {
                                resolve({success: true});
                            } else {
                                reject(new Error(`删除 ${provider} API密钥失败`));
                            }
                        } else {
                            resolve({success: true, message: 'API密钥不存在'});
                        }
                    } catch (error) {
                        reject(error);
                    }
                }, 200);
            });
        },
        
        setApiKeyStatus: function(provider, active) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        if (_userData.apiKeys[provider]) {
                            _userData.apiKeys[provider].active = active;
                            
                            if (_saveUserData()) {
                                resolve({success: true});
                            } else {
                                reject(new Error(`更新 ${provider} API密钥状态失败`));
                            }
                        } else {
                            reject(new Error(`API密钥 ${provider} 不存在`));
                        }
                    } catch (error) {
                        reject(error);
                    }
                }, 200);
            });
        },
        
        // 记录API密钥使用情况
        logApiKeyUsage: function(provider, tokens) {
            if (_userData.apiKeys[provider]) {
                _userData.apiKeys[provider].lastUsed = new Date().toISOString();
                _userData.apiKeys[provider].usage.total += tokens;
                _userData.apiKeys[provider].usage.lastMonth += tokens;
                
                _saveUserData();
            }
        },
        
        // 用户登录/退出
        login: function(credentials) {
            // 预留后端接口
            return new Promise((resolve) => {
                setTimeout(() => {
                    // 模拟成功登录
                    resolve({
                        success: true,
                        message: '登录成功',
                        user: {
                            displayName: _userData.displayName,
                            email: _userData.email,
                            role: _userData.role
                        }
                    });
                }, 500);
            });
        },
        
        logout: function() {
            // 预留后端接口
            return new Promise((resolve) => {
                setTimeout(() => {
                    // 模拟退出登录
                    resolve({success: true, message: '已退出登录'});
                }, 300);
            });
        },
        
        // 检查是否已登录
        isLoggedIn: function() {
            // 预留后端接口
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true); // 本地版本始终返回已登录
                }, 100);
            });
        }
    };
})();

// 初始化并暴露为全局对象
window.UserService = UserService;
document.addEventListener('DOMContentLoaded', function() {
    UserService.init();
}); 