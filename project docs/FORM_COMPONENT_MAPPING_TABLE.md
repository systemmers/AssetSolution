# 📋 폼 컴포넌트 매핑 테이블 (FORM COMPONENT MAPPING TABLE)

> **목적**: 기존 스타일가이드를 충분히 반영하고 일관성을 확보하기 위한 폼/버튼/테이블 컴포넌트 통합 매핑

---

## 🎯 스타일가이드 분석 결과

### 현재 Design Tokens 기반 시스템
- ✅ **CSS 변수**: 204개 Design Token 정의
- ✅ **색상 시스템**: Bootstrap 5.2.3 호환
- ✅ **간격 시스템**: rem 기반 표준화
- ✅ **다크 모드**: 완전 지원
- ✅ **접근성**: 고대비 모드 지원

### 스타일가이드 표준 컴포넌트
1. **Typography**: 6단계 Heading + Body Text 변형
2. **Colors**: 브랜드/상태 색상 팔레트
3. **Buttons**: 8가지 색상 + 크기/상태 변형
4. **Forms**: 모든 입력 요소 + 상태 표시
5. **Cards**: 통계 카드 완전 통합 완료
6. **Tables**: 기본 테이블 + 호버/스트라이프

---

## 📊 컴포넌트별 매핑 계획

### 1. 폼 컴포넌트 매핑 (FORM COMPONENTS)

#### 1.1 입력 필드 (Input Fields)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 스타일가이드 준수 |
|------------|------------------|------|------------------|
| `form-control` | `form-input` | 기본 텍스트 입력 | ✅ CSS 변수 활용 |
| `form-control is-valid` | `form-input form-input-valid` | 유효성 검증 성공 | ✅ 피드백 시스템 |
| `form-control is-invalid` | `form-input form-input-error` | 유효성 검증 실패 | ✅ 접근성 색상 |
| `form-control` (disabled) | `form-input form-input-disabled` | 비활성화 상태 | ✅ 시각적 구분 |

#### 1.2 선택 박스 (Select)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 개선 사항 |
|------------|------------------|------|-----------|
| `form-select` | `form-select-custom` | 기본 선택 박스 | 커스텀 화살표 아이콘 |
| `form-select` (multiple) | `form-select-multiple` | 다중 선택 | 체크박스 스타일 |

#### 1.3 체크박스/라디오 (Checkboxes/Radio)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 개선 사항 |
|------------|------------------|------|-----------|
| `form-check-input` | `form-checkbox` | 체크박스 | 커스텀 체크 아이콘 |
| `form-check-input` (radio) | `form-radio` | 라디오 버튼 | 브랜드 색상 적용 |
| `form-check form-switch` | `form-toggle` | 토글 스위치 | 애니메이션 개선 |

#### 1.4 텍스트 영역 (Textarea)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 개선 사항 |
|------------|------------------|------|-----------|
| `form-control` (textarea) | `form-textarea` | 멀티라인 텍스트 | 리사이즈 핸들 스타일링 |

#### 1.5 폼 레이아웃 (Form Layout)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 개선 사항 |
|------------|------------------|------|-----------|
| `form-label` | `form-label-standard` | 기본 라벨 | 필수 표시 통합 |
| `form-text` | `form-help-text` | 도움말 텍스트 | 일관된 색상/크기 |
| `form-group` | `form-field` | 필드 그룹 | 간격 표준화 |

---

### 2. 버튼 컴포넌트 매핑 (BUTTON COMPONENTS)

#### 2.1 기본 버튼 (Primary Buttons)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 스타일가이드 반영 |
|------------|------------------|------|-------------------|
| `btn btn-primary` | `btn-primary-solid` | 주요 액션 | ✅ 브랜드 색상 |
| `btn btn-secondary` | `btn-secondary-solid` | 보조 액션 | ✅ 그레이 스케일 |
| `btn btn-success` | `btn-success-solid` | 성공 액션 | ✅ 상태 색상 |
| `btn btn-warning` | `btn-warning-solid` | 경고 액션 | ✅ 상태 색상 |
| `btn btn-danger` | `btn-danger-solid` | 위험 액션 | ✅ 상태 색상 |

#### 2.2 아웃라인 버튼 (Outline Buttons)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 개선 사항 |
|------------|------------------|------|-----------|
| `btn btn-outline-primary` | `btn-primary-outline` | 보조 주요 액션 | 호버 애니메이션 |
| `btn btn-outline-secondary` | `btn-secondary-outline` | 보조 액션 | 포커스 링 개선 |

#### 2.3 크기 변형 (Size Variants)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 표준화 |
|------------|------------------|------|--------|
| `btn btn-sm` | `btn-size-sm` | 작은 버튼 | ✅ Design Token |
| `btn btn-lg` | `btn-size-lg` | 큰 버튼 | ✅ Design Token |

#### 2.4 특수 버튼 (Special Buttons)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 스타일가이드 준수 |
|------------|------------------|------|-------------------|
| `btn-export-excel` | `btn-export-excel` | 엑셀 내보내기 | ✅ 이미 표준화됨 |
| `btn-floating` | `btn-floating-action` | 플로팅 액션 | ✅ 그림자 시스템 |
| `btn-icon` | `btn-with-icon` | 아이콘 버튼 | ✅ 간격 시스템 |

---

### 3. 테이블 컴포넌트 매핑 (TABLE COMPONENTS)

#### 3.1 기본 테이블 (Basic Tables)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 개선 사항 |
|------------|------------------|------|-----------|
| `table` | `table-base` | 기본 테이블 | 일관된 셀 패딩 |
| `table table-hover` | `table-interactive` | 호버 효과 | 부드러운 애니메이션 |
| `table table-striped` | `table-striped` | 줄무늬 테이블 | 다크 모드 최적화 |

#### 3.2 반응형 테이블 (Responsive Tables)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 개선 사항 |
|------------|------------------|------|-----------|
| `table-responsive` | `table-responsive-scroll` | 가로 스크롤 | 스크롤바 스타일링 |
| `table-responsive-sm` | `table-responsive-mobile` | 모바일 최적화 | 카드형 레이아웃 |

#### 3.3 테이블 헤더 (Table Headers)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 스타일가이드 반영 |
|------------|------------------|------|-------------------|
| `table-light` | `table-header-light` | 밝은 헤더 | ✅ 그레이 스케일 |
| `table-dark` | `table-header-dark` | 어두운 헤더 | ✅ 다크 모드 |

#### 3.4 자산관리 특화 테이블 (Asset Tables)
| 기존 클래스 | 새로운 통합 클래스 | 용도 | 특화 기능 |
|------------|------------------|------|-----------|
| `asset-row` | `table-asset-row` | 자산 행 | 클릭 상호작용 |
| `asset-image-thumb` | `table-asset-thumbnail` | 자산 썸네일 | 지연 로딩 |
| `asset-status-badge` | `table-status-badge` | 상태 배지 | 상태별 색상 |

---

## 🎨 새로운 컴포넌트 클래스 체계

### Design System 일관성 확보

#### 네이밍 컨벤션
```scss
// 패턴: {component}-{variant}-{modifier}
.form-input-error          // 폼 입력 에러 상태
.btn-primary-outline       // 주요 아웃라인 버튼
.table-asset-row          // 자산 테이블 행
.card-stat-primary        // 주요 통계 카드 (기존 완료)
```

#### 상태 시스템
```scss
// 상태별 통일된 색상 적용
.component-state-valid     // --color-success
.component-state-error     // --color-danger  
.component-state-warning   // --color-warning
.component-state-disabled  // --color-gray-400
```

#### 크기 시스템
```scss
// 일관된 크기 변형
.component-size-xs         // --spacing-1, --font-size-xs
.component-size-sm         // --spacing-2, --font-size-sm
.component-size-md         // --spacing-3, --font-size-base
.component-size-lg         // --spacing-4, --font-size-lg
.component-size-xl         // --spacing-5, --font-size-xl
```

---

## 📋 구현 우선순위

### Phase 1: 폼 컴포넌트 (높음)
1. **form-input** 시스템 - 가장 많이 사용되는 컴포넌트
2. **form-select-custom** - 일관성 부족이 심각한 영역
3. **form-checkbox/radio** - 브랜드 일관성 확보

### Phase 2: 버튼 컴포넌트 (높음)
1. **btn-primary/secondary-solid** - 핵심 사용자 액션
2. **btn-with-icon** - 아이콘과 텍스트 일관성
3. **btn-size-** 시스템 - 크기 표준화

### Phase 3: 테이블 컴포넌트 (중간)
1. **table-base** - 기본 테이블 스타일링
2. **table-asset-** 시리즈 - 자산관리 특화
3. **table-responsive-mobile** - 모바일 경험 개선

---

## 🔄 마이그레이션 전략

### 점진적 적용 방식
1. **신규 컴포넌트 구현** → 기존과 병행 사용
2. **템플릿별 순차 적용** → 페이지별 검증
3. **기존 클래스 단계적 제거** → 안전한 마이그레이션

### 테스트 우선순위
1. **로그인 페이지** (auth/) - 기본 폼 검증
2. **자산 등록 페이지** (assets/form.html) - 복합 폼 검증  
3. **사용자 관리** (users/) - 테이블 + 폼 조합
4. **대시보드** (main/dashboard.html) - 버튼 + 카드 조합

---

## 🎯 성공 지표

### 품질 목표
- **CSS 크기**: 추가 50% 감소 목표 (현재 18KB → 9KB)
- **컴포넌트 일관성**: 100% Design Token 기반
- **접근성**: WCAG 2.1 AA 준수
- **브라우저 호환성**: IE11+ 지원

### 개발 효율성 목표
- **새로운 폼 추가 시간**: 기존 대비 80% 단축
- **디자인 수정 시간**: CSS 변수 수정으로 즉시 반영
- **코드 중복**: 완전 제거 (DRY 원칙)

---

**작성일**: 2025-01-11  
**프로젝트**: Asset Management System PHASE-2  
**상태**: 스타일가이드 분석 완료, 구현 준비 