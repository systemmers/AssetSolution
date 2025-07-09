# 도메인별 함수 상세 분류

## 1. Loan (대여) 도메인

### 데이터 구조
```python
# Mock 데이터: 168줄 (라인 25-192)
self.loan_status = [...]  # 대여 상태 마스터 (6개 항목)
self.loans = [...]        # 대여 데이터 (15개 항목)
```

### 비즈니스 로직 메서드 (8개)
1. **`get_all_loans()`** (라인 1092-1122)
   - 기능: 필터링 포함 대여 목록 조회
   - 파라미터: status, user_id, department
   - 반환: List[Dict]

2. **`get_loan_by_id()`** (라인 1124-1135)
   - 기능: 대여 ID로 특정 대여 정보 조회
   - 파라미터: loan_id
   - 반환: Optional[Dict]

3. **`get_loans_with_pagination()`** (라인 1136-1170)
   - 기능: 페이지네이션 포함 대여 목록 조회
   - 파라미터: page, per_page, status, user_id, department
   - 반환: Tuple[List[Dict], int, int, int]

4. **`get_returned_loans()`** (라인 1171-1181)
   - 기능: 반납 완료된 대여 목록 조회
   - 반환: List[Dict]

5. **`get_loan_statuses()`** (라인 1205-1213)
   - 기능: 대여 상태 마스터 데이터 조회
   - 반환: List[Dict]

6. **`get_operations_statistics()`** (라인 1225-1255)
   - 기능: 운영 관련 통계 정보 조회
   - 반환: Dict

7. **`get_operation_history()`** (라인 1256-1377)
   - 기능: 자산 운영 이력 종합 조회
   - 파라미터: asset_id, user_name, operation_type, status, start_date, end_date
   - 반환: List[Dict]

8. **`get_detailed_statistics()`** (라인 1435-1583)
   - 기능: 상세 운영 통계 조회
   - 반환: Dict

## 2. Disposal (폐기) 도메인

### 데이터 구조
```python
# Mock 데이터: 425줄 (라인 35-460)
self.disposal_reasons = [...]     # 폐기 사유 마스터 (5개 항목)
self.disposal_plans = [...]       # 폐기 계획 데이터 (12개 항목)
self.disposals = [...]            # 폐기 데이터 (2개 항목)
self.disposal_planning_statuses = [...] # 폐기 계획 상태 마스터 (4개 항목)
```

### 비즈니스 로직 메서드 (14개)
1. **`get_all_disposals()`** (라인 1182-1190)
   - 기능: 전체 폐기 목록 조회
   - 반환: List[Dict]

2. **`get_disposal_by_id()`** (라인 1191-1204)
   - 기능: 폐기 ID로 특정 폐기 정보 조회
   - 파라미터: disposal_id
   - 반환: Optional[Dict]

3. **`get_disposal_reasons()`** (라인 1214-1224)
   - 기능: 폐기 사유 마스터 데이터 조회
   - 반환: List[Dict]

4. **`get_all_disposal_plans()`** (라인 1584-1604)
   - 기능: 폐기 계획 목록 조회 (필터링 포함)
   - 파라미터: status
   - 반환: List[Dict]

5. **`get_disposal_plan_by_id()`** (라인 1605-1617)
   - 기능: 폐기 계획 ID로 특정 계획 조회
   - 파라미터: plan_id
   - 반환: Optional[Dict]

6. **`get_disposal_plans_with_pagination()`** (라인 1617-1664)
   - 기능: 페이지네이션 포함 폐기 계획 목록 조회
   - 파라미터: page, per_page, status, disposal_type, department
   - 반환: Tuple[List[Dict], int, int, int]

7. **`create_disposal_plan()`** (라인 1664-1689)
   - 기능: 폐기 계획 생성
   - 파라미터: plan_data
   - 반환: Dict

8. **`update_disposal_plan()`** (라인 1689-1708)
   - 기능: 폐기 계획 수정
   - 파라미터: plan_id, plan_data
   - 반환: Optional[Dict]

9. **`delete_disposal_plan()`** (라인 1708-1724)
   - 기능: 폐기 계획 삭제
   - 파라미터: plan_id
   - 반환: bool

10. **`approve_disposal_plan()`** (라인 1724-1744)
    - 기능: 폐기 계획 승인
    - 파라미터: plan_id, approver
    - 반환: Optional[Dict]

11. **`schedule_disposal_plan()`** (라인 1744-1761)
    - 기능: 폐기 일정 확정
    - 파라미터: plan_id
    - 반환: Optional[Dict]

12. **`complete_disposal_plan()`** (라인 1761-1778)
    - 기능: 폐기 완료 처리
    - 파라미터: plan_id
    - 반환: Optional[Dict]

13. **`get_disposal_planning_statistics()`** (라인 1778-1813)
    - 기능: 폐기 계획 통계 조회
    - 반환: Dict

14. **`get_disposal_planning_statuses()`** (라인 1813-1824)
    - 기능: 폐기 계획 상태 마스터 데이터 조회
    - 반환: List[Dict]

## 3. Allocation (지급) 도메인

### 데이터 구조
```python
# Mock 데이터: 215줄 (라인 40-255)
self.allocation_requesters = [...]        # 지급 요청자 정보 (12개 항목)
self.allocation_assets = [...]            # 지급 자산 정보 (12개 항목)
self.allocation_types = [...]             # 지급 유형 (5개 항목)
self.allocation_statuses = [...]          # 지급 상태 (5개 항목)
self.allocation_request_titles = [...]    # 지급 요청 제목 템플릿 (12개 항목)
```

### 비즈니스 로직 메서드 (6개)
1. **`get_allocation_requests_data()`** (라인 1824-1877)
   - 기능: 지급 요청 데이터 조회
   - 반환: List[Dict]

2. **`get_allocation_requesters()`** (라인 1877-1886)
   - 기능: 지급 요청자 목록 조회
   - 반환: List[Dict]

3. **`get_allocation_assets()`** (라인 1886-1895)
   - 기능: 지급 자산 목록 조회
   - 반환: List[Dict]

4. **`get_allocation_types()`** (라인 1895-1904)
   - 기능: 지급 유형 목록 조회
   - 반환: List[Dict]

5. **`get_allocation_statuses()`** (라인 1904-1913)
   - 기능: 지급 상태 목록 조회
   - 반환: List[Dict]

6. **`get_allocation_request_titles()`** (라인 1913-1924)
   - 기능: 지급 요청 제목 템플릿 조회
   - 반환: List[str]

## 4. Upgrade (업그레이드) 도메인

### 데이터 구조
```python
# Mock 데이터: 125줄 (라인 105-230)
self.upgrade_statuses = [...]  # 업그레이드 상태 (4개 항목)
self.upgrade_plans = [...]     # 업그레이드 계획 데이터 (2개 항목)
```

### 비즈니스 로직 메서드 (5개)
1. **`get_all_upgrade_plans()`** (라인 1924-1956)
   - 기능: 업그레이드 계획 목록 조회
   - 파라미터: status, upgrade_type, department
   - 반환: List[Dict]

2. **`get_upgrade_plan_by_id()`** (라인 1956-1979)
   - 기능: 업그레이드 계획 상세 조회
   - 파라미터: plan_id
   - 반환: Optional[Dict]

3. **`get_upgrade_plans_with_pagination()`** (라인 1979-2014)
   - 기능: 페이지네이션 포함 업그레이드 계획 목록
   - 파라미터: page, per_page, status, upgrade_type, department
   - 반환: Tuple[List[Dict], int, int, int]

4. **`get_upgrade_plans_statistics()`** (라인 2014-2061)
   - 기능: 업그레이드 계획 통계 조회
   - 반환: Dict

5. **`get_upgrade_statuses()`** (라인 2061-2072)
   - 기능: 업그레이드 상태 마스터 데이터 조회
   - 반환: List[Dict]

## 5. Lifecycle (생명주기) 도메인

### 데이터 구조
```python
# Mock 데이터: 157줄 (라인 235-392)
self.lifecycle_event_types = [...]  # 생명주기 이벤트 타입 (7개 항목)
self.lifecycle_events = [...]       # 생명주기 이벤트 데이터 (3개 항목)
```

### 비즈니스 로직 메서드 (6개)
1. **`get_all_lifecycle_events()`** (라인 2072-2133)
   - 기능: 생명주기 이벤트 목록 조회
   - 파라미터: asset_id, event_type, department, start_date, end_date
   - 반환: List[Dict]

2. **`get_lifecycle_events_by_asset()`** (라인 2133-2148)
   - 기능: 자산별 생명주기 이벤트 조회
   - 파라미터: asset_id
   - 반환: List[Dict]

3. **`get_lifecycle_events_with_pagination()`** (라인 2148-2183)
   - 기능: 페이지네이션 포함 생명주기 이벤트 목록
   - 파라미터: page, per_page, asset_id, event_type, department
   - 반환: Tuple[List[Dict], int, int, int]

4. **`get_lifecycle_statistics()`** (라인 2183-2245)
   - 기능: 생명주기 통계 조회
   - 반환: Dict

5. **`get_lifecycle_event_types()`** (라인 2245-2254)
   - 기능: 생명주기 이벤트 타입 마스터 데이터 조회
   - 반환: List[Dict]

6. **`get_lifecycle_event_by_id()`** (라인 2254-2289)
   - 기능: 생명주기 이벤트 상세 조회
   - 파라미터: event_id
   - 반환: Optional[Dict]

## 6. 분리 복잡도 분석

### 우선순위별 분리 계획

#### 1순위: Disposal 도메인
- **Mock 데이터**: 425줄 (18.6%)
- **비즈니스 로직**: 14개 메서드
- **CRUD 완성도**: 높음 (Create, Read, Update, Delete 모두 포함)
- **독립성**: 높음 (다른 도메인과 의존성 낮음)

#### 2순위: Loan 도메인  
- **Mock 데이터**: 168줄 (7.3%)
- **비즈니스 로직**: 8개 메서드
- **핵심 기능**: 시스템의 주요 비즈니스 로직
- **연관성**: 높음 (통계, 이력에서 다른 도메인과 연계)

#### 3순위: Lifecycle 도메인
- **Mock 데이터**: 157줄 (6.9%)
- **비즈니스 로직**: 6개 메서드
- **독립성**: 높음
- **확장성**: 높음

#### 4순위: Allocation 도메인
- **Mock 데이터**: 215줄 (9.4%)
- **비즈니스 로직**: 6개 메서드
- **단순성**: 주로 조회 기능

#### 5순위: Upgrade 도메인
- **Mock 데이터**: 125줄 (5.5%)
- **비즈니스 로직**: 5개 메서드
- **단순성**: 상대적으로 단순한 구조 