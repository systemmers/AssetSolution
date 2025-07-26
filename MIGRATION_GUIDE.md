# CSS 마이그레이션 가이드

페이지별 CSS를 새로운 템플릿 시스템으로 마이그레이션하는 가이드입니다.

## 🎯 마이그레이션 목표

- 28개 페이지 CSS 파일의 중복 제거
- 현대적 템플릿 시스템 도입
- 코드 재사용성 향상
- 유지보수성 개선

## 📁 새로운 구조

```
app/static/css/
├── base/           # 기본 스타일 (토큰, 리셋)
├── templates/      # 레이아웃 템플릿과 패턴 (새로 추가)
├── components/     # 재사용 컴포넌트
└── pages/          # 페이지별 고유 스타일만 유지
```

## 🔄 마이그레이션 전략

### 1. 템플릿 시스템 활용

**기존 방식:**
```css
/* pages/main/dashboard.css */
.dashboard-summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    /* ... 100줄의 스타일 */
}
```

**새로운 방식:**
```html
<!-- 템플릿에서 -->
<div class="summary-cards">
    <!-- templates/page-patterns.css의 .summary-cards 사용 -->
</div>
```

```css
/* pages/main/dashboard.new.css */
/* 페이지 고유 스타일만 정의 */
.dashboard-chart {
    min-height: 320px;
    /* 대시보드 차트만의 고유한 스타일 */
}
```

### 2. 레이아웃 템플릿 매핑

| 페이지 유형 | 사용할 템플릿 | 설명 |
|-------------|---------------|------|
| 대시보드 | `.dashboard-layout` | 통계 + 메인 + 사이드바 |
| 목록 페이지 | `.list-layout` | 필터 + 테이블/그리드 |
| 상세 페이지 | `.detail-layout` | 메인 콘텐츠 + 사이드바 |
| 폼 페이지 | `.form-layout` | 중앙 정렬 폼 |
| 설정 페이지 | `.settings-layout` | 네비 + 콘텐츠 |
| 로그인 | `.auth-layout` | 중앙 정렬 카드 |

### 3. 공통 패턴 활용

| 기존 CSS 패턴 | 새로운 클래스 | 설명 |
|---------------|---------------|------|
| `.asset-stats-cards` | `.summary-cards` | 통계 카드 그리드 |
| `.asset-filters` | `.filter-section` | 필터링 영역 |
| `.asset-status-badge` | `.status-badge` | 상태 표시 배지 |
| `.recent-activities` | `.activity-timeline` | 활동 타임라인 |
| `.asset-actions` | `.quick-actions` | 빠른 액션 버튼 |

## 📋 단계별 마이그레이션

### Phase 1: 완료된 작업 ✅
- 컴포넌트 시스템 구축 (카드, 버튼, 폼, 테이블)
- 템플릿 시스템 구축 (레이아웃 + 패턴)
- 예시 마이그레이션 (dashboard, assets/index)

### Phase 2: 우선순위 페이지 마이그레이션
```bash
# 마이그레이션 대상 (사용 빈도 높은 페이지)
pages/main/dashboard.css        → dashboard.new.css ✅
pages/assets/index.css          → index.new.css ✅
pages/inventory/index.css       → 마이그레이션 필요
pages/operations/index.css      → 마이그레이션 필요
pages/users/index.css           → 마이그레이션 필요
```

### Phase 3: 전체 페이지 마이그레이션
- 나머지 23개 페이지 CSS 파일
- 기존 파일은 `.legacy.css`로 백업
- 새 파일은 `.new.css`로 생성

## 🛠️ 마이그레이션 도구

### 1. CSS 중복 제거 체크리스트

**제거 대상:**
- [x] 카드 호버 효과 (템플릿으로 이동)
- [x] 필터 섹션 스타일 (템플릿으로 이동)
- [x] 상태 배지 스타일 (템플릿으로 이동)
- [x] 반응형 미디어 쿼리 (템플릿으로 이동)
- [x] 그리드 레이아웃 (템플릿으로 이동)

**유지 대상:**
- [ ] 페이지별 고유 컴포넌트 스타일
- [ ] 특수한 인터랙션 효과
- [ ] 페이지별 커스텀 레이아웃

### 2. HTML 템플릿 업데이트

**기존:**
```html
<div class="asset-stats-cards">
    <div class="asset-stat-card">...</div>
</div>
```

**새로운:**
```html
<div class="summary-cards">
    <div class="summary-card">...</div>
</div>
```

### 3. 테스트 가이드

각 마이그레이션 후 확인사항:
- [ ] 레이아웃이 올바르게 표시되는가?
- [ ] 반응형이 정상 작동하는가?
- [ ] 다크모드가 정상 작동하는가?
- [ ] 호버/포커스 효과가 정상인가?
- [ ] 브라우저 호환성 확인

## 📊 마이그레이션 진행 상황

### 완료 (2/28)
- ✅ dashboard.new.css
- ✅ assets/index.new.css

### 진행 중 (0/28)
- 진행 중인 파일 없음

### 대기 중 (26/28)
- inventory/index.css
- operations/index.css
- users/index.css
- auth/login.css
- settings/index.css
- (21개 추가 파일)

## 🎯 예상 효과

### 코드 감소량
- **기존**: 28개 파일, 약 8,000줄
- **마이그레이션 후**: 28개 파일, 약 3,000줄 (62% 감소)
- **중복 제거**: 약 5,000줄의 중복 코드 제거

### 유지보수성 향상
- 공통 패턴 수정 시 한 곳에서만 변경
- 새 페이지 개발 시 템플릿 재사용
- 일관성 있는 UI/UX

### 성능 개선
- CSS 파일 크기 감소
- 브라우저 캐싱 효율성 증대
- 로딩 시간 단축

## 🚀 다음 단계

1. **우선순위 페이지 마이그레이션** (inventory, operations, users)
2. **템플릿 매크로 개발** (Jinja2 템플릿 레벨에서 재사용)
3. **레거시 CSS 제거** (충분한 테스트 후)
4. **문서화 완료** (스타일 가이드 업데이트)

---

*이 가이드는 CSS 아키텍처 현대화 프로젝트의 일환으로 작성되었습니다.*