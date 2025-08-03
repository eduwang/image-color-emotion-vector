import './index.css';
import Graph from 'graphology';
import Sigma from 'sigma';
import forceAtlas2 from 'graphology-layout-forceatlas2';

// 전역 변수
let graph = null;
let sigma = null;
let currentAlgorithm = 'cosine';
let currentGraphType = null;
let analysisData = {};
let uploadedFiles = [];

// 알고리즘 설명 데이터
const algorithmDescriptions = {
    cosine: {
        name: '코사인 유사도',
        desc: '색상/감정 벡터 간의 각도를 기반으로 유사도 계산. 0~1 범위의 값으로, 벡터의 크기에 무관하게 방향만 고려합니다.'
    },
    euclidean: {
        name: '유클리드 거리',
        desc: '벡터 간의 직선 거리를 계산하여 유사도 측정. 거리가 가까울수록 유사하며, 절댓값 차이를 중요시합니다.'
    },
    pearson: {
        name: '피어슨 상관계수',
        desc: '색상/감정 분포의 선형적 상관관계를 측정. -1~1 범위의 값으로, 선형적 패턴을 찾아냅니다.'
    },
    jaccard: {
        name: '자카드 유사도',
        desc: '공통 색상/감정 요소의 비율로 유사도 계산. 0~1 범위의 값으로, 공통성에 집중합니다.'
    },
    manhattan: {
        name: '맨해튼 거리',
        desc: '각 차원별 차이의 절댓값 합으로 유사도 측정. 격자 거리 기반으로, 각 차원의 차이를 누적합니다.'
    },
    custom: {
        name: '커스텀 가중치',
        desc: '색상과 감정에 서로 다른 가중치를 적용한 복합 유사도 계산. 색상 60%, 감정 40% 비율로 계산합니다.'
    }
};

// DOM 요소들
const backToMainBtn = document.getElementById('back-to-main');
const goToAnalysisBtn = document.getElementById('go-to-analysis-btn');
const similarityBtns = document.querySelectorAll('.similarity-btn');
const selectedAlgorithmName = document.getElementById('selected-algorithm-name');
const selectedAlgorithmDesc = document.getElementById('selected-algorithm-desc');
const colorGraphBtn = document.getElementById('color-graph-btn');
const emotionGraphBtn = document.getElementById('emotion-graph-btn');
const resetViewBtn = document.getElementById('reset-view');
const toggleLabelsBtn = document.getElementById('toggle-labels');
const similarityThreshold = document.getElementById('similarity-threshold');
const thresholdValue = document.getElementById('threshold-value');
const nodeSizeSlider = document.getElementById('node-size');
const edgeWidthSlider = document.getElementById('edge-width');
const nodeCount = document.getElementById('node-count');
const edgeCount = document.getElementById('edge-count');
const avgDegree = document.getElementById('avg-degree');
const density = document.getElementById('density');

// 툴팁 요소들
const nodeTooltip = document.getElementById('node-tooltip');
const tooltipTitle = document.getElementById('tooltip-title');
const tooltipColors = document.getElementById('tooltip-colors');
const tooltipEmotions = document.getElementById('tooltip-emotions');

window.addEventListener('load', () => {
    initializeGraph();
    loadAnalysisData();
    setupEventListeners();
});

function initializeGraph() {
    graph = new Graph();
    const container = document.getElementById('graph-container');
    sigma = new Sigma(graph, container, {
        minCameraRatio: 0.1,
        maxCameraRatio: 10,
        nodeReducer: (node, data) => ({
            ...data,
            size: data.size || 5,
            color: data.color || '#3b82f6',
            label: data.label || '',
            labelSize: 12,
            labelColor: '#374151'
        }),
        edgeReducer: (edge, data) => ({
            ...data,
            size: data.size || 1,
            color: data.color || '#94a3b8',
            type: 'line'
        })
    });

    // 마우스 이벤트 리스너 추가
    sigma.on('enterNode', (event) => {
        const nodeId = event.node;
        showNodeTooltip(nodeId, event);
    });

    sigma.on('leaveNode', () => {
        hideNodeTooltip();
    });

    sigma.on('mousemove', (event) => {
        if (nodeTooltip.classList.contains('show')) {
            const rect = nodeTooltip.getBoundingClientRect();
            const x = event.clientX + 10;
            const y = event.clientY - rect.height - 10;
            const maxX = window.innerWidth - rect.width - 10;
            const maxY = window.innerHeight - rect.height - 10;
            nodeTooltip.style.left = Math.min(x, maxX) + 'px';
            nodeTooltip.style.top = Math.max(y, 10) + 'px';
        }
    });
}

function loadAnalysisData() {
    analysisData = JSON.parse(localStorage.getItem('analysisData') || '{}');
    uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    if (Object.keys(analysisData).length === 0) {
        showNoDataMessage();
        return;
    }
}

function setupEventListeners() {
    backToMainBtn.addEventListener('click', () => {
        window.location.href = '/';
    });
    goToAnalysisBtn.addEventListener('click', () => {
        window.location.href = '/analysis.html';
    });
    similarityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const algorithm = btn.dataset.algorithm;
            selectAlgorithm(algorithm);
        });
    });
    colorGraphBtn.addEventListener('click', () => {
        createColorGraph();
    });
    emotionGraphBtn.addEventListener('click', () => {
        createEmotionGraph();
    });
    resetViewBtn.addEventListener('click', resetView);
    toggleLabelsBtn.addEventListener('click', toggleLabels);
    similarityThreshold.addEventListener('input', updateThreshold);
    nodeSizeSlider.addEventListener('input', updateNodeSize);
    edgeWidthSlider.addEventListener('input', updateEdgeWidth);
}

function selectAlgorithm(algorithm) {
    currentAlgorithm = algorithm;
    similarityBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.algorithm === algorithm) {
            btn.classList.add('active');
        }
    });
    const desc = algorithmDescriptions[algorithm];
    selectedAlgorithmName.textContent = desc.name;
    selectedAlgorithmDesc.textContent = desc.desc;
    if (currentGraphType) {
        if (currentGraphType === 'color') createColorGraph();
        else createEmotionGraph();
    }
}

function createColorGraph() {
    currentGraphType = 'color';
    const edges = calculateSimilarities('color');
    createGraph(edges, 'color');
}

function createEmotionGraph() {
    currentGraphType = 'emotion';
    const edges = calculateSimilarities('emotion');
    createGraph(edges, 'emotion');
}

function calculateSimilarities(type) {
    const edges = [];
    const threshold = similarityThreshold.value / 100;

    for (let i = 0; i < uploadedFiles.length; i++) {
        for (let j = i + 1; j < uploadedFiles.length; j++) {
            const file1 = uploadedFiles[i];
            const file2 = uploadedFiles[j];
            const result1 = analysisData[file1.id];
            const result2 = analysisData[file2.id];
            if (!result1 || !result2) continue;

            let similarity = 0;
            if (type === 'color') {
                similarity = calculateColorSimilarity(result1.colorVector, result2.colorVector);
            } else {
                similarity = calculateEmotionSimilarity(result1.emotionVector, result2.emotionVector);
            }
            if (similarity >= threshold) {
                edges.push({
                    source: file1.id,
                    target: file2.id,
                    weight: similarity,
                    type: type
                });
            }
        }
    }
    return edges;
}

function calculateColorSimilarity(colorVector1, colorVector2) {
    const colors1 = colorVector1.dominantColors.map(c => Number(c.percentage) / 100);
    const colors2 = colorVector2.dominantColors.map(c => Number(c.percentage) / 100);
    const maxLength = Math.max(colors1.length, colors2.length);
    const paddedColors1 = [...colors1, ...Array(maxLength - colors1.length).fill(0)];
    const paddedColors2 = [...colors2, ...Array(maxLength - colors2.length).fill(0)];
    return calculateSimilarity(paddedColors1, paddedColors2);
}

function calculateEmotionSimilarity(emotionVector1, emotionVector2) {
    const emotions1 = Object.values(emotionVector1.emotions);
    const emotions2 = Object.values(emotionVector2.emotions);
    const maxLength = Math.max(emotions1.length, emotions2.length);
    const paddedEmotions1 = [...emotions1, ...Array(maxLength - emotions1.length).fill(0)];
    const paddedEmotions2 = [...emotions2, ...Array(maxLength - emotions2.length).fill(0)];
    return calculateSimilarity(paddedEmotions1, paddedEmotions2);
}

function calculateSimilarity(vector1, vector2) {
    switch (currentAlgorithm) {
        case 'cosine':
            return cosineSimilarity(vector1, vector2);
        case 'euclidean':
            return euclideanSimilarity(vector1, vector2);
        case 'pearson':
            return pearsonSimilarity(vector1, vector2);
        case 'jaccard':
            return jaccardSimilarity(vector1, vector2);
        case 'manhattan':
            return manhattanSimilarity(vector1, vector2);
        case 'custom':
            return customSimilarity(vector1, vector2);
        default:
            return cosineSimilarity(vector1, vector2);
    }
}

function cosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    const result = dotProduct / (magnitude1 * magnitude2);
    return isNaN(result) ? 0 : Math.max(0, Math.min(1, result));
}
function euclideanSimilarity(vec1, vec2) {
    const distance = Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
    const result = 1 / (1 + distance);
    return isNaN(result) ? 0 : Math.max(0, Math.min(1, result));
}
function pearsonSimilarity(vec1, vec2) {
    const n = vec1.length;
    const sum1 = vec1.reduce((sum, val) => sum + val, 0);
    const sum2 = vec2.reduce((sum, val) => sum + val, 0);
    const sum1Sq = vec1.reduce((sum, val) => sum + val * val, 0);
    const sum2Sq = vec2.reduce((sum, val) => sum + val * val, 0);
    const pSum = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    const result = den === 0 ? 0 : num / den;
    return isNaN(result) ? 0 : Math.max(-1, Math.min(1, result));
}
function jaccardSimilarity(vec1, vec2) {
    const intersection = vec1.reduce((sum, val, i) => sum + Math.min(val, vec2[i]), 0);
    const union = vec1.reduce((sum, val, i) => sum + Math.max(val, vec2[i]), 0);
    const result = union === 0 ? 0 : intersection / union;
    return isNaN(result) ? 0 : Math.max(0, Math.min(1, result));
}
function manhattanSimilarity(vec1, vec2) {
    const distance = vec1.reduce((sum, val, i) => sum + Math.abs(val - vec2[i]), 0);
    const result = 1 / (1 + distance);
    return isNaN(result) ? 0 : Math.max(0, Math.min(1, result));
}
function customSimilarity(vec1, vec2) {
    const colorWeight = 0.6;
    const emotionWeight = 0.4;
    const colorSim = cosineSimilarity(vec1, vec2);
    const emotionSim = cosineSimilarity(vec1, vec2);
    const result = colorWeight * colorSim + emotionWeight * emotionSim;
    return isNaN(result) ? 0 : Math.max(0, Math.min(1, result));
}

// ForceAtlas2 레이아웃 적용
function applyForceAtlas2Layout() {
    forceAtlas2.assign(graph, {
        iterations: 100,
        settings: { slowDown: 10 }
    });
}

function createGraph(edges, type) {
    graph.clear();
    uploadedFiles.forEach(file => {
        const result = analysisData[file.id];
        if (!result) return;
        const nodeColor = type === 'color' ? '#3b82f6' : '#8b5cf6';
        const nodeSize = type === 'color' ? 8 : 6;
        graph.addNode(file.id, {
            label: file.name,
            size: nodeSize,
            color: nodeColor,
            x: Math.random() * 1000,
            y: Math.random() * 1000
        });
    });
    edges.forEach(edge => {
        const edgeColor = type === 'color' ? '#60a5fa' : '#a78bfa';
        const edgeSize = edge.weight * 3 + 1;
        graph.addEdge(edge.source, edge.target, {
            size: edgeSize,
            color: edgeColor,
            weight: edge.weight
        });
    });
    updateGraphStats();
    applyForceAtlas2Layout();
}

function updateGraphStats() {
    const nodes = graph.nodes();
    const edges = graph.edges();
    nodeCount.textContent = nodes.length;
    edgeCount.textContent = edges.length;
    const totalDegree = nodes.reduce((sum, node) => sum + graph.degree(node), 0);
    const avgDegreeValue = nodes.length > 0 ? (totalDegree / nodes.length).toFixed(2) : 0;
    avgDegree.textContent = avgDegreeValue;
    const maxEdges = nodes.length * (nodes.length - 1) / 2;
    const densityValue = maxEdges > 0 ? (edges.length / maxEdges).toFixed(3) : 0;
    density.textContent = densityValue;
}
function resetView() {
    sigma.getCamera().goTo({ x: 0, y: 0, angle: 0, ratio: 1 });
}
function toggleLabels() {
    sigma.setSetting('labelRendered', !sigma.getSetting('labelRendered'));
}
function updateThreshold() {
    thresholdValue.textContent = similarityThreshold.value + '%';
    if (currentGraphType) {
        if (currentGraphType === 'color') createColorGraph();
        else createEmotionGraph();
    }
}
function updateNodeSize() {
    const size = nodeSizeSlider.value;
    graph.forEachNode((node, attributes) => {
        graph.setNodeAttribute(node, 'size', size);
    });
}
function updateEdgeWidth() {
    const width = edgeWidthSlider.value;
    graph.forEachEdge((edge, attributes) => {
        graph.setEdgeAttribute(edge, 'size', width);
    });
}

// 툴팁 관련 함수들
function showNodeTooltip(nodeId, event) {
    const file = uploadedFiles.find(f => f.id == nodeId);
    const result = analysisData[nodeId];

    if (!file || !result) return;

    tooltipTitle.textContent = file.name;

    // 대표 색상 표시 (상위 3개)
    tooltipColors.innerHTML = '';
    const topColors = result.colorVector.dominantColors.slice(0, 3);
    topColors.forEach(color => {
        const colorChip = document.createElement('div');
        colorChip.className = 'color-chip';
        colorChip.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        // 🚩 percentage를 반드시 Number로 변환!
        colorChip.title = `RGB(${color.r}, ${color.g}, ${color.b}) - ${Number(color.percentage).toFixed(1)}%`;
        tooltipColors.appendChild(colorChip);
    });

    // 대표 감정 표시 (상위 3개)
    tooltipEmotions.innerHTML = '';
    const emotions = result.emotionVector.emotions;
    const topEmotions = Object.entries(emotions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    topEmotions.forEach(([emotion, value]) => {
        const emotionChip = document.createElement('span');
        emotionChip.className = 'emotion-chip';
        emotionChip.textContent = `${emotion} ${(value * 100).toFixed(1)}%`;
        tooltipEmotions.appendChild(emotionChip);
    });

    // 툴팁 위치 설정
    const rect = nodeTooltip.getBoundingClientRect();
    const x = event.clientX + 10;
    const y = event.clientY - rect.height - 10;
    const maxX = window.innerWidth - rect.width - 10;
    const maxY = window.innerHeight - rect.height - 10;
    nodeTooltip.style.left = Math.min(x, maxX) + 'px';
    nodeTooltip.style.top = Math.max(y, 10) + 'px';

    nodeTooltip.classList.remove('hidden', 'hide');
    nodeTooltip.classList.add('show');
}

function hideNodeTooltip() {
    nodeTooltip.classList.remove('show');
    nodeTooltip.classList.add('hide');
    setTimeout(() => {
        nodeTooltip.classList.add('hidden');
        nodeTooltip.classList.remove('hide');
    }, 200);
}

function showNoDataMessage() {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="text-center py-12">
            <div class="text-6xl mb-4">📊</div>
            <h2 class="text-3xl font-bold text-gray-800 mb-4">분석 데이터가 없습니다</h2>
            <p class="text-gray-600 mb-8">메인 페이지에서 이미지를 업로드하고 분석을 완료한 후 다시 시도해주세요.</p>
            <button onclick="window.location.href='/'" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200">
                메인 페이지로 이동
            </button>
        </div>
    `;
}
