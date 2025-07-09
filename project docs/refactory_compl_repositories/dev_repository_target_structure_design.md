# Repository 목표 구조 상세 설계 (단순화 버전)

## 1. 단순화된 디렉토리 구조

```
repositories/
├── base_repository.py              # BaseRepository 클래스
├── domain/
│   ├── __init__.py
│   ├── loan_repository.py
│   ├── disposal_repository.py
│   ├── allocation_repository.py
│   ├── lifecycle_repository.py
│   └── upgrade_repository.py
└── data/
    ├── __init__.py
    ├── loan_data.py
    ├── disposal_data.py
    ├── disposal_data_plans.py      # 큰 도메인만 기능별 분할
    ├── allocation_data.py
    ├── lifecycle_data.py
    └── upgrade_data.py
```

**개선 효과:**
- 파일 수: 25개 → 12개 (52% 감소)
- 디렉토리 수: 12개 → 3개 (75% 감소)
- Import 경로: `from repositories.domain.loan_repository import LoanRepository`

## 2. BaseRepository 인터페이스 설계

```python
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseRepository(ABC):
    """모든 Repository의 기본 인터페이스"""
    
    @abstractmethod
    def get_all(self) -> List[Dict[str, Any]]:
        """모든 항목 조회"""
        pass
    
    @abstractmethod
    def get_by_id(self, item_id: int) -> Optional[Dict[str, Any]]:
        """ID로 항목 조회"""
        pass
    
    @abstractmethod
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """새 항목 생성"""
        pass
    
    @abstractmethod
    def update(self, item_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """항목 업데이트"""
        pass
    
    @abstractmethod
    def delete(self, item_id: int) -> bool:
        """항목 삭제"""
        pass
    
    @abstractmethod
    def get_statistics(self) -> Dict[str, Any]:
        """통계 정보 조회"""
        pass
    
    # 공통 유틸리티 메서드
    def _validate_data(self, data: Dict[str, Any], required_fields: List[str]) -> bool:
        """데이터 유효성 검사"""
        return all(field in data for field in required_fields)
    
    def _generate_id(self, items: List[Dict[str, Any]]) -> int:
        """새 ID 생성"""
        if not items:
            return 1
        return max(item.get('id', 0) for item in items) + 1
```

## 3. 싱글톤 패턴 적용

### 3.1 Mock 데이터 클래스 (싱글톤)

```python
# data/loan_data.py
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

class LoanData:
    """대여 관련 Mock 데이터 관리 (싱글톤)"""
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not LoanData._initialized:
            self._loans = [
                {
                    "id": 1,
                    "asset_id": 101,
                    "asset_name": "노트북 Dell XPS 13",
                    "asset_number": "NB-2024-001",
                    "user_id": 1,
                    "user_name": "김철수",
                    "user_department": "IT팀",
                    "loan_date": "2024-01-15",
                    "due_date": "2024-02-15",
                    "return_date": None,
                    "status": "대여중",
                    "purpose": "업무용 개발",
                    "notes": "프로젝트 완료 후 반납 예정",
                    "created_at": "2024-01-15T09:00:00",
                    "updated_at": "2024-01-15T09:00:00"
                },
                # ... 더 많은 Mock 데이터
            ]
            
            self._loan_statistics = {
                "total_loans": 156,
                "active_loans": 89,
                "overdue_loans": 12,
                "returned_loans": 67,
                "monthly_loan_count": 23,
                "most_loaned_category": "노트북",
                "average_loan_duration": 18.5
            }
            LoanData._initialized = True
    
    def reset_for_testing(self):
        """테스트용 데이터 리셋"""
        self._loans = []
        self._loan_statistics = {}
        LoanData._initialized = False
    
    def get_all_loans(self) -> List[Dict[str, Any]]:
        """모든 대여 목록 조회"""
        return self._loans.copy()
    
    def get_loan_by_id(self, loan_id: int) -> Optional[Dict[str, Any]]:
        """ID로 대여 조회"""
        return next((loan for loan in self._loans if loan["id"] == loan_id), None)
    
    def add_loan(self, loan_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 대여 추가"""
        new_id = max(loan["id"] for loan in self._loans) + 1 if self._loans else 1
        loan_data["id"] = new_id
        loan_data["created_at"] = datetime.now().isoformat()
        loan_data["updated_at"] = datetime.now().isoformat()
        self._loans.append(loan_data)
        return loan_data
    
    def update_loan(self, loan_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """대여 정보 업데이트"""
        loan = self.get_loan_by_id(loan_id)
        if loan:
            loan.update(update_data)
            loan["updated_at"] = datetime.now().isoformat()
            return loan
        return None
    
    def delete_loan(self, loan_id: int) -> bool:
        """대여 삭제"""
        loan = self.get_loan_by_id(loan_id)
        if loan:
            self._loans.remove(loan)
            return True
        return False
    
    def get_loan_statistics(self) -> Dict[str, Any]:
        """대여 통계 조회"""
        return self._loan_statistics.copy()
    
    def get_loans_with_pagination(self, page: int, per_page: int, **filters) -> Dict[str, Any]:
        """페이지네이션이 적용된 대여 목록 조회"""
        filtered_loans = self._apply_filters(self._loans, filters)
        
        total_items = len(filtered_loans)
        total_pages = (total_items + per_page - 1) // per_page
        start_index = (page - 1) * per_page
        end_index = start_index + per_page
        
        return {
            "loans": filtered_loans[start_index:end_index],
            "pagination": {
                "current_page": page,
                "per_page": per_page,
                "total_items": total_items,
                "total_pages": total_pages
            },
            "current_date": datetime.now().isoformat()
        }
    
    def _apply_filters(self, loans: List[Dict[str, Any]], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """필터 적용"""
        filtered = loans.copy()
        
        if filters.get("status"):
            filtered = [loan for loan in filtered if loan["status"] == filters["status"]]
        
        if filters.get("user_id"):
            filtered = [loan for loan in filtered if loan["user_id"] == filters["user_id"]]
        
        if filters.get("department"):
            filtered = [loan for loan in filtered if loan["user_department"] == filters["department"]]
        
        return filtered
```

### 3.2 Repository 클래스 (의존성 주입)

```python
# domain/loan_repository.py
from repositories.base_repository import BaseRepository
from repositories.data.loan_data import LoanData
from typing import List, Dict, Any, Optional

class LoanRepository(BaseRepository):
    """대여 도메인 Repository"""
    
    def __init__(self):
        self.data_source = LoanData()  # 싱글톤 인스턴스
    
    # BaseRepository 구현
    def get_all(self) -> List[Dict[str, Any]]:
        return self.data_source.get_all_loans()
    
    def get_by_id(self, loan_id: int) -> Optional[Dict[str, Any]]:
        return self.data_source.get_loan_by_id(loan_id)
    
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return self.data_source.add_loan(data)
    
    def update(self, loan_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        return self.data_source.update_loan(loan_id, data)
    
    def delete(self, loan_id: int) -> bool:
        return self.data_source.delete_loan(loan_id)
    
    def get_statistics(self) -> Dict[str, Any]:
        return self.data_source.get_loan_statistics()
    
    # 도메인 특화 메서드
    def get_loans_with_pagination(self, page: int, per_page: int, **filters) -> Dict[str, Any]:
        """페이지네이션이 적용된 대여 목록 조회"""
        return self.data_source.get_loans_with_pagination(page, per_page, **filters)
    
    def get_overdue_loans(self) -> List[Dict[str, Any]]:
        """연체된 대여 목록 조회"""
        all_loans = self.get_all()
        return [loan for loan in all_loans if loan.get("status") == "연체"]
    
    def get_loans_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        """사용자별 대여 목록 조회"""
        all_loans = self.get_all()
        return [loan for loan in all_loans if loan.get("user_id") == user_id]
    
    def get_loans_by_asset(self, asset_id: int) -> List[Dict[str, Any]]:
        """자산별 대여 이력 조회"""
        all_loans = self.get_all()
        return [loan for loan in all_loans if loan.get("asset_id") == asset_id]
    
    def get_loans_by_status(self, status: str) -> List[Dict[str, Any]]:
        """상태별 대여 목록 조회"""
        all_loans = self.get_all()
        return [loan for loan in all_loans if loan.get("status") == status]
    
    def get_loans_by_date_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """날짜 범위별 대여 목록 조회"""
        all_loans = self.get_all()
        return [loan for loan in all_loans 
                if start_date <= loan.get("loan_date", "") <= end_date]
    
    def get_loans_by_department(self, department: str) -> List[Dict[str, Any]]:
        """부서별 대여 목록 조회"""
        all_loans = self.get_all()
        return [loan for loan in all_loans if loan.get("user_department") == department]
```

## 4. 기존 시스템 호환성 유지 (Facade 패턴)

```python
# repositories/operations_repository.py (기존 파일을 Facade로 변경)
from repositories.domain.loan_repository import LoanRepository
from repositories.domain.disposal_repository import DisposalRepository
from repositories.domain.allocation_repository import AllocationRepository
from repositories.domain.lifecycle_repository import LifecycleRepository
from repositories.domain.upgrade_repository import UpgradeRepository

class OperationsRepository:
    """기존 API 호환성을 위한 Facade 클래스"""
    
    def __init__(self):
        self.loan_repo = LoanRepository()
        self.disposal_repo = DisposalRepository()
        self.allocation_repo = AllocationRepository()
        self.lifecycle_repo = LifecycleRepository()
        self.upgrade_repo = UpgradeRepository()
    
    # === Loan 도메인 메서드 위임 ===
    def get_loans_with_pagination(self, page, per_page, **filters):
        return self.loan_repo.get_loans_with_pagination(page, per_page, **filters)
    
    def get_loan_by_id(self, loan_id):
        return self.loan_repo.get_by_id(loan_id)
    
    def get_overdue_loans(self):
        return self.loan_repo.get_overdue_loans()
    
    def get_loans_by_user(self, user_id):
        return self.loan_repo.get_loans_by_user(user_id)
    
    def get_loans_by_asset(self, asset_id):
        return self.loan_repo.get_loans_by_asset(asset_id)
    
    def get_loans_by_status(self, status):
        return self.loan_repo.get_loans_by_status(status)
    
    def get_loans_by_date_range(self, start_date, end_date):
        return self.loan_repo.get_loans_by_date_range(start_date, end_date)
    
    def get_loans_by_department(self, department):
        return self.loan_repo.get_loans_by_department(department)
    
    # === Disposal 도메인 메서드 위임 ===
    def get_all_disposals(self):
        return self.disposal_repo.get_all()
    
    def get_disposal_by_id(self, disposal_id):
        return self.disposal_repo.get_by_id(disposal_id)
    
    # ... 다른 도메인 메서드들도 동일한 방식으로 위임
```

## 5. 테스트 지원

```python
# 테스트에서 사용
def setUp(self):
    """테스트 전 데이터 초기화"""
    LoanData().reset_for_testing()
    DisposalData().reset_for_testing()
    AllocationData().reset_for_testing()
    LifecycleData().reset_for_testing()
    UpgradeData().reset_for_testing()

def tearDown(self):
    """테스트 후 정리"""
    # 필요시 추가 정리 작업
    pass
```

## 6. 싱글톤 패턴 적용 이유

### 권장 이유:
1. **Mock 데이터 특성**: 애플리케이션 생명주기 동안 일관성 유지 필요
2. **메모리 효율성**: Mock 데이터 크기가 크므로 인스턴스 하나로 관리
3. **임시 구조**: DB 전환 시 제거 예정이므로 단순한 구조 적합
4. **단일 프로세스**: Flask 개발 환경에서 동시성 이슈 최소

### 주의사항:
- 테스트 격리를 위한 `reset_for_testing()` 메서드 제공
- DB 전환 시 싱글톤 패턴 제거 예정

## 7. 최종 구조 장점

1. **극단적 단순화**: 12개 파일, 3개 디렉토리
2. **메모리 효율성**: 싱글톤으로 Mock 데이터 관리
3. **테스트 지원**: reset 메서드로 테스트 격리
4. **호환성 보장**: 기존 API 변경 없음
5. **DB 전환 용이**: data/ 폴더 삭제만으로 완료 