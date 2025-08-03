import './index.css';
import { extractColorsFromImage, createColorVector } from './utils/colorExtractor.js';
import { createEmotionVector, determineOverallMood } from './utils/emotionMapper.js';
import { rgbToColorName } from './data/colorEmotionMap.js';

// 전역 상태
let uploadedFiles = [];
let analysisResults = {};

// DOM 요소들
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileSelectBtn = document.getElementById('file-select-btn');
const fileList = document.getElementById('file-list');
const imageGallery = document.getElementById('image-gallery');
const galleryGrid = document.getElementById('gallery-grid');
const analyzedCount = document.getElementById('analyzed-count');
const totalCount = document.getElementById('total-count');
const downloadCsvBtn = document.getElementById('download-csv-btn');
const analysisButtonContainer = document.getElementById('analysis-button-container');
const goToAnalysisBtn = document.getElementById('go-to-analysis-btn');
const goToGraphBtn = document.getElementById('go-to-graph-btn');

// 드래그 앤 드롭 이벤트
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('border-blue-500', 'bg-blue-50');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-blue-500', 'bg-blue-50');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-blue-500', 'bg-blue-50');
  
  const files = Array.from(e.dataTransfer.files);
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  
  if (imageFiles.length > 0) {
    handleFiles(imageFiles);
  }
});

// 파일 선택 버튼
fileSelectBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  handleFiles(files);
});

// CSV 다운로드 버튼 이벤트
downloadCsvBtn.addEventListener('click', downloadAnalysisResults);

// 분석 페이지로 이동 버튼 이벤트
    goToAnalysisBtn.addEventListener('click', () => {
        window.location.href = '/analysis.html';
    });
    
    goToGraphBtn.addEventListener('click', () => {
        window.location.href = '/graphVisualizer.html';
    });

// 파일 처리 함수
function handleFiles(files) {
  const newFiles = files.map(file => ({
    id: Date.now() + Math.random(),
    file,
    name: file.name,
    size: file.size,
    preview: URL.createObjectURL(file)
  }));
  
  console.log('New files created:', newFiles);
  
  uploadedFiles = [...uploadedFiles, ...newFiles];
  updateFileList();
  updateCounts();
  showImageGallery();
  renderGallery();
  
  // 각 파일 분석 시작
  newFiles.forEach(fileData => {
    analyzeImage(fileData);
  });
}

// 파일 목록 업데이트
function updateFileList() {
  fileList.innerHTML = uploadedFiles.map(file => `
    <div class="flex items-center justify-between p-3 rounded-lg border">
      <div class="flex items-center space-x-3">
        <img src="${file.preview}" alt="${file.name}" class="w-12 h-12 object-cover rounded">
        <div>
          <p class="font-medium text-gray-900">${file.name}</p>
          <p class="text-sm text-gray-500">${formatFileSize(file.size)}</p>
        </div>
      </div>
      <button onclick="removeFile('${file.id}')" class="text-red-500 hover:text-red-700">
        삭제
      </button>
    </div>
  `).join('');
}

// 파일 삭제
window.removeFile = function(fileId) {
  uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
  delete analysisResults[fileId];
  
  // localStorage 업데이트
  localStorage.setItem('analysisData', JSON.stringify(analysisResults));
  localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
  
  updateFileList();
  updateCounts();
  renderGallery();
  
  if (uploadedFiles.length === 0) {
    hideImageGallery();
  }
  
  // 분석 완료 상태 확인
  checkAnalysisCompletion();
};

// 카운트 업데이트
function updateCounts() {
  totalCount.textContent = uploadedFiles.length;
  analyzedCount.textContent = Object.keys(analysisResults).length;
}

// 이미지 갤러리 표시/숨김
function showImageGallery() {
  imageGallery.classList.remove('hidden');
}

function hideImageGallery() {
  imageGallery.classList.add('hidden');
}

// 갤러리 렌더링
function renderGallery() {
  galleryGrid.innerHTML = uploadedFiles.map(file => {
    const result = analysisResults[file.id];
    const isAnalyzing = !result && file.analysisStarted;
    const isAnalyzed = result;
    
    return `
      <div class="rounded-lg shadow-md overflow-hidden">
        <div class="relative">
          <img src="${file.preview}" alt="${file.name}" class="w-full h-48 object-cover">
          ${isAnalyzing ? '<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div class="text-white">분석 중...</div></div>' : ''}
        </div>
        <div class="p-4">
          <h4 class="font-semibold text-gray-900 mb-2">${file.name}</h4>
          ${isAnalyzed ? renderAnalysisResult(result) : ''}
          ${isAnalyzed ? `<button onclick="showDetailedAnalysis('${file.id}')" class="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">상세 분석 보기</button>` : ''}
          ${isAnalyzing ? '<div class="mt-3 text-center text-sm text-gray-500">분석 중...</div>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

// 분석 결과 렌더링
function renderAnalysisResult(result) {
  const { colorVector, emotionVector } = result;
  const mood = determineOverallMood(emotionVector);
  
  return `
    <div class="space-y-3">
      <div>
        <h5 class="font-medium text-gray-700 mb-1">주요 색상</h5>
        <div class="flex space-x-2">
          ${colorVector.dominantColors.slice(0, 3).map(color => `
            <div class="flex items-center space-x-1">
              <div class="w-4 h-4 rounded border border-gray-200" style="background-color: ${color.hex}"></div>
              <span class="text-xs text-gray-600">${color.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div>
        <h5 class="font-medium text-gray-700 mb-1">전체 감정</h5>
        <div class="text-sm">
          <span class="px-2 py-1 rounded text-xs ${getMoodColor(mood)}">${mood}</span>
        </div>
      </div>
    </div>
  `;
}

// 감정 색상 클래스
function getMoodColor(mood) {
  const colors = {
    '행복': 'bg-yellow-100 text-yellow-800',
    '평온': 'bg-blue-100 text-blue-800',
    '우울': 'bg-gray-100 text-gray-800',
    '열정': 'bg-red-100 text-red-800',
    '신비': 'bg-purple-100 text-purple-800'
  };
  return colors[mood] || 'bg-gray-100 text-gray-800';
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 이미지 분석
async function analyzeImage(fileData) {
  fileData.analysisStarted = true;
  renderGallery();
  
  try {
    // 색상 추출
    const colors = await extractColorsFromImage(fileData.file);
    const colorVector = createColorVector(colors);
    
    // 감정 벡터 생성
    const emotionVector = createEmotionVector(colorVector);
    
    // 결과 저장
    analysisResults[fileData.id] = {
      colorVector,
      emotionVector
    };
    
    // localStorage에 데이터 저장
    localStorage.setItem('analysisData', JSON.stringify(analysisResults));
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
    
    updateCounts();
    renderGallery();
    
    // 모든 분석이 완료되었는지 확인하고 분석 페이지 버튼 표시
    checkAnalysisCompletion();
    
  } catch (error) {
    console.error('이미지 분석 중 오류:', error);
    fileData.analysisStarted = false;
    renderGallery();
  }
}

// 상세 분석 모달 표시
window.showDetailedAnalysis = function(fileId) {
  console.log('showDetailedAnalysis called with fileId:', fileId);
  console.log('uploadedFiles:', uploadedFiles);
  console.log('analysisResults:', analysisResults);
  
  // fileId를 숫자로 변환 시도
  const numericFileId = parseFloat(fileId);
  const file = uploadedFiles.find(f => f.id === numericFileId || f.id === fileId);
  const result = analysisResults[numericFileId] || analysisResults[fileId];
  
  console.log('numericFileId:', numericFileId);
  console.log('file:', file);
  console.log('result:', result);
  
  if (!file || !result) {
    console.log('file or result not found');
    return;
  }
  
  const detailContent = document.getElementById('detail-content');
  detailContent.innerHTML = renderDetailedAnalysis(file, result);
  
  document.getElementById('detail-modal').classList.remove('hidden');
  console.log('modal should be visible now');
};

// 상세 분석 모달 닫기
window.closeDetailModal = function() {
  document.getElementById('detail-modal').classList.add('hidden');
};

// 상세 분석 결과 렌더링
function renderDetailedAnalysis(file, result) {
  const { colorVector, emotionVector } = result;
  
  return `
    <div class="space-y-8">
      <!-- 이미지 정보 -->
      <div class="border-b pb-4">
        <h4 class="text-lg font-semibold text-gray-900 mb-2">이미지 정보</h4>
        <div class="flex items-center space-x-4">
          <img src="${file.preview}" alt="${file.name}" class="w-24 h-24 object-cover rounded">
          <div>
            <p class="font-medium text-gray-900">${file.name}</p>
            <p class="text-sm text-gray-500">크기: ${formatFileSize(file.size)}</p>
          </div>
        </div>
      </div>

      <!-- 색상 벡터 -->
      <div class="border-b pb-4">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">색상 벡터 분석</h4>
        
        <!-- 주요 색상들 -->
        <div class="mb-6">
          <h5 class="font-medium text-gray-700 mb-3">주요 색상 (상위 5개)</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${colorVector.dominantColors.map((color, index) => `
              <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                <div class="w-8 h-8 rounded border border-gray-200" style="background-color: ${color.hex}"></div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">${color.name}</p>
                  <p class="text-sm text-gray-500">${color.percentage}%</p>
                  <p class="text-xs text-gray-400">RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})</p>
                  ${color.clusterSize ? `<p class="text-xs text-blue-600">클러스터: ${color.clusterSize}개 색상</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 평균 RGB -->
        <div class="mb-6">
          <h5 class="font-medium text-gray-700 mb-3">평균 RGB</h5>
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded" style="background-color: rgb(${colorVector.averageRGB.r}, ${colorVector.averageRGB.g}, ${colorVector.averageRGB.b})"></div>
            <div>
              <p class="font-medium text-gray-900">RGB(${colorVector.averageRGB.r}, ${colorVector.averageRGB.g}, ${colorVector.averageRGB.b})</p>
              <p class="text-sm text-gray-500">전체 강도: ${(colorVector.totalIntensity * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <!-- 색상 분포 -->
        <div>
          <h5 class="font-medium text-gray-700 mb-3">색상 분포</h5>
          <div class="space-y-2">
            ${Object.entries(colorVector.colorDistribution).map(([colorName, weight]) => `
              <div class="flex items-center justify-between">
                <span class="text-gray-700">${colorName}</span>
                <span class="text-gray-500">${weight.toFixed(1)}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 감정 벡터 -->
      <div>
        <h4 class="text-lg font-semibold text-gray-900 mb-4">감정 벡터 분석</h4>
        
        <!-- 전체 분위기 -->
        <div class="mb-6">
          <h5 class="font-medium text-gray-700 mb-3">전체 분위기</h5>
          <span class="px-3 py-1 rounded text-sm ${getMoodColor(emotionVector.overallMood)}">${emotionVector.overallMood}</span>
        </div>

        <!-- 주요 감정들 -->
        <div class="mb-6">
          <h5 class="font-medium text-gray-700 mb-3">주요 감정 (상위 3개)</h5>
          <div class="space-y-2">
            ${emotionVector.dominantEmotions.map((emotion, index) => `
              <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span class="text-gray-700">${emotion.name}</span>
                <span class="text-gray-500">${(emotion.value * 100).toFixed(1)}%</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 전체 감정 분포 -->
        <div>
          <h5 class="font-medium text-gray-700 mb-3">전체 감정 분포</h5>
          <div class="space-y-2">
            ${Object.entries(emotionVector.emotions).map(([emotion, value]) => `
              <div class="flex items-center justify-between">
                <span class="text-gray-700">${emotion}</span>
                <span class="text-gray-500">${(value * 100).toFixed(1)}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// CSV 다운로드 함수
function downloadAnalysisResults() {
  const analyzedFiles = uploadedFiles.filter(file => analysisResults[file.id]);
  
  if (analyzedFiles.length === 0) {
    alert('분석된 이미지가 없습니다. 이미지를 업로드하고 분석을 완료해주세요.');
    return;
  }
  
  const csvContent = generateCSVContent(analyzedFiles);
  downloadCSV(csvContent, 'image_analysis_results.csv');
}

// CSV 내용 생성
function generateCSVContent(files) {
  const headers = [
    '이미지 번호',
    '파일명',
    '파일 크기',
    // 색상 벡터 헤더
    '주요 색상 1 (이름)',
    '주요 색상 1 (RGB)',
    '주요 색상 1 (퍼센트)',
    '주요 색상 2 (이름)',
    '주요 색상 2 (RGB)',
    '주요 색상 2 (퍼센트)',
    '주요 색상 3 (이름)',
    '주요 색상 3 (RGB)',
    '주요 색상 3 (퍼센트)',
    '주요 색상 4 (이름)',
    '주요 색상 4 (RGB)',
    '주요 색상 4 (퍼센트)',
    '주요 색상 5 (이름)',
    '주요 색상 5 (RGB)',
    '주요 색상 5 (퍼센트)',
    '평균 RGB',
    '전체 색상 강도 (%)',
    // 감정 벡터 헤더
    '전체 분위기',
    '주요 감정 1',
    '주요 감정 1 강도 (%)',
    '주요 감정 2',
    '주요 감정 2 강도 (%)',
    '주요 감정 3',
    '주요 감정 3 강도 (%)',
    // 전체 감정 분포
    '기쁨 (%)',
    '흥분 (%)',
    '평온 (%)',
    '신뢰 (%)',
    '사랑 (%)',
    '에너지 (%)',
    '창의성 (%)',
    '고급스러움 (%)',
    '자연스러움 (%)',
    '신비로움 (%)',
    '중성 (%)'
  ];
  
  const rows = files.map((file, index) => {
    const result = analysisResults[file.id];
    const { colorVector, emotionVector } = result;
    
    // 색상 데이터
    const colorData = [];
    for (let i = 0; i < 5; i++) {
      const color = colorVector.dominantColors[i] || { name: '', rgb: { r: 0, g: 0, b: 0 }, percentage: 0 };
      colorData.push(
        color.name,
        `RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
        color.percentage
      );
    }
    
    // 감정 데이터
    const dominantEmotions = emotionVector.dominantEmotions;
    const emotionData = [
      emotionVector.overallMood,
      dominantEmotions[0]?.name || '',
      dominantEmotions[0] ? (dominantEmotions[0].value * 100).toFixed(1) : '',
      dominantEmotions[1]?.name || '',
      dominantEmotions[1] ? (dominantEmotions[1].value * 100).toFixed(1) : '',
      dominantEmotions[2]?.name || '',
      dominantEmotions[2] ? (dominantEmotions[2].value * 100).toFixed(1) : ''
    ];
    
    // 전체 감정 분포
    const emotionDistribution = [
      (emotionVector.emotions.joy || 0) * 100,
      (emotionVector.emotions.excitement || 0) * 100,
      (emotionVector.emotions.calm || 0) * 100,
      (emotionVector.emotions.trust || 0) * 100,
      (emotionVector.emotions.love || 0) * 100,
      (emotionVector.emotions.energy || 0) * 100,
      (emotionVector.emotions.creativity || 0) * 100,
      (emotionVector.emotions.luxury || 0) * 100,
      (emotionVector.emotions.nature || 0) * 100,
      (emotionVector.emotions.mystery || 0) * 100,
      (emotionVector.emotions.neutral || 0) * 100
    ].map(val => val.toFixed(1));
    
    return [
      index + 1,
      file.name,
      formatFileSize(file.size),
      ...colorData,
      `RGB(${colorVector.averageRGB.r}, ${colorVector.averageRGB.g}, ${colorVector.averageRGB.b})`,
      (colorVector.totalIntensity * 100).toFixed(1),
      ...emotionData,
      ...emotionDistribution
    ];
  });
  
  // CSV 형식으로 변환
  const csvRows = [headers, ...rows];
  return csvRows.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
}

// CSV 파일 다운로드
function downloadCSV(content, filename) {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// 분석 완료 확인 및 분석 페이지 버튼 표시
function checkAnalysisCompletion() {
  const totalFiles = uploadedFiles.length;
  const analyzedFiles = Object.keys(analysisResults).length;
  
  // 모든 파일이 분석 완료되었고, 최소 1개 이상의 파일이 있을 때
  if (totalFiles > 0 && totalFiles === analyzedFiles) {
    analysisButtonContainer.classList.remove('hidden');
  } else {
    analysisButtonContainer.classList.add('hidden');
  }
}
