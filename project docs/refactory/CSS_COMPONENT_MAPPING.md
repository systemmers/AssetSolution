# 🗂️ CSS 컴포넌트 매핑 테이블

## 📋 개요
기존 17개 CSS 파일의 혼잡한 클래스들을 새로운 통합 컴포넌트 시스템으로 매핑하는 변환 테이블입니다.

---

## 🧩 1. 카드 컴포넌트 매핑

### 기존 → 새로운 매핑 테이블
| 기존 클래스 | 파일 위치 | 새로운 컴포넌트 | 설명 |
|------------|----------|----------------|------|
| `.card` | components/cards.css | `.card-base` | 기본 카드 스타일 |
| `.stats-card` | components/stats-cards.css | `.card-stat` | 통계 카드 |
| `.stat-card` | shared/operations.css | `.card-stat` | 통계 카드 (통합) |
| `.modal-card` | components/modal-cards.css | `.card-modal` | 모달 전용 카드 |
| `.asset-stats-cards .card` | pages/assets/index.css | `.card-stat` | 자산 통계 (통합) |
| `.inventory-summary-cards .card` | pages/inventory/index.css | `.card-stat` | 재고 통계 (통합) |
| `.disposal-stats-cards .card` | pages/operations/disposal.css | `.card-stat` | 처분 통계 (통합) |
| `.allocation-stats-cards .card` | pages/operations/allocation.css | `.card-stat` | 할당 통계 (통합) |
| `.lifecycle-stats-cards .card` | pages/operations/lifecycle.css | `.card-stat` | 생명주기 통계 (통합) |

### 카드 변형 클래스 매핑
| 기존 클래스 | 새로운 컴포넌트 | 용도 |
|------------|----------------|------|
| `.border-left-primary` | `.card-stat-primary` | Primary 색상 통계 카드 |
| `.border-left-success` | `.card-stat-success` | Success 색상 통계 카드 |
| `.border-left-warning` | `.card-stat-warning` | Warning 색상 통계 카드 |
| `.border-left-danger` | `.card-stat-danger` | Danger 색상 통계 카드 |
| `.border-left-info` | `.card-stat-info` | Info 색상 통계 카드 |

---

## 🔘 2. 버튼 컴포넌트 매핑

### 기존 → 새로운 매핑 테이블
| 기존 클래스 | 파일 위치 | 새로운 컴포넌트 | 설명 |
|------------|----------|----------------|------|
| `.btn-primary` | components/buttons.css | `.btn-base.btn-primary` | Primary 버튼 |
| `.btn-secondary` | components/buttons.css | `.btn-base.btn-secondary` | Secondary 버튼 |
| `.btn-view` | demo/bootstrap_style_guide.html | `.btn-action-view` | 조회 액션 버튼 |
| `.btn-edit` | demo/bootstrap_style_guide.html | `.btn-action-edit` | 수정 액션 버튼 |
| `.btn-approve` | demo/bootstrap_style_guide.html | `.btn-action-approve` | 승인 액션 버튼 |
| `.btn-reject` | demo/bootstrap_style_guide.html | `.btn-action-reject` | 거부 액션 버튼 |
| `.btn-print` | demo/bootstrap_style_guide.html | `.btn-action-print` | 인쇄 액션 버튼 |
| `.action-btn` | 여러 페이지 | `.btn-action` | 일반 액션 버튼 |

### 버튼 크기 매핑
| 기존 클래스 | 새로운 컴포넌트 | 설명 |
|------------|----------------|------|
| `.btn-sm` | `.btn-base.btn-sm` | 작은 버튼 |
| `.btn-lg` | `.btn-base.btn-lg` | 큰 버튼 |

---

## 📊 3. 테이블 컴포넌트 매핑

### 기존 → 새로운 매핑 테이블
| 기존 클래스 | 파일 위치 | 새로운 컴포넌트 | 설명 |
|------------|----------|----------------|------|
| `.table` | components/tables.css | `.table-base` | 기본 테이블 |
| `.asset-list-table` | pages/assets/index.css | `.table-data` | 자산 목록 테이블 |
| `.inventory-table` | pages/inventory/index.css | `.table-data` | 재고 테이블 |
| `.table-striped` | Bootstrap 기본 | `.table-base.table-striped` | 줄무늬 테이블 |
| `.table-hover` | Bootstrap 기본 | `.table-base.table-hover` | 호버 효과 테이블 |

### 테이블 셀 매핑
| 기존 클래스 | 새로운 컴포넌트 | 설명 |
|------------|----------------|------|
| `.asset-image` | `.data-cell-image` | 테이블 내 이미지 |
| `.asset-status-badge` | `.data-cell-badge` | 테이블 내 상태 배지 |
| `.asset-row` | `.data-row` | 테이블 행 |

---

## 📝 4. 폼 컴포넌트 매핑

### 기존 → 새로운 매핑 테이블
| 기존 클래스 | 파일 위치 | 새로운 컴포넌트 | 설명 |
|------------|----------|----------------|------|
| `.form-control` | components/forms.css | `.form-base.form-control` | 기본 입력 필드 |
| `.form-select` | components/forms.css | `.form-base.form-select` | 선택 드롭다운 |
| `.form-check` | components/forms.css | `.form-base.form-check` | 체크박스/라디오 |

---

## 🏷️ 5. 배지 컴포넌트 매핑

### 기존 → 새로운 매핑 테이블
| 기존 클래스 | 파일 위치 | 새로운 컴포넌트 | 설명 |
|------------|----------|----------------|------|
| `.badge` | components/badges.css | `.badge-base` | 기본 배지 |
| `.status-in-use` | pages/assets/index.css | `.badge-status-active` | 사용 중 상태 |
| `.status-available` | pages/assets/index.css | `.badge-status-available` | 사용 가능 상태 |
| `.status-maintenance` | pages/assets/index.css | `.badge-status-maintenance` | 유지보수 상태 |
| `.status-retired` | pages/assets/index.css | `.badge-status-retired` | 퇴역 상태 |

---

## 🔄 6. 변환 프로세스

### HTML 템플릿 변환 예시
```html
<!-- 기존 코드 -->
<div class="asset-stats-cards">
  <div class="card border-left-primary">
    <div class="card-body">
      <div class="row no-gutters align-items-center">
        <div class="col mr-2">
          <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
            총 자산
          </div>
          <div class="h5 mb-0 font-weight-bold text-gray-800">1,234</div>
        </div>
        <div class="col-auto">
          <i class="fas fa-box fa-2x text-gray-300"></i>
        </div>
      </div>
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

### JavaScript 업데이트
```javascript
// 기존
document.querySelectorAll('.asset-stats-cards .card');
document.querySelectorAll('.inventory-summary-cards .card');
document.querySelectorAll('.disposal-stats-cards .card');

// 새로운
document.querySelectorAll('.card-stat');
```

---

## ✅ 변환 체크리스트

### 카드 컴포넌트 변환
- [ ] `.asset-stats-cards` → `.card-stat` 변환
- [ ] `.inventory-summary-cards` → `.card-stat` 변환
- [ ] `.disposal-stats-cards` → `.card-stat` 변환
- [ ] `.allocation-stats-cards` → `.card-stat` 변환
- [ ] `.lifecycle-stats-cards` → `.card-stat` 변환
- [ ] `.border-left-*` → `.card-stat-*` 변환

### 버튼 컴포넌트 변환
- [ ] `.btn-view` → `.btn-action-view` 변환
- [ ] `.btn-edit` → `.btn-action-edit` 변환
- [ ] `.btn-approve` → `.btn-action-approve` 변환
- [ ] `.action-btn` → `.btn-action` 변환

### 테이블 컴포넌트 변환
- [ ] `.asset-list-table` → `.table-data` 변환
- [ ] `.inventory-table` → `.table-data` 변환
- [ ] `.asset-row` → `.data-row` 변환

### 배지 컴포넌트 변환
- [ ] `.status-*` → `.badge-status-*` 변환

---

## 🎯 최종 목표

**혼잡한 개별 클래스 → 통합 컴포넌트 시스템**
- 7개 카드 파일 → 1개 통합 카드 컴포넌트
- 페이지별 개별 스타일 → 재사용 가능한 컴포넌트
- 중복 정의 완전 제거
- Bootstrap 5.2.3 표준 100% 준수

---

*작성일: 2025-01-11*  
*프로젝트: Asset Management System*  
*목표: 완전한 컴포넌트 통합* 