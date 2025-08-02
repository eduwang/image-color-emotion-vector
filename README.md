# 이미지 색상-감정 분석기

이미지의 색상을 분석하고 감정 벡터를 추출하는 웹 애플리케이션입니다.

## 🎯 주요 기능

### 📸 이미지 업로드
- **드래그 앤 드롭**: 이미지를 드래그해서 업로드
- **파일 선택**: 버튼 클릭으로 이미지 파일 선택
- **다중 업로드**: 여러 이미지를 한 번에 업로드 가능
- **실시간 미리보기**: 업로드된 이미지 즉시 확인

### 🎨 색상 분석
- **RGB 양자화**: 16단위로 색상을 그룹화하여 비슷한 색상들을 묶음
- **주요 색상 추출**: 상위 5개의 주요 색상과 비율 표시
- **색상 분포**: 각 색상의 퍼센트와 RGB 값 제공
- **평균 RGB**: 전체 이미지의 평균 색상 계산

### 😊 감정 벡터 생성
- **색상-감정 매핑**: 각 색상을 감정으로 변환
- **가중 평균**: 색상 비율에 따른 감정 가중치 계산
- **정규화**: 감정 벡터의 합이 100%가 되도록 정규화
- **주요 감정**: 상위 3개의 주요 감정과 강도 표시
- **전체 분위기**: 이미지의 전체적인 감정 분위기 결정

### 📊 분석 결과
- **갤러리 뷰**: 업로드된 이미지들과 분석 결과를 카드 형태로 표시
- **상세 분석**: 각 이미지의 상세한 색상 및 감정 벡터 정보
- **CSV 다운로드**: 전체 분석 결과를 CSV 파일로 다운로드
- **실시간 카운트**: 분석된 이미지 수와 총 이미지 수 표시

## 🛠️ 기술 스택

### Frontend
- **Vanilla JavaScript**: 순수 JavaScript로 구현
- **Vite**: 빠른 개발 서버와 빌드 도구
- **Tailwind CSS**: 모던한 UI 디자인
- **Canvas API**: 이미지 픽셀 데이터 처리

### 색상 분석
- **RGB 양자화**: 16단위 반올림으로 색상 그룹화
- **CIE76 색상 거리**: 색상 유사도 계산
- **노이즈 제거**: 너무 어둡거나 밝은 색상 필터링

### 감정 분석
- **색상-감정 매핑**: 11가지 기본 색상과 20가지 이상 감정 연결
- **가중 평균**: 색상 비율에 따른 감정 계산
- **정규화**: 감정 벡터 합을 100%로 정규화

## 📁 프로젝트 구조

```
image-color-emotion-vector/
├── index.html              # 메인 HTML 파일
├── src/
│   ├── main.js            # 메인 JavaScript 로직
│   ├── index.css          # Tailwind CSS + 커스텀 스타일
│   ├── utils/
│   │   ├── colorExtractor.js    # 색상 추출 로직
│   │   └── emotionMapper.js     # 감정 벡터 생성
│   └── data/
│       └── colorEmotionMap.js   # 색상-감정 매핑 데이터
├── package.json           # 프로젝트 설정
├── vite.config.js         # Vite 설정
├── tailwind.config.js     # Tailwind CSS 설정
├── postcss.config.js      # PostCSS 설정
└── README.md              # 프로젝트 문서
```

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 브라우저에서 확인
```
http://localhost:5174/
```

## 🎨 색상-감정 매핑

### 기본 색상 (11가지)
- **빨간색**: 열정, 에너지, 사랑
- **주황색**: 창의성, 낙관, 따뜻함
- **노란색**: 기쁨, 흥미, 활력
- **초록색**: 자연, 성장, 평온
- **파란색**: 신뢰, 평화, 안정
- **보라색**: 신비, 지혜, 상상력
- **분홍색**: 사랑, 따뜻함, 창의성
- **갈색색**: 자연, 안정, 따뜻함
- **회색색**: 중성, 단순함, 깔끔함
- **검은색**: 고급스러움, 권위, 전문성
- **흰색**: 깔끔함, 단순함, 중성

### 감정 분류 (20가지 이상)
- **긍정적**: 기쁨(joy), 흥분(excitement), 열정(passion), 에너지(energy), 낙관(optimism)
- **사랑/따뜻함**: 사랑(love), 로맨스(romance), 따뜻함(warmth), 부드러움(gentleness), 순수함(innocence)
- **평온/안정**: 평온(calm), 평화(peace), 신뢰(trust), 안정(stability), 조화(harmony), 균형(balance)
- **자연/성장**: 자연(nature), 성장(growth), 신선함(freshness), 대지의 향기(earthiness), 편안함(comfort)
- **고급스러움**: 고급스러움(luxury), 부(swealth), 세련됨(sophistication), 권위(authority), 전문성(professionalism), 우아함(elegance)
- **신비/창의**: 신비(mystery), 영성(spirituality), 지혜(wisdom), 상상력(imagination), 창의성(creativity)
- **중성/단순**: 중성(neutrality), 단순함(simplicity), 깔끔함(cleanliness), 순수함(purity)
- **기타**: 분노(anger), 슬픔(sadness), 신뢰성(reliability), 모험(adventure), 달콤함(sweetness)

## 📊 CSV 다운로드 형식

다운로드되는 CSV 파일에는 다음 정보가 포함됩니다:

### 이미지 정보
- 이미지 번호, 파일명, 파일 크기

### 색상 벡터
- 주요 색상 5개 (이름, RGB, 퍼센트)
- 평균 RGB, 전체 색상 강도

### 감정 벡터
- 전체 분위기, 주요 감정 3개
- 전체 감정 분포 (20가지 이상 감정의 퍼센트)

## 🎯 사용 시나리오

### 1. 개인 사용
- **사진 분석**: 개인 사진의 색상과 감정 분석
- **디자인 참고**: 색상 조합과 감정 효과 확인
- **감정 기록**: 이미지별 감정 벡터 저장

### 2. 디자인 작업
- **색상 팔레트**: 이미지에서 주요 색상 추출
- **감정 분석**: 디자인의 감정적 효과 평가
- **브랜딩**: 브랜드 이미지의 색상-감정 분석

### 3. 연구 목적
- **데이터 수집**: 대량 이미지의 색상-감정 데이터
- **패턴 분석**: 색상과 감정의 상관관계 연구
- **통계 분석**: CSV 데이터를 통한 정량적 분석

## 🔧 커스터마이징

### 색상 그룹화 조정
`src/utils/colorExtractor.js`에서 RGB 양자화 단위를 조정할 수 있습니다:
```javascript
// 16단위 → 8단위로 변경 (더 세밀한 그룹화)
const colorGroups = groupSimilarColors(colorArray, 8);
```

### 감정 매핑 수정
`src/data/colorEmotionMap.js`에서 색상-감정 매핑을 수정할 수 있습니다.

### UI 스타일 변경
`src/index.css`에서 색상 테마와 스타일을 수정할 수 있습니다.

## 📈 성능 최적화

- **샘플링**: 대용량 이미지도 효율적으로 처리
- **노이즈 제거**: 의미 없는 색상 필터링
- **정규화**: 감정 벡터의 정확한 계산
- **실시간 처리**: 업로드 즉시 분석 시작

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 등록해주세요. 