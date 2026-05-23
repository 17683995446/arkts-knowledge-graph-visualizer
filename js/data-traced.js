/**
 * ArkTS Knowledge Graph - Data Module with Full Execution Tracing
 * 每一行代码后都有日志输出，用于深度测试
 * Bug #41-#50 追踪版本
 */

// 初始化追踪器
if (typeof CodeTracer !== 'undefined') {
    CodeTracer.init({ maxLogCount: 50000 });
    CodeTracer.trace('data-traced.js', 1, 'info', '模块开始加载');
}

const KGData = {
    // 项目元数据
    project: {
        name: 'ArkTS Knowledge Graph',
        version: '1.0.0',
        description: 'HarmonyOS ArkTS code analysis and visualization'
    },

    // 文件结构数据
    fileStructure: {
        root: {
            name: 'src',
            type: 'folder',
            path: '/src',
            children: []
        }
    },

    // 类继承关系
    classHierarchy: {
        nodes: [],
        edges: []
    },

    // 函数调用关系
    functionCalls: {
        nodes: [],
        edges: []
    },

    // 模块依赖
    moduleDependencies: {
        nodes: [],
        edges: []
    },

    // 代码统计
    statistics: {
        totalFiles: 0,
        totalLines: 0,
        totalClasses: 0,
        totalFunctions: 0
    }
};

// 生成模拟数据 - 每一行都有日志
function generateMockData() {
    if (typeof CodeTracer !== 'undefined') CodeTracer.enterFunction('data-traced.js', 45, 'generateMockData', []);
    
    // 生成文件结构
    if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 48, 'info', '开始生成文件结构数据');
    const folders = ['components', 'services', 'utils', 'models', 'views', 'api'];
    if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 50, 'folders', folders);
    
    let fileId = 1;
    if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 53, 'fileId', fileId);
    
    folders.forEach((folder, folderIndex) => {
        if (typeof CodeTracer !== 'undefined') CodeTracer.loopIter('data-traced.js', 56, 'forEach folders', folderIndex, folders.length);
        
        const folderNode = {
            id: `folder_${folder}`,
            name: folder,
            type: 'folder',
            path: `/src/${folder}`,
            children: []
        };
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 65, 'folderNode', folderNode);
        
        // 每个文件夹下生成5-15个文件
        const fileCount = Math.floor(Math.random() * 10) + 5;
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 69, 'fileCount', fileCount);
        
        for (let i = 0; i < fileCount; i++) {
            if (typeof CodeTracer !== 'undefined') CodeTracer.loopIter('data-traced.js', 72, 'for files', i, fileCount);
            
            const fileNode = {
                id: `file_${fileId}`,
                name: `${folder}_${i + 1}.ets`,
                type: 'file',
                path: `/src/${folder}/${folder}_${i + 1}.ets`,
                size: Math.floor(Math.random() * 10000) + 500,
                lines: Math.floor(Math.random() * 500) + 50
            };
            if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 83, 'fileNode', fileNode);
            
            folderNode.children.push(fileNode);
            if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 87, 'call', 'folderNode.children.push');
            
            fileId++;
            if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 91, 'fileId', fileId);
        }
        
        KGData.fileStructure.root.children.push(folderNode);
        if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 96, 'call', 'KGData.fileStructure.root.children.push');
    });
    
    // 生成类数据
    if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 100, 'info', '开始生成类数据');
    const classNames = [
        'BaseView', 'BaseModel', 'BaseController', 'BaseService',
        'UserView', 'UserModel', 'UserController', 'UserService',
        'ProductView', 'ProductModel', 'ProductController', 'ProductService',
        'OrderView', 'OrderModel', 'OrderController', 'OrderService',
        'CartView', 'CartModel', 'CartController', 'CartService',
        'PaymentView', 'PaymentModel', 'PaymentController', 'PaymentService',
        'AuthService', 'Logger', 'Utils', 'Validator',
        'APIClient', 'CacheManager', 'EventBus', 'Router'
    ];
    if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 111, 'classNames', classNames);
    
    classNames.forEach((className, index) => {
        if (typeof CodeTracer !== 'undefined') CodeTracer.loopIter('data-traced.js', 114, 'forEach classNames', index, classNames.length);
        
        const node = {
            id: `class_${className}`,
            label: className,
            group: className.startsWith('Base') ? 'base' : 'derived',
            title: `Class: ${className}`,
            properties: {
                methods: Math.floor(Math.random() * 20) + 5,
                properties: Math.floor(Math.random() * 15) + 3,
                lines: Math.floor(Math.random() * 500) + 100
            }
        };
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 128, 'node', node);
        
        KGData.classHierarchy.nodes.push(node);
        if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 132, 'call', 'KGData.classHierarchy.nodes.push');
    });
    
    // 生成继承关系
    if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 136, 'info', '开始生成继承关系');
    const derivedClasses = classNames.filter(name => !name.startsWith('Base'));
    if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 139, 'derivedClasses', derivedClasses);
    
    const baseClasses = ['BaseView', 'BaseModel', 'BaseController', 'BaseService'];
    if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 143, 'baseClasses', baseClasses);
    
    derivedClasses.forEach((className, index) => {
        if (typeof CodeTracer !== 'undefined') CodeTracer.loopIter('data-traced.js', 146, 'forEach derivedClasses', index, derivedClasses.length);
        
        let baseClass;
        if (className.includes('View')) {
            baseClass = 'BaseView';
        } else if (className.includes('Model')) {
            baseClass = 'BaseModel';
        } else if (className.includes('Controller')) {
            baseClass = 'BaseController';
        } else if (className.includes('Service')) {
            baseClass = 'BaseService';
        } else {
            baseClass = baseClasses[Math.floor(Math.random() * baseClasses.length)];
        }
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 161, 'baseClass', baseClass);
        
        const edge = {
            from: `class_${baseClass}`,
            to: `class_${className}`,
            label: 'extends'
        };
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 169, 'edge', edge);
        
        KGData.classHierarchy.edges.push(edge);
        if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 173, 'call', 'KGData.classHierarchy.edges.push');
    });
    
    // 生成函数数据
    if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 177, 'info', '开始生成函数数据');
    const functions = [
        'init', 'render', 'update', 'destroy', 'handleClick',
        'fetchData', 'saveData', 'validate', 'transform',
        'onMount', 'onUnmount', 'onUpdate', 'onError',
        'getUserInfo', 'setUserInfo', 'login', 'logout',
        'addToCart', 'removeFromCart', 'checkout', 'pay',
        'search', 'filter', 'sort', 'paginate'
    ];
    if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 188, 'functions', functions);
    
    functions.forEach((funcName, index) => {
        if (typeof CodeTracer !== 'undefined') CodeTracer.loopIter('data-traced.js', 191, 'forEach functions', index, functions.length);
        
        const node = {
            id: `func_${funcName}`,
            label: funcName,
            group: 'function',
            title: `Function: ${funcName}()`,
            value: Math.floor(Math.random() * 50) + 10
        };
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 202, 'node', node);
        
        KGData.functionCalls.nodes.push(node);
        if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 206, 'call', 'KGData.functionCalls.nodes.push');
    });
    
    // 生成函数调用关系
    if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 210, 'info', '开始生成函数调用关系');
    for (let i = 0; i < functions.length; i++) {
        if (typeof CodeTracer !== 'undefined') CodeTracer.loopIter('data-traced.js', 213, 'for functions', i, functions.length);
        
        const caller = functions[i];
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 217, 'caller', caller);
        
        // 每个函数调用1-3个其他函数
        const callCount = Math.floor(Math.random() * 3) + 1;
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 222, 'callCount', callCount);
        
        for (let j = 0; j < callCount; j++) {
            if (typeof CodeTracer !== 'undefined') CodeTracer.loopIter('data-traced.js', 226, 'for callCount', j, callCount);
            
            const targetIndex = Math.floor(Math.random() * functions.length);
            if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 230, 'targetIndex', targetIndex);
            
            if (targetIndex !== i) {
                const edge = {
                    from: `func_${caller}`,
                    to: `func_${functions[targetIndex]}`,
                    value: Math.floor(Math.random() * 10) + 1
                };
                if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 239, 'edge', edge);
                
                KGData.functionCalls.edges.push(edge);
                if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 243, 'call', 'KGData.functionCalls.edges.push');
            }
        }
    }
    
    // 生成模块数据
    if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 249, 'info', '开始生成模块数据');
    const modules = [
        { name: 'UserModule', files: 12, lines: 3500 },
        { name: 'ProductModule', files: 8, lines: 2800 },
        { name: 'OrderModule', files: 10, lines: 3200 },
        { name: 'CartModule', files: 6, lines: 1800 },
        { name: 'PaymentModule', files: 9, lines: 2900 },
        { name: 'AuthModule', files: 7, lines: 2200 },
        { name: 'CommonModule', files: 15, lines: 4200 },
        { name: 'CoreModule', files: 20, lines: 5500 }
    ];
    if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 261, 'modules', modules);
    
    modules.forEach((module, index) => {
        if (typeof CodeTracer !== 'undefined') CodeTracer.loopIter('data-traced.js', 264, 'forEach modules', index, modules.length);
        
        const node = {
            id: `module_${module.name}`,
            label: module.name,
            group: 'module',
            title: `${module.name}\nFiles: ${module.files}\nLines: ${module.lines.toLocaleString()}`,
            value: module.files * 100
        };
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 275, 'node', node);
        
        KGData.moduleDependencies.nodes.push(node);
        if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 279, 'call', 'KGData.moduleDependencies.nodes.push');
    });
    
    // 生成模块依赖关系
    if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 283, 'info', '开始生成模块依赖关系');
    modules.forEach((module, index) => {
        if (typeof CodeTracer !== 'undefined') CodeTracer.loopIter('data-traced.js', 286, 'forEach modules deps', index, modules.length);
        
        // 每个模块依赖1-4个其他模块
        const depCount = Math.floor(Math.random() * 4) + 1;
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 291, 'depCount', depCount);
        
        for (let i = 0; i < depCount; i++) {
            if (typeof CodeTracer !== 'undefined') CodeTracer.loopIter('data-traced.js', 295, 'for depCount', i, depCount);
            
            const targetIndex = Math.floor(Math.random() * modules.length);
            if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 299, 'targetIndex', targetIndex);
            
            if (targetIndex !== index) {
                const edge = {
                    from: `module_${module.name}`,
                    to: `module_${modules[targetIndex].name}`,
                    value: Math.floor(Math.random() * 20) + 5
                };
                if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 308, 'edge', edge);
                
                KGData.moduleDependencies.edges.push(edge);
                if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 312, 'call', 'KGData.moduleDependencies.edges.push');
            }
        }
    });
    
    // 更新统计
    if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 318, 'info', '开始更新统计数据');
    KGData.statistics.totalFiles = fileId - 1;
    if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 321, 'KGData.statistics.totalFiles', KGData.statistics.totalFiles);
    
    KGData.statistics.totalLines = modules.reduce((sum, m) => sum + m.lines, 0);
    if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 325, 'KGData.statistics.totalLines', KGData.statistics.totalLines);
    
    KGData.statistics.totalClasses = classNames.length;
    if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 329, 'KGData.statistics.totalClasses', KGData.statistics.totalClasses);
    
    KGData.statistics.totalFunctions = functions.length;
    if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 333, 'KGData.statistics.totalFunctions', KGData.statistics.totalFunctions);
    
    if (typeof CodeTracer !== 'undefined') CodeTracer.exitFunction('data-traced.js', 335, 'generateMockData', KGData);
    return KGData;
}

// 数据访问方法 - 每一行都有日志
const KGDataAPI = {
    getFileStructure() {
        if (typeof CodeTracer !== 'undefined') CodeTracer.enterFunction('data-traced.js', 342, 'KGDataAPI.getFileStructure', []);
        const result = KGData.fileStructure;
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 345, 'result', result);
        if (typeof CodeTracer !== 'undefined') CodeTracer.exitFunction('data-traced.js', 347, 'KGDataAPI.getFileStructure', result);
        return result;
    },
    
    getClassHierarchy() {
        if (typeof CodeTracer !== 'undefined') CodeTracer.enterFunction('data-traced.js', 351, 'KGDataAPI.getClassHierarchy', []);
        const result = KGData.classHierarchy;
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 354, 'result', result);
        if (typeof CodeTracer !== 'undefined') CodeTracer.exitFunction('data-traced.js', 356, 'KGDataAPI.getClassHierarchy', result);
        return result;
    },
    
    getFunctionCalls() {
        if (typeof CodeTracer !== 'undefined') CodeTracer.enterFunction('data-traced.js', 360, 'KGDataAPI.getFunctionCalls', []);
        const result = KGData.functionCalls;
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 363, 'result', result);
        if (typeof CodeTracer !== 'undefined') CodeTracer.exitFunction('data-traced.js', 365, 'KGDataAPI.getFunctionCalls', result);
        return result;
    },
    
    getModuleDependencies() {
        if (typeof CodeTracer !== 'undefined') CodeTracer.enterFunction('data-traced.js', 369, 'KGDataAPI.getModuleDependencies', []);
        const result = KGData.moduleDependencies;
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 372, 'result', result);
        if (typeof CodeTracer !== 'undefined') CodeTracer.exitFunction('data-traced.js', 374, 'KGDataAPI.getModuleDependencies', result);
        return result;
    },
    
    getStatistics() {
        if (typeof CodeTracer !== 'undefined') CodeTracer.enterFunction('data-traced.js', 378, 'KGDataAPI.getStatistics', []);
        const result = KGData.statistics;
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 381, 'result', result);
        if (typeof CodeTracer !== 'undefined') CodeTracer.exitFunction('data-traced.js', 383, 'KGDataAPI.getStatistics', result);
        return result;
    },
    
    search(query) {
        if (typeof CodeTracer !== 'undefined') CodeTracer.enterFunction('data-traced.js', 387, 'KGDataAPI.search', [query]);
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 389, 'query', query);
        
        const results = [];
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 393, 'results', results);
        
        if (!query) {
            if (typeof CodeTracer !== 'undefined') CodeTracer.branch('data-traced.js', 396, '!query', true);
            if (typeof CodeTracer !== 'undefined') CodeTracer.exitFunction('data-traced.js', 398, 'KGDataAPI.search', results);
            return results;
        }
        if (typeof CodeTracer !== 'undefined') CodeTracer.branch('data-traced.js', 401, '!query', false);
        
        const lowerQuery = query.toLowerCase();
        if (typeof CodeTracer !== 'undefined') CodeTracer.varAssign('data-traced.js', 405, 'lowerQuery', lowerQuery);
        
        // 搜索类
        KGData.classHierarchy.nodes.forEach((node, index) => {
            if (typeof CodeTracer !== 'undefined') CodeTracer.loopIter('data-traced.js', 409, 'forEach classHierarchy.nodes', index, KGData.classHierarchy.nodes.length);
            
            if (node.label.toLowerCase().includes(lowerQuery)) {
                if (typeof CodeTracer !== 'undefined') CodeTracer.branch('data-traced.js', 413, 'node.label.includes(lowerQuery)', true);
                results.push({ type: 'class', data: node });
                if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 416, 'call', 'results.push');
            } else {
                if (typeof CodeTracer !== 'undefined') CodeTracer.branch('data-traced.js', 419, 'node.label.includes(lowerQuery)', false);
            }
        });
        
        // 搜索函数
        KGData.functionCalls.nodes.forEach((node, index) => {
            if (typeof CodeTracer !== 'undefined') CodeTracer.loopIter('data-traced.js', 425, 'forEach functionCalls.nodes', index, KGData.functionCalls.nodes.length);
            
            if (node.label.toLowerCase().includes(lowerQuery)) {
                if (typeof CodeTracer !== 'undefined') CodeTracer.branch('data-traced.js', 429, 'node.label.includes(lowerQuery)', true);
                results.push({ type: 'function', data: node });
                if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 432, 'call', 'results.push');
            } else {
                if (typeof CodeTracer !== 'undefined') CodeTracer.branch('data-traced.js', 435, 'node.label.includes(lowerQuery)', false);
            }
        });
        
        if (typeof CodeTracer !== 'undefined') CodeTracer.exitFunction('data-traced.js', 439, 'KGDataAPI.search', results);
        return results;
    }
};

// 初始化数据
try {
    if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 446, 'info', '开始初始化数据');
    generateMockData();
    if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 449, 'info', '数据初始化完成');
} catch (e) {
    if (typeof CodeTracer !== 'undefined') CodeTracer.error('data-traced.js', 452, e);
    console.error('数据初始化失败:', e);
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KGData, KGDataAPI, generateMockData };
}

if (typeof CodeTracer !== 'undefined') CodeTracer.trace('data-traced.js', 461, 'info', '模块加载完成');
