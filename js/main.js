/**
 * ArkTS Knowledge Graph Visualizer - Main Application
 */

// Global instances
let graphVisualizer = null;
let chartManager = null;

/**
 * Initialize dashboard
 */
function initDashboard() {
    // Initialize chart manager
    chartManager = new ChartManager();
    
    // Initialize overview graph
    initOverviewGraph();
    
    // Initialize charts
    initCharts();
    
    // Setup event listeners
    setupEventListeners();
    
    // Animate stats
    animateStats();
}

/**
 * Initialize overview network graph
 */
function initOverviewGraph() {
    const container = document.getElementById('overviewGraph');
    if (!container) return;
    
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
    
    const data = KGData.projectStructure;
    graphVisualizer.init(data.nodes, data.edges);
    
    // Fit after stabilization
    setTimeout(() => {
        graphVisualizer.fit();
    }, 1000);
}

/**
 * Initialize charts
 */
function initCharts() {
    // File type pie chart
    if (document.getElementById('fileTypeChart')) {
        chartManager.createPieChart('fileTypeChart', KGData.fileTypes);
    }
    
    // Code trend line chart
    if (document.getElementById('codeTrendChart')) {
        chartManager.createLineChart('codeTrendChart', KGData.codeTrend);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Global search
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }
    
    // Project selector
    const projectSelect = document.getElementById('projectSelect');
    if (projectSelect) {
        projectSelect.addEventListener('change', (e) => {
            loadProject(e.target.value);
        });
    }
}

/**
 * Animate statistics numbers
 */
function animateStats() {
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
        }
    });
}

/**
 * Animate number counting
 */
function animateNumber(element, start, end, duration) {
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
}

/**
 * Perform global search
 */
function performSearch(query) {
    if (!query.trim()) return;
    
    console.log('Searching for:', query);
    
    // Search in graph
    if (graphVisualizer) {
        const results = graphVisualizer.searchNodes(query);
        if (results.length > 0) {
            showNotification(`Found ${results.length} matching nodes`);
        } else {
            showNotification('No results found', 'warning');
        }
    }
}

/**
 * Load project data
 */
function loadProject(projectId) {
    showNotification(`Loading project: ${projectId}...`);
    
    // Simulate loading
    setTimeout(() => {
        location.reload();
    }, 500);
}

/**
 * Run a query from the popular queries list
 */
function runQuery(element) {
    const queryText = element.querySelector('span').textContent;
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.value = queryText;
        performSearch(queryText);
    }
}

/**
 * Reset graph zoom
 */
function resetZoom() {
    if (graphVisualizer) {
        graphVisualizer.fit();
    }
}

/**
 * Toggle physics simulation
 */
function togglePhysics() {
    if (graphVisualizer) {
        const enabled = graphVisualizer.togglePhysics();
        userPhysicsEnabled = enabled;
        showNotification(enabled ? 'Physics enabled' : 'Physics paused');
    }
}

/**
 * Show node details modal
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

function showNodeDetails(node) {
    if (!node) return; // Bug #32修复: 参数验证
    const modal = document.getElementById('detailModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    if (!modal || !title || !body) return; // Bug #32修复: DOM元素null检查

    title.textContent = node.label;

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
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) { // Bug #32修复: null检查
        modal.classList.remove('active');
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'warning' ? '#f59e0b' : '#2563eb'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Export current graph as image
 */
function exportGraph() {
    if (graphVisualizer) {
        graphVisualizer.exportImage();
        showNotification('Graph exported successfully');
    }
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
function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
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

// Handle window resize (with debounce)
window.addEventListener('resize', debounce(() => {
    if (graphVisualizer && graphVisualizer.network) {
        graphVisualizer.network.redraw();
    }
}, 250));

// Export functions for global access
window.initDashboard = initDashboard;
window.showNodeDetails = showNodeDetails;
window.closeModal = closeModal;
window.resetZoom = resetZoom;
window.togglePhysics = togglePhysics;
window.runQuery = runQuery;
window.exportGraph = exportGraph;
