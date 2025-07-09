# 페이지별 Repository 사용 현황 매핑

## 1. Operations 웹 페이지 구조

### 템플릿 파일 분석 (23개 파일)
```
templates/operations/
├── 대여 관련 (4개)
│   ├── loan_index.html - 대여 목록 페이지
│   ├── loan_form.html - 대여 신청 페이지
│   ├── return_history.html - 반납 이력 페이지
│   └── return_form.html - 반납 처리 페이지
├── 폐기 관련 (6개)
│   ├── disposal_index.html - 폐기 목록 페이지
│   ├── disposal_form.html - 폐기 신청 페이지
│   ├── disposal_planning.html - 폐기 계획 관리
│   ├── disposal_planning_modal.html - 폐기 계획 모달
│   └── asset_disposal_planning.html - 자산 폐기 계획
├── 지급 관련 (2개)
│   ├── allocation_management.html - 지급 관리 페이지
│   └── allocation_request_modal.html - 지급 요청 모달
├── 업그레이드 관련 (2개)
│   ├── upgrade_management.html - 업그레이드 관리
│   └── upgrade_plan_detail.html - 업그레이드 계획 상세
├── 생명주기 관련 (2개)
│   ├── lifecycle_tracking.html - 생명주기 추적
│   └── asset_lifecycle_timeline.html - 자산 생명주기 타임라인
├── 반납 워크플로우 (4개)
│   ├── return_approval_dashboard.html - 반납 승인 대시보드
│   ├── return_approval_workflow.html - 반납 승인 워크플로우
│   ├── return_notifications.html - 반납 알림
│   └── return_status_tracking.html - 반납 상태 추적
└── 공통 (3개)
    ├── index.html - 운영 관리 메인
    ├── statistics.html - 운영 통계
    ├── history.html - 운영 이력
    └── detail.html - 상세 정보
```

## 2. 라우트별 Repository 사용 패턴

### 2.1 Loan 도메인 라우트
**라우트**: `/operations/loans`
**템플릿**: `loan_index.html`
**사용 메서드**:
- `operations_service.get_loan_list_with_filters()` → `get_loans_with_pagination()`
- `operations_service.get_loan_detail()` → `get_loan_by_id()`

**JavaScript**: `loan_index.js`
**API 호출**: 
- `/api/loans` (GET) - 대여 목록 조회
- `/api/loans/<id>` (GET) - 대여 상세 조회
- `/api/loans/statistics` (GET) - 대여 통계
- `/api/loans/active` (GET) - 활성 대여 목록

### 2.2 Disposal 도메인 라우트
**라우트**: `/operations/disposals`, `/operations/disposal/planning`
**템플릿**: `disposal_index.html`, `disposal_planning.html`
**사용 메서드**:
- `operations_service.get_disposal_list()` → `get_all_disposals()`
- `operations_service.get_disposal_detail()` → `get_disposal_by_id()`
- `operations_service.get_disposal_planning_data()` → `get_all_disposal_plans()`
- `operations_service.get_disposal_planning_statistics()` → `get_disposal_planning_statistics()`

**JavaScript**: `asset_disposal_planning.js` (1,286줄)
**API 호출**:
- `/api/disposals` (GET/POST) - 폐기 목록/생성
- `/api/disposals/<id>` (GET/PUT/DELETE) - 폐기 상세/수정/삭제
- `/api/disposals/reasons` (GET) - 폐기 사유
- `/api/disposal-planning-data` (GET) - 폐기 계획 데이터
- `/api/disposal-planning-statistics` (GET) - 폐기 계획 통계

### 2.3 Allocation 도메인 라우트
**라우트**: `/operations/allocation/management`
**템플릿**: `allocation_management.html`
**사용 메서드**:
- `operations_service.get_allocation_requests_data()` → `get_allocation_requests_data()`
- `operations_service.get_allocation_requesters()` → `get_allocation_requesters()`
- `operations_service.get_allocation_assets()` → `get_allocation_assets()`

**JavaScript**: `allocation_management.js` (762줄)
**API 호출**: 주로 Mock 데이터 기반 클라이언트 사이드 처리

### 2.4 Upgrade 도메인 라우트
**라우트**: `/operations/upgrade-management`
**템플릿**: `upgrade_management.html`, `upgrade_plan_detail.html`
**사용 메서드**:
- `operations_service.get_upgrade_management_data()` → `get_all_upgrade_plans()`
- `operations_service.get_upgrade_plan_details()` → `get_upgrade_plan_by_id()`
- `operations_service.get_upgrade_plans_statistics()` → `get_upgrade_plans_statistics()`

**JavaScript**: `upgrade_management.js` (915줄)
**API 호출**:
- `/api/upgrade-plans` (GET) - 업그레이드 계획 목록
- `/api/upgrade-plans/<id>` (GET) - 업그레이드 계획 상세
- `/api/upgrade-plans/statistics` (GET) - 업그레이드 계획 통계

### 2.5 Lifecycle 도메인 라우트
**라우트**: `/operations/lifecycle-tracking`
**템플릿**: `lifecycle_tracking.html`, `asset_lifecycle_timeline.html`
**사용 메서드**:
- `operations_service.get_lifecycle_tracking_data()` → `get_all_lifecycle_events()`
- `operations_service.get_asset_lifecycle_timeline()` → `get_lifecycle_events_by_asset()`
- `operations_service.get_lifecycle_statistics()` → `get_lifecycle_statistics()`

**JavaScript**: `lifecycle_tracking.js` (599줄)
**API 호출**:
- `/api/lifecycle-events` (GET) - 생명주기 이벤트 목록
- `/api/lifecycle-events/asset/<id>` (GET) - 자산별 생명주기
- `/api/lifecycle-events/statistics` (GET) - 생명주기 통계
- `/api/lifecycle-events/<id>` (GET) - 생명주기 이벤트 상세

## 3. 공통 기능 라우트

### 3.1 통계 및 이력
**라우트**: `/operations/statistics`, `/operations/history`
**템플릿**: `statistics.html`, `history.html`
**사용 메서드**:
- `statistics_service.get_operations_statistics()` → `get_operations_statistics()`
- `statistics_service.get_operation_history()` → `get_operation_history()`
- `statistics_service.get_detailed_statistics()` → `get_detailed_statistics()`

**JavaScript**: `statistics.js` (485줄), `history.js` (518줄)

### 3.2 반납 워크플로우
**라우트**: `/operations/return-*`
**템플릿**: `return_*.html` (4개 파일)
**사용 메서드**: 주로 operations_core_service의 반납 관련 메서드들

**JavaScript**: 
- `return_approval_dashboard.js` (975줄)
- `return_approval_workflow.js` (967줄)
- `return_notifications.js` (1,127줄)
- `return_status_tracking.js` (607줄)

## 4. 영향도 분석

### 4.1 높은 영향도 (Critical)
1. **Disposal 도메인** - 6개 페이지, 14개 메서드, 1,286줄 JS
2. **Loan 도메인** - 4개 페이지, 8개 메서드, 반납 워크플로우 포함
3. **통계/이력 기능** - 모든 도메인 데이터 통합

### 4.2 중간 영향도 (Medium)
1. **Upgrade 도메인** - 2개 페이지, 5개 메서드, 915줄 JS
2. **Lifecycle 도메인** - 2개 페이지, 6개 메서드, 599줄 JS

### 4.3 낮은 영향도 (Low)
1. **Allocation 도메인** - 2개 페이지, 6개 메서드, 762줄 JS (주로 클라이언트 사이드)

## 5. 마이그레이션 시 고려사항

### 5.1 API 호환성 유지
- 기존 API 엔드포인트 URL 변경 없이 내부 구현만 변경
- 응답 데이터 구조 동일하게 유지
- 에러 처리 방식 일관성 유지

### 5.2 JavaScript 코드 영향 최소화
- 클라이언트 사이드 코드는 수정 없이 유지
- API 호출 패턴 변경 없음
- Mock 데이터 구조 호환성 유지

### 5.3 템플릿 변경 최소화
- HTML 템플릿 수정 불필요
- 데이터 바인딩 구조 유지
- CSS/UI 컴포넌트 영향 없음

## 6. 테스트 우선순위

### Phase 1: Disposal 도메인 (6개 페이지)
- disposal_index.html
- disposal_planning.html
- asset_disposal_planning.html
- disposal_form.html
- disposal_planning_modal.html

### Phase 2: Loan 도메인 (4개 페이지)
- loan_index.html
- loan_form.html
- return_history.html
- return_form.html

### Phase 3: 나머지 도메인 (11개 페이지)
- Lifecycle: 2개 페이지
- Upgrade: 2개 페이지
- Allocation: 2개 페이지
- 반납 워크플로우: 4개 페이지
- 공통: 1개 페이지 (statistics, history는 통합 테스트에서) 