/**
 * ArkTS Knowledge Graph - Chart Visualizations
 * Uses D3.js for various chart types
 */

class ChartManager {
    constructor() {
        this.charts = {};
    }

    /**
     * Create a pie chart for file type distribution
     */
    createPieChart(containerId, data) {
        const container = d3.select(`#${containerId}`);
        const containerNode = container.node();
        if (!containerNode) { console.warn('Container not found'); return this; }
        container.selectAll('*').remove();

        let width = containerNode.getBoundingClientRect().width;
        width = Math.max(width, 300);
        const height = 250;
        const radius = Math.min(width, height) / 2 - 20;

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.type))
            .range(data.map(d => d.color));

        const pie = d3.pie()
            .value(d => d.count)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius);

        const hoverArc = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius + 10);

        // Draw arcs
        const paths = svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.type))
            .attr('stroke', '#1e293b')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('d', hoverArc);
                
                centerText.text(d.data.count);
                centerLabel.text(d.data.type);
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('d', arc);
                
                centerText.text(total);
                centerLabel.text('Files');
            });

        // Center text
        const total = data.reduce((sum, d) => sum + d.count, 0);
        
        const centerText = svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.2em')
            .text(total)
            .style('font-size', '24px')
            .style('font-weight', 'bold')
            .style('fill', '#f1f5f9');

        const centerLabel = svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.2em')
            .text('Files')
            .style('font-size', '12px')
            .style('fill', '#94a3b8');

        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${radius + 30}, -${data.length * 15})`);

        const legendItems = legend.selectAll('.legend-item')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * 25})`);

        legendItems.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('rx', 2)
            .attr('fill', d => d.color);

        legendItems.append('text')
            .attr('x', 20)
            .attr('y', 9)
            .text(d => `${d.type} (${d.count})`)
            .style('font-size', '11px')
            .style('fill', '#94a3b8');

        return this;
    }

    /**
     * Create a line chart for code trend
     */
    createLineChart(containerId, data) {
        const container = d3.select(`#${containerId}`);
        const containerNode = container.node();
        if (!containerNode) { console.warn('Container not found'); return this; }
        if (!data || data.length === 0) { console.warn('createLineChart: empty data'); return this; }
        container.selectAll('*').remove();
        // Bug #31修复: 清理之前可能残留的tooltip
        d3.selectAll('.chart-tooltip').remove();

        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        let width = containerNode.getBoundingClientRect().width - margin.left - margin.right;
        width = Math.max(width, 300);
        const height = 250 - margin.top - margin.bottom;

        const svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Parse dates (avoid mutating original data)
        const parseDate = d3.timeParse('%Y-%m-%d');
        const parsedData = data.map(d => ({ ...d, date: parseDate(d.date) }));

        // Scales
        const x = d3.scaleTime()
            .domain(d3.extent(parsedData, d => d.date))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([d3.min(parsedData, d => d.lines) * 0.95, d3.max(parsedData, d => d.lines) * 1.05])
            .range([height, 0]);

        // Gradient
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'line-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0)
            .attr('y1', height)
            .attr('x2', 0)
            .attr('y2', 0);

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#2563eb')
            .attr('stop-opacity', 0.1);

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#2563eb')
            .attr('stop-opacity', 0.8);

        // Area
        const area = d3.area()
            .x(d => x(d.date))
            .y0(height)
            .y1(d => y(d.lines))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(parsedData)
            .attr('fill', 'url(#line-gradient)')
            .attr('d', area);

        // Line
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.lines))
            .curve(d3.curveMonotoneX);

        const path = svg.append('path')
            .datum(parsedData)
            .attr('fill', 'none')
            .attr('stroke', '#2563eb')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Animate line
        const totalLength = path.node().getTotalLength();
        path.attr('stroke-dasharray', totalLength + ' ' + totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(1500)
            .ease(d3.easeCubicOut)
            .attr('stroke-dashoffset', 0);

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%m/%d')))
            .style('color', '#64748b')
            .selectAll('text')
            .style('fill', '#94a3b8');

        svg.append('g')
            .call(d3.axisLeft(y).tickFormat(d => d3.format('.2s')(d)))
            .style('color', '#64748b')
            .selectAll('text')
            .style('fill', '#94a3b8');

        // Grid lines
        svg.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickSize(-height).tickFormat(''))
            .style('stroke-opacity', 0.1);

        svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(y).tickSize(-width).tickFormat(''))
            .style('stroke-opacity', 0.1);

        // Tooltip dots
        const tooltip = d3.select('body').append('div')
            .attr('class', 'chart-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', '#1e293b')
            .style('border', '1px solid #334155')
            .style('border-radius', '4px')
            .style('padding', '8px 12px')
            .style('font-size', '12px')
            .style('pointer-events', 'none');

        svg.selectAll('.dot')
            .data(parsedData)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.lines))
            .attr('r', 4)
            .attr('fill', '#2563eb')
            .attr('stroke', '#1e293b')
            .attr('stroke-width', 2)
            .style('opacity', 0)
            .on('mouseover', function(event, d) {
                d3.select(this).style('opacity', 1).attr('r', 6);
                tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(`Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br/>Lines: ${d.lines.toLocaleString()}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this).style('opacity', 0).attr('r', 4);
                tooltip.transition().duration(500).style('opacity', 0);
            });

        return this;
    }

    /**
     * Create a bar chart for code statistics
     */
    createBarChart(containerId, data, options = {}) {
        if (!data || data.length === 0) return this;
        const container = d3.select(`#${containerId}`);
        const containerNode = container.node();
        if (!containerNode) { console.warn('Container not found'); return this; }
        container.selectAll('*').remove();

        // Bug #31修复: 使用传入的margin选项（如果提供）
        const defaultMargin = { top: 20, right: 20, bottom: 60, left: 80 };
        const margin = (options && options.margin) ? { ...defaultMargin, ...options.margin } : defaultMargin;
        const width = (options.width || container.node().getBoundingClientRect().width) - margin.left - margin.right;
        const height = (options.height || 300) - margin.top - margin.bottom;

        const svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, width])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value) * 1.1])
            .range([height, 0]);

        // Bars
        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.name))
            .attr('width', x.bandwidth())
            .attr('y', height)
            .attr('height', 0)
            .attr('fill', d => d.color || '#2563eb')
            .attr('rx', 4)
            .transition()
            .duration(800)
            .delay((d, i) => i * 100)
            .attr('y', d => y(d.value))
            .attr('height', d => height - y(d.value));

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)')
            .style('fill', '#94a3b8');

        svg.append('g')
            .call(d3.axisLeft(y).tickFormat(d3.format('.2s')))
            .selectAll('text')
            .style('fill', '#94a3b8');

        // Value labels
        svg.selectAll('.label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.name) + x.bandwidth() / 2)
            .attr('y', d => y(d.value) - 5)
            .attr('text-anchor', 'middle')
            .text(d => d3.format('.2s')(d.value))
            .style('fill', '#f1f5f9')
            .style('font-size', '11px')
            .style('opacity', 0)
            .transition()
            .duration(800)
            .delay((d, i) => i * 100 + 400)
            .style('opacity', 1);

        return this;
    }

    /**
     * Create a treemap for file structure
     */
    createTreemap(containerId, data) {
        const container = d3.select(`#${containerId}`);
        const containerNode = container.node();
        if (!containerNode) { console.warn('Container not found'); return this; }
        container.selectAll('*').remove();

        // Get container width, fallback to parent width or default
        let width = container.node().getBoundingClientRect().width;
        if (width === 0) {
            // Try to get width from parent element
            const parentWidth = container.node().parentElement?.getBoundingClientRect().width;
            width = parentWidth || 800;
        }
        const height = 400;

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);

        const root = d3.hierarchy(data)
            .sum(d => d.lines || 0)
            .sort((a, b) => b.value - a.value);

        d3.treemap()
            .size([width, height])
            .padding(2)
            (root);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const leaf = svg.selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x0},${d.y0})`);

        leaf.append('rect')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => {
                while (d.depth > 1) d = d.parent;
                return color(d.data.name);
            })
            .attr('opacity', 0.8)
            .attr('rx', 2);

        leaf.append('text')
            .attr('x', 4)
            .attr('y', 14)
            .text(d => d.data.name)
            .style('font-size', '10px')
            .style('fill', '#f1f5f9')
            .style('pointer-events', 'none');

        leaf.append('text')
            .attr('x', 4)
            .attr('y', 26)
            .text(d => d3.format('.2s')(d.value) + ' lines')
            .style('font-size', '9px')
            .style('fill', '#94a3b8')
            .style('pointer-events', 'none');

        return this;
    }

    /**
     * Create a force-directed graph
     */
    createForceGraph(containerId, nodes, links, options = {}) {
        const container = d3.select(`#${containerId}`);
        const containerNode = container.node();
        if (!containerNode) { console.warn('Container not found'); return this; }
        container.selectAll('*').remove();

        // Deep copy nodes to avoid mutating original data
        const simNodes = JSON.parse(JSON.stringify(nodes));
        // Convert link format for d3 compatibility
        const d3Links = links.map(l => ({ source: l.from || l.source, target: l.to || l.target }));

        const width = options.width || containerNode.getBoundingClientRect().width;
        const height = options.height || 500;

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height)
            .call(d3.zoom().on('zoom', (event) => {
                g.attr('transform', event.transform);
            }));

        const g = svg.append('g');

        // Simulation
        const simulation = d3.forceSimulation(simNodes)
            .force('link', d3.forceLink(d3Links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(d => (d.size || 20) + 10));

        // Links
        const link = g.append('g')
            .selectAll('line')
            .data(d3Links)
            .enter()
            .append('line')
            .attr('stroke', '#475569')
            .attr('stroke-width', d => d.strength || 1)
            .attr('stroke-opacity', 0.6);

        // Nodes
        const node = g.append('g')
            .selectAll('g')
            .data(simNodes)
            .enter()
            .append('g')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        node.append('circle')
            .attr('r', d => d.size || 20)
            .attr('fill', d => d.color || '#2563eb')
            .attr('stroke', '#1e293b')
            .attr('stroke-width', 2);

        node.append('text')
            .text(d => d.label)
            .attr('x', d => (d.size || 20) + 5)
            .attr('y', 4)
            .style('font-size', '11px')
            .style('fill', '#f1f5f9')
            .style('pointer-events', 'none');

        // Update positions
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return { svg, simulation, node, link, destroy: function() {
            // Bug #31修复: 提供destroy方法停止simulation并清理DOM
            simulation.stop();
            svg.on('.zoom', null);
            svg.remove();
        }};
    }

    /**
     * Create a chord diagram for module dependencies
     */
    createChordDiagram(containerId, matrix, labels) {
        const container = d3.select(`#${containerId}`);
        const containerNode = container.node();
        if (!containerNode) { console.warn('Container not found'); return this; }
        container.selectAll('*').remove();

        const width = 500;
        const height = 500;
        const outerRadius = Math.min(width, height) / 2 - 60;
        const innerRadius = outerRadius - 20;

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        const chord = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending);

        const chords = chord(matrix);

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        const ribbon = d3.ribbon()
            .radius(innerRadius);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Draw arcs
        const group = svg.append('g')
            .selectAll('g')
            .data(chords.groups)
            .enter()
            .append('g');

        group.append('path')
            .attr('fill', d => color(d.index))
            .attr('stroke', '#1e293b')
            .attr('d', arc);

        // Draw ribbons
        svg.append('g')
            .attr('fill-opacity', 0.67)
            .selectAll('path')
            .data(chords)
            .enter()
            .append('path')
            .attr('d', ribbon)
            .attr('fill', d => color(d.target.index))
            .attr('stroke', '#1e293b');

        // Labels
        group.append('text')
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr('dy', '.35em')
            .attr('transform', d => `
                rotate(${(d.angle * 180 / Math.PI - 90)})
                translate(${outerRadius + 10})
                ${d.angle > Math.PI ? 'rotate(180)' : ''}
            `)
            .attr('text-anchor', d => d.angle > Math.PI ? 'end' : 'start')
            .text(d => labels[d.index])
            .style('font-size', '10px')
            .style('fill', '#94a3b8');

        return this;
    }

    // Bug #31修复: 添加destroy方法清理所有残留的tooltip和chart引用
    destroy() {
        d3.selectAll('.chart-tooltip').remove();
        this.charts = {};
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartManager;
}
