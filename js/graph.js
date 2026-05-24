/**
 * ArkTS Knowledge Graph - Graph Visualization
 * Uses Vis.js for network visualization
 */

// Bug #77修复: 使用window.KGLog确保跨文件全局可见
if (typeof window.KGLog === 'undefined') {
    window.KGLog = {
        _enabled: true,
        _prefix: '[KG]',
        entry(method, msg) { if (this._enabled) console.log(`${this._prefix} ▶ ${method}: ${msg}`); },
        exit(method, msg) { if (this._enabled) console.log(`${this._prefix} ◀ ${method}: ${msg || 'done'}`); },
        info(method, msg) { if (this._enabled) console.log(`${this._prefix} ℹ ${method}: ${msg}`); },
        warn(method, msg) { if (this._enabled) console.warn(`${this._prefix} ⚠ ${method}: ${msg}`); },
        error(method, msg) { if (this._enabled) console.error(`${this._prefix} ✖ ${method}: ${msg}`); },
        data(method, msg, data) { if (this._enabled) console.log(`${this._prefix} 📊 ${method}: ${msg}`, data); }
    };
}
// Bug #77修复续: 使用var避免重复声明错误
var KGLog = window.KGLog;

class GraphVisualizer {
    constructor(containerId, options = {}) {
        KGLog.entry('GraphVisualizer.constructor', `containerId=${containerId}`);
        this.container = document.getElementById(containerId);
        // Bug #30修复: 容器不存在时给出警告而非后续崩溃
        if (!this.container) {
            console.warn(`GraphVisualizer: container #${containerId} not found`);
            KGLog.warn('GraphVisualizer.constructor', `container #${containerId} not found`);
        }
        this.network = null;
        this.nodes = null;
        this.edges = null;
        // Bug #71修复: 内置escapeHtml防止XSS
        this._escapeHtml = function(str) {
            if (str === null || str === undefined) return '';
            const div = document.createElement('div');
            div.textContent = String(str);
            return div.innerHTML;
        };
        this.options = {
            groups: {
                component: {
                    color: { background: '#4CAF50', border: '#388E3C' },
                    shape: 'dot',
                    font: { color: '#ffffff' }
                },
                utility: {
                    color: { background: '#2196F3', border: '#1976D2' },
                    shape: 'box',
                    font: { color: '#ffffff' }
                },
                interface: {
                    color: { background: '#FF9800', border: '#F57C00' },
                    shape: 'diamond',
                    font: { color: '#ffffff' }
                },
                model: {
                    color: { background: '#9C27B0', border: '#7B1FA2' },
                    shape: 'ellipse',
                    font: { color: '#ffffff' }
                },
                service: {
                    color: { background: '#00BCD4', border: '#0097A7' },
                    shape: 'hexagon',
                    font: { color: '#ffffff' }
                },
                enum: {
                    color: { background: '#607D8B', border: '#455A64' },
                    shape: 'triangle',
                    font: { color: '#ffffff' }
                }
            },
            physics: {
                enabled: true,
                barnesHut: {
                    gravitationalConstant: -2000,
                    centralGravity: 0.3,
                    springLength: 150,
                    springConstant: 0.04,
                    damping: 0.09,
                    avoidOverlap: 0.2
                },
                stabilization: {
                    enabled: true,
                    iterations: 200,
                    updateInterval: 25,
                    // Bug #79修复: 添加超时保护，防止大规模数据导致浏览器卡死
                    onlyDynamicEdges: false,
                    fit: true
                },
                // Bug #79修复: 自适应时间步长，大数据量时降低精度保证响应
                adaptiveTimestep: true
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                hideEdgesOnDrag: true,
                navigationButtons: true,
                keyboard: true
            },
            // Bug #71修复: 禁用HTML渲染，使用纯文本
            // Bug #93修复: 标签不再预转义，由showNodeDetails统一转义
            nodes: {
                font: { multi: false }
            },
            layout: {
                improvedLayout: true
            },
            ...options
        };
        // Bug #136 fix: 初始化节流版本的highlightConnected
        this._throttledHighlightConnected = this._createThrottledHighlight(100);
        KGLog.exit('GraphVisualizer.constructor', 'options configured');
    }

    /**
     * Bug #136 fix: 创建节流版本的highlightConnected
     */
    _createThrottledHighlight(limit) {
        let inThrottle = false;
        let lastArgs = null;
        const self = this;
        return function(nodeId) {
            lastArgs = nodeId;
            if (!inThrottle) {
                self._highlightConnectedImpl(nodeId);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                    // 如果在节流期间有新的调用，执行最后一次
                    if (lastArgs !== nodeId) {
                        self._highlightConnectedImpl(lastArgs);
                    }
                }, limit);
            }
        };
    }

    /**
     * Initialize the network with data
     */
    init(nodesData, edgesData) {
        KGLog.entry('GraphVisualizer.init', `nodes=${nodesData ? nodesData.length : 0}, edges=${edgesData ? edgesData.length : 0}`);
        // Bug #30修复: 容器不存在时安全返回
        if (!this.container) {
            console.error('GraphVisualizer.init: container is null');
            KGLog.error('GraphVisualizer.init', 'container is null');
            return null;
        }
        // Bug #79修复: 数据规模限制保护，防止浏览器卡死
        // Bug #129修复: 智能截断 + 边关系验证，防止边指向不存在的节点
        const MAX_NODES = 2000;
        const MAX_EDGES = 5000;
        const nodeCount = nodesData ? nodesData.length : 0;
        const edgeCount = edgesData ? edgesData.length : 0;

        if (nodeCount > MAX_NODES) {
            KGLog.warn('GraphVisualizer.init', `Node count ${nodeCount} exceeds limit ${MAX_NODES}, applying smart sampling`);
            // 保留重要节点（有更多连接的节点）
            const nodeConnectionCount = {};
            edgesData.forEach(e => {
                nodeConnectionCount[e.from] = (nodeConnectionCount[e.from] || 0) + 1;
                nodeConnectionCount[e.to] = (nodeConnectionCount[e.to] || 0) + 1;
            });

            // 按连接数排序，保留连接最多的节点
            nodesData = nodesData.slice().sort((a, b) =>
                (nodeConnectionCount[b.id] || 0) - (nodeConnectionCount[a.id] || 0)
            ).slice(0, MAX_NODES);

            // 创建有效节点ID集合
            const validNodeIds = new Set(nodesData.map(n => n.id));

            // 过滤无效边（边两端都必须在有效节点集合中）
            const originalEdgeCount = edgesData.length;
            edgesData = edgesData.filter(e => validNodeIds.has(e.from) && validNodeIds.has(e.to));

            // 如果边数仍超限，再截断
            if (edgesData.length > MAX_EDGES) {
                edgesData = edgesData.slice(0, MAX_EDGES);
            }

            KGLog.info('GraphVisualizer.init', `Smart sampling: ${nodeCount}→${nodesData.length} nodes, ${originalEdgeCount}→${edgesData.length} edges`);
        } else if (edgeCount > MAX_EDGES) {
            KGLog.warn('GraphVisualizer.init', `Edge count ${edgeCount} exceeds limit ${MAX_EDGES}, truncating`);
            edgesData = edgesData.slice(0, MAX_EDGES);
        }
        try {
            // Ensure container has minimum dimensions
            const rect = this.container.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                this.container.style.minHeight = '400px';
                this.container.style.minWidth = '300px';
                KGLog.info('GraphVisualizer.init', 'container had zero dimensions, set minimums');
            }

            // Bug #93修复: vis.js已禁用HTML渲染(multi:false)，标签作为纯文本显示，无需预转义
            // showNodeDetails中使用innerHTML时再通过escapeHtml转义
            const safeNodes = nodesData.map(node => ({
                ...node
            }));
            KGLog.info('GraphVisualizer.init', `prepared ${safeNodes.length} nodes`);

            // Create DataSets
            this.nodes = new vis.DataSet(safeNodes);
            this.edges = new vis.DataSet(edgesData);

            // Create network
            const data = { nodes: this.nodes, edges: this.edges };
            this.network = new vis.Network(this.container, data, this.options);
            KGLog.info('GraphVisualizer.init', 'vis.Network created');

            // Setup event handlers
            this.setupEvents();

            // Auto-fit after stabilization
            // Bug #74修复: 添加null检查，防止destroy后stabilization回调触发崩溃
            this.network.once('stabilizationIterationsDone', () => {
                if (this.network) {
                    this.network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
                }
            });

            KGLog.exit('GraphVisualizer.init', 'network initialized');
            return this.network;
        } catch (e) {
            console.error('GraphVisualizer.init failed:', e);
            KGLog.error('GraphVisualizer.init', `failed: ${e.message}`);
            return null;
        }
    }

    /**
     * Setup network event handlers
     */
    setupEvents() {
        KGLog.entry('GraphVisualizer.setupEvents', 'registering event handlers');
        // Click event
        this.network.on('click', (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                this.onNodeClick(nodeId);
            }
        });
        KGLog.info('GraphVisualizer.setupEvents', 'registered: click');

        // Hover event
        // Bug #74修复: 添加null检查，防止destroy后事件回调崩溃
        this.network.on('hoverNode', (params) => {
            if (this.container) this.container.style.cursor = 'pointer';
        });

        this.network.on('blurNode', (params) => {
            if (this.container) this.container.style.cursor = 'default';
        });
        KGLog.info('GraphVisualizer.setupEvents', 'registered: hoverNode, blurNode');

        // Double click to focus
        this.network.on('doubleClick', (params) => {
            if (params.nodes.length > 0) {
                this.focusNode(params.nodes[0]);
            }
        });
        KGLog.info('GraphVisualizer.setupEvents', 'registered: doubleClick');

        // Stabilization progress
        this.network.on('stabilizationProgress', (params) => {
            // Bug #90修复: 防止params.total为0导致除零错误
            const progress = params.total > 0 ? Math.round((params.iterations / params.total) * 100) : 0;
            console.log('Stabilization: ' + progress + '%');
        });
        KGLog.info('GraphVisualizer.setupEvents', 'registered: stabilizationProgress');
        KGLog.exit('GraphVisualizer.setupEvents', 'all handlers registered');
    }

    /**
     * Handle node click
     */
    onNodeClick(nodeId) {
        KGLog.entry('GraphVisualizer.onNodeClick', `nodeId=${nodeId}`);
        // Bug #74修复: 添加null检查，防止destroy后回调崩溃
        if (!this.nodes) {
            KGLog.warn('GraphVisualizer.onNodeClick', 'nodes dataset is null, skipping');
            return;
        }
        const node = this.nodes.get(nodeId);
        if (node && window.showNodeDetails) {
            window.showNodeDetails(node);
            KGLog.exit('GraphVisualizer.onNodeClick', `dispatched showNodeDetails for "${node.label}"`);
        } else {
            KGLog.warn('GraphVisualizer.onNodeClick', `node not found or showNodeDetails unavailable`);
        }
    }

    /**
     * Focus on a specific node
     */
    focusNode(nodeId, options = {}) {
        KGLog.entry('GraphVisualizer.focusNode', `nodeId=${nodeId}, options=${JSON.stringify(options)}`);
        if (!this.network) {
            KGLog.warn('GraphVisualizer.focusNode', 'network is null, skipping');
            return;
        }
        const defaultOptions = {
            scale: 1.2,
            animation: {
                duration: 500,
                easingFunction: 'easeInOutQuad'
            }
        };
        this.network.focus(nodeId, { ...defaultOptions, ...options });
        KGLog.exit('GraphVisualizer.focusNode', `focused on node ${nodeId}`);
    }

    /**
     * Fit all nodes in view
     */
    fit(options = {}) {
        KGLog.entry('GraphVisualizer.fit', `options=${JSON.stringify(options)}`);
        if (!this.network) {
            KGLog.warn('GraphVisualizer.fit', 'network is null, skipping');
            return;
        }
        const defaultOptions = {
            animation: {
                duration: 500,
                easingFunction: 'easeInOutQuad'
            }
        };
        this.network.fit({ ...defaultOptions, ...options });
        KGLog.exit('GraphVisualizer.fit', 'done');
    }

    /**
     * Toggle physics simulation
     */
    togglePhysics() {
        KGLog.entry('GraphVisualizer.togglePhysics', '');
        if (!this.network) {
            KGLog.warn('GraphVisualizer.togglePhysics', 'network is null, skipping');
            return false;
        }
        const currentState = this.network.physics.physicsEnabled;
        KGLog.info('GraphVisualizer.togglePhysics', `current state: ${currentState}`);
        this.network.setOptions({ physics: { enabled: !currentState } });
        KGLog.exit('GraphVisualizer.togglePhysics', `physics ${currentState ? 'disabled' : 'enabled'}`);
        return !currentState;
    }

    /**
     * Highlight connected nodes
     */
    highlightConnected(nodeId) {
        // Bug #136 fix: 使用节流版本
        this._throttledHighlightConnected(nodeId);
    }

    /**
     * Internal highlight connected nodes implementation
     */
    _highlightConnectedImpl(nodeId) {
        KGLog.entry('GraphVisualizer.highlightConnected', `nodeId=${nodeId}`);
        if (!this.network || !this.nodes || !this.edges) {
            KGLog.warn('GraphVisualizer.highlightConnected', 'network/nodes/edges is null, skipping');
            return;
        }
        const connectedNodes = this.network.getConnectedNodes(nodeId);
        const connectedEdges = this.network.getConnectedEdges(nodeId);
        KGLog.info('GraphVisualizer.highlightConnected', `connected nodes=${connectedNodes.length}, edges=${connectedEdges.length}`);

        // Bug #56修复: 使用Set替代includes，O(1)查找替代O(n)
        const connectedNodeSet = new Set(connectedNodes);
        const connectedEdgeSet = new Set(connectedEdges);

        // Dim all nodes
        const allNodes = this.nodes.get();
        const updateArray = [];

        for (const node of allNodes) {
            if (node.id === nodeId || connectedNodeSet.has(node.id)) {
                updateArray.push({
                    id: node.id,
                    color: null, // Reset to group color
                    opacity: 1
                });
            } else {
                updateArray.push({
                    id: node.id,
                    color: { background: '#334155', border: '#475569' },
                    opacity: 0.3
                });
            }
        }

        this.nodes.update(updateArray);

        // Highlight edges
        const allEdges = this.edges.get();
        const edgeUpdateArray = [];

        for (const edge of allEdges) {
            if (connectedEdgeSet.has(edge.id)) {
                edgeUpdateArray.push({
                    id: edge.id,
                    color: { color: '#2563eb', opacity: 1 },
                    width: 3
                });
            } else {
                edgeUpdateArray.push({
                    id: edge.id,
                    color: { color: '#475569', opacity: 0.2 },
                    width: 1
                });
            }
        }

        this.edges.update(edgeUpdateArray);
        KGLog.exit('GraphVisualizer.highlightConnected', `updated ${updateArray.length} nodes, ${edgeUpdateArray.length} edges`);
    }

    /**
     * Reset highlighting
     */
    resetHighlight() {
        if (!this.nodes || !this.edges) return;
        const allNodes = this.nodes.get();
        const nodeUpdateArray = allNodes.map(node => ({
            id: node.id,
            color: null,
            opacity: 1
        }));
        this.nodes.update(nodeUpdateArray);

        const allEdges = this.edges.get();
        const edgeUpdateArray = allEdges.map(edge => ({
            id: edge.id,
            color: null,
            width: 1
        }));
        this.edges.update(edgeUpdateArray);
    }

    /**
     * Search and highlight nodes
     */
    searchNodes(query) {
        KGLog.entry('GraphVisualizer.searchNodes', `query="${query}"`);
        if (!this.nodes || !query) {
            KGLog.warn('GraphVisualizer.searchNodes', 'nodes dataset is null or query is empty');
            return [];
        }
        const allNodes = this.nodes.get();
        const matchedNodes = allNodes.filter(node =>
            (node.label || '').toLowerCase().includes(query.toLowerCase()) ||
            (node.title && node.title.toLowerCase().includes(query.toLowerCase()))
        );
        KGLog.info('GraphVisualizer.searchNodes', `found ${matchedNodes.length} matches`);

        if (matchedNodes.length > 0) {
            // Focus on first match
            this.focusNode(matchedNodes[0].id);
            
            // Highlight matches
            // Bug #91修复: 仅匹配节点设置borderWidthSelected=4，非匹配节点恢复默认
            const matchedSet = new Set(matchedNodes.map(m => m.id));
            const updateArray = allNodes.map(node => ({
                id: node.id,
                borderWidth: matchedSet.has(node.id) ? 4 : 1,
                borderWidthSelected: matchedSet.has(node.id) ? 4 : 2
            }));
            this.nodes.update(updateArray);
        }

        KGLog.exit('GraphVisualizer.searchNodes', `returning ${matchedNodes.length} results`);
        return matchedNodes;
    }

    /**
     * Export graph as image
     */
    exportImage() {
        KGLog.entry('GraphVisualizer.exportImage', '');
        if (!this.container) {
            KGLog.warn('GraphVisualizer.exportImage', 'container is null, skipping');
            return;
        }
        const canvas = this.container.getElementsByTagName('canvas')[0];
        if (!canvas) {
            console.warn('GraphVisualizer.exportImage: no canvas found');
            KGLog.warn('GraphVisualizer.exportImage', 'no canvas found');
            return;
        }
        try {
            const link = document.createElement('a');
            link.download = 'knowledge-graph.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            KGLog.exit('GraphVisualizer.exportImage', 'exported as knowledge-graph.png');
        } catch (e) {
            console.error('GraphVisualizer.exportImage failed:', e);
            KGLog.error('GraphVisualizer.exportImage', `failed: ${e.message}`);
        }
    }

    /**
     * Destroy the network
     */
    destroy() {
        KGLog.entry('GraphVisualizer.destroy', 'cleaning up');
        // Bug #74修复: 先移除所有事件监听器，防止destroy后回调触发
        if (this.network) {
            this.network.off('click');
            this.network.off('hoverNode');
            this.network.off('blurNode');
            this.network.off('doubleClick');
            this.network.off('stabilizationProgress');
            this.network.off('stabilizationIterationsDone');
            this.network.destroy();
            this.network = null;
            KGLog.info('GraphVisualizer.destroy', 'network events removed and destroyed');
        }
        if (this.nodes) {
            this.nodes.clear();
            this.nodes = null;
            KGLog.info('GraphVisualizer.destroy', 'nodes dataset cleared');
        }
        if (this.edges) {
            this.edges.clear();
            this.edges = null;
            KGLog.info('GraphVisualizer.destroy', 'edges dataset cleared');
        }
        this.container = null;
        KGLog.exit('GraphVisualizer.destroy', 'cleanup complete');
    }
}

/**
 * D3.js Tree Layout for hierarchical data
 */
class TreeVisualizer {
    constructor(containerId, options = {}) {
        KGLog.entry('TreeVisualizer.constructor', `containerId=${containerId}`);
        this.container = d3.select(`#${containerId}`);
        // Bug #66修复: 容器不存在时给出警告
        const containerNode = this.container.node();
        if (!containerNode) {
            console.warn(`TreeVisualizer: container #${containerId} not found`);
            KGLog.warn('TreeVisualizer.constructor', `container #${containerId} not found`);
        }
        this.options = {
            width: 800,
            height: 600,
            nodeRadius: 8,
            duration: 500,
            ...options
        };
        this.root = null;
        this.svg = null;
        this.g = null;
        this.tree = null;
        this.i = 0; // 节点ID计数器
        KGLog.exit('TreeVisualizer.constructor', 'options configured');
    }

    init(data) {
        KGLog.entry('TreeVisualizer.init', `root name="${data ? data.name : 'null'}"`);
        // Clear container
        this.container.selectAll('*').remove();
        this.i = 0; // 重置计数器

        // 获取容器实际尺寸
        const containerNode = this.container.node();
        if (containerNode) {
            const rect = containerNode.getBoundingClientRect();
            if (rect.width > 0) this.options.width = rect.width;
            if (rect.height > 0) this.options.height = rect.height;
        }

        // Setup SVG with responsive sizing
        this.svg = this.container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.options.width} ${this.options.height}`)
            .call(d3.zoom().on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            }));

        this.g = this.svg.append('g')
            .attr('transform', `translate(40,${this.options.height / 2})`);

        // Create tree layout
        this.tree = d3.tree()
            .nodeSize([28, 200]);

        // Process data
        this.root = d3.hierarchy(data);
        this.root.x0 = 0;
        this.root.y0 = 0;

        // Collapse all after level 2
        if (this.root.children) {
            this.root.children.forEach(child => this.collapse(child));
        }

        const nodeCount = this.root.descendants().length;
        const depth = this.root.height;
        KGLog.info('TreeVisualizer.init', `depth=${depth}, nodeCount=${nodeCount}`);

        this.update(this.root);

        KGLog.exit('TreeVisualizer.init', 'tree rendered');
        return this;
    }

    collapse(d) {
        if (d.children && d.depth >= 1) {
            d._children = d.children;
            d._children.forEach(child => this.collapse(child));
            d.children = null;
        }
    }

    update(source) {
        const treeData = this.tree(this.root);
        const nodes = treeData.descendants();
        const links = treeData.links();

        // Normalize for fixed-depth
        nodes.forEach(d => { d.y = d.depth * 180; });

        // Update nodes
        const node = this.g.selectAll('g.node')
            .data(nodes, d => d.id || (d.id = ++this.i));

        // Enter new nodes
        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${source.y0},${source.x0})`)
            .on('click', (event, d) => this.click(d));

        nodeEnter.append('circle')
            .attr('r', 1e-6)
            .style('fill', d => d._children ? '#2563eb' : (d.data.type === 'folder' ? '#f59e0b' : '#1e293b'))
            .style('stroke', d => d.data.type === 'folder' ? '#f59e0b' : '#2563eb')
            .style('stroke-width', 2)
            .style('cursor', 'pointer');

        nodeEnter.append('text')
            .attr('dy', '.35em')
            .attr('x', d => (d.children || d._children) ? -13 : 13)
            .attr('text-anchor', d => (d.children || d._children) ? 'end' : 'start')
            .text(d => d.data.name)
            .style('fill', '#f1f5f9')
            .style('font-size', '12px')
            .style('pointer-events', 'none');

        // Update
        const nodeUpdate = node.merge(nodeEnter);

        nodeUpdate.transition()
            .duration(this.options.duration)
            .attr('transform', d => `translate(${d.y},${d.x})`);

        nodeUpdate.select('circle')
            .attr('r', this.options.nodeRadius)
            .style('fill', d => d._children ? '#2563eb' : (d.data.type === 'folder' ? '#f59e0b' : '#1e293b'));

        // Exit
        const nodeExit = node.exit().transition()
            .duration(this.options.duration)
            .attr('transform', d => `translate(${source.y},${source.x})`)
            .remove();

        nodeExit.select('circle').attr('r', 1e-6);
        nodeExit.select('text').style('fill-opacity', 1e-6);

        // Update links
        const link = this.g.selectAll('path.link')
            .data(links, d => d.target.id);

        const linkEnter = link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('d', d => {
                const o = { x: source.x0, y: source.y0 };
                return this.diagonal(o, o);
            })
            .style('fill', 'none')
            .style('stroke', '#475569')
            .style('stroke-width', 1.5);

        const linkUpdate = link.merge(linkEnter);

        linkUpdate.transition()
            .duration(this.options.duration)
            .attr('d', d => this.diagonal(d.source, d.target));

        const linkExit = link.exit().transition()
            .duration(this.options.duration)
            .attr('d', d => {
                const o = { x: source.x, y: source.y };
                return this.diagonal(o, o);
            })
            .remove();

        // Store old positions
        nodes.forEach(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    diagonal(s, d) {
        return `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`;
    }

    click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        this.update(d);
    }

    expandAll() {
        KGLog.entry('TreeVisualizer.expandAll', '');
        if (this.root) {
            this.expandNode(this.root);
            this.update(this.root);
            KGLog.exit('TreeVisualizer.expandAll', 'all nodes expanded');
        } else {
            KGLog.warn('TreeVisualizer.expandAll', 'root is null, skipping');
        }
    }

    collapseAll() {
        KGLog.entry('TreeVisualizer.collapseAll', '');
        if (this.root) {
            if (this.root.children) {
                this.root.children.forEach(child => this.collapse(child));
            }
            this.update(this.root);
            KGLog.exit('TreeVisualizer.collapseAll', 'all nodes collapsed');
        } else {
            KGLog.warn('TreeVisualizer.collapseAll', 'root is null, skipping');
        }
    }

    expandNode(d) {
        if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        if (d.children) {
            d.children.forEach(child => this.expandNode(child));
        }
    }

    // Bug #30修复: 添加destroy方法防止内存泄漏
    // Bug #80修复: 正确移除D3 zoom事件监听器
    destroy() {
        KGLog.entry('TreeVisualizer.destroy', 'cleaning up');
        if (this.svg) {
            // 正确移除zoom事件 - D3 v7语法
            this.svg.on('zoom', null);
            this.svg.selectAll('*').remove();
            this.svg.remove();
            this.svg = null;
            KGLog.info('TreeVisualizer.destroy', 'SVG and zoom events removed');
        }
        this.g = null;
        this.root = null;
        this.tree = null;
        this.container = null;
        KGLog.exit('TreeVisualizer.destroy', 'cleanup complete');
    }
}

/**
 * Sunburst Chart for file structure
 */
class SunburstVisualizer {
    constructor(containerId, options = {}) {
        KGLog.entry('SunburstVisualizer.constructor', `containerId=${containerId}`);
        this.container = d3.select(`#${containerId}`);
        // Bug #67修复: 容器不存在时给出警告
        const containerNode = this.container.node();
        if (!containerNode) {
            console.warn(`SunburstVisualizer: container #${containerId} not found`);
            KGLog.warn('SunburstVisualizer.constructor', `container #${containerId} not found`);
        }
        this.options = {
            width: 600,
            height: 600,
            radius: 300,
            ...options
        };
        KGLog.exit('SunburstVisualizer.constructor', 'options configured');
    }

    init(data) {
        KGLog.entry('SunburstVisualizer.init', `root name="${data ? data.name : 'null'}"`);
        // Clear container
        this.container.selectAll('*').remove();

        const width = this.options.width;
        const height = this.options.height;
        const radius = this.options.radius;

        // Create partition layout
        const partition = d3.partition()
            .size([2 * Math.PI, radius]);

        // Create arc generator
        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(radius / 2)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1 - 1);

        // Process data
        const root = d3.hierarchy(data)
            .sum(d => d.size || 0)
            .sort((a, b) => b.value - a.value);

        partition(root);

        const depth = root.height;
        const nodeCount = root.descendants().length;
        KGLog.info('SunburstVisualizer.init', `depth=${depth}, nodeCount=${nodeCount}`);

        // Create SVG
        const svg = this.container.append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Color scale
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Draw arcs
        const path = svg.append('g')
            .selectAll('path')
            .data(root.descendants().filter(d => d.depth))
            .join('path')
            .attr('fill', d => {
                // Bug #37修复: 使用临时变量避免修改D3绑定的数据引用
                let ancestor = d;
                while (ancestor.depth > 1) ancestor = ancestor.parent;
                return color(ancestor.data.name);
            })
            .attr('d', arc)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this).style('opacity', 0.8);
            })
            .on('mouseout', function() {
                d3.select(this).style('opacity', 1);
            });

        // Add labels
        const label = svg.append('g')
            .attr('pointer-events', 'none')
            .attr('text-anchor', 'middle')
            .style('user-select', 'none')
            .selectAll('text')
            .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
            .join('text')
            .attr('transform', function(d) {
                const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                const y = (d.y0 + d.y1) / 2;
                return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
            })
            .attr('dy', '0.35em')
            .text(d => d.data.name)
            .style('font-size', '10px')
            .style('fill', '#f1f5f9');

        // Center circle
        svg.append('circle')
            .attr('r', radius / 6)
            .attr('fill', '#1e293b')
            .attr('stroke', '#334155');

        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .text(data.name)
            .style('font-size', '12px')
            .style('fill', '#f1f5f9');

        KGLog.exit('SunburstVisualizer.init', 'sunburst rendered');
        return this;
    }

    // Bug #30修复: 添加destroy方法防止内存泄漏
    destroy() {
        KGLog.entry('SunburstVisualizer.destroy', 'cleaning up');
        this.container.selectAll('*').remove();
        this.container = null;
        KGLog.exit('SunburstVisualizer.destroy', 'cleanup complete');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GraphVisualizer, TreeVisualizer, SunburstVisualizer };
}
