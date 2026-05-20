/**
 * ArkTS Knowledge Graph - Mock Data
 * Simulates database responses for visualization
 */

const KGData = {
    // 项目概览统计
    overview: {
        totalFiles: 1247,
        totalClasses: 386,
        totalFunctions: 2156,
        totalLines: 156432,
        changes: {
            new: 12,
            modified: 5,
            deleted: 2
        }
    },

    // 文件类型分布
    fileTypes: [
        { type: '.ets', count: 523, color: '#4CAF50' },
        { type: '.ts', count: 412, color: '#2196F3' },
        { type: '.js', count: 198, color: '#FF9800' },
        { type: '.json', count: 89, color: '#9C27B0' },
        { type: '其他', count: 25, color: '#607D8B' }
    ],

    // 代码增长趋势（最近30天）
    codeTrend: [
        { date: '2025-01-01', lines: 145000 },
        { date: '2025-01-05', lines: 147500 },
        { date: '2025-01-10', lines: 150200 },
        { date: '2025-01-15', lines: 153800 },
        { date: '2025-01-17', lines: 156432 }
    ],

    // 项目结构图数据（节点和边）
    projectStructure: {
        nodes: [
            // 核心模块
            { id: 1, label: 'AppEntry', group: 'component', size: 30, title: '应用入口组件' },
            { id: 2, label: 'MainPage', group: 'component', size: 25, title: '主页面' },
            { id: 3, label: 'HomeTab', group: 'component', size: 20, title: '首页标签' },
            { id: 4, label: 'SettingsTab', group: 'component', size: 20, title: '设置标签' },
            { id: 5, label: 'ProfileTab', group: 'component', size: 20, title: '个人中心' },
            
            // UI组件
            { id: 10, label: 'SmartButton', group: 'component', size: 15, title: '智能按钮组件' },
            { id: 11, label: 'DataList', group: 'component', size: 18, title: '数据列表' },
            { id: 12, label: 'SearchBar', group: 'component', size: 15, title: '搜索栏' },
            { id: 13, label: 'CardView', group: 'component', size: 16, title: '卡片视图' },
            { id: 14, label: 'LoadingSpinner', group: 'component', size: 12, title: '加载动画' },
            
            // 工具类
            { id: 20, label: 'DataManager', group: 'utility', size: 22, title: '数据管理器' },
            { id: 21, label: 'NetworkClient', group: 'utility', size: 20, title: '网络客户端' },
            { id: 22, label: 'StorageHelper', group: 'utility', size: 18, title: '存储助手' },
            { id: 23, label: 'Logger', group: 'utility', size: 15, title: '日志工具' },
            { id: 24, label: 'Validator', group: 'utility', size: 16, title: '验证器' },
            
            // 接口
            { id: 30, label: 'IDataProvider', group: 'interface', size: 14, title: '数据提供者接口' },
            { id: 31, label: 'IComponent', group: 'interface', size: 14, title: '组件接口' },
            { id: 32, label: 'ISerializable', group: 'interface', size: 12, title: '序列化接口' },
            
            // 模型类
            { id: 40, label: 'UserModel', group: 'model', size: 18, title: '用户模型' },
            { id: 41, label: 'ProductModel', group: 'model', size: 16, title: '产品模型' },
            { id: 42, label: 'OrderModel', group: 'model', size: 16, title: '订单模型' },
            { id: 43, label: 'CategoryModel', group: 'model', size: 14, title: '分类模型' },
            
            // 服务类
            { id: 50, label: 'AuthService', group: 'service', size: 20, title: '认证服务' },
            { id: 51, label: 'UserService', group: 'service', size: 19, title: '用户服务' },
            { id: 52, label: 'ProductService', group: 'service', size: 19, title: '产品服务' },
            { id: 53, label: 'PaymentService', group: 'service', size: 18, title: '支付服务' },
            
            // 枚举
            { id: 60, label: 'StatusCode', group: 'enum', size: 12, title: '状态码枚举' },
            { id: 61, label: 'ErrorType', group: 'enum', size: 12, title: '错误类型枚举' },
            { id: 62, label: 'ThemeMode', group: 'enum', size: 10, title: '主题模式枚举' }
        ],
        edges: [
            // 页面层级关系
            { from: 1, to: 2, label: 'contains' },
            { from: 2, to: 3, label: 'contains' },
            { from: 2, to: 4, label: 'contains' },
            { from: 2, to: 5, label: 'contains' },
            
            // 组件使用关系
            { from: 3, to: 10, label: 'uses' },
            { from: 3, to: 11, label: 'uses' },
            { from: 3, to: 12, label: 'uses' },
            { from: 3, to: 13, label: 'uses' },
            { from: 4, to: 10, label: 'uses' },
            { from: 5, to: 13, label: 'uses' },
            
            // 工具类依赖
            { from: 20, to: 21, label: 'depends' },
            { from: 20, to: 22, label: 'depends' },
            { from: 20, to: 23, label: 'uses' },
            { from: 21, to: 23, label: 'uses' },
            { from: 50, to: 20, label: 'uses' },
            { from: 51, to: 20, label: 'uses' },
            { from: 52, to: 20, label: 'uses' },
            { from: 52, to: 21, label: 'uses' },
            
            // 接口实现
            { from: 10, to: 31, label: 'implements', dashes: true },
            { from: 11, to: 31, label: 'implements', dashes: true },
            { from: 20, to: 30, label: 'implements', dashes: true },
            { from: 40, to: 32, label: 'implements', dashes: true },
            { from: 41, to: 32, label: 'implements', dashes: true },
            
            // 服务使用模型
            { from: 51, to: 40, label: 'manages' },
            { from: 52, to: 41, label: 'manages' },
            { from: 52, to: 42, label: 'manages' },
            { from: 52, to: 43, label: 'manages' },
            
            // 数据流
            { from: 11, to: 20, label: 'fetches' },
            { from: 3, to: 51, label: 'calls' },
            { from: 5, to: 51, label: 'calls' }
        ]
    },

    // 类继承层次数据
    classHierarchy: {
        nodes: [
            { id: 'BaseComponent', label: 'BaseComponent', level: 0, type: 'abstract' },
            { id: 'View', label: 'View', level: 1, type: 'class' },
            { id: 'Text', label: 'Text', level: 2, type: 'component' },
            { id: 'Button', label: 'Button', level: 2, type: 'component' },
            { id: 'Image', label: 'Image', level: 2, type: 'component' },
            { id: 'List', label: 'List', level: 2, type: 'component' },
            { id: 'Container', label: 'Container', level: 1, type: 'class' },
            { id: 'Column', label: 'Column', level: 2, type: 'component' },
            { id: 'Row', label: 'Row', level: 2, type: 'component' },
            { id: 'Stack', label: 'Stack', level: 2, type: 'component' },
            { id: 'CustomButton', label: 'CustomButton', level: 3, type: 'component' },
            { id: 'SmartCard', label: 'SmartCard', level: 3, type: 'component' },
            { id: 'BaseModel', label: 'BaseModel', level: 0, type: 'abstract' },
            { id: 'User', label: 'User', level: 1, type: 'model' },
            { id: 'Product', label: 'Product', level: 1, type: 'model' },
            { id: 'Order', label: 'Order', level: 1, type: 'model' }
        ],
        edges: [
            { from: 'View', to: 'BaseComponent' },
            { from: 'Container', to: 'BaseComponent' },
            { from: 'Text', to: 'View' },
            { from: 'Button', to: 'View' },
            { from: 'Image', to: 'View' },
            { from: 'List', to: 'View' },
            { from: 'Column', to: 'Container' },
            { from: 'Row', to: 'Container' },
            { from: 'Stack', to: 'Container' },
            { from: 'CustomButton', to: 'Button' },
            { from: 'SmartCard', to: 'Column' },
            { from: 'User', to: 'BaseModel' },
            { from: 'Product', to: 'BaseModel' },
            { from: 'Order', to: 'BaseModel' }
        ]
    },

    // 函数调用关系数据
    functionCalls: {
        nodes: [
            { id: 'main', label: 'main()', group: 'entry' },
            { id: 'initApp', label: 'initApp()', group: 'init' },
            { id: 'loadConfig', label: 'loadConfig()', group: 'init' },
            { id: 'setupRoutes', label: 'setupRoutes()', group: 'init' },
            { id: 'renderHome', label: 'renderHome()', group: 'render' },
            { id: 'fetchData', label: 'fetchData()', group: 'data' },
            { id: 'parseResponse', label: 'parseResponse()', group: 'data' },
            { id: 'validateData', label: 'validateData()', group: 'data' },
            { id: 'cacheData', label: 'cacheData()', group: 'data' },
            { id: 'renderList', label: 'renderList()', group: 'render' },
            { id: 'renderItem', label: 'renderItem()', group: 'render' },
            { id: 'formatDate', label: 'formatDate()', group: 'util' },
            { id: 'formatCurrency', label: 'formatCurrency()', group: 'util' },
            { id: 'handleError', label: 'handleError()', group: 'error' },
            { id: 'logError', label: 'logError()', group: 'error' },
            { id: 'showToast', label: 'showToast()', group: 'ui' }
        ],
        edges: [
            { from: 'main', to: 'initApp' },
            { from: 'initApp', to: 'loadConfig' },
            { from: 'initApp', to: 'setupRoutes' },
            { from: 'setupRoutes', to: 'renderHome' },
            { from: 'renderHome', to: 'fetchData' },
            { from: 'fetchData', to: 'parseResponse' },
            { from: 'fetchData', to: 'handleError' },
            { from: 'parseResponse', to: 'validateData' },
            { from: 'validateData', to: 'cacheData' },
            { from: 'renderHome', to: 'renderList' },
            { from: 'renderList', to: 'renderItem' },
            { from: 'renderItem', to: 'formatDate' },
            { from: 'renderItem', to: 'formatCurrency' },
            { from: 'handleError', to: 'logError' },
            { from: 'handleError', to: 'showToast' }
        ]
    },

    // 模块依赖关系
    moduleDeps: {
        modules: [
            { name: 'app', files: 45, lines: 5200 },
            { name: 'components', files: 128, lines: 28500 },
            { name: 'services', files: 32, lines: 8900 },
            { name: 'models', files: 48, lines: 6200 },
            { name: 'utils', files: 67, lines: 12300 },
            { name: 'pages', files: 89, lines: 45600 },
            { name: 'assets', files: 156, lines: 0 },
            { name: 'styles', files: 34, lines: 8900 },
            { name: 'tests', files: 89, lines: 23400 },
            { name: 'config', files: 12, lines: 1800 }
        ],
        dependencies: [
            { from: 'app', to: 'components', strength: 10 },
            { from: 'app', to: 'services', strength: 8 },
            { from: 'app', to: 'pages', strength: 10 },
            { from: 'pages', to: 'components', strength: 9 },
            { from: 'pages', to: 'services', strength: 7 },
            { from: 'pages', to: 'models', strength: 6 },
            { from: 'components', to: 'utils', strength: 5 },
            { from: 'components', to: 'styles', strength: 8 },
            { from: 'services', to: 'models', strength: 9 },
            { from: 'services', to: 'utils', strength: 7 },
            { from: 'tests', to: 'app', strength: 6 },
            { from: 'tests', to: 'components', strength: 5 },
            { from: 'tests', to: 'services', strength: 4 }
        ]
    },

    // 文件结构树
    fileStructure: {
        name: 'project-root',
        type: 'folder',
        children: [
            {
                name: 'src',
                type: 'folder',
                children: [
                    {
                        name: 'components',
                        type: 'folder',
                        children: [
                            { name: 'Button.ets', type: 'file', size: 2340, lines: 89 },
                            { name: 'Card.ets', type: 'file', size: 3120, lines: 112 },
                            { name: 'List.ets', type: 'file', size: 4560, lines: 156 },
                            { name: 'Modal.ets', type: 'file', size: 2890, lines: 98 },
                            { name: 'index.ts', type: 'file', size: 450, lines: 18 }
                        ]
                    },
                    {
                        name: 'pages',
                        type: 'folder',
                        children: [
                            { name: 'Home.ets', type: 'file', size: 8900, lines: 312 },
                            { name: 'Profile.ets', type: 'file', size: 5670, lines: 198 },
                            { name: 'Settings.ets', type: 'file', size: 4560, lines: 156 },
                            { name: 'Detail.ets', type: 'file', size: 7230, lines: 245 }
                        ]
                    },
                    {
                        name: 'services',
                        type: 'folder',
                        children: [
                            { name: 'AuthService.ts', type: 'file', size: 4560, lines: 156 },
                            { name: 'DataService.ts', type: 'file', size: 6780, lines: 234 },
                            { name: 'UserService.ts', type: 'file', size: 5340, lines: 189 }
                        ]
                    },
                    {
                        name: 'models',
                        type: 'folder',
                        children: [
                            { name: 'User.ts', type: 'file', size: 1230, lines: 45 },
                            { name: 'Product.ts', type: 'file', size: 1450, lines: 52 },
                            { name: 'Order.ts', type: 'file', size: 1890, lines: 67 }
                        ]
                    },
                    {
                        name: 'utils',
                        type: 'folder',
                        children: [
                            { name: 'Logger.ts', type: 'file', size: 890, lines: 34 },
                            { name: 'Validator.ts', type: 'file', size: 1560, lines: 58 },
                            { name: 'Formatter.ts', type: 'file', size: 1230, lines: 45 },
                            { name: 'Storage.ts', type: 'file', size: 2340, lines: 89 }
                        ]
                    },
                    { name: 'App.ets', type: 'file', size: 3450, lines: 123 },
                    { name: 'Index.ets', type: 'file', size: 560, lines: 22 }
                ]
            },
            {
                name: 'resources',
                type: 'folder',
                children: [
                    { name: 'base', type: 'folder', children: [] },
                    { name: 'rawfile', type: 'folder', children: [] },
                    { name: 'en_US.element', type: 'folder', children: [] },
                    { name: 'zh_CN.element', type: 'folder', children: [] }
                ]
            },
            {
                name: 'test',
                type: 'folder',
                children: [
                    { name: 'List.test.ets', type: 'file', size: 2340, lines: 89 },
                    { name: 'Button.test.ets', type: 'file', size: 1890, lines: 67 }
                ]
            },
            { name: 'build-profile.json5', type: 'file', size: 890, lines: 34 },
            { name: 'oh-package.json5', type: 'file', size: 1230, lines: 45 },
            { name: 'module.json5', type: 'file', size: 2340, lines: 89 }
        ]
    },

    // 代码统计
    codeStats: {
        languages: [
            { name: 'ArkTS', files: 523, lines: 85432, color: '#4CAF50' },
            { name: 'TypeScript', files: 412, lines: 45678, color: '#2196F3' },
            { name: 'JavaScript', files: 198, lines: 18900, color: '#FF9800' },
            { name: 'JSON', files: 89, lines: 4200, color: '#9C27B0' },
            { name: 'CSS/Less', files: 25, lines: 3222, color: '#00BCD4' }
        ],
        complexity: {
            low: 1456,
            medium: 567,
            high: 89,
            veryHigh: 12
        },
        topFiles: [
            { path: 'src/pages/Home.ets', lines: 312, complexity: 'medium' },
            { path: 'src/services/DataService.ts', lines: 234, complexity: 'high' },
            { path: 'src/components/List.ets', lines: 156, complexity: 'medium' },
            { path: 'src/pages/Detail.ets', lines: 245, complexity: 'medium' },
            { path: 'src/pages/Profile.ets', lines: 198, complexity: 'low' }
        ]
    },

    // 查询历史
    queryHistory: [
        { query: '查找所有按钮组件', count: 128, lastUsed: '2025-01-17 10:30' },
        { query: '显示异步函数调用链', count: 86, lastUsed: '2025-01-17 09:15' },
        { query: '分析模块依赖关系', count: 64, lastUsed: '2025-01-16 16:45' },
        { query: '查找未使用的函数', count: 52, lastUsed: '2025-01-16 14:20' },
        { query: '显示类继承树', count: 47, lastUsed: '2025-01-16 11:30' }
    ],

    // 搜索结果示例
    searchResults: {
        classes: [
            { name: 'SmartButton', file: 'src/components/SmartButton.ets', line: 12, type: 'component' },
            { name: 'IconButton', file: 'src/components/IconButton.ets', line: 8, type: 'component' },
            { name: 'TextButton', file: 'src/components/TextButton.ets', line: 15, type: 'component' }
        ],
        functions: [
            { name: 'createButton', file: 'src/utils/ButtonFactory.ts', line: 45, type: 'function' },
            { name: 'renderButton', file: 'src/components/BaseComponent.ets', line: 89, type: 'method' }
        ]
    }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KGData;
}
