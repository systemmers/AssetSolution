# 🔄 CSS 전면 리셋 및 Bootstrap 5 기반 재구축 완전 계획서

## 📊 현황 분석 요약

### 프로젝트 규모
- **HTML 템플릿**: 66개 파일
- **CSS 파일**: 30개 파일 
- **JavaScript 파일**: 100+ 개 파일
- **핵심 문제**: 7개 파일에서 `.card` 중복 정의, 일관성 부족

### Context7 MCP Bootstrap 5 참고사항 적용
- 유틸리티 우선 접근법 (Utility-first approach)
- 컴포넌트 기반 설계 (Component-based design)
- 반응형 시스템 표준화 (Responsive grid system)
- 접근성 고려 설계 (Accessibility considerations)

---

## 🎯 새로운 CSS 아키텍처

```
app/static/css/
├── bootstrap/              # Bootstrap 5 커스터마이징
│   ├── _variables.scss     # Bootstrap 변수 오버라이드
│   ├── _custom.scss        # 커스텀 Bootstrap 확장
│   └── bootstrap.scss      # Bootstrap 메인 파일
├── core/                   # 핵심 시스템
│   ├── variables.css       # 프로젝트 CSS 변수
│   ├── utilities.css       # 유틸리티 클래스
│   └── reset.css          # 브라우저 리셋
├── components/             # 재사용 컴포넌트 (통합)
│   ├── cards.css          # 🔄 통합 카드 시스템
│   ├── buttons.css        # ✅ Bootstrap 버튼 확장
│   ├── forms.css          # ✅ Bootstrap 폼 확장
│   ├── tables.css         # ✅ Bootstrap 테이블 확장
│   └── navigation.css     # 네비게이션
├── layout/                # 레이아웃
│   ├── header.css         
│   ├── sidebar.css        
│   └── footer.css         
└── style.css              # 메인 통합 파일
```

---

## 📋 상세 체크리스트

### Phase 1: 기반 구축 (Day 1-2)

#### 🔴 Priority 1: Core Setup
- [ ] **CSS-001**: Bootstrap 5.3.x 최신 버전 설치
  - [ ] CDN 또는 npm 패키지 설정
  - [ ] Sass 컴파일 환경 구성
  - [ ] 기존 Bootstrap 4 의존성 제거

- [ ] **CSS-002**: 통합 CSS 변수 시스템 구축
  ```css
  /* 새로운 변수 체계 */
  :root {
    --bs-primary: #007bff;
    --bs-primary-rgb: 0, 123, 255;
    --asset-card-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    --stat-card-border-width: 0.25rem;
  }
  ```

- [ ] **CSS-003**: 새로운 폴더 구조 생성
  - [ ] 기존 CSS 파일 백업 (backup/css-old/)
  - [ ] 새로운 디렉토리 구조 생성
  - [ ] 통합 style.css 생성

#### 🔄 Priority 2: Component Integration
- [ ] **CSS-004**: 카드 컴포넌트 시스템 통합
  ```css
  /* 통합 카드 시스템 */
  .card-stat { /* 통계 카드 */ }
  .card-asset { /* 자산 카드 */ }
  .card-action { /* 액션 포함 카드 */ }
  ```

### Phase 2: 핵심 템플릿 마이그레이션 (Day 3-5)

#### 🔴 Critical Templates
- [ ] **HTML-001**: app/templates/base.html
  - [ ] Bootstrap 5 CDN/로컬 링크 업데이트
  - [ ] 새로운 CSS 구조 적용
  - [ ] JavaScript Bootstrap 컴포넌트 업데이트
  - [ ] 반응형 메타태그 확인

- [ ] **HTML-002**: app/templates/main/dashboard.html
  - [ ] `.card.border-left-primary` → `.card.card-stat` 변경
  - [ ] 통계 카드 레이아웃 Bootstrap 5 그리드 적용
  - [ ] 타임라인 컴포넌트 Bootstrap 5 스타일 적용

- [ ] **HTML-003**: Assets 페이지들 (10개)
  - [ ] app/templates/assets/index.html
  - [ ] app/templates/assets/detail.html
  - [ ] app/templates/assets/form.html
  - [ ] app/templates/assets/bulk_register.html
  - [ ] app/templates/assets/ip_detail.html
  - [ ] app/templates/assets/ip_management.html
  - [ ] app/templates/assets/pc_detail.html
  - [ ] app/templates/assets/pc_management.html
  - [ ] app/templates/assets/sw_detail.html
  - [ ] app/templates/assets/sw_license.html

### Phase 3: 나머지 페이지 마이그레이션 (Day 6-8)

#### 🟡 High Priority (21개)
**Operations 페이지들:**
- [ ] app/templates/operations/allocation_management.html
- [ ] app/templates/operations/asset_disposal_planning.html
- [ ] app/templates/operations/asset_lifecycle_timeline.html
- [ ] app/templates/operations/detail.html
- [ ] app/templates/operations/disposal_form.html
- [ ] app/templates/operations/disposal_index.html
- [ ] app/templates/operations/disposal_planning.html
- [ ] app/templates/operations/disposal_planning_modal.html
- [ ] app/templates/operations/history.html
- [ ] app/templates/operations/index.html
- [ ] app/templates/operations/lifecycle_tracking.html
- [ ] app/templates/operations/loan_detail.html
- [ ] app/templates/operations/loan_form.html
- [ ] app/templates/operations/loan_index.html
- [ ] app/templates/operations/return_approval_dashboard.html
- [ ] app/templates/operations/return_approval_workflow.html
- [ ] app/templates/operations/return_form.html
- [ ] app/templates/operations/return_history.html
- [ ] app/templates/operations/return_notifications.html
- [ ] app/templates/operations/return_status_tracking.html
- [ ] app/templates/operations/statistics.html
- [ ] app/templates/operations/upgrade_management.html
- [ ] app/templates/operations/upgrade_plan_detail.html
- [ ] app/templates/operations/allocation_request_modal.html

**Inventory 페이지들 (6개):**
- [ ] app/templates/inventory/index.html
- [ ] app/templates/inventory/detail.html
- [ ] app/templates/inventory/create.html
- [ ] app/templates/inventory/edit.html
- [ ] app/templates/inventory/discrepancies.html
- [ ] app/templates/inventory/report.html

#### 🟢 Medium Priority (16개)
**Contract 페이지들 (4개):**
- [ ] app/templates/contract/index.html
- [ ] app/templates/contract/detail.html
- [ ] app/templates/contract/create.html
- [ ] app/templates/contract/edit.html

**Users 페이지들 (4개):**
- [ ] app/templates/users/index.html
- [ ] app/templates/users/detail.html
- [ ] app/templates/users/create.html
- [ ] app/templates/users/edit.html

**Auth 페이지들 (3개):**
- [ ] app/templates/auth/login.html
- [ ] app/templates/auth/profile.html
- [ ] app/templates/auth/edit_profile.html

**Settings 페이지들 (2개):**
- [ ] app/templates/settings/index.html
- [ ] app/templates/settings/categories.html

**Partners 페이지들 (2개):**
- [ ] app/templates/partners/partner_management.html
- [ ] app/templates/partners/partner_detail.html

#### 🔵 Low Priority (2개)
**Demo 페이지들:**
- [ ] app/templates/demo/style-demo.html
- [ ] app/templates/demo/bootstrap_style_guide.html

### Phase 4: CSS 파일 정리 및 통합

#### 🔄 Components 통합
**삭제할 중복 파일들:**
- [ ] ❌ app/static/css/components/stats-cards.css → cards.css로 통합
- [ ] ❌ app/static/css/components/modal-cards.css → cards.css로 통합
- [ ] ❌ app/static/css/pages/main/dashboard.css → components/cards.css로 이관
- [ ] ❌ app/static/css/pages/assets/index.css → 페이지별 최소한 유지
- [ ] ❌ app/static/css/pages/assets/detail.css → 페이지별 최소한 유지

**유지할 파일들 (정리 후):**
- [ ] ✅ app/static/css/components/buttons.css → Bootstrap 확장
- [ ] ✅ app/static/css/components/forms.css → Bootstrap 확장
- [ ] ✅ app/static/css/components/tables.css → Bootstrap 확장
- [ ] ✅ app/static/css/components/grid.css → Bootstrap 그리드 확장
- [ ] ✅ app/static/css/components/layout.css → 레이아웃

### Phase 5: JavaScript 호환성 업데이트

#### 🔄 Bootstrap 5 JavaScript 마이그레이션
**주요 변경사항:**
- [ ] `data-toggle` → `data-bs-toggle`
- [ ] `data-target` → `data-bs-target`
- [ ] jQuery 의존성 제거 (가능한 경우)
- [ ] Bootstrap 5 API 변경사항 적용

**업데이트 대상 파일들:**
- [ ] app/static/js/common/ui/UIModal.js
- [ ] app/static/js/common/ui/UIAlert.js
- [ ] app/static/js/demo/style-demo.js
- [ ] 각 페이지별 JavaScript 파일들

### Phase 6: 최종 검증 및 최적화

#### 🔍 검증 체크리스트
- [ ] **기능 검증**: 모든 페이지 정상 동작 확인
- [ ] **반응형 검증**: 모바일/태블릿/데스크톱 동작 확인
- [ ] **브라우저 호환성**: Chrome, Firefox, Safari, Edge 테스트
- [ ] **성능 검증**: CSS 파일 크기 50% 감소 확인
- [ ] **접근성 검증**: WCAG 2.1 AA 준수 확인

#### 🚀 최적화 작업
- [ ] 사용하지 않는 CSS 제거 (PurgeCSS 활용)
- [ ] CSS 압축 및 번들링
- [ ] Critical CSS 인라인 적용
- [ ] 다크모드 일관성 최종 확인

---

## 📈 성공 지표

### 정량적 지표
- [ ] CSS 파일 크기 **50% 이상 감소**
- [ ] 페이지 로딩 속도 **30% 향상**
- [ ] 카드 컴포넌트 정의 **7개 → 1개 통합**
- [ ] Bootstrap 5 표준 준수율 **100%**

### 정성적 지표
- [ ] 모든 페이지 일관된 디자인
- [ ] 완벽한 반응형 동작
- [ ] 다크모드 일관성 확보
- [ ] 개발자 경험 향상 (유지보수성)

---

## ⚠️ 위험 요소 및 대응 방안

### 주요 위험 요소
1. **기존 기능 손상**: 단계별 테스트로 대응
2. **JavaScript 호환성**: Bootstrap 5 마이그레이션 가이드 준수
3. **브라우저 호환성**: polyfill 적용 및 fallback CSS 제공
4. **개발 일정 지연**: 우선순위 기반 단계별 적용

### 롤백 계획
- 각 Phase별 git 브랜치 생성
- 기존 CSS 파일 백업 유지
- 단계별 테스트 실패 시 이전 단계로 롤백

---

## 🚀 즉시 실행 준비

**현재 상태**: ✅ 즉시 실행 가능
**예상 완료**: **9일 (1주 + 2일)**
**다음 액션**: Phase 1 시작 승인 대기

---

*작성일: 2024년 12월 19일*  
*프로젝트: Asset Management System*  
*참고: Bootstrap 5.3.x + Context7 MCP 권장사항* 