# 🧩 CSS 컴포넌트 통합 가이드

## 📋 개요
기존 17개 CSS 파일의 혼잡한 상태를 완전히 정리하고, 재사용 가능한 컴포넌트 시스템으로 통합하는 가이드입니다.

---

## 🚨 현재 문제 상황

### 기존 혼잡한 CSS 구조
```
app/static/css/
├── style.css                    # 메인 파일 (282줄)
├── components/                  # 17개 컴포넌트 파일
│   ├── cards.css               # 카드 (276줄)
│   ├── modal-cards.css         # 모달 카드 (244줄)
│   ├── stats-cards.css         # 통계 카드 (250줄)
│   ├── buttons.css             # 버튼 (742줄)
│   ├── tables.css              # 테이블 (342줄)
│   └── ... 12개 더
├── pages/                       # 페이지별 개별 CSS
│   ├── assets/index.css        # 자산 페이지
│   ├── inventory/create.css    # 재고 페이지
│   └── ... 30개 더
└── shared/                      # 공유 CSS
    └── operations.css
```

### 중복 정의 문제
```css
/* cards.css */
.card { border: 1px solid #ddd; }

/* modal-cards.css */
.modal-card { border: 1px solid #ddd; } /* 중복! */

/* stats-cards.css */
.stats-card { border: 1px solid #ddd; } /* 중복! */

/* pages/assets/index.css */
.asset-stats-cards .card { border: 1px solid #ddd; } /* 중복! */
```

---

## 🏗️ 새로운 컴포넌트 시스템

### 통합 아키텍처
```
app/static/css/
├── src/                         # 새로운 통합 시스템
│   ├── bootstrap/
│   │   ├── _variables.scss      # Bootstrap 변수 오버라이드
│   │   ├── _custom.scss         # 커스텀 확장
│   │   └── bootstrap.scss       # Bootstrap 메인
│   ├── components/              # 통합 컴포넌트
│   │   ├── _cards.scss          # 모든 카드 통합
│   │   ├── _buttons.scss        # 모든 버튼 통합
│   │   ├── _tables.scss         # 모든 테이블 통합
│   │   ├── _forms.scss          # 모든 폼 통합
│   │   └── _layout.scss         # 레이아웃 통합
│   ├── core/
│   │   ├── _variables.scss      # 프로젝트 변수
│   │   ├── _utilities.scss      # 유틸리티
│   │   └── _reset.scss          # 브라우저 리셋
│   └── main.scss                # 메인 통합 파일
└── dist/
    └── main.css                 # 최종 컴파일 결과
```

---

## 🧩 컴포넌트 매핑 테이블

### 1. 카드 컴포넌트 통합

#### 기존 → 새로운 매핑
| 기존 클래스 | 위치 | 새로운 컴포넌트 | 설명 |
|------------|------|----------------|------|
| `.card` | components/cards.css | `.card-base` | 기본 카드 |
| `.stats-card` | components/stats-cards.css | `.card-stat` | 통계 카드 |
| `.stat-card` | shared/operations.css | `.card-stat` | 통계 카드 (통합) |
| `.modal-card` | components/modal-cards.css | `.card-modal` | 모달 카드 |
| `.asset-stats-cards .card` | pages/assets/index.css | `.card-stat` | 자산 통계 (통합) |
| `.inventory-summary-cards .card` | pages/inventory/index.css | `.card-stat` | 재고 통계 (통합) |
| `.disposal-stats-cards .card` | pages/operations/disposal.css | `.card-stat` | 처분 통계 (통합) |

#### 새로운 통합 카드 시스템
```scss
// _cards.scss - 모든 카드 통합
.card-base {
  border: var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  transition: var(--card-transition);
  
  &:hover {
    box-shadow: var(--card-shadow-hover);
  }
}

.card-stat {
  @extend .card-base;
  border-left: 4px solid var(--color-primary);
  
  .stat-icon {
    font-size: var(--stat-icon-size);
    color: var(--color-primary);
    opacity: 0.8;
  }
  
  .stat-number {
    font-size: var(--stat-number-size);
    font-weight: var(--font-weight-bold);
    margin: 0;
  }
  
  .stat-label {
    font-size: var(--stat-label-size);
    color: var(--color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  // 색상 변형
  &.card-stat-primary { border-left-color: var(--color-primary); }
  &.card-stat-success { border-left-color: var(--color-success); }
  &.card-stat-warning { border-left-color: var(--color-warning); }
  &.card-stat-danger { border-left-color: var(--color-danger); }
}

.card-data {
  @extend .card-base;
  // 데이터 표시 전용 카드
}

.card-action {
  @extend .card-base;
  cursor: pointer;
  
  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }
}
```

### 2. 버튼 컴포넌트 통합

#### 기존 → 새로운 매핑
| 기존 클래스 | 새로운 컴포넌트 | 설명 |
|------------|----------------|------|
| `.btn-primary` | `.btn-base.btn-primary` | 기본 primary 버튼 |
| `.btn-view` | `.btn-action-view` | 조회 액션 버튼 |
| `.btn-edit` | `.btn-action-edit` | 수정 액션 버튼 |
| `.btn-approve` | `.btn-action-approve` | 승인 액션 버튼 |
| `.btn-reject` | `.btn-action-reject` | 거부 액션 버튼 |
| `.action-btn` | `.btn-action` | 일반 액션 버튼 |

#### 새로운 통합 버튼 시스템
```scss
// _buttons.scss - 모든 버튼 통합
.btn-base {
  @extend .btn; // Bootstrap 기본 버튼 확장
  border-radius: var(--btn-radius);
  transition: var(--btn-transition);
  font-weight: var(--btn-font-weight);
  
  &:focus {
    box-shadow: var(--btn-focus-shadow);
  }
}

.btn-action {
  @extend .btn-base;
  padding: var(--btn-action-padding);
  font-size: var(--btn-action-font-size);
  
  i {
    margin-right: var(--btn-icon-margin);
  }
}

.btn-action-view {
  @extend .btn-action;
  background-color: var(--color-info);
  border-color: var(--color-info);
  color: white;
  
  &:hover {
    background-color: var(--color-info-dark);
    border-color: var(--color-info-dark);
  }
}

.btn-action-edit {
  @extend .btn-action;
  background-color: var(--color-warning);
  border-color: var(--color-warning);
  color: white;
  
  &:hover {
    background-color: var(--color-warning-dark);
    border-color: var(--color-warning-dark);
  }
}
```

### 3. 테이블 컴포넌트 통합

#### 새로운 통합 테이블 시스템
```scss
// _tables.scss - 모든 테이블 통합
.table-base {
  @extend .table; // Bootstrap 기본 테이블 확장
  border-color: var(--table-border-color);
  
  th {
    background-color: var(--table-header-bg);
    color: var(--table-header-color);
    font-weight: var(--table-header-font-weight);
    border-bottom: 2px solid var(--table-border-color);
  }
}

.table-data {
  @extend .table-base;
  
  .data-row {
    cursor: pointer;
    transition: var(--table-row-transition);
    
    &:hover {
      background-color: var(--table-row-hover-bg);
    }
  }
  
  .data-cell-image {
    width: var(--table-image-size);
    height: var(--table-image-size);
    object-fit: cover;
    border-radius: var(--table-image-radius);
  }
  
  .data-cell-badge {
    font-size: var(--table-badge-font-size);
    padding: var(--table-badge-padding);
    border-radius: var(--table-badge-radius);
  }
}
```

---

## 🔄 변환 프로세스

### 1. 기존 CSS 파일 분석
```bash
# 기존 CSS 파일들의 클래스 사용 현황 파악
grep -r "\.card" app/static/css/ > card_usage.txt
grep -r "\.btn" app/static/css/ > button_usage.txt
grep -r "\.table" app/static/css/ > table_usage.txt
```

### 2. 컴포넌트 구현
```scss
// main.scss - 모든 컴포넌트 통합
@import "bootstrap/bootstrap";
@import "core/variables";
@import "core/utilities";
@import "core/reset";
@import "components/cards";
@import "components/buttons";
@import "components/tables";
@import "components/forms";
@import "components/layout";
```

### 3. 템플릿 파일 변환
```html
<!-- 기존 -->
<div class="asset-stats-cards">
  <div class="card border-left-primary">
    <div class="card-body">
      <div class="stat-icon text-primary">
        <i class="fas fa-box"></i>
      </div>
      <div class="stat-number">1,234</div>
      <div class="stat-label">총 자산</div>
    </div>
  </div>
</div>

<!-- 새로운 컴포넌트 -->
<div class="card-stat card-stat-primary">
  <div class="card-body">
    <div class="stat-icon">
      <i class="fas fa-box"></i>
    </div>
    <div class="stat-number">1,234</div>
    <div class="stat-label">총 자산</div>
  </div>
</div>
```

### 4. JavaScript 의존성 업데이트
```javascript
// 기존
document.querySelectorAll('.asset-stats-cards .card');

// 새로운
document.querySelectorAll('.card-stat');
```

---

## ✅ 검증 체크리스트

### 컴포넌트 통합 완료 확인
- [ ] 모든 카드 관련 클래스가 `.card-stat`, `.card-data`, `.card-action`으로 통합됨
- [ ] 모든 버튼 관련 클래스가 `.btn-action-*` 시스템으로 통합됨
- [ ] 모든 테이블 관련 클래스가 `.table-data` 시스템으로 통합됨
- [ ] 기존 17개 CSS 파일이 1개 `dist/main.css`로 통합됨
- [ ] 중복 정의가 완전히 제거됨

### 성능 개선 확인
- [ ] CSS 파일 크기 66% 감소 (150KB → 50KB)
- [ ] HTTP 요청 94% 감소 (17개 → 1개)
- [ ] 페이지 로딩 속도 개선 확인

### 일관성 확인
- [ ] 모든 페이지에서 동일한 컴포넌트 사용
- [ ] 색상, 간격, 폰트 완전 표준화
- [ ] Bootstrap 5.2.3 표준 100% 준수

---

## 🎯 최종 목표

**기존 혼잡한 17개 CSS 파일 → 1개 통합 컴포넌트 시스템**
- 완전한 일관성 확보
- 재사용 가능한 컴포넌트 설계
- 유지보수성 17배 향상
- 개발 효율성 극대화

---

*작성일: 2025-01-11*  
*프로젝트: Asset Management System*  
*목표: 컴포넌트 중심 CSS 시스템 구축* 