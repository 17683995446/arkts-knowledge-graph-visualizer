# ArkTS 知识图谱可视化平台

一个基于 vis.js 和 D3.js 的交互式知识图谱可视化系统，用于分析和展示 ArkTS/HarmonyOS 项目的代码结构。

## 功能特性

- **项目结构概览**: 网络图展示模块间依赖关系
- **文件结构图谱**: 树形图、旭日图、矩形树图三种视图
- **类继承关系**: 可视化类层次结构和继承链
- **函数调用关系**: 展示函数间的调用依赖
- **模块依赖关系**: 弦图和网络图展示模块耦合
- **代码统计分析**: 多维度代码质量指标图表
- **自然语言查询**: 智能查询代码信息

## 技术栈

- **vis-network**: 网络图可视化
- **D3.js v7**: 图表和层次结构可视化
- **原生 JavaScript**: 无框架依赖，轻量高效

## 项目结构

```
kg_visualizer/
├── index.html              # 主页
├── pages/                  # 子页面
│   ├── file-structure.html
│   ├── class-hierarchy.html
│   ├── function-calls.html
│   ├── module-deps.html
│   ├── statistics.html
│   └── query.html
├── js/                     # JavaScript 模块
│   ├── data.js            # 数据层
│   ├── graph.js           # 图可视化类
│   ├── charts.js          # 图表管理器
│   └── main.js            # 主入口
├── css/                    # 样式文件
└── pages/                  # 测试页面
    ├── comprehensive-test.html
    ├── iteration-2-test.html
    ├── phase3-7-test.html
    └── ...
```

## 快速开始

1. 克隆仓库
2. 启动本地服务器: `python3 -m http.server 8080`
3. 访问 `http://localhost:8080`

## 测试

项目包含完整的测试套件：
- `comprehensive-test.html`: 168个综合测试用例
- `iteration-2-test.html`: 迭代#2测试
- `phase3-7-test.html`: 阶段3-7综合测试

## 版本历史

- **v3.0**: 完成阶段3-7深度测试，修复Bug #93-#99
- **v2.0**: 迭代#2测试，修复Bug #84-#92
- **v1.0**: 初始版本

## License

MIT
