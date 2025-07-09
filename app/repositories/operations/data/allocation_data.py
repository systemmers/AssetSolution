"""
할당 관련 Mock 데이터 관리
싱글톤 패턴을 적용하여 메모리 효율성 확보

Classes:
    - AllocationData: 할당 관련 Mock 데이터 관리 (싱글톤)
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta


class AllocationData:
    """
    할당 관련 Mock 데이터 관리 (싱글톤)
    
    애플리케이션 생명주기 동안 일관된 할당 데이터를 제공합니다.
    DB 전환 시 이 클래스는 제거 예정입니다.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not AllocationData._initialized:
            self._initialize_data()
            AllocationData._initialized = True
    
    def _initialize_data(self):
        """초기 데이터 설정"""
        self._allocations = [
            {
                "id": 1,
                "asset_id": 301,
                "asset_name": "노트북 MacBook Pro",
                "asset_number": "MB-2024-001",
                "user_id": 1,
                "user_name": "김철수",
                "user_department": "IT팀",
                "allocation_date": "2024-01-01",
                "allocation_type": "개인할당",
                "status": "할당중",
                "location": "본사 3층",
                "purpose": "개발업무",
                "notes": "개발팀 전용 장비",
                "created_at": "2024-01-01T09:00:00",
                "updated_at": "2024-01-01T09:00:00"
            },
            {
                "id": 2,
                "asset_id": 302,
                "asset_name": "회의실 프로젝터",
                "asset_number": "PJ-2024-002",
                "user_id": None,
                "user_name": None,
                "user_department": None,
                "allocation_date": "2024-01-15",
                "allocation_type": "공간할당",
                "status": "할당중",
                "location": "회의실 A",
                "purpose": "회의용",
                "notes": "회의실 전용 프로젝터",
                "created_at": "2024-01-15T10:00:00",
                "updated_at": "2024-01-15T10:00:00"
            },
            {
                "id": 3,
                "asset_id": 303,
                "asset_name": "데스크톱 iMac",
                "asset_number": "IM-2024-003",
                "user_id": 2,
                "user_name": "이영희",
                "user_department": "디자인팀",
                "allocation_date": "2024-02-01",
                "allocation_type": "개인할당",
                "status": "반납완료",
                "location": "본사 2층",
                "purpose": "디자인업무",
                "notes": "디자인팀 전용 장비, 부서 이동으로 반납",
                "created_at": "2024-02-01T11:00:00",
                "updated_at": "2024-02-15T16:30:00"
            }
        ]
        
        self._allocation_statistics = {
            "total_allocations": 89,
            "active_allocations": 67,
            "returned_allocations": 22,
            "personal_allocations": 56,
            "space_allocations": 33,
            "by_department": {
                "IT팀": 25,
                "디자인팀": 18,
                "영업팀": 15,
                "마케팅팀": 12,
                "기타": 19
            }
        }
    
    def reset_for_testing(self):
        """테스트용 데이터 리셋"""
        self._allocations = []
        self._allocation_statistics = {}
        AllocationData._initialized = False
        self._initialize_data()
    
    # ==================== 기본 CRUD 메서드 ====================
    
    def get_all_allocations(self) -> List[Dict[str, Any]]:
        """모든 할당 목록 조회"""
        return self._allocations.copy()
    
    def get_allocation_by_id(self, allocation_id: int) -> Optional[Dict[str, Any]]:
        """ID로 할당 조회"""
        return next((allocation for allocation in self._allocations if allocation["id"] == allocation_id), None)
    
    def add_allocation(self, allocation_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 할당 추가"""
        new_id = max(allocation["id"] for allocation in self._allocations) + 1 if self._allocations else 1
        allocation_data["id"] = new_id
        allocation_data["created_at"] = datetime.now().isoformat()
        allocation_data["updated_at"] = datetime.now().isoformat()
        self._allocations.append(allocation_data)
        return allocation_data
    
    def update_allocation(self, allocation_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """할당 정보 업데이트"""
        for i, allocation in enumerate(self._allocations):
            if allocation["id"] == allocation_id:
                updated_allocation = allocation.copy()
                updated_allocation.update(update_data)
                updated_allocation["updated_at"] = datetime.now().isoformat()
                self._allocations[i] = updated_allocation
                return updated_allocation
        return None
    
    def delete_allocation(self, allocation_id: int) -> bool:
        """할당 삭제"""
        for i, allocation in enumerate(self._allocations):
            if allocation["id"] == allocation_id:
                del self._allocations[i]
                return True
        return False
    
    def get_allocation_statistics(self) -> Dict[str, Any]:
        """할당 통계 조회"""
        return self._allocation_statistics.copy()
    
    # ==================== 필터링 및 검색 메서드 ====================
    
    def get_allocations_by_status(self, status: str) -> List[Dict[str, Any]]:
        """상태별 할당 목록 조회"""
        return [allocation for allocation in self._allocations if allocation.get("status") == status]
    
    def get_allocations_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        """사용자별 할당 목록 조회"""
        return [allocation for allocation in self._allocations if allocation.get("user_id") == user_id]
    
    def get_allocations_by_department(self, department: str) -> List[Dict[str, Any]]:
        """부서별 할당 목록 조회"""
        return [allocation for allocation in self._allocations if allocation.get("user_department") == department]
    
    def get_allocations_by_type(self, allocation_type: str) -> List[Dict[str, Any]]:
        """유형별 할당 목록 조회"""
        return [allocation for allocation in self._allocations if allocation.get("allocation_type") == allocation_type] 