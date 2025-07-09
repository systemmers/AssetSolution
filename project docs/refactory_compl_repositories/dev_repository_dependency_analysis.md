# Repository 의존성 분석 결과

## 1. Operations Repository 구조 분석

### 파일 크기 및 구성
- **총 라인 수**: 2,289줄
- **Mock 데이터**: 1,090줄 (47.6%)
- **비즈니스 로직**: 1,199줄 (52.4%)

### 도메인별 함수 분류

#### Loan (대여) 도메인 - 8개 메서드
- `get_all_loans()` - 대여 목록 조회
- `get_loan_by_id()` - 대여 상세 조회
- `get_loans_with_pagination()` - 페이지네이션 대여 목록
- `get_returned_loans()` - 반납된 대여 목록
- `get_loan_statuses()` - 대여 상태 마스터
- `get_operations_statistics()` - 운영 통계
- `get_operation_history()` - 운영 이력
- `get_detailed_statistics()` - 상세 통계

#### Disposal (폐기) 도메인 - 12개 메서드
- `get_all_disposals()` - 폐기 목록 조회
- `get_disposal_by_id()` - 폐기 상세 조회
- `get_disposal_reasons()` - 폐기 사유 마스터
- `get_all_disposal_plans()` - 폐기 계획 목록
- `get_disposal_plan_by_id()` - 폐기 계획 상세
- `get_disposal_plans_with_pagination()` - 페이지네이션 폐기 계획
- `create_disposal_plan()` - 폐기 계획 생성
- `update_disposal_plan()` - 폐기 계획 수정
- `delete_disposal_plan()` - 폐기 계획 삭제
- `approve_disposal_plan()` - 폐기 계획 승인
- `schedule_disposal_plan()` - 폐기 일정 확정
- `complete_disposal_plan()` - 폐기 완료 처리
- `get_disposal_planning_statistics()` - 폐기 계획 통계
- `get_disposal_planning_statuses()` - 폐기 계획 상태 마스터

#### Allocation (지급) 도메인 - 5개 메서드
- `get_allocation_requests_data()` - 지급 요청 데이터
- `get_allocation_requesters()` - 지급 요청자 목록
- `get_allocation_assets()` - 지급 자산 목록
- `get_allocation_types()` - 지급 유형 목록
- `get_allocation_statuses()` - 지급 상태 목록
- `get_allocation_request_titles()` - 지급 요청 제목 템플릿

#### Upgrade (업그레이드) 도메인 - 5개 메서드
- `get_all_upgrade_plans()` - 업그레이드 계획 목록
- `get_upgrade_plan_by_id()` - 업그레이드 계획 상세
- `get_upgrade_plans_with_pagination()` - 페이지네이션 업그레이드 계획
- `get_upgrade_plans_statistics()` - 업그레이드 계획 통계
- `get_upgrade_statuses()` - 업그레이드 상태 마스터

#### Lifecycle (생명주기) 도메인 - 6개 메서드
- `get_all_lifecycle_events()` - 생명주기 이벤트 목록
- `get_lifecycle_events_by_asset()` - 자산별 생명주기 이벤트
- `get_lifecycle_events_with_pagination()` - 페이지네이션 생명주기 이벤트
- `get_lifecycle_statistics()` - 생명주기 통계
- `get_lifecycle_event_types()` - 생명주기 이벤트 타입 마스터
- `get_lifecycle_event_by_id()` - 생명주기 이벤트 상세

## 2. 의존성 매핑

### Operations Repository 사용 서비스
1. **operations_core_service.py** (2,498줄)
   - 모든 도메인의 비즈니스 로직 처리
   - 주요 사용 메서드: 36개 이상

2. **operations_statistics_service.py**
   - 통계 관련 기능
   - 주요 사용 메서드: 통계 관련 메서드들

3. **operations/loan_service.py**
   - 대여 관련 전용 서비스
   - 주요 사용 메서드: Loan 도메인 메서드들

4. **operations/lifecycle_service.py**
   - 생명주기 관련 전용 서비스
   - 주요 사용 메서드: Lifecycle 도메인 메서드들

5. **operations/notification_service.py**
   - 알림 관련 서비스
   - 주요 사용 메서드: 통계 및 상태 메서드들

6. **operations/return_service.py**
   - 반납 관련 서비스
   - 주요 사용 메서드: Loan 도메인 메서드들

7. **operations/upgrade_service.py**
   - 업그레이드 관련 서비스
   - 주요 사용 메서드: Upgrade 도메인 메서드들

### Repository 초기화 방식
```python
# repositories/__init__.py
from .operations_repository import OperationsRepository
operations_repository = OperationsRepository()  # 싱글톤 인스턴스
```

## 3. 페이지별 Repository 사용 현황

### 웹 페이지와 Repository 매핑
- **대여 관리 페이지**: Loan 도메인 메서드 사용
- **폐기 관리 페이지**: Disposal 도메인 메서드 사용
- **지급 관리 페이지**: Allocation 도메인 메서드 사용
- **업그레이드 관리 페이지**: Upgrade 도메인 메서드 사용
- **생명주기 추적 페이지**: Lifecycle 도메인 메서드 사용
- **대시보드**: 모든 도메인의 통계 메서드 사용

## 4. 분리 우선순위

### 1순위: Disposal 도메인
- 메서드 수: 12개 (가장 많음)
- CRUD 작업 포함
- 독립성 높음

### 2순위: Loan 도메인
- 메서드 수: 8개
- 핵심 비즈니스 로직
- 다른 도메인과 연관성 높음

### 3순위: Lifecycle 도메인
- 메서드 수: 6개
- 독립적 기능
- 확장 가능성 높음

### 4순위: Allocation/Upgrade 도메인
- 메서드 수: 5개씩
- 상대적으로 단순한 구조 