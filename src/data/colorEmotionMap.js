// 색상-감정 매핑 데이터
export const colorEmotionMap = {
  // 빨간색 계열
  red: {
    emotions: { joy: 0.8, excitement: 0.9, passion: 0.7, anger: 0.6, energy: 0.8 },
    intensity: 0.9
  },
  crimson: {
    emotions: { passion: 0.8, intensity: 0.7, love: 0.6, power: 0.7 },
    intensity: 0.8
  },
  
  // 파란색 계열
  blue: {
    emotions: { calm: 0.8, trust: 0.7, stability: 0.6, sadness: 0.5, peace: 0.7 },
    intensity: 0.6
  },
  navy: {
    emotions: { trust: 0.8, authority: 0.7, stability: 0.8, professionalism: 0.7 },
    intensity: 0.7
  },
  
  // 녹색 계열
  green: {
    emotions: { nature: 0.8, growth: 0.7, harmony: 0.6, balance: 0.7, freshness: 0.6 },
    intensity: 0.6
  },
  emerald: {
    emotions: { luxury: 0.7, wealth: 0.6, sophistication: 0.7, nature: 0.6 },
    intensity: 0.7
  },
  
  // 노란색 계열
  yellow: {
    emotions: { joy: 0.9, optimism: 0.8, energy: 0.7, creativity: 0.6, warmth: 0.7 },
    intensity: 0.8
  },
  gold: {
    emotions: { luxury: 0.8, wealth: 0.7, success: 0.6, prestige: 0.7 },
    intensity: 0.8
  },
  
  // 보라색 계열
  purple: {
    emotions: { mystery: 0.7, creativity: 0.6, luxury: 0.6, spirituality: 0.7, wisdom: 0.6 },
    intensity: 0.7
  },
  violet: {
    emotions: { creativity: 0.7, imagination: 0.6, spirituality: 0.6, luxury: 0.5 },
    intensity: 0.6
  },
  
  // 주황색 계열
  orange: {
    emotions: { energy: 0.8, enthusiasm: 0.7, warmth: 0.6, creativity: 0.5, adventure: 0.6 },
    intensity: 0.7
  },
  
  // 분홍색 계열
  pink: {
    emotions: { love: 0.8, romance: 0.7, sweetness: 0.6, gentleness: 0.7, innocence: 0.6 },
    intensity: 0.6
  },
  
  // 갈색 계열
  brown: {
    emotions: { stability: 0.7, reliability: 0.6, earthiness: 0.7, comfort: 0.6, warmth: 0.5 },
    intensity: 0.5
  },
  
  // 회색 계열
  gray: {
    emotions: { neutrality: 0.8, sophistication: 0.6, professionalism: 0.7, calm: 0.5 },
    intensity: 0.4
  },
  
  // 검은색
  black: {
    emotions: { power: 0.8, elegance: 0.7, mystery: 0.6, sophistication: 0.7, authority: 0.8 },
    intensity: 0.9
  },
  
  // 흰색
  white: {
    emotions: { purity: 0.8, innocence: 0.7, cleanliness: 0.7, simplicity: 0.6, peace: 0.6 },
    intensity: 0.3
  }
};

// 색상 이름을 감정 벡터로 변환하는 함수
export function getEmotionVector(colorName) {
  const color = colorEmotionMap[colorName.toLowerCase()];
  if (!color) {
    return {
      emotions: { neutral: 0.5 },
      intensity: 0.5
    };
  }
  return color;
}

// RGB 값을 색상 이름으로 변환하는 함수
export function rgbToColorName(r, g, b) {
  // 간단한 색상 매칭 로직
  const colors = {
    red: [255, 0, 0],
    blue: [0, 0, 255],
    green: [0, 255, 0],
    yellow: [255, 255, 0],
    purple: [128, 0, 128],
    orange: [255, 165, 0],
    pink: [255, 192, 203],
    brown: [165, 42, 42],
    gray: [128, 128, 128],
    black: [0, 0, 0],
    white: [255, 255, 255]
  };
  
  let minDistance = Infinity;
  let closestColor = 'gray';
  
  for (const [colorName, rgb] of Object.entries(colors)) {
    const distance = Math.sqrt(
      Math.pow(r - rgb[0], 2) + 
      Math.pow(g - rgb[1], 2) + 
      Math.pow(b - rgb[2], 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorName;
    }
  }
  
  return closestColor;
} 