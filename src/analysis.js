import './index.css';

// DOM 요소들
const backToMainBtn = document.getElementById('back-to-main');
const goToGraphBtn = document.getElementById('go-to-graph-btn');
const totalImages = document.getElementById('total-images');
const analyzedImages = document.getElementById('analyzed-images');
const colorTypes = document.getElementById('color-types');
const emotionTypes = document.getElementById('emotion-types');
const colorMatrix = document.getElementById('color-matrix');
const colorMatrixBody = document.getElementById('color-matrix-body');
const emotionMatrix = document.getElementById('emotion-matrix');
const emotionMatrixBody = document.getElementById('emotion-matrix-body');
const downloadAnalysisCsvBtn = document.getElementById('download-analysis-csv');

// 메인으로 돌아가기 버튼
backToMainBtn.addEventListener('click', () => {
    window.location.href = '/';
});

// 네트워크 시각화로 이동 버튼
goToGraphBtn.addEventListener('click', () => {
    window.location.href = '/graphVisualizer.html';
});

// 페이지 로드 시 분석 데이터 로드
window.addEventListener('load', () => {
    loadAnalysisData();
});

// 분석 데이터 로드
function loadAnalysisData() {
    // localStorage에서 분석 데이터 가져오기
    const analysisData = JSON.parse(localStorage.getItem('analysisData') || '{}');
    const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    
    if (Object.keys(analysisData).length === 0) {
        showNoDataMessage();
        return;
    }
    
    // 통계 업데이트
    updateStatistics(uploadedFiles, analysisData);
    
    // 행렬 생성
    createColorMatrix(uploadedFiles, analysisData);
    createEmotionMatrix(uploadedFiles, analysisData);
}

// 통계 업데이트
function updateStatistics(files, analysisData) {
    totalImages.textContent = files.length;
    analyzedImages.textContent = Object.keys(analysisData).length;
    
    // 색상 종류 수 계산
    const allColors = new Set();
    Object.values(analysisData).forEach(result => {
        if (result.colorVector && result.colorVector.dominantColors) {
            result.colorVector.dominantColors.forEach(color => {
                allColors.add(color.name);
            });
        }
    });
    colorTypes.textContent = allColors.size;
    
    // 감정 종류 수 계산
    const allEmotions = new Set();
    Object.values(analysisData).forEach(result => {
        if (result.emotionVector && result.emotionVector.emotions) {
            Object.keys(result.emotionVector.emotions).forEach(emotion => {
                allEmotions.add(emotion);
            });
        }
    });
    emotionTypes.textContent = allEmotions.size;
}

// 색상 행렬 생성
function createColorMatrix(files, analysisData) {
    // 모든 색상 수집
    const allColors = new Set();
    Object.values(analysisData).forEach(result => {
        if (result.colorVector && result.colorVector.dominantColors) {
            result.colorVector.dominantColors.forEach(color => {
                allColors.add(color.name);
            });
        }
    });
    
    const colorArray = Array.from(allColors).sort();
    
    // 헤더 생성
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-gray-100';
    
    // 이미지 이름 헤더
    const imageNameHeader = document.createElement('th');
    imageNameHeader.className = 'border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700';
    imageNameHeader.textContent = '이미지 이름';
    headerRow.appendChild(imageNameHeader);
    
         // 색상 헤더들
     colorArray.forEach(colorName => {
         const colorHeader = document.createElement('th');
         colorHeader.className = 'border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700 min-w-[80px] text-xs';
         colorHeader.textContent = colorName;
         headerRow.appendChild(colorHeader);
     });
    
    // 기존 헤더 제거하고 새 헤더 추가
    const thead = colorMatrix.querySelector('thead');
    thead.innerHTML = '';
    thead.appendChild(headerRow);
    
    // 데이터 행 생성
    colorMatrixBody.innerHTML = '';
    files.forEach(file => {
        const result = analysisData[file.id];
        if (!result || !result.colorVector) return;
        
        const dataRow = document.createElement('tr');
        dataRow.className = 'hover:bg-gray-50';
        
                 // 이미지 이름
         const imageNameCell = document.createElement('td');
         imageNameCell.className = 'border border-gray-300 px-4 py-3 text-left font-medium text-gray-900 sticky left-0 bg-white z-10';
         imageNameCell.textContent = file.name;
         dataRow.appendChild(imageNameCell);
         
         // 색상 데이터
         colorArray.forEach(colorName => {
             const colorCell = document.createElement('td');
             colorCell.className = 'border border-gray-300 px-3 py-2 text-center min-w-[80px]';
            
            const colorData = result.colorVector.dominantColors.find(c => c.name === colorName);
                         if (colorData) {
                 colorCell.innerHTML = `
                     <div class="flex flex-col items-center justify-center space-y-1">
                         <div class="w-3 h-3 rounded" style="background-color: ${colorData.hex}"></div>
                         <span class="text-xs">${colorData.percentage}%</span>
                     </div>
                 `;
             } else {
                 colorCell.innerHTML = '<span class="text-xs text-gray-400">0%</span>';
             }
            dataRow.appendChild(colorCell);
        });
        
        colorMatrixBody.appendChild(dataRow);
    });
}

// 감정 행렬 생성
function createEmotionMatrix(files, analysisData) {
    // 모든 감정 수집
    const allEmotions = new Set();
    Object.values(analysisData).forEach(result => {
        if (result.emotionVector && result.emotionVector.emotions) {
            Object.keys(result.emotionVector.emotions).forEach(emotion => {
                allEmotions.add(emotion);
            });
        }
    });
    
    const emotionArray = Array.from(allEmotions).sort();
    
    // 헤더 생성
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-gray-100';
    
    // 이미지 이름 헤더
    const imageNameHeader = document.createElement('th');
    imageNameHeader.className = 'border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700';
    imageNameHeader.textContent = '이미지 이름';
    headerRow.appendChild(imageNameHeader);
    
         // 감정 헤더들
     emotionArray.forEach(emotionName => {
         const emotionHeader = document.createElement('th');
         emotionHeader.className = 'border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700 min-w-[80px] text-xs';
         emotionHeader.textContent = emotionName;
         headerRow.appendChild(emotionHeader);
     });
    
    // 기존 헤더 제거하고 새 헤더 추가
    const thead = emotionMatrix.querySelector('thead');
    thead.innerHTML = '';
    thead.appendChild(headerRow);
    
    // 데이터 행 생성
    emotionMatrixBody.innerHTML = '';
    files.forEach(file => {
        const result = analysisData[file.id];
        if (!result || !result.emotionVector) return;
        
        const dataRow = document.createElement('tr');
        dataRow.className = 'hover:bg-gray-50';
        
                 // 이미지 이름
         const imageNameCell = document.createElement('td');
         imageNameCell.className = 'border border-gray-300 px-4 py-3 text-left font-medium text-gray-900 sticky left-0 bg-white z-10';
         imageNameCell.textContent = file.name;
         dataRow.appendChild(imageNameCell);
         
         // 감정 데이터
         emotionArray.forEach(emotionName => {
             const emotionCell = document.createElement('td');
             emotionCell.className = 'border border-gray-300 px-3 py-2 text-center min-w-[80px]';
            
            const emotionValue = result.emotionVector.emotions[emotionName] || 0;
            const percentage = (emotionValue * 100).toFixed(1);
            
                         emotionCell.innerHTML = `
                 <div class="flex items-center justify-center">
                     <span class="text-xs font-medium">${percentage}%</span>
                 </div>
             `;
            dataRow.appendChild(emotionCell);
        });
        
        emotionMatrixBody.appendChild(dataRow);
    });
}

// 데이터가 없을 때 메시지 표시
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

// CSV 다운로드 버튼 이벤트
downloadAnalysisCsvBtn.addEventListener('click', () => {
    const analysisData = JSON.parse(localStorage.getItem('analysisData') || '{}');
    const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    
    if (Object.keys(analysisData).length === 0) {
        alert('다운로드할 분석 데이터가 없습니다.');
        return;
    }
    
    downloadAnalysisCsv(uploadedFiles, analysisData);
});

// 분석 CSV 다운로드
function downloadAnalysisCsv(files, analysisData) {
    // 색상 행렬 CSV
    const colorCsv = generateColorMatrixCsv(files, analysisData);
    downloadCsv(colorCsv, 'color_analysis_matrix.csv');
    
    // 감정 행렬 CSV
    const emotionCsv = generateEmotionMatrixCsv(files, analysisData);
    downloadCsv(emotionCsv, 'emotion_analysis_matrix.csv');
}

// 색상 행렬 CSV 생성
function generateColorMatrixCsv(files, analysisData) {
    const allColors = new Set();
    Object.values(analysisData).forEach(result => {
        if (result.colorVector && result.colorVector.dominantColors) {
            result.colorVector.dominantColors.forEach(color => {
                allColors.add(color.name);
            });
        }
    });
    
    const colorArray = Array.from(allColors).sort();
    const headers = ['이미지 이름', ...colorArray];
    
    const rows = files.map(file => {
        const result = analysisData[file.id];
        if (!result || !result.colorVector) {
            return [file.name, ...colorArray.map(() => '0%')];
        }
        
        const row = [file.name];
        colorArray.forEach(colorName => {
            const colorData = result.colorVector.dominantColors.find(c => c.name === colorName);
            row.push(colorData ? `${colorData.percentage}%` : '0%');
        });
        
        return row;
    });
    
    return [headers, ...rows].map(row => 
        row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
}

// 감정 행렬 CSV 생성
function generateEmotionMatrixCsv(files, analysisData) {
    const allEmotions = new Set();
    Object.values(analysisData).forEach(result => {
        if (result.emotionVector && result.emotionVector.emotions) {
            Object.keys(result.emotionVector.emotions).forEach(emotion => {
                allEmotions.add(emotion);
            });
        }
    });
    
    const emotionArray = Array.from(allEmotions).sort();
    const headers = ['이미지 이름', ...emotionArray];
    
    const rows = files.map(file => {
        const result = analysisData[file.id];
        if (!result || !result.emotionVector) {
            return [file.name, ...emotionArray.map(() => '0%')];
        }
        
        const row = [file.name];
        emotionArray.forEach(emotionName => {
            const emotionValue = result.emotionVector.emotions[emotionName] || 0;
            row.push(`${(emotionValue * 100).toFixed(1)}%`);
        });
        
        return row;
    });
    
    return [headers, ...rows].map(row => 
        row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
}

// CSV 다운로드 함수
function downloadCsv(content, filename) {
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