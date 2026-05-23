/**
 * ArkTS Knowledge Graph Visualizer - Main Application
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

// Global instances
let graphVisualizer = null;
let chartManager = null;

/**
 * Initialize dashboard
 */
function initDashboard() {
    KGLog.entry('initDashboard', 'Initializing dashboard');
    // Initialize chart manager
    chartManager = new ChartManager();
    KGLog.info('initDashboard', 'ChartManager created');
    
    // Initialize overview graph
    initOverviewGraph();
    
    // Initialize charts
    initCharts();
    
    // Setup event listeners
    setupEventListeners();
    
    // Animate stats
    animateStats();
    KGLog.exit('initDashboard', 'Dashboard initialized');
}

/**
 * Initialize overview network graph
 */
function initOverviewGraph() {
    KGLog.entry('initOverviewGraph', 'Initializing overview graph');
    const container = document.getElementById('overviewGraph');
    if (!container) {
        KGLog.warn('initOverviewGraph', 'Container #overviewGraph not found');
        return;
    }
    
    graphVisualizer = new GraphVisualizer('overviewGraph', {
        physics: {
            enabled: true,
            barnesHut: {
                gravitationalConstant: -3000,
                centralGravity: 0.3,
                springLength: 120,
                springConstant: 0.04,
                damping: 0.09
            }
        }
    });
    KGLog.info('initOverviewGraph', 'GraphVisualizer created');
    
    const data = KGData.projectStructure;
    graphVisualizer.init(data.nodes, data.edges);
    KGLog.data('initOverviewGraph', 'Graph initialized', { nodes: data.nodes.length, edges: data.edges.length });
    
    // Fit after stabilization
    setTimeout(() => {
        graphVisualizer.fit();
        KGLog.info('initOverviewGraph', 'Graph fit applied');
    }, 1000);
    KGLog.exit('initOverviewGraph');
}

/**
 * Initialize charts
 */
function initCharts() {
    KGLog.entry('initCharts', 'Initializing charts');
    // File type pie chart
    if (document.getElementById('fileTypeChart')) {
        chartManager.createPieChart('fileTypeChart', KGData.fileTypes);
        KGLog.info('initCharts', 'File type pie chart created');
    } else {
        KGLog.warn('initCharts', 'Container #fileTypeChart not found');
    }
    
    // Code trend line chart
    if (document.getElementById('codeTrendChart')) {
        chartManager.createLineChart('codeTrendChart', KGData.codeTrend);
        KGLog.info('initCharts', 'Code trend line chart created');
    } else {
        KGLog.warn('initCharts', 'Container #codeTrendChart not found');
    }
    KGLog.exit('initCharts');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    KGLog.entry('setupEventListeners', 'Setting up event listeners');
    // Global search
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
        KGLog.info('setupEventListeners', 'Global search listener attached');
    } else {
        KGLog.warn('setupEventListeners', 'Search input #globalSearch not found');
    }
    
    // Project selector
    const projectSelect = document.getElementById('projectSelect');
    if (projectSelect) {
        projectSelect.addEventListener('change', (e) => {
            loadProject(e.target.value);
        });
        KGLog.info('setupEventListeners', 'Project selector listener attached');
    } else {
        KGLog.warn('setupEventListeners', 'Project selector #projectSelect not found');
    }
    KGLog.exit('setupEventListeners');
}

/**
 * Animate statistics numbers
 */
function animateStats() {
    KGLog.entry('animateStats', 'Animating statistics');
    const stats = [
        { id: 'totalFiles', target: KGData.overview.totalFiles },
        { id: 'totalClasses', target: KGData.overview.totalClasses },
        { id: 'totalFunctions', target: KGData.overview.totalFunctions },
        { id: 'totalLines', target: KGData.overview.totalLines }
    ];
    
    stats.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (element) {
            animateNumber(element, 0, stat.target, 1500);
        } else {
            KGLog.warn('animateStats', `Element #${stat.id} not found`);
        }
    });
    KGLog.exit('animateStats', `${stats.length} stats queued`);
}

/**
 * Animate number counting
 */
function animateNumber(element, start, end, duration) {
    KGLog.entry('animateNumber', `Animating ${start} -> ${end} over ${duration}ms`);
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
    KGLog.exit('animateNumber');
}

/**
 * Perform global search
 */
function performSearch(query) {
    KGLog.entry('performSearch', `Query: "${query}"`);
    if (!query.trim()) {
        KGLog.warn('performSearch', 'Empty query, skipping');
        return;
    }
    
    // Search in graph
    if (graphVisualizer) {
        const results = graphVisualizer.searchNodes(query);
        if (results.length > 0) {
            KGLog.info('performSearch', `Found ${results.length} matching nodes`);
            showNotification(`Found ${results.length} matching nodes`);
        } else {
            KGLog.info('performSearch', 'No results found');
            showNotification('No results found', 'warning');
        }
    } else {
        KGLog.warn('performSearch', 'graphVisualizer not initialized');
    }
    KGLog.exit('performSearch');
}

/**
 * Load project data
 */
function loadProject(projectId) {
    KGLog.entry('loadProject', `Loading project: ${projectId}`);
    showNotification(`Loading project: ${projectId}...`);
    
    // Simulate loading
    setTimeout(() => {
        KGLog.info('loadProject', 'Reloading page');
        location.reload();
    }, 500);
}

/**
 * Run a query from the popular queries list
 */
function runQuery(element) {
    KGLog.entry('runQuery', 'Running popular query');
    // Bug #58修复: 添加null检查防止querySelector返回null
    const span = element ? element.querySelector('span') : null;
    if (!span) {
        KGLog.warn('runQuery', 'No span element found');
        return;
    }
    const queryText = span.textContent;
    KGLog.info('runQuery', `Query text: "${queryText}"`);
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.value = queryText;
        performSearch(queryText);
    } else {
        KGLog.warn('runQuery', 'Search input #globalSearch not found');
    }
    KGLog.exit('runQuery');
}

/**
 * Reset graph zoom
 */
function resetZoom() {
    KGLog.entry('resetZoom', 'Resetting graph zoom');
    if (graphVisualizer) {
        graphVisualizer.fit();
        KGLog.exit('resetZoom', 'Zoom reset applied');
    } else {
        KGLog.warn('resetZoom', 'graphVisualizer not initialized');
    }
}

/**
 * Toggle physics simulation
 */
function togglePhysics() {
    KGLog.entry('togglePhysics', 'Toggling physics simulation');
    if (graphVisualizer) {
        const enabled = graphVisualizer.togglePhysics();
        userPhysicsEnabled = enabled;
        KGLog.info('togglePhysics', `Physics ${enabled ? 'enabled' : 'paused'}`);
        showNotification(enabled ? 'Physics enabled' : 'Physics paused');
    } else {
        KGLog.warn('togglePhysics', 'graphVisualizer not initialized');
    }
    KGLog.exit('togglePhysics');
}

/**
 * Show node details modal
 */
function escapeHtml(str) {
    KGLog.entry('escapeHtml', `Input type: ${typeof str}`);
    if (str === null || str === undefined) {
        KGLog.warn('escapeHtml', 'Input is null/undefined, returning empty string');
        return '';
    }
    const div = document.createElement('div');
    div.textContent = String(str);
    const result = div.innerHTML;
    KGLog.exit('escapeHtml', `Output length: ${result.length}`);
    return result;
}

function showNodeDetails(node) {
    KGLog.entry('showNodeDetails', `Node id: ${node ? node.id : 'null'}, label: ${node ? node.label : 'null'}`);
    if (!node) { // Bug #32修复: 参数验证
        KGLog.warn('showNodeDetails', 'No node provided');
        return;
    }
    const modal = document.getElementById('detailModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    if (!modal || !title || !body) { // Bug #32修复: DOM元素null检查
        KGLog.error('showNodeDetails', 'Required DOM elements not found');
        return;
    }

    title.textContent = node.label;
    KGLog.info('showNodeDetails', `Showing details for "${node.label}" (group: ${node.group || 'Unknown'})`);

    // Build details HTML
    let detailsHtml = `
        <div class="node-details">
            <div class="detail-section">
                <h4>基本信息</h4>
                <table class="detail-table">
                    <tr><td>类型</td><td>${escapeHtml(node.group || 'Unknown')}</td></tr>
                    <tr><td>ID</td><td>${escapeHtml(node.id)}</td></tr>
                    <tr><td>大小</td><td>${escapeHtml(node.size || 'N/A')}</td></tr>
                </table>
            </div>
    `;

    if (node.title) {
        detailsHtml += `
            <div class="detail-section">
                <h4>描述</h4>
                <p>${escapeHtml(node.title)}</p>
            </div>
        `;
    }

    // Add connected nodes info
    if (graphVisualizer && graphVisualizer.network) {
        const connectedNodes = graphVisualizer.network.getConnectedNodes(node.id);
        if (connectedNodes.length > 0) {
            KGLog.info('showNodeDetails', `Found ${connectedNodes.length} connected nodes`);
            detailsHtml += `
                <div class="detail-section">
                    <h4>关联节点 (${connectedNodes.length})</h4>
                    <ul class="connected-list">
            `;
            connectedNodes.forEach(id => {
                const connectedNode = graphVisualizer.nodes.get(id);
                if (connectedNode) {
                    detailsHtml += `<li>${escapeHtml(connectedNode.label)}</li>`;
                }
            });
            detailsHtml += '</ul></div>';
        }
    }

    detailsHtml += '</div>';
    body.innerHTML = detailsHtml;
    
    modal.classList.add('active');
    KGLog.exit('showNodeDetails', 'Modal opened');
}

/**
 * Close modal
 */
function closeModal() {
    KGLog.entry('closeModal', 'Closing detail modal');
    const modal = document.getElementById('detailModal');
    if (modal) { // Bug #32修复: null检查
        modal.classList.remove('active');
        KGLog.exit('closeModal', 'Modal closed');
    } else {
        KGLog.warn('closeModal', 'Modal #detailModal not found');
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    KGLog.entry('showNotification', `message: "${message}", type: ${type}`);
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Bug #70修复: 不使用内联样式，依赖CSS类定义的颜色
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    KGLog.info('showNotification', 'Notification appended to DOM');
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
    KGLog.exit('showNotification');
}

/**
 * Export current graph as image
 */
function exportGraph() {
    KGLog.entry('exportGraph', 'Exporting graph as image');
    if (graphVisualizer) {
        graphVisualizer.exportImage();
        KGLog.info('exportGraph', 'Export initiated');
        showNotification('Graph exported successfully');
    } else {
        KGLog.warn('exportGraph', 'graphVisualizer not initialized');
    }
    KGLog.exit('exportGraph');
}

// Bug #32修复: 使用addEventListener替代直接赋值，避免覆盖其他handler
window.addEventListener('click', function(event) {
    const modal = document.getElementById('detailModal');
    if (modal && event.target === modal) {
        closeModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl/Cmd + F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Ctrl/Cmd + 0 to reset zoom
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        resetZoom();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .node-details {
        color: #f1f5f9;
    }
    
    .detail-section {
        margin-bottom: 20px;
    }
    
    .detail-section h4 {
        color: #2563eb;
        margin-bottom: 10px;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .detail-table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .detail-table td {
        padding: 8px 0;
        border-bottom: 1px solid #334155;
    }
    
    .detail-table td:first-child {
        color: #94a3b8;
        width: 30%;
    }
    
    .connected-list {
        list-style: none;
        padding: 0;
    }
    
    .connected-list li {
        padding: 6px 0;
        border-bottom: 1px solid #334155;
        color: #94a3b8;
    }
    
    .connected-list li:before {
        content: '→ ';
        color: #2563eb;
    }
`;
document.head.appendChild(style);

// Bug #32修复: 添加防抖函数
// Bug #82修复: 添加cancel方法防止内存泄漏
function debounce(fn, delay) {
    KGLog.entry('debounce', `Creating debounced function with ${delay}ms delay`);
    let timer = null;
    const debounced = function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
    // 添加cancel方法用于清理
    debounced.cancel = function() {
        clearTimeout(timer);
        timer = null;
        KGLog.info('debounce.cancel', 'timer cleared');
    };
    KGLog.exit('debounce');
    return debounced;
}

// Track user-set physics state
let userPhysicsEnabled = true;

// Page visibility API - pause physics when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (graphVisualizer && graphVisualizer.network) {
        if (document.hidden) {
            graphVisualizer.network.setOptions({ physics: { enabled: false } });
        } else if (userPhysicsEnabled) {
            graphVisualizer.network.setOptions({ physics: { enabled: true } });
        }
    }
});

// Bug #83修复: 使用命名函数存储debounce引用，便于清理
const resizeHandler = debounce(() => {
    if (graphVisualizer && graphVisualizer.network) {
        graphVisualizer.network.redraw();
    }
}, 250);
window.addEventListener('resize', resizeHandler);

// Export functions for global access
window.initDashboard = initDashboard;
window.showNodeDetails = showNodeDetails;
window.closeModal = closeModal;
window.resetZoom = resetZoom;
window.togglePhysics = togglePhysics;
window.runQuery = runQuery;
window.exportGraph = exportGraph;
