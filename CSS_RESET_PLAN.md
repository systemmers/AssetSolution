# CSS 전면 리셋 및 스타일 가이드 기반 재구축 계획

## 🎯 목표
기존 복잡한 CSS 구조를 모두 초기화하고 스타일 가이드 (http://127.0.0.1:5200/demo/style-guide) 기반으로 일관성 있는 새로운 CSS 시스템 구축

## 📋 현재 문제점
- 7개 파일에서 `.card` 중복 정의
- `border-left-*` vs `shadow-sm` 혼재 사용
- 페이지별 독립적 스타일로 일관성 부족
- CSS Specificity 충돌 문제

## 🔄 새로운 CSS 아키텍처

### Core System (핵심 시스템)
```
app/static/css/
├── core/
│   ├── variables.css      // CSS 변수 (색상, 간격, 폰트)
│   ├── reset.css         // 브라우저 기본값 리셋
│   └── utilities.css     // 유틸리티 클래스
├── components/
│   ├── buttons.css       // 버튼 컴포넌트 (표준 유지)
│   ├── cards.css         // 통합 카드 컴포넌트 ✨ 새로 구축
│   ├── forms.css         // 폼 컴포넌트 (표준 유지)
│   ├── tables.css        // 테이블 컴포넌트 (표준 유지)
│   └── badges.css        // 배지 컴포넌트 (표준 유지)
├── layout/
│   ├── grid.css          // 그리드 시스템
│   └── spacing.css       // 간격 시스템
└── style.css             // 메인 CSS (모든 것을 import)
```

### Page Specific (페이지별 최소화)
```
pages/
├── main/
│   └── dashboard.css     // 타임라인 등 고유 요소만
├── assets/
│   └── assets.css        // 자산 이미지, 필터 등 고유 요소만
└── operations/
    └── operations.css    // 운영 고유 요소만
```

## ✨ 새로운 카드 시스템 설계

### 통합 카드 클래스 구조
```css
/* 기본 카드 */
.card                     // 기본 스타일
.card-sm                  // 작은 카드
.card-lg                  // 큰 카드

/* 용도별 카드 */
.card-stat                // 통계 카드 (대시보드용)
.card-content             // 콘텐츠 카드 (일반용)
.card-action              // 액션 카드 (버튼 포함)

/* 상태별 카드 */
.card-primary             // 주요 색상
.card-success             // 성공 색상
.card-warning             // 경고 색상
.card-danger              // 위험 색상

/* 그림자 표준화 */
.shadow-xs                // 매우 약한 그림자
.shadow-sm                // 약한 그림자 (기본)
.shadow-md                // 보통 그림자
.shadow-lg                // 강한 그림자
```

## 🚀 실행 단계

### Phase 1: 백업 및 기반 구축 (30분)
- [x] 백업 브랜치 생성 (backup/css-before-reset)
- [ ] core/ 디렉토리 생성 및 기본 파일 생성
- [ ] 스타일 가이드에서 CSS 변수 추출

### Phase 2: 통합 컴포넌트 구축 (30분)
- [ ] 새로운 cards.css 생성 (스타일 가이드 기반)
- [ ] 기존 잘 정의된 컴포넌트 유지 (buttons, tables, forms)
- [ ] 그림자 시스템 표준화

### Phase 3: 페이지별 적용 (30분)
- [ ] dashboard.html 클래스 변경 (통합 카드 시스템 적용)
- [ ] assets 페이지 클래스 변경
- [ ] 기타 페이지 일괄 적용

### Phase 4: 검증 및 정리 (30분)
- [ ] 모든 페이지 기능 테스트
- [ ] 사용하지 않는 CSS 파일 제거
- [ ] style.css 통합 import 구조 완성

## 🎯 예상 효과
- CSS 파일 크기 50% 감소
- 카드 스타일 100% 일관성 확보
- 유지보수성 대폭 개선
- 새로운 페이지 개발 시 표준 준수 자동화

## ⚠️ 리스크 관리
- 각 단계마다 git commit으로 롤백 지점 확보
- 기능 검증 후 다음 단계 진행
- 필수 JavaScript 연동 확인

---
**작업 일시:** 2025-01-26
**예상 소요 시간:** 2시간
**완료 기준:** 모든 페이지 카드 스타일 일관성 100% 달성 