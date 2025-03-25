// 文件上传管理器
document.addEventListener('DOMContentLoaded', function() {
    const fileUpload = document.getElementById('fileUpload');
    const attachButton = document.getElementById('attachButton');
    const attachmentInfo = document.getElementById('attachmentInfo');
    const fileName = document.getElementById('fileName');
    const removeAttachment = document.getElementById('removeAttachment');
    
    // 文件类型和对应的处理函数
    const fileHandlers = {
        'application/pdf': handlePdfFile,
        'application/msword': handleWordFile,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': handleWordFile
    };
    
    if (attachButton) {
        attachButton.addEventListener('click', function() {
            fileUpload.click();
        });
    }
    
    if (fileUpload) {
        fileUpload.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) { // 10MB限制
                    alert('文件大小不能超过10MB');
                    fileUpload.value = '';
                    return;
                }
                
                fileName.textContent = file.name;
                attachmentInfo.style.display = 'flex';
                
                // 显示加载动画
                window.spinnerManager && window.spinnerManager.show('正在分析文件内容...');
                
                try {
                    // 根据文件类型选择处理函数
                    const handler = fileHandlers[file.type];
                    if (handler) {
                        const content = await handler(file);
                        analyzeContent(content);
                    } else {
                        console.error('不支持的文件类型:', file.type);
                        alert('不支持的文件类型，请上传PDF或Word文档');
                    }
                } catch (error) {
                    console.error('文件处理失败:', error);
                    alert('文件处理失败，请重试');
                } finally {
                    window.spinnerManager && window.spinnerManager.hide();
                }
            }
        });
    }
    
    if (removeAttachment) {
        removeAttachment.addEventListener('click', function() {
            fileUpload.value = '';
            attachmentInfo.style.display = 'none';
        });
    }
    
    // 处理PDF文件
    async function handlePdfFile(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let content = '';
        
        // 记录处理进度
        console.log(`开始处理PDF文件，共${pdf.numPages}页`);
        
        for (let i = 1; i <= pdf.numPages; i++) {
            window.spinnerManager && window.spinnerManager.updateMessage(`正在处理第${i}/${pdf.numPages}页...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            content += textContent.items.map(item => item.str).join(' ') + '\n';
        }
        
        console.log(`PDF处理完成，提取文本长度: ${content.length}字符`);
        return content;
    }
    
    // 处理Word文件
    async function handleWordFile(file) {
        console.log('开始处理Word文件');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        console.log(`Word处理完成，提取文本长度: ${result.value.length}字符`);
        return result.value;
    }
    
    // 分析文件内容
    function analyzeContent(content) {
        console.log('开始分析文件内容...');
        
        // 根据README说明调整技术领域关键词映射
        const techFields = {
            '电子/通信/计算机技术': [
                '电路', '芯片', '算法', '处理器', 'CPU', 'GPU', '通信', '网络', '计算机', 
                '存储', '数据库', '软件', '编程', '5G', '无线', '基站', '信号', 'RFID',
                '人工智能', '深度学习', '神经网络', '自然语言', '机器学习', 'AI', 
                '大数据', '云计算', '边缘计算', '区块链', '操作系统', '集成电路', 'FPGA',
                'ASIC', 'DSP', 'MCU', 'SoC', '存储器', '缓存', '总线', '接口', '协议',
                '编码', '解码', '调制', '解调', '天线', '滤波器', '放大器', '振荡器',
                '时钟', '定时器', '中断', 'DMA', 'I2C', 'SPI', 'UART', 'USB', '以太网',
                '路由器', '交换机', '网关', '防火墙', '加密', '解密', '认证', '授权',
                '虚拟化', '容器', '微服务', 'API', 'SDK', '固件', '驱动', '中间件'
            ],
            '机械/结构工程': [
                '机械', '结构', '装置', '设备', '机构', '传动', '轴承', '齿轮', '阀门',
                '液压', '气动', '执行器', '传感器', '控制系统', '组件', '紧固件', '支架',
                '框架', '外壳', '底座', '铰链', '连杆', '管道', '连接', '焊接', '铸造',
                '机床', '刀具', '夹具', '模具', '冲压', '锻造', '热处理', '表面处理',
                '密封', '润滑', '减震', '隔振', '联轴器', '离合器', '制动器', '减速器',
                '凸轮', '曲轴', '活塞', '气缸', '泵', '压缩机', '风机', '涡轮', '叶轮',
                '轴承座', '轴承盖', '轴套', '轴瓦', '键', '销', '螺栓', '螺母', '垫圈',
                '弹簧', '密封圈', 'O型圈', '油封', '垫片', '挡圈', '定位销', '定位套'
            ],
            '材料/化学': [
                '材料', '化学', '聚合物', '合金', '塑料', '金属', '陶瓷', '涂层', '复合材料',
                '纳米材料', '高分子', '化合物', '反应', '催化剂', '溶液', '电极', '无机物',
                '有机物', '表面处理', '粘合剂', '腐蚀', '晶体', '纤维', '薄膜', '涂料',
                '钢', '铁', '铝', '铜', '钛', '镍', '锌', '镁', '钨', '钼', '铬', '锰',
                '碳钢', '不锈钢', '工具钢', '高速钢', '硬质合金', '超导材料', '形状记忆合金',
                '玻璃', '水泥', '混凝土', '石墨', '碳纤维', '芳纶', '聚酯', '环氧树脂',
                '聚氨酯', '硅胶', '橡胶', '聚丙烯', '聚乙烯', '聚氯乙烯', '聚苯乙烯',
                '电镀', '喷涂', '热喷涂', '化学镀', '阳极氧化', '磷化', '钝化', '渗碳'
            ],
            '医药技术': [
                '药物', '治疗', '诊断', '医疗', '临床', '医疗器械', '疫苗', '药剂', 
                '配方', '生物标志物', '检测', '监测', '植入物', '手术', '疗法', '病症',
                '处方', '制剂', '药效', '副作用', '给药', '剂量', '疗程', '康复',
                '片剂', '胶囊', '注射剂', '口服液', '滴剂', '喷雾剂', '贴剂', '栓剂',
                '缓释', '控释', '靶向', '纳米', '微球', '脂质体', '透皮', '吸入',
                '血压计', '血糖仪', '心电图', 'B超', 'CT', 'MRI', 'X光', '内窥镜',
                '手术刀', '缝合线', '支架', '导管', '起搏器', '除颤器', '呼吸机', '透析机',
                '麻醉', '镇痛', '消炎', '抗菌', '抗病毒', '抗肿瘤', '免疫调节', '激素'
            ],
            '生物技术': [
                '基因', '抗体', '细胞', '蛋白质', '酶', '疾病', '病毒', '细菌', '免疫',
                '生物', '分子', '生物工程', '基因工程', '细胞培养', '发酵', '生物材料',
                '生物传感器', '生物芯片', '生物标记', '生物信息', '生物制药', '生物降解',
                'DNA', 'RNA', 'PCR', '测序', '克隆', '转基因', '基因编辑', 'CRISPR',
                '干细胞', '组织工程', '细胞治疗', '免疫治疗', '单克隆抗体', '疫苗开发',
                '酶工程', '蛋白质工程', '代谢工程', '合成生物学', '生物催化', '生物转化',
                '生物反应器', '生物分离', '生物纯化', '生物检测', '生物成像', '生物标记物',
                '生物传感器', '生物芯片', '生物计算机', '生物信息学', '生物统计学'
            ],
            '能源技术': [
                '能源', '电池', '节能', '太阳能', '风能', '充电', '新能源', '储能',
                '水力', '地热', '生物质', '发电', '电解', '燃料电池', '光伏', '核能',
                '热能', '电能', '动力', '能源转换', '能源存储', '能源传输', '能源利用',
                '锂离子电池', '钠离子电池', '固态电池', '超级电容器', '氢能', '氢燃料电池',
                '风力发电', '光伏发电', '水力发电', '核能发电', '地热发电', '生物质发电',
                '智能电网', '微电网', '分布式发电', '储能系统', '能量管理系统', '电力电子',
                '变压器', '逆变器', '整流器', '变频器', '功率器件', '电力系统', '输电线路',
                '充电桩', '换电站', '能量回收', '余热利用', '热电联产', '冷热电三联供'
            ],
            '环保技术': [
                '环保', '可再生', '碳捕获', '二氧化碳', '污染', '净化', '过滤', '回收',
                '废物处理', '污水处理', '空气净化', '土壤修复', '生态修复', '环境监测',
                '节能减排', '绿色技术', '清洁生产', '循环经济', '环境友好', '生态保护',
                '脱硫', '脱硝', '除尘', '除臭', '除雾', '除菌', '除重金属', '除有机物',
                '活性炭', '膜分离', '离子交换', '吸附', '催化氧化', '生物降解', '光催化',
                '固废处理', '危废处理', '垃圾焚烧', '垃圾填埋', '堆肥', '厌氧消化',
                '中水回用', '雨水收集', '海水淡化', '污泥处理', '废气处理', '噪声控制',
                '环境监测', '在线监测', '遥感监测', '环境评估', '环境影响评价', '环境管理'
            ],
            '航空航天': [
                '航空', '航天', '飞机', '火箭', '卫星', '轨道', '推进', '发动机',
                '航行', '导航', '姿态控制', '着陆', '发射', '宇宙', '太空', '航天器',
                '无人机', '飞行器', '气动', '气流', '机翼', '机身', '起落架', '燃料',
                '涡轮发动机', '涡扇发动机', '涡桨发动机', '冲压发动机', '火箭发动机',
                '航空电子', '飞行控制系统', '自动驾驶', '惯性导航', '卫星导航', '雷达',
                '通信系统', '气象系统', '防冰系统', '液压系统', '电气系统', '燃油系统',
                '复合材料', '钛合金', '高温合金', '隐身材料', '热防护', '结构设计',
                '风洞试验', '强度试验', '疲劳试验', '振动试验', '环境试验', '可靠性试验'
            ]
        };
        
        // 统计各领域关键词出现次数
        const fieldCounts = {};
        for (const [field, keywords] of Object.entries(techFields)) {
            const count = keywords.reduce((sum, keyword) => {
                const regex = new RegExp(keyword, 'gi');
                const matches = content.match(regex);
                return sum + (matches ? matches.length : 0);
            }, 0);
            
            if (count > 0) {
                fieldCounts[field] = count;
            }
        }
        
        // 找出匹配度最高的领域
        const bestMatch = Object.entries(fieldCounts)
            .sort(([,a], [,b]) => b - a)[0];
        
        if (bestMatch) {
            const [field, count] = bestMatch;
            console.log(`===== 识别出的技术领域 =====`);
            console.log(`${field} (匹配度: ${count})`);
            console.log(`==========================`);
            
            // 如果有chat.js提供的updateContext函数，则更新上下文
            if (window.updateContext) {
                window.updateContext({
                    techFields: [field],
                    content: content.substring(0, 1000) // 只取前1000个字符作为上下文
                });
                console.log('已更新聊天上下文，包含识别的技术领域信息');
            } else {
                console.log('未找到updateContext函数，无法更新聊天上下文');
            }
            
            return [field];
        } else {
            console.log('未识别出明确的技术领域');
            return [];
        }
    }
}); 