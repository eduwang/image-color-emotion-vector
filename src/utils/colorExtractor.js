import { rgbToColorName } from '../data/colorEmotionMap.js';

// RGB 값을 일정 단위로 반올림하는 함수
function quantizeRGB(r, g, b, step = 16) {
  return {
    r: Math.round(r / step) * step,
    g: Math.round(g / step) * step,
    b: Math.round(b / step) * step
  };
}

// 색상 그룹화 함수
function groupSimilarColors(colors, step = 16) {
  const colorGroups = new Map();
  
  colors.forEach(color => {
    const quantized = quantizeRGB(color.r, color.g, color.b, step);
    const key = `${quantized.r},${quantized.g},${quantized.b}`;
    
    if (!colorGroups.has(key)) {
      colorGroups.set(key, {
        center: quantized,
        colors: [],
        count: 0
      });
    }
    
    const group = colorGroups.get(key);
    group.colors.push(color);
    group.count += color.count;
  });
  
  return Array.from(colorGroups.values());
}

// 이미지에서 주요 색상들을 추출하는 함수
export async function extractColorsFromImage(imageFile) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // 색상 빈도 분석 (더 세밀한 색상 구분)
      const colorMap = new Map();
      const sampleSize = Math.min(2000, pixels.length / 4); // 샘플링 크기 증가
      const step = Math.max(1, pixels.length / 4 / sampleSize);
      
      for (let i = 0; i < pixels.length; i += step * 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // 투명도가 높은 픽셀은 제외
        if (pixels[i + 3] < 128) continue;
        
        // 너무 어둡거나 밝은 색상 제외 (노이즈 제거)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness < 20 || brightness > 240) continue;
        
        const colorKey = `${r},${g},${b}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      }
      
      // 색상 데이터를 배열로 변환
      const colorArray = Array.from(colorMap.entries()).map(([colorKey, count]) => {
        const [r, g, b] = colorKey.split(',').map(Number);
        return { r, g, b, count };
      });
      
      // 색상 그룹화 적용 (16단위로 반올림)
      const colorGroups = groupSimilarColors(colorArray, 16);
      
      // 그룹을 크기순으로 정렬하고 상위 5개 선택
      const sortedGroups = colorGroups
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // 결과 포맷팅
      const sortedColors = sortedGroups.map((group, index) => {
        const { r, g, b } = group.center;
        const colorName = rgbToColorName(r, g, b);
        const percentage = (group.count / sampleSize) * 100;
        
        return {
          rgb: { r, g, b },
          hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
          name: colorName,
          percentage: percentage.toFixed(1),
          clusterSize: group.colors.length // 그룹에 포함된 색상 개수
        };
      });
      
      resolve(sortedColors);
    };
    
    img.src = URL.createObjectURL(imageFile);
  });
}

// 색상 벡터 생성 함수
export function createColorVector(colors) {
  const vector = {
    dominantColors: colors,
    averageRGB: { r: 0, g: 0, b: 0 },
    colorDistribution: {},
    totalIntensity: 0
  };
  
  let totalWeight = 0;
  
  colors.forEach(color => {
    const weight = parseFloat(color.percentage);
    totalWeight += weight;
    
    // 평균 RGB 계산
    vector.averageRGB.r += color.rgb.r * weight;
    vector.averageRGB.g += color.rgb.g * weight;
    vector.averageRGB.b += color.rgb.b * weight;
    
    // 색상 분포
    vector.colorDistribution[color.name] = (vector.colorDistribution[color.name] || 0) + weight;
  });
  
  // 정규화
  if (totalWeight > 0) {
    vector.averageRGB.r = Math.round(vector.averageRGB.r / totalWeight);
    vector.averageRGB.g = Math.round(vector.averageRGB.g / totalWeight);
    vector.averageRGB.b = Math.round(vector.averageRGB.b / totalWeight);
  }
  
  // 전체 강도 계산 (밝기 기반)
  const brightness = (vector.averageRGB.r * 299 + vector.averageRGB.g * 587 + vector.averageRGB.b * 114) / 1000;
  vector.totalIntensity = brightness / 255;
  
  return vector;
}

// 색상 유사도 계산 함수
export function calculateColorSimilarity(color1, color2) {
  const r1 = color1.rgb.r, g1 = color1.rgb.g, b1 = color1.rgb.b;
  const r2 = color2.rgb.r, g2 = color2.rgb.g, b2 = color2.rgb.b;
  
  const distance = Math.sqrt(
    Math.pow(r1 - r2, 2) + 
    Math.pow(g1 - g2, 2) + 
    Math.pow(b1 - b2, 2)
  );
  
  // 최대 거리 (255^2 * 3)^0.5 = 441.67
  return 1 - (distance / 441.67);
} 