# Repository 도메인별 구조 재편성 개발 계획

## 1. 개발 개요

### 1.1 프로젝트 목적
- 현재 repositories 구조를 도메인별 폴더 구조로 재편성
- 6개 독립 도메인의 Repository와 Mock 데이터 분리
- 확장성과 유지보수성 극대화

### 1.2 개발 목표
- **도메인 독립성**: 각 도메인별 독립적 폴더 구조 구축
- **Mock 데이터 분리**: Repository 클래스와 Mock 데이터 완전 분리
- **구조 일관성**: 모든 도메인에 동일한 구조 적용
- **호환성 보장**: 기존 시스템과 100% 호환성 유지

## 2. 개발 범위

### 2.1 분리 대상 도메인
| 도메인 | 현재 파일 | 라인 수 | 복잡도 | 우선순위 |
|---------|-----------|---------|---------|----------|
| operations | 구조 재편성 | 967 lines | 낮음 | 1 |
| contract | contract_repository.py | 257 lines | 낮음 | 1 |
| inventory | inventory_repository.py | 377 lines | 중간 | 2 |
| category | category_repository.py | 482 lines | 중간 | 2 |
| preset | preset_repository.py | 566 lines | 중간 | 2 |
| notification | notification_repository.py | 494 lines | 중간 | 2 |
| asset | asset_repository.py | 1,122 lines | 높음 | 3 |

### 2.2 작업 산출물
- 7개 도메인 폴더 구조 생성
- 7개 Repository 클래스 (기존 유지/수정)
- 7개 Data 클래스 (신규 생성)
- Import 경로 업데이트 (약 30개 파일)
- 호환성 테스트 및 검증

## 3. 단계별 개발 계획

### Phase 1: Operations 구조 재편성
**소요 시간**: 30분  
**리스크 수준**: 낮음

#### Task 1.1: Operations 도메인 폴더 구조 생성
- **작업 내용**: operations/ 폴더 생성 및 기존 파일 이동
- **소요 시간**: 15분
- **산출물**:
  ```
  operations/
  ├── loan_repository.py          # domain/에서 이동
  ├── disposal_repository.py      # domain/에서 이동
  ├── allocation_repository.py    # domain/에서 이동
  ├── lifecycle_repository.py     # domain/에서 이동
  ├── upgrade_repository.py       # domain/에서 이동
  ├── operations_repository.py    # 루트에서 이동
  └── data/                       # data/ 폴더 이동
      ├── loan_data.py
      ├── disposal_data.py
      ├── allocation_data.py
      ├── lifecycle_data.py
      └── upgrade_data.py
  ```

#### Task 1.2: Operations Import 경로 수정
- **작업 내용**: operations 도메인 관련 import 경로 업데이트
- **소요 시간**: 15분
- **대상 파일**: services/operations_service.py, routes/operations_routes.py 등

### Phase 2: 단순 도메인 분리
**소요 시간**: 120분  
**리스크 수준**: 중간

#### Task 2.1: Contract 도메인 분리
- **작업 내용**: contract/ 폴더 생성 및 Mock 데이터 분리
- **소요 시간**: 20분
- **산출물**:
  ```
  contract/
  ├── contract_repository.py      # Mock 데이터 제거
  └── data/
      └── contract_data.py        # 싱글톤 패턴 적용
  ```

#### Task 2.2: Inventory 도메인 분리
- **작업 내용**: inventory/ 폴더 생성 및 Mock 데이터 분리
- **소요 시간**: 25분
- **산출물**:
  ```
  inventory/
  ├── inventory_repository.py     # Mock 데이터 제거
  └── data/
      └── inventory_data.py       # 싱글톤 패턴 적용
  ```

#### Task 2.3: Category 도메인 분리
- **작업 내용**: category/ 폴더 생성 및 Mock 데이터 분리
- **소요 시간**: 30분
- **산출물**:
  ```
  category/
  ├── category_repository.py      # Mock 데이터 제거
  └── data/
      └── category_data.py        # 싱글톤 패턴 적용
  ```

#### Task 2.4: Preset 도메인 분리
- **작업 내용**: preset/ 폴더 생성 및 Mock 데이터 분리
- **소요 시간**: 35분
- **산출물**:
  ```
  preset/
  ├── preset_repository.py        # Mock 데이터 제거
  └── data/
      └── preset_data.py          # 싱글톤 패턴 적용
  ```

#### Task 2.5: 단순 도메인 Import 경로 수정
- **작업 내용**: 4개 도메인 관련 import 경로 업데이트
- **소요 시간**: 10분
- **대상 파일**: services/, routes/ 폴더 내 관련 파일

### Phase 3: 복잡 도메인 분리
**소요 시간**: 180분  
**리스크 수준**: 높음

#### Task 3.1: Notification 도메인 분리
- **작업 내용**: notification/ 폴더 생성 및 Mock 데이터 분리
- **소요 시간**: 60분
- **특이사항**: 3개 데이터셋 (_notifications, _notification_rules, _notification_templates)
- **산출물**:
  ```
  notification/
  ├── notification_repository.py  # Mock 데이터 제거
  └── data/
      └── notification_data.py    # 3개 데이터셋 통합 관리
  ```

#### Task 3.2: Asset 도메인 분리
- **작업 내용**: asset/ 폴더 생성 및 대용량 Mock 데이터 분리
- **소요 시간**: 120분
- **특이사항**: 15개+ 데이터셋, 1,122 lines 분리 작업
- **산출물**:
  ```
  asset/
  ├── asset_repository.py         # Mock 데이터 제거
  └── data/
      └── asset_data.py           # 대용량 데이터셋 통합 관리
  ```

### Phase 4: 통합 및 검증
**소요 시간**: 90분  
**리스크 수준**: 높음

#### Task 4.1: 전체 Import 경로 업데이트
- **작업 내용**: 모든 도메인 import 경로 일괄 업데이트
- **소요 시간**: 60분
- **대상 파일**: services/, routes/, templates/ 폴더 내 약 25개 파일

#### Task 4.2: 호환성 테스트 및 검증
- **작업 내용**: 전체 시스템 기능 검증
- **소요 시간**: 30분
- **검증 항목**:
  - 각 도메인별 API 엔드포인트 동작 확인
  - Mock 데이터 일관성 검증
  - 페이지 렌더링 및 데이터 표시 확인

## 4. 기술적 구현 방안

### 4.1 싱글톤 패턴 적용
```python
# data/contract_data.py 예시
class ContractData:
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not ContractData._initialized:
            self._contracts = [
                # Mock 데이터
            ]
            ContractData._initialized = True
    
    def get_all_contracts(self):
        return self._contracts.copy()
```

### 4.2 Repository 클래스 수정
```python
# contract/contract_repository.py 예시
from repositories.contract.data.contract_data import ContractData

class ContractRepository:
    def __init__(self):
        self.data_source = ContractData()
    
    def get_all(self):
        return self.data_source.get_all_contracts()
```

### 4.3 Import 경로 패턴
```python
# 기존
from repositories.contract_repository import ContractRepository

# 변경 후
from repositories.contract.contract_repository import ContractRepository
```

## 5. 품질 관리

### 5.1 테스트 전략
- **단위 테스트**: 각 도메인별 Repository 클래스 테스트
- **통합 테스트**: 도메인 간 연동 테스트
- **회귀 테스트**: 기존 기능 영향도 확인

### 5.2 품질 기준
- **기능 호환성**: 100% 기존 기능 유지
- **성능**: 기존 대비 성능 저하 없음
- **코드 품질**: 중복 코드 0%, 일관된 구조

## 6. 리스크 관리

### 6.1 주요 리스크
| 리스크 | 발생 확률 | 영향도 | 완화 방안 |
|--------|-----------|---------|-----------|
| Import 경로 오류 | 중간 | 높음 | 단계별 테스트, IDE 자동 완성 활용 |
| Mock 데이터 불일치 | 낮음 | 높음 | 싱글톤 패턴, 데이터 검증 |
| 성능 저하 | 낮음 | 중간 | 메모리 사용량 모니터링 |
| 호환성 문제 | 중간 | 높음 | 각 단계별 기능 검증 |

### 6.2 롤백 계획
- **Phase 1**: 파일 이동 취소
- **Phase 2**: 도메인 폴더 삭제 후 원복
- **Phase 3**: 백업 파일로 복원
- **Phase 4**: Import 경로 일괄 복원

## 7. 일정 계획

### 7.1 전체 일정
- **총 소요 시간**: 7시간 (420분)
- **개발 기간**: 1일 (집중 작업)
- **버퍼 시간**: 2시간 (예상 이슈 대응)

### 7.2 마일스톤
| 마일스톤 | 완료 기준 | 목표 시간 |
|----------|-----------|-----------|
| MS1 | Operations 구조 재편성 완료 | 30분 |
| MS2 | 단순 도메인 4개 분리 완료 | 150분 |
| MS3 | 복잡 도메인 2개 분리 완료 | 330분 |
| MS4 | 전체 통합 및 검증 완료 | 420분 |

## 8. 성공 기준

### 8.1 기술적 성공 기준
- 모든 도메인 독립적 폴더 구조 구축
- Repository와 Mock 데이터 100% 분리
- 기존 API 호환성 100% 유지
- 전체 시스템 정상 동작 확인

### 8.2 품질 성공 기준
- 코드 중복 0% (Mock 데이터 분리)
- 구조 일관성 100% (모든 도메인 동일 구조)
- 성능 저하 0% (기존 대비)
- 버그 발생 0% (기존 기능 영향 없음)

---

**작성일**: 2024-12-30  
**총 예상 소요 시간**: 7시간  
**다음 단계**: 개발 로그 문서 작성 및 실행 준비 