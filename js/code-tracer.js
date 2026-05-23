/**
 * 代码执行追踪系统 - Code Execution Tracer
 * 用于逐行追踪代码执行，发现隐藏bug
 * Bug #41-#50 测试基础设施
 */

const CodeTracer = {
    // 配置
    config: {
        enabled: true,
        logLevel: 'debug', // 'debug', 'info', 'warn', 'error'
        maxLogCount: 10000,
        includeTimestamp: true,
        includeStackTrace: false,
        groupByFunction: true
    },

    // 日志存储
    logs: [],
    functionStack: [],
    callCount: {},
    executionTime: {},

    /**
     * 初始化追踪器
     */
    init(options = {}) {
        this.config = { ...this.config, ...options };
        console.log('[CodeTracer] 初始化完成，日志级别:', this.config.logLevel);
        return this;
    },

    /**
     * 记录日志 - 每一行代码执行时调用
     * @param {string} file - 文件名
     * @param {number} line - 行号
     * @param {string} type - 类型: 'entry'|'exit'|'var'|'call'|'return'|'loop'|'branch'|'error'
     * @param {string} message - 消息
     * @param {*} data - 附加数据
     */
    trace(file, line, type, message, data = null) {
        if (!this.config.enabled) return;
        if (this.logs.length >= this.config.maxLogCount) {
            this.logs.shift(); // 移除最旧的日志
        }

        const logEntry = {
            timestamp: this.config.includeTimestamp ? performance.now() : null,
            file,
            line,
            type,
            message,
            data: data ? this.safeStringify(data) : null,
            functionStack: [...this.functionStack]
        };

        this.logs.push(logEntry);

        // 控制台输出
        const prefix = `[${file}:${line}]`;
        const typeEmoji = {
            'entry': '▶️',
            'exit': '◀️',
            'var': '📦',
            'call': '📞',
            'return': '↩️',
            'loop': '🔄',
            'branch': '🔀',
            'error': '❌',
            'warn': '⚠️',
            'info': 'ℹ️'
        }[type] || '•';

        const consoleMethod = {
            'error': console.error,
            'warn': console.warn,
            'debug': console.log
        }[type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'debug'];

        consoleMethod(`${typeEmoji} ${prefix} ${message}`, data || '');
    },

    /**
     * 函数进入追踪
     */
    enterFunction(file, line, funcName, args = []) {
        this.functionStack.push(funcName);
        this.callCount[funcName] = (this.callCount[funcName] || 0) + 1;
        this.executionTime[funcName] = performance.now();
        
        this.trace(file, line, 'entry', `进入函数: ${funcName}`, {
            args: args.map(arg => this.safeStringify(arg)),
            callCount: this.callCount[funcName]
        });
    },

    /**
     * 函数退出追踪
     */
    exitFunction(file, line, funcName, returnValue = undefined) {
        const startTime = this.executionTime[funcName];
        const duration = startTime ? (performance.now() - startTime).toFixed(2) + 'ms' : 'unknown';
        
        this.trace(file, line, 'exit', `退出函数: ${funcName} (耗时: ${duration})`, {
            returnValue: returnValue !== undefined ? this.safeStringify(returnValue) : undefined
        });
        
        this.functionStack.pop();
    },

    /**
     * 变量赋值追踪
     */
    varAssign(file, line, varName, value) {
        this.trace(file, line, 'var', `变量赋值: ${varName}`, {
            value: this.safeStringify(value),
            type: typeof value
        });
    },

    /**
     * 函数调用追踪
     */
    funcCall(file, line, funcName, args = []) {
        this.trace(file, line, 'call', `调用函数: ${funcName}`, {
            args: args.map(arg => this.safeStringify(arg))
        });
    },

    /**
     * 返回值追踪
     */
    funcReturn(file, line, funcName, value) {
        this.trace(file, line, 'return', `函数返回: ${funcName}`, {
            value: this.safeStringify(value),
            type: typeof value
        });
    },

    /**
     * 循环迭代追踪
     */
    loopIter(file, line, loopType, index, total) {
        if (index % 100 === 0 || index === total - 1) { // 每100次记录一次，避免日志过多
            this.trace(file, line, 'loop', `${loopType} 迭代: ${index}/${total}`);
        }
    },

    /**
     * 条件分支追踪
     */
    branch(file, line, condition, result) {
        this.trace(file, line, 'branch', `条件判断: ${condition} => ${result}`);
    },

    /**
     * 错误追踪
     */
    error(file, line, error) {
        this.trace(file, line, 'error', `错误: ${error.message}`, {
            error: error.toString(),
            stack: error.stack
        });
    },

    /**
     * 警告追踪
     */
    warn(file, line, message) {
        this.trace(file, line, 'warn', message);
    },

    /**
     * 安全地序列化数据
     */
    safeStringify(obj, maxLength = 500) {
        try {
            if (obj === null) return 'null';
            if (obj === undefined) return 'undefined';
            if (typeof obj === 'function') return '[Function]';
            if (typeof obj === 'symbol') return '[Symbol]';
            if (obj instanceof Error) return `[Error: ${obj.message}]`;
            
            let str = JSON.stringify(obj);
            if (str && str.length > maxLength) {
                str = str.substring(0, maxLength) + '... [truncated]';
            }
            return str;
        } catch (e) {
            return `[Unserializable: ${e.message}]`;
        }
    },

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            totalLogs: this.logs.length,
            functionCalls: { ...this.callCount },
            currentStack: [...this.functionStack],
            errors: this.logs.filter(l => l.type === 'error').length,
            warnings: this.logs.filter(l => l.type === 'warn').length
        };
    },

    /**
     * 导出日志
     */
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    },

    /**
     * 清空日志
     */
    clear() {
        this.logs = [];
        this.functionStack = [];
        this.callCount = {};
        this.executionTime = {};
        console.log('[CodeTracer] 日志已清空');
    },

    /**
     * 分析潜在问题
     */
    analyze() {
        const issues = [];

        // 1. 检查重复调用过多的函数
        Object.entries(this.callCount).forEach(([func, count]) => {
            if (count > 1000) {
                issues.push({
                    type: 'performance',
                    message: `函数 ${func} 被调用 ${count} 次，可能存在性能问题`
                });
            }
        });

        // 2. 检查错误
        const errors = this.logs.filter(l => l.type === 'error');
        if (errors.length > 0) {
            issues.push({
                type: 'error',
                message: `发现 ${errors.length} 个错误`,
                details: errors
            });
        }

        // 3. 检查未匹配的函数进入/退出
        if (this.functionStack.length > 0) {
            issues.push({
                type: 'warning',
                message: `有 ${this.functionStack.length} 个函数未正常退出`,
                details: this.functionStack
            });
        }

        // 4. 检查递归调用
        Object.entries(this.callCount).forEach(([func, count]) => {
            const funcLogs = this.logs.filter(l => l.message.includes(func));
            const maxStackDepth = Math.max(...funcLogs.map(l => l.functionStack.length), 0);
            if (maxStackDepth > 50) {
                issues.push({
                    type: 'warning',
                    message: `函数 ${func} 最大调用深度 ${maxStackDepth}，可能存在无限递归风险`
                });
            }
        });

        return issues;
    }
};

// 全局可用
if (typeof window !== 'undefined') {
    window.CodeTracer = CodeTracer;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeTracer;
}
