# 브라우저 호환성 테스트 가이드

리팩토링된 템플릿 시스템의 브라우저 호환성 테스트를 위한 종합적인 가이드입니다.

## 테스트 대상 브라우저

### 필수 지원 브라우저 (Tier 1)
- **Chrome**: 100+ (최신 2개 버전)
- **Firefox**: 100+ (최신 2개 버전)
- **Safari**: 15+ (macOS/iOS)
- **Edge**: 100+ (Chromium 기반)

### 호환성 확인 브라우저 (Tier 2)
- **Chrome**: 90-99 (구버전 지원)
- **Firefox**: 90-99 (구버전 지원)
- **Safari**: 13-14 (iOS 13+)
- **Samsung Internet**: 15+
- **Opera**: 80+

### 최소 지원 확인 (Tier 3)
- **Internet Explorer**: 11 (기본 기능만)
- **Chrome**: 80-89
- **Firefox**: 80-89

## 테스트 매트릭스

### 1. CSS Grid 및 Flexbox 호환성

#### 테스트할 레이아웃들
- ✅ `dashboard-layout` (CSS Grid + Flexbox)
- ✅ `list-layout` (Flexbox 기반)
- ✅ `auth-layout` (Grid + Flexbox)
- ✅ `settings-layout` (Grid 사이드바)

#### 확인 사항
```css
/* Grid 지원 여부 확인 */
@supports (display: grid) {
  .dashboard-layout {
    display: grid;
    grid-template-columns: 1fr;
  }
}

/* Flexbox 대체 지원 */
@supports not (display: grid) {
  .dashboard-layout {
    display: flex;
    flex-direction: column;
  }
}
```

### 2. CSS Custom Properties (CSS Variables) 호환성

#### 대상 변수들
- `--color-primary-*`: 색상 시스템
- `--spacing-*`: 간격 시스템  
- `--radius-*`: 모서리 둥글기
- `--font-*`: 폰트 시스템
- `--shadow-*`: 그림자 시스템

#### 폴백 전략
```css
/* CSS Variables 지원하지 않는 브라우저 대응 */
.btn {
  background-color: #3b82f6; /* 폴백 */
  background-color: var(--color-primary-500); /* CSS Variables */
}
```

### 3. 반응형 디자인 테스트

#### 테스트 뷰포트
- **Desktop**: 1920x1080, 1366x768
- **Tablet**: 768x1024, 834x1194 (iPad)
- **Mobile**: 375x667 (iPhone), 360x640 (Android)
- **Large Mobile**: 414x896 (iPhone Plus)

#### 브레이크포인트 확인
```css
/* 주요 브레이크포인트 */
@media (max-width: 1200px) { /* Large tablets/small laptops */ }
@media (max-width: 768px)  { /* Tablets */ }
@media (max-width: 480px)  { /* Mobile */ }
```

## 페이지별 테스트 체크리스트

### 1. 대시보드 페이지 (`dashboard.new.html`)

#### 레이아웃 테스트
- [ ] **Chrome**: Grid 레이아웃 정상 표시
- [ ] **Firefox**: 통계 카드 정렬 확인
- [ ] **Safari**: 차트 영역 표시 확인
- [ ] **Edge**: 액티비티 타임라인 스크롤
- [ ] **Mobile**: 카드 스택 레이아웃 변환

#### 컴포넌트 테스트
- [ ] `stat_card` 매크로 렌더링
- [ ] `simple_table` 반응형 동작
- [ ] `btn` 매크로 상호작용
- [ ] 다크 모드 토글 동작

#### 성능 테스트
- [ ] 페이지 로드 시간 < 2초
- [ ] CSS 렌더링 블로킹 없음
- [ ] 레이아웃 시프트 최소화

### 2. 사용자 관리 페이지 (`users/index.new.html`)

#### 필터 시스템 테스트
- [ ] **Chrome**: 필터 폼 정상 동작
- [ ] **Firefox**: 드롭다운 선택 확인
- [ ] **Safari**: 검색 필드 상호작용
- [ ] **Mobile**: 필터 섹션 반응형 전환

#### 테이블 시스템 테스트
- [ ] `data_table` 매크로 렌더링
- [ ] 테이블 가로 스크롤 동작
- [ ] 정렬 기능 정상 작동
- [ ] 페이지네이션 동작

#### 사용자 통계 테스트
- [ ] 통계 카드 그리드 레이아웃
- [ ] 활동 타임라인 표시
- [ ] 상태 배지 색상 정확성

### 3. 운영 관리 페이지 (`operations/index.new.html`)

#### 대시보드 레이아웃 테스트
- [ ] **Chrome**: 복합 그리드 레이아웃
- [ ] **Firefox**: 사이드바 고정 위치
- [ ] **Safari**: 메인 컨텐츠 스크롤
- [ ] **Mobile**: 사이드바 하단 이동

#### `operations_card` 테스트
- [ ] 카드 호버 효과 동작
- [ ] 액션 리스트 상호작용
- [ ] 아이콘 표시 정확성
- [ ] 카드 그리드 반응형 조정

#### 메트릭 및 통계 테스트
- [ ] 요약 통계 표시
- [ ] 운영 현황 표시기
- [ ] 워크플로우 단계 표시

### 4. 로그인 페이지 (`auth/login.new.html`)

#### 인증 레이아웃 테스트
- [ ] **Chrome**: 중앙 정렬 레이아웃
- [ ] **Firefox**: 배경 그라데이션
- [ ] **Safari**: 폼 요소 스타일링
- [ ] **Mobile**: 레이아웃 스택 변환

#### 폼 컴포넌트 테스트
- [ ] `form_input` 아이콘 표시
- [ ] `form_checkbox` 상호작용
- [ ] `btn` 스타일 및 상태
- [ ] 검증 메시지 표시

#### 애니메이션 테스트
- [ ] 카드 슬라이드업 애니메이션
- [ ] 정보 섹션 페이드인
- [ ] 호버 효과 부드러움
- [ ] 로딩 상태 표시

### 5. 설정 페이지 (`settings/index.new.html`)

#### 설정 레이아웃 테스트
- [ ] **Chrome**: 사이드바 네비게이션
- [ ] **Firefox**: 탭 전환 동작
- [ ] **Safari**: 스크롤 동기화
- [ ] **Mobile**: 네비게이션 그리드 변환

#### 폼 시스템 테스트
- [ ] `form_switch` 토글 동작
- [ ] `form_select` 드롭다운
- [ ] 라디오 그룹 선택
- [ ] 파일 업로드 필드

#### 복잡한 섹션 테스트
- [ ] 자산번호 설정 폼
- [ ] AI 서비스 설정 UI
- [ ] 백업/복원 카드 시스템
- [ ] 사용자 정의 필드 관리

## CSS 호환성 세부 확인

### 1. CSS Grid 지원
```css
/* Grid 미지원 브라우저 확인 */
.dashboard-layout {
  display: -webkit-box;  /* Old flexbox */
  display: -moz-box;     /* Firefox */
  display: -ms-flexbox;  /* IE 10 */
  display: -webkit-flex; /* Safari */
  display: flex;         /* Standard */
  
  /* Grid 지원 시 적용 */
  display: grid;
  grid-template-columns: 1fr;
}
```

### 2. CSS Custom Properties 폴백
```css
/* 필수 색상 변수들의 폴백값 */
:root {
  --color-primary-500: #3b82f6;
  --color-success-500: #10b981;
  --color-warning-500: #f59e0b;
  --color-danger-500: #ef4444;
}

/* 폴백 적용 예시 */
.btn-primary {
  background-color: #3b82f6;
  background-color: var(--color-primary-500);
}
```

### 3. Flexbox 호환성
```css
/* Flexbox 구버전 지원 */
.flex-container {
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
}
```

## JavaScript 호환성 확인

### 1. ES6+ 기능 사용 확인
- [ ] Arrow Functions 사용 여부
- [ ] Template Literals 사용 여부  
- [ ] Destructuring 사용 여부
- [ ] const/let 사용 여부

### 2. DOM API 호환성
- [ ] `querySelector` / `querySelectorAll`
- [ ] `addEventListener`
- [ ] `classList` API
- [ ] `dataset` API

### 3. 폴리필 필요 기능
```javascript
// IE11 지원을 위한 폴리필
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement) {
    return this.indexOf(searchElement) !== -1;
  };
}
```

## 접근성 (a11y) 테스트

### 1. 키보드 네비게이션
- [ ] Tab 순서가 논리적인가
- [ ] 모든 인터랙티브 요소에 접근 가능한가
- [ ] Skip links 동작하는가
- [ ] Focus 표시가 명확한가

### 2. 스크린 리더 지원
- [ ] ARIA 레이블 적절한가
- [ ] Semantic HTML 사용했는가
- [ ] 이미지 alt 텍스트 제공하는가
- [ ] 색상에만 의존하지 않는가

### 3. 대비 및 가독성
- [ ] 색상 대비비 4.5:1 이상인가
- [ ] 텍스트 크기 조정 200%까지 가능한가
- [ ] 색맹 사용자 고려했는가

## 성능 테스트

### 1. 로딩 성능
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms

### 2. 리소스 최적화
- [ ] CSS 파일 크기 적정한가
- [ ] 미사용 CSS 제거했는가
- [ ] Critical CSS 인라인화했는가
- [ ] 폰트 로딩 최적화했는가

## 자동화된 테스트 도구

### 1. Lighthouse 감사
```bash
# Chrome DevTools에서 실행
# Performance, Accessibility, Best Practices, SEO 점수 확인
```

### 2. Can I Use 확인
- CSS Grid: https://caniuse.com/css-grid
- CSS Variables: https://caniuse.com/css-variables
- Flexbox: https://caniuse.com/flexbox

### 3. BrowserStack 크로스 브라우저 테스트
```javascript
// 주요 테스트 시나리오
const testScenarios = [
  'Login flow with form validation',
  'Dashboard responsive layout',
  'Settings tab navigation',
  'Data table sorting and filtering',
  'Dark mode toggle functionality'
];
```

## 호환성 이슈 해결 방안

### 1. CSS Grid 미지원 시
```css
@supports not (display: grid) {
  .dashboard-layout {
    display: flex;
    flex-direction: column;
  }
  
  .dashboard-layout__main {
    display: flex;
    flex-wrap: wrap;
  }
}
```

### 2. CSS Variables 미지원 시
```css
/* SCSS 변수로 컴파일 타임 대체 */
$color-primary: #3b82f6;
$spacing-4: 1rem;

.btn-primary {
  background-color: $color-primary;
  padding: $spacing-4;
}
```

### 3. Flexbox 구버전 지원
```css
.flex-center {
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  
  -webkit-box-pack: center;
  -moz-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
}
```

## 테스트 완료 체크리스트

### Phase 2 리팩토링 검증
- [ ] 모든 새 템플릿이 주요 브라우저에서 정상 렌더링
- [ ] 매크로 시스템이 모든 브라우저에서 동작
- [ ] 반응형 레이아웃이 모든 디바이스에서 적절히 작동
- [ ] 다크 모드가 모든 브라우저에서 정상 동작
- [ ] 접근성 표준을 모든 브라우저에서 준수
- [ ] 성능 기준을 모든 브라우저에서 만족

### 회귀 테스트
- [ ] 기존 기능이 새 템플릿에서도 정상 동작
- [ ] 기존 JavaScript가 새 DOM 구조와 호환
- [ ] 기존 API 연동이 정상 작동
- [ ] 기존 사용자 워크플로우가 그대로 유지

## 테스트 보고서 템플릿

```markdown
## 브라우저 호환성 테스트 결과

### 테스트 환경
- 날짜: YYYY-MM-DD
- 테스터: 이름
- 테스트 페이지: [페이지 이름]

### 브라우저별 결과
| 브라우저 | 버전 | 레이아웃 | 기능 | 성능 | 접근성 | 전체 |
|---------|------|---------|------|------|--------|------|
| Chrome  | 120  | ✅      | ✅   | ✅   | ✅     | PASS |
| Firefox | 119  | ✅      | ✅   | ✅   | ✅     | PASS |
| Safari  | 17   | ✅      | ⚠️   | ✅   | ✅     | WARN |
| Edge    | 119  | ✅      | ✅   | ✅   | ✅     | PASS |

### 발견된 이슈
1. Safari에서 CSS Grid 일부 속성 미지원
2. IE11에서 CSS Variables 완전 미지원

### 권장 조치
1. Safari용 CSS Grid 폴백 추가
2. IE11용 SCSS 변수 컴파일 설정
```

이 가이드를 통해 리팩토링된 템플릿 시스템의 브라우저 호환성을 체계적으로 검증할 수 있습니다.