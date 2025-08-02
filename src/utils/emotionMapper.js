import { getEmotionVector } from '../data/colorEmotionMap.js';

// 색상 벡터를 감정 벡터로 변환하는 함수
export function createEmotionVector(colorVector) {
  const emotionVector = {
    emotions: {},
    overallMood: '',
    intensity: 0,
    dominantEmotions: [],
    colorEmotionMap: {}
  };
  
  let totalWeight = 0;
  const emotionWeights = {};
  
  // 각 색상의 감정 가중치 계산
  colorVector.dominantColors.forEach(color => {
    const weight = parseFloat(color.percentage);
    totalWeight += weight;
    
    const colorEmotion = getEmotionVector(color.name);
    emotionVector.colorEmotionMap[color.name] = colorEmotion;
    
    // 감정 가중치 누적
    Object.entries(colorEmotion.emotions).forEach(([emotion, value]) => {
      emotionWeights[emotion] = (emotionWeights[emotion] || 0) + (value * weight);
    });
  });
  
  // 가중 평균으로 최종 감정 벡터 계산
  if (totalWeight > 0) {
    Object.entries(emotionWeights).forEach(([emotion, totalValue]) => {
      emotionVector.emotions[emotion] = totalValue / totalWeight;
    });
  }
  
  // 감정 벡터 정규화 (합이 1이 되도록)
  normalizeEmotionVector(emotionVector.emotions);
  
  // 전체 강도 계산
  emotionVector.intensity = colorVector.totalIntensity;
  
  // 주요 감정들 추출 (상위 3개)
  emotionVector.dominantEmotions = Object.entries(emotionVector.emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion, value]) => ({
      name: emotion,
      value: value.toFixed(2)
    }));
  
  // 전체 분위기 결정
  emotionVector.overallMood = determineOverallMood(emotionVector.emotions);
  
  return emotionVector;
}

// 전체 분위기를 결정하는 함수
export function determineOverallMood(emotions) {
  const moodCategories = {
    positive: ['joy', 'excitement', 'optimism', 'energy', 'love', 'warmth', 'creativity'],
    calm: ['calm', 'peace', 'trust', 'stability', 'harmony', 'balance'],
    sophisticated: ['luxury', 'sophistication', 'authority', 'professionalism', 'elegance'],
    natural: ['nature', 'growth', 'freshness', 'earthiness'],
    mysterious: ['mystery', 'spirituality', 'wisdom', 'imagination'],
    neutral: ['neutrality', 'simplicity', 'cleanliness']
  };
  
  let maxScore = 0;
  let dominantMood = 'neutral';
  
  Object.entries(moodCategories).forEach(([mood, emotionList]) => {
    let score = 0;
    emotionList.forEach(emotion => {
      if (emotions[emotion]) {
        score += emotions[emotion];
      }
    });
    
    if (score > maxScore) {
      maxScore = score;
      dominantMood = mood;
    }
  });
  
  return dominantMood;
}

// 감정 벡터 정규화 함수
function normalizeEmotionVector(emotions) {
  const total = Object.values(emotions).reduce((sum, value) => sum + value, 0);
  
  if (total > 0) {
    Object.keys(emotions).forEach(emotion => {
      emotions[emotion] = emotions[emotion] / total;
    });
  }
}

// 감정 벡터 간 유사도 계산
export function calculateEmotionSimilarity(emotionVector1, emotionVector2) {
  const emotions1 = emotionVector1.emotions;
  const emotions2 = emotionVector2.emotions;
  
  // 모든 고유 감정들 수집
  const allEmotions = new Set([
    ...Object.keys(emotions1),
    ...Object.keys(emotions2)
  ]);
  
  let totalDifference = 0;
  let count = 0;
  
  allEmotions.forEach(emotion => {
    const value1 = emotions1[emotion] || 0;
    const value2 = emotions2[emotion] || 0;
    totalDifference += Math.abs(value1 - value2);
    count++;
  });
  
  if (count === 0) return 1;
  
  const averageDifference = totalDifference / count;
  return 1 - averageDifference;
}

// 감정 벡터를 시각화용 데이터로 변환
export function emotionVectorToChartData(emotionVector) {
  return Object.entries(emotionVector.emotions)
    .map(([emotion, value]) => ({
      emotion,
      value: parseFloat(value),
      percentage: (value * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value);
}

// 감정 강도에 따른 색상 매핑
export function getEmotionColor(emotion, intensity) {
  const emotionColors = {
    joy: '#FFD700',      // 금색
    excitement: '#FF4500', // 주황빨강
    calm: '#87CEEB',     // 하늘색
    trust: '#4169E1',    // 로얄블루
    love: '#FF69B4',     // 핫핑크
    energy: '#FFA500',   // 주황색
    creativity: '#9932CC', // 다크오키드
    luxury: '#DAA520',   // 골든로드
    nature: '#228B22',   // 포레스트그린
    mystery: '#4B0082',  // 인디고
    neutral: '#808080'   // 회색
  };
  
  return emotionColors[emotion] || '#808080';
} 