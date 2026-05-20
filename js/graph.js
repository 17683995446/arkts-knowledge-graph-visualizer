/**
 * ArkTS Knowledge Graph - Graph Visualization
 * Uses Vis.js for network visualization
 */

class GraphVisualizer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        // Bug #30修复: 容器不存在时给出警告而非后续崩溃
        if (!this.container) {
            console.warn(`GraphVisualizer: container #${containerId} not found`);
        }
        this.network = null;
        this.nodes = null;
        this.edges = null;
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
                    iterations: 200
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                hideEdgesOnDrag: true,
                navigationButtons: true,
                keyboard: true
            },
            layout: {
                improvedLayout: true
            },
            ...options
        };
    }

    /**
     * Initialize the network with data
     */
    init(nodesData, edgesData) {
        // Bug #30修复: 容器不存在时安全返回
        if (!this.container) {
            console.error('GraphVisualizer.init: container is null');
            return null;
        }
        try {
            // Ensure container has minimum dimensions
            const rect = this.container.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                this.container.style.minHeight = '400px';
                this.container.style.minWidth = '300px';
            }

            // Create DataSets
            this.nodes = new vis.DataSet(nodesData);
            this.edges = new vis.DataSet(edgesData);

            // Create network
            const data = { nodes: this.nodes, edges: this.edges };
            this.network = new vis.Network(this.container, data, this.options);

            // Setup event handlers
            this.setupEvents();

            // Auto-fit after stabilization
            this.network.once('stabilizationIterationsDone', () => {
                this.network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
            });

            return this.network;
        } catch (e) {
            console.error('GraphVisualizer.init failed:', e);
            return null;
        }
    }

    /**
     * Setup network event handlers
     */
    setupEvents() {
        // Click event
        this.network.on('click', (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                this.onNodeClick(nodeId);
            }
        });

        // Hover event
        this.network.on('hoverNode', (params) => {
            this.container.style.cursor = 'pointer';
        });

        this.network.on('blurNode', (params) => {
            this.container.style.cursor = 'default';
        });

        // Double click to focus
        this.network.on('doubleClick', (params) => {
            if (params.nodes.length > 0) {
                this.focusNode(params.nodes[0]);
            }
        });

        // Stabilization progress
        this.network.on('stabilizationProgress', (params) => {
            const progress = Math.round((params.iterations / params.total) * 100);
            console.log('Stabilization: ' + progress + '%');
        });
    }

    /**
     * Handle node click
     */
    onNodeClick(nodeId) {
        const node = this.nodes.get(nodeId);
        if (node && window.showNodeDetails) {
            window.showNodeDetails(node);
        }
    }

    /**
     * Focus on a specific node
     */
    focusNode(nodeId, options = {}) {
        if (!this.network) return;
        const defaultOptions = {
            scale: 1.2,
            animation: {
                duration: 500,
                easingFunction: 'easeInOutQuad'
            }
        };
        this.network.focus(nodeId, { ...defaultOptions, ...options });
    }

    /**
     * Fit all nodes in view
     */
    fit(options = {}) {
        if (!this.network) return;
        const defaultOptions = {
            animation: {
                duration: 500,
                easingFunction: 'easeInOutQuad'
            }
        };
        this.network.fit({ ...defaultOptions, ...options });
    }

    /**
     * Toggle physics simulation
     */
    togglePhysics() {
        if (!this.network) return false;
        const currentState = this.network.physics.physicsEnabled;
        this.network.setOptions({ physics: { enabled: !currentState } });
        return !currentState;
    }

    /**
     * Highlight connected nodes
     */
    highlightConnected(nodeId) {
        if (!this.network || !this.nodes || !this.edges) return;
        const connectedNodes = this.network.getConnectedNodes(nodeId);
        const connectedEdges = this.network.getConnectedEdges(nodeId);

        // Dim all nodes
        const allNodes = this.nodes.get();
        const updateArray = [];

        for (const node of allNodes) {
            if (node.id === nodeId || connectedNodes.includes(node.id)) {
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
            if (connectedEdges.includes(edge.id)) {
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
    }

    /**
     * Reset highlighting
     */
    resetHighlight() {
        if (!this.nodes || !this.edges) return;
        const allNodes = this.nodes.get();
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
        if (!this.nodes || !query) return [];
        const allNodes = this.nodes.get();
        const matchedNodes = allNodes.filter(node =>
            (node.label || '').toLowerCase().includes(query.toLowerCase()) ||
            (node.title && node.title.toLowerCase().includes(query.toLowerCase()))
        );

        if (matchedNodes.length > 0) {
            // Focus on first match
            this.focusNode(matchedNodes[0].id);
            
            // Highlight matches
            const updateArray = allNodes.map(node => ({
                id: node.id,
                borderWidth: matchedNodes.some(m => m.id === node.id) ? 4 : 1,
                borderWidthSelected: 4
            }));
            this.nodes.update(updateArray);
        }

        return matchedNodes;
    }

    /**
     * Export graph as image
     */
    exportImage() {
        if (!this.container) return;
        const canvas = this.container.getElementsByTagName('canvas')[0];
        if (!canvas) {
            console.warn('GraphVisualizer.exportImage: no canvas found');
            return;
        }
        try {
            const link = document.createElement('a');
            link.download = 'knowledge-graph.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('GraphVisualizer.exportImage failed:', e);
        }
    }

    /**
     * Destroy the network
     */
    destroy() {
        if (this.network) {
            this.network.destroy();
            this.network = null;
        }
        if (this.nodes) {
            this.nodes.clear();
            this.nodes = null;
        }
        if (this.edges) {
            this.edges.clear();
            this.edges = null;
        }
        this.container = null;
    }
}

/**
 * D3.js Tree Layout for hierarchical data
 */
class TreeVisualizer {
    constructor(containerId, options = {}) {
        this.container = d3.select(`#${containerId}`);
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
    }

    init(data) {
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

        this.update(this.root);

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
        if (this.root) {
            this.expandNode(this.root);
            this.update(this.root);
        }
    }

    collapseAll() {
        if (this.root) {
            if (this.root.children) {
                this.root.children.forEach(child => this.collapse(child));
            }
            this.update(this.root);
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
    destroy() {
        if (this.svg) {
            this.svg.on('.zoom', null); // 移除D3 zoom事件
            this.svg.remove();
            this.svg = null;
        }
        this.g = null;
        this.root = null;
        this.tree = null;
        this.container = null;
    }
}

/**
 * Sunburst Chart for file structure
 */
class SunburstVisualizer {
    constructor(containerId, options = {}) {
        this.container = d3.select(`#${containerId}`);
        this.options = {
            width: 600,
            height: 600,
            radius: 300,
            ...options
        };
    }

    init(data) {
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
                while (d.depth > 1) d = d.parent;
                return color(d.data.name);
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

        return this;
    }

    // Bug #30修复: 添加destroy方法防止内存泄漏
    destroy() {
        this.container.selectAll('*').remove();
        this.container = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GraphVisualizer, TreeVisualizer, SunburstVisualizer };
}
