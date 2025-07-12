# Part 1: 다중책임 및 비대한 파일 리팩토링 상세 계획

## 📋 프로젝트 개요

### 🎯 목표
- operations_core_service.py (2507라인) → 400라인 이하로 분할
- asset_core_service.py (952라인) → 300라인 이하로 분할  
- 기존 로직 100% 유지하면서 단일 책임 원칙 적용
- 리스크 최소화를 위한 단계적 점진적 접근

### 📊 현재 상황
| 파일명 | 현재 라인 수 | 목표 라인 수 | 심각도 | 우선순위 |
|--------|-------------|-------------|---------|----------|
| operations_core_service.py | 2507 lines | ≤400 lines | 🔴 긴급 | 1 |
| asset_core_service.py | 952 lines | ≤300 lines | 🟠 높음 | 2 |

---

## 🏗️ 분할 전략

### Operations Core Service 분할 계획
```
operations_core_service.py (2507라인)
├── statistics_service.py (통계 관리 - 150라인)
├── allocation_service.py (지급 관리 - 200라인)  
├── loan_service.py (대여 관리 - 400라인)
├── return_service.py (반납 관리 - 500라인)
├── disposal_service.py (폐기 관리 - 600라인)
├── lifecycle_service.py (생명주기 관리 - 400라인)
├── upgrade_service.py (업그레이드 관리 - 300라인)
└── operations_core_service.py (Facade + 잔여 - ≤400라인)
```

### Asset Core Service 분할 계획  
```
asset_core_service.py (952라인)
├── asset_crud_service.py (자산 CRUD - 300라인)
├── asset_search_service.py (검색/필터링 - 200라인)
├── partner_management_service.py (협력사 관리 - 250라인)
├── purchase_service.py (구매/견적 관리 - 200라인)
└── asset_core_service.py (Facade + 잔여 - ≤300라인)
```

---

## 📅 단계별 실행 계획

### Phase 1: 준비 및 분석 (30분) 🟢 위험도: 낮음
**승인 포인트 AP-1**: 분석 완료 후 진행 승인

### Phase 2: 독립성 높은 서비스 분리 (90분) 🟡 위험도: 중간  
**승인 포인트 AP-2**: Statistics & Allocation 분리 완료 후 승인

### Phase 3: 핵심 서비스 분리 (120분) 🔴 위험도: 높음
**승인 포인트 AP-3**: Loan & Return 분리 완료 후 승인

### Phase 4: 나머지 Operations 서비스 분리 (90분) 🟡 위험도: 중간
**승인 포인트 AP-4**: Operations 전체 분할 완료 후 승인

### Phase 5: Asset 서비스 분리 (210분) 🟠 위험도: 높음
**승인 포인트 AP-5**: Asset 분할 완료 후 승인

### Phase 6: 통합 검증 (30분) 🟢 위험도: 낮음
**승인 포인트 AP-6**: Part 1 전체 완료 승인

**총 예상 소요 시간**: 8.5시간

---

## 🛡️ 리스크 완화 방안

### 핵심 원칙
1. **기존 로직 100% 유지**: 함수 내부 로직은 절대 변경하지 않음
2. **단계별 승인**: 각 Phase 완료 후 반드시 사용자 승인 받고 진행
3. **즉시 테스트**: 각 분리 작업 후 해당 기능 즉시 테스트
4. **백업 및 롤백**: 원본 파일 백업 유지, 롤백 계획 수립

### 기술적 접근법
- **Facade 패턴**: 기존 호출 경로 유지하면서 내부적으로만 분리
- **점진적 분할**: 독립성 높은 기능부터 단계적 분리
- **Import 경로 최소화**: 기존 코드의 import 변경 최소화

---

## ✅ 상세 Task 목록

### Task 1.1: 코드 분석 및 준비 (30분)
**체크리스트**:
- [ ] operations_core_service.py 함수 목록 추출
- [ ] 함수별 호출 관계 및 의존성 매핑
- [ ] 도메인별 함수 그룹 분류
- [ ] 백업 파일 생성 (`operations_core_service_backup.py`)
- [ ] 롤백 계획 수립 및 문서화

### Task 1.2: Statistics 서비스 분리 (45분)
**체크리스트**:
- [ ] statistics 관련 함수 식별 (get_statistics, get_detailed_statistics 등)
- [ ] `services/operations/statistics_service.py` 생성
- [ ] 함수 이동 및 import 정리
- [ ] operations_core_service에서 위임 구조 구현
- [ ] 통계 기능 테스트 (대시보드 통계 확인)

### Task 1.3: Allocation 서비스 분리 (45분)  
**체크리스트**:
- [ ] allocation 관련 함수 식별
- [ ] `services/operations/allocation_service.py` 생성
- [ ] 함수 이동 및 의존성 해결
- [ ] 지급 관리 기능 테스트

### Task 1.4: Loan 서비스 분리 (60분)
**체크리스트**:
- [ ] loan 관련 핵심 함수 식별 (대여 신청, 승인, 연장 등)
- [ ] `services/operations/loan_service.py` 생성  
- [ ] 복잡한 비즈니스 로직 이동 (세심한 주의)
- [ ] 대여 프로세스 전체 기능 테스트
- [ ] 대여 목록, 상세 조회 기능 테스트

### Task 1.5: Return 서비스 분리 (60분)
**체크리스트**:
- [ ] return 관련 함수 식별
- [ ] `services/operations/return_service.py` 생성
- [ ] loan 서비스와의 연동 확인
- [ ] 반납 프로세스 전체 기능 테스트

### Task 1.6: 나머지 Operations 서비스 분리 (90분)
**체크리스트**:
- [ ] `services/operations/disposal_service.py` 생성 및 테스트
- [ ] `services/operations/lifecycle_service.py` 생성 및 테스트  
- [ ] `services/operations/upgrade_service.py` 생성 및 테스트
- [ ] operations 전체 통합 테스트

### Task 1.7: Asset CRUD & Search 서비스 분리 (120분)
**체크리스트**:
- [ ] asset_core_service.py 함수 분석 및 분류
- [ ] `services/asset/asset_crud_service.py` 생성
- [ ] `services/asset/asset_search_service.py` 생성
- [ ] 자산 등록, 수정, 삭제, 조회 기능 테스트
- [ ] 자산 검색 및 필터링 기능 테스트

### Task 1.8: Asset Partner & Purchase 서비스 분리 (90분)
**체크리스트**:
- [ ] `services/asset/partner_management_service.py` 생성
- [ ] `services/asset/purchase_service.py` 생성  
- [ ] 협력사 관리 기능 테스트
- [ ] 구매 관리 및 견적 요청 기능 테스트
- [ ] asset 전체 통합 테스트

---

## 📊 성공 기준

### 정량적 기준
- [ ] operations_core_service.py ≤ 400 lines
- [ ] asset_core_service.py ≤ 300 lines  
- [ ] 새로 생성된 각 서비스 파일 ≤ 600 lines
- [ ] 기존 기능 100% 정상 작동

### 정성적 기준
- [ ] 각 서비스가 단일 책임 원칙 준수
- [ ] 서비스 간 의존성 최소화
- [ ] 코드 가독성 및 유지보수성 향상
- [ ] 테스트 용이성 확보

---

## 🚨 비상 계획

### 롤백 시나리오
1. **즉시 롤백**: 백업 파일로 즉시 복원 (5분 이내)
2. **부분 롤백**: 문제가 된 분리 작업만 되돌리기
3. **단계별 롤백**: 이전 승인 포인트로 되돌리기

### 문제 발생 시 대응
- 기능 오류 발견 시 즉시 작업 중단
- 원인 분석 후 수정 방안 결정
- 필요 시 롤백 후 재계획

---

**작성일**: 2024-12-30  
**예상 완료**: 8.5시간 후  
**다음 단계**: Task Manager 등록 및 Task 1.1 시작 