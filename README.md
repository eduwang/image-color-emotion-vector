# 🎨 이미지 색상-감정 분석기

이미지의 색상 정보를 추출하고 감정 벡터를 생성하는 웹 애플리케이션입니다. 이미지 간의 유사도를 분석하고 네트워크 그래프로 시각화할 수 있습니다.

## ✨ 주요 기능

### 📸 이미지 업로드 및 분석
- **다중 이미지 업로드**: 여러 이미지를 동시에 업로드하여 일괄 처리
- **실시간 색상 추출**: Canvas API를 사용한 픽셀 단위 색상 분석
- **RGB 양자화**: 16단위로 반올림하여 유사한 색상을 그룹화
- **감정 벡터 생성**: 색상 정보를 기반으로 12가지 감정 분류

### 📊 분석 결과 시각화
- **상세 분석 모달**: 각 이미지별 색상 및 감정 정보 상세 표시
- **분석 페이지**: 모든 이미지의 색상/감정 행렬 표시
- **CSV 다운로드**: 분석 결과를 CSV 파일로 내보내기

### 🕸️ 네트워크 그래프 시각화
- **색상 유사도 네트워크**: 색상 벡터 기반 이미지 연결
- **감정 유사도 네트워크**: 감정 벡터 기반 이미지 연결
- **다양한 유사도 알고리즘**:
  - 코사인 유사도
  - 유클리드 거리
  - 피어슨 상관계수
  - 자카드 유사도
  - 맨해튼 거리
  - 커스텀 가중치 유사도
- **인터랙티브 그래프**: 노드 툴팁, 줌, 패닝 기능
- **그래프 통계**: 노드 수, 엣지 수, 평균 연결도, 네트워크 밀도

## 🏗️ 프로젝트 구조

```
image-color-emotion-vector/
├── index.html                 # 메인 페이지 (이미지 업로드)
├── analysis.html              # 분석 페이지 (색상/감정 행렬)
├── graphVisualizer.html       # 그래프 시각화 페이지
├── package.json               # 프로젝트 의존성
├── vite.config.js            # Vite 설정 (멀티 페이지)
├── tailwind.config.js        # Tailwind CSS 설정
├── postcss.config.js         # PostCSS 설정
├── src/
│   ├── main.js               # 메인 페이지 로직
│   ├── analysis.js           # 분석 페이지 로직
│   ├── graphVisualizer.js    # 그래프 시각화 로직
│   ├── index.css             # 메인 스타일시트
│   ├── data/
│   │   └── colorEmotionMap.js # 색상-감정 매핑 데이터
│   └── utils/
│       ├── colorExtractor.js  # 색상 추출 로직
│       └── emotionMapper.js   # 감정 매핑 로직
└── README.md                 # 프로젝트 문서
```

## 🎨 감정 분류 (20가지 이상)

### 기본 색상별 감정 매핑
- **빨간색 계열**: 기쁨(joy), 흥분(excitement), 열정(passion), 분노(anger), 에너지(energy)
- **파란색 계열**: 평온(calm), 신뢰(trust), 안정(stability), 슬픔(sadness), 평화(peace)
- **녹색 계열**: 자연(nature), 성장(growth), 조화(harmony), 균형(balance), 신선함(freshness)
- **노란색 계열**: 기쁨(joy), 낙관(optimism), 에너지(energy), 창의성(creativity), 따뜻함(warmth)
- **보라색 계열**: 신비(mystery), 창의성(creativity), 고급스러움(luxury), 영성(spirituality), 지혜(wisdom)
- **주황색 계열**: 에너지(energy), 열정(enthusiasm), 따뜻함(warmth), 창의성(creativity), 모험(adventure)
- **분홍색 계열**: 사랑(love), 로맨스(romance), 달콤함(sweetness), 부드러움(gentleness), 순수함(innocence)
- **갈색 계열**: 안정(stability), 신뢰성(reliability), 대지의 향기(earthiness), 편안함(comfort), 따뜻함(warmth)
- **회색 계열**: 중성(neutrality), 세련됨(sophistication), 전문성(professionalism), 평온(calm)
- **검은색**: 권력(power), 우아함(elegance), 신비(mystery), 세련됨(sophistication), 권위(authority)
- **흰색**: 순수함(purity), 순수함(innocence), 깔끔함(cleanliness), 단순함(simplicity), 평화(peace)

### 주요 감정 카테고리
- **긍정적**: 기쁨, 흥분, 열정, 에너지, 낙관, 창의성
- **사랑/따뜻함**: 사랑, 로맨스, 따뜻함, 부드러움, 순수함
- **평온/안정**: 평온, 평화, 신뢰, 안정, 조화, 균형
- **자연/성장**: 자연, 성장, 신선함, 대지의 향기, 편안함
- **고급스러움**: 고급스러움, 부, 세련됨, 권위, 전문성, 우아함
- **신비/창의**: 신비, 영성, 지혜, 상상력, 창의성
- **중성/단순**: 중성, 단순함, 깔끔함, 순수함
- **기타**: 분노, 슬픔, 신뢰성, 모험, 달콤함

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 프로덕션 빌드
```bash
npm run build
```

## 📱 사용 방법

### 1. 이미지 업로드
- 메인 페이지에서 이미지 파일들을 선택하여 업로드
- 지원 형식: JPG, PNG, GIF, WebP
- 업로드된 이미지는 브라우저에서 즉시 분석됨

### 2. 분석 결과 확인
- **상세 분석**: 각 이미지의 "상세 분석 보기" 버튼 클릭
- **분석 페이지**: 모든 이미지 분석 완료 후 "분석 페이지로 이동" 버튼 클릭
- **CSV 다운로드**: 분석 결과를 CSV 파일로 다운로드

### 3. 네트워크 그래프 생성
- "네트워크 시각화" 버튼 클릭
- 유사도 알고리즘 선택 (코사인, 유클리드 등)
- 그래프 타입 선택 (색상/감정 네트워크)
- 임계값 조정으로 연결 강도 조절

## 🛠️ 기술 스택

### Frontend
- **Vanilla JavaScript**: ES6+ 모듈 시스템
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **PostCSS**: CSS 전처리 및 최적화

### 그래프 시각화
- **Graphology.js**: 그래프 데이터 구조 관리
- **Sigma.js**: 인터랙티브 그래프 렌더링
- **ForceAtlas2**: 그래프 레이아웃 알고리즘

### 이미지 처리
- **Canvas API**: 픽셀 단위 색상 추출
- **RGB 양자화**: 16단위 반올림으로 색상 그룹화
- **커스텀 알고리즘**: 색상-감정 매핑 및 유사도 계산

## 📊 데이터 저장

- **localStorage**: 브라우저 로컬 스토리지에 분석 결과 저장
- **세션 유지**: 페이지 새로고침 후에도 데이터 유지
- **크로스 페이지**: 메인 → 분석 → 그래프 페이지 간 데이터 공유

## 🎯 주요 알고리즘

### 색상 추출
1. Canvas에 이미지 렌더링
2. 픽셀 데이터 추출 (RGBA)
3. RGB 값을 16단위로 양자화
4. 유사한 색상 그룹화
5. 비율 계산 및 정렬

### 감정 매핑
1. 각 색상의 RGB 값 분석
2. 색상-감정 매핑 테이블 참조
3. 감정 벡터 생성 (12차원)
4. 벡터 정규화 (합 = 1)

### 유사도 계산
- **코사인 유사도**: 벡터 간 각도 기반 (0~1)
- **유클리드 거리**: 직선 거리 기반 (0~∞)
- **피어슨 상관계수**: 선형 상관관계 (-1~1)
- **자카드 유사도**: 집합 기반 유사도 (0~1)
- **맨해튼 거리**: L1 거리 기반 (0~∞)
- **커스텀 가중치**: 색상별 가중치 적용

## 🔧 커스터마이징

### 색상 추출 설정
```javascript
// src/utils/colorExtractor.js
const QUANTIZATION_STEP = 16; // RGB 양자화 단위
const MIN_COLOR_PERCENTAGE = 0.01; // 최소 색상 비율
```

### 감정 매핑 수정
```javascript
// src/data/colorEmotionMap.js
const colorEmotionMap = {
  // 색상 범위와 감정 매핑 수정
};
```

### 그래프 설정
```javascript
// src/graphVisualizer.js
const DEFAULT_THRESHOLD = 0.5; // 기본 유사도 임계값
const NODE_SIZE_RANGE = [1, 10]; // 노드 크기 범위
```

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.

---

**개발자**: 이미지 색상-감정 분석기 팀  
**버전**: 1.0.0  
**최종 업데이트**: 2024년 