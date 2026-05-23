/**
 * 极端数据规模压力测试数据生成器
 * Bug #36-#40 测试用数据
 */

const StressTestData = {
    /**
     * 生成超大规模节点数据（10万+节点）
     * 用于测试 vis.js 和 D3.js 的性能极限
     */
    generateMassiveNodes(count = 100000) {
        const nodes = [];
        const groups = ['component', 'utility', 'interface', 'model', 'service'];
        
        for (let i = 0; i < count; i++) {
            nodes.push({
                id: i,
                label: `Node_${i}_${'x'.repeat(100)}`, // 超长标签测试
                group: groups[i % groups.length],
                value: Math.random() * 100,
                title: `Title_${i}_` + 'y'.repeat(1000) // 超长title测试
            });
        }
        return nodes;
    },

    /**
     * 生成超大规模边数据
     */
    generateMassiveEdges(nodeCount = 100000, edgeDensity = 0.01) {
        const edges = [];
        const edgeCount = Math.floor(nodeCount * nodeCount * edgeDensity);
        
        for (let i = 0; i < Math.min(edgeCount, 500000); i++) {
            const from = Math.floor(Math.random() * nodeCount);
            let to = Math.floor(Math.random() * nodeCount);
            while (to === from) {
                to = Math.floor(Math.random() * nodeCount);
            }
            edges.push({
                from: from,
                to: to,
                value: Math.random() * 10
            });
        }
        return edges;
    },

    /**
     * 生成超深层级树结构（1000+层）
     * 用于测试 TreeVisualizer 的递归极限
     */
    generateDeepTree(depth = 1000, branchingFactor = 2) {
        function createNode(currentDepth, index) {
            const node = {
                name: `Level${currentDepth}_Node${index}_` + 'z'.repeat(50),
                type: currentDepth === depth ? 'file' : 'folder',
                size: Math.floor(Math.random() * 10000)
            };
            
            if (currentDepth < depth) {
                node.children = [];
                for (let i = 0; i < branchingFactor; i++) {
                    node.children.push(createNode(currentDepth + 1, i));
                }
            }
            return node;
        }
        
        return createNode(0, 0);
    },

    /**
     * 生成包含特殊字符和潜在XSS攻击向量的数据
     */
    generateMaliciousData() {
        const maliciousStrings = [
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>",
            "<svg onload=alert('xss')>",
            "javascript:alert('xss')",
            "'; DROP TABLE users; --",
            "${7*7}",
            "{{7*7}}",
            "<%= 7 * 7 %>",
            "${process.env}",
            "\x00\x01\x02\x03", // 二进制字符
            "\u0000\u0001\u0002", // Unicode控制字符
            "A".repeat(1000000), // 1MB字符串
            "\n\r\t\b\f\\\"'", // 转义字符
            "null\x00", // null字节注入
            "<iframe src='javascript:alert(1)'>",
            "<body onload=alert(1)>",
            "<input onfocus=alert(1) autofocus>",
        ];
        
        return maliciousStrings.map((str, i) => ({
            id: i,
            label: str,
            group: 'malicious',
            title: str
        }));
    },

    /**
     * 生成循环引用数据（测试JSON序列化）
     */
    generateCircularReference() {
        const a = { id: 1, name: 'A' };
        const b = { id: 2, name: 'B' };
        const c = { id: 3, name: 'C' };
        a.ref = b;
        b.ref = c;
        c.ref = a; // 循环引用
        return [a, b, c];
    },

    /**
     * 生成包含所有JavaScript特殊值的数据
     */
    generateEdgeCaseValues() {
        return [
            { id: 'null', value: null },
            { id: 'undefined', value: undefined },
            { id: 'NaN', value: NaN },
            { id: 'Infinity', value: Infinity },
            { id: '-Infinity', value: -Infinity },
            { id: '0', value: 0 },
            { id: '-0', value: -0 },
            { id: 'empty', value: '' },
            { id: 'false', value: false },
            { id: 'true', value: true },
            { id: 'array', value: [] },
            { id: 'object', value: {} },
            { id: 'function', value: function() {} },
            { id: 'symbol', value: Symbol('test') },
            { id: 'bigint', value: BigInt(9007199254740991) },
            { id: 'date', value: new Date() },
            { id: 'regex', value: /test/gi },
            { id: 'error', value: new Error('test error') },
        ];
    },

    /**
     * 生成内存压力测试数据（大量大对象）
     */
    generateMemoryPressureData(count = 10000) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push({
                id: i,
                // 每个对象约1MB
                largeBuffer: new Array(250000).fill('x').join(''),
                nested: {
                    level1: {
                        level2: {
                            level3: {
                                level4: {
                                    level5: 'deep value'
                                }
                            }
                        }
                    }
                }
            });
        }
        return data;
    }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StressTestData;
}
