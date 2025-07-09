"""
폐기 관련 Mock 데이터 관리
싱글톤 패턴을 적용하여 메모리 효율성 확보

Classes:
    - DisposalData: 폐기 관련 Mock 데이터 관리 (싱글톤)
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta


class DisposalData:
    """
    폐기 관련 Mock 데이터 관리 (싱글톤)
    
    애플리케이션 생명주기 동안 일관된 폐기 데이터를 제공합니다.
    DB 전환 시 이 클래스는 제거 예정입니다.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not DisposalData._initialized:
            self._initialize_data()
            DisposalData._initialized = True
    
    def _initialize_data(self):
        """초기 데이터 설정"""
        self._disposals = [
            {
                "id": 1,
                "asset_id": 201,
                "asset_name": "노트북 Dell Latitude",
                "asset_number": "NB-2019-001",
                "disposal_type": "폐기",
                "reason": "수명 만료",
                "disposal_date": "2024-01-15",
                "disposal_method": "전문업체 위탁",
                "disposal_cost": 50000,
                "approval_status": "승인완료",
                "approver": "김부장",
                "approval_date": "2024-01-10",
                "notes": "정상적인 수명 만료로 인한 폐기",
                "created_at": "2024-01-05T09:00:00",
                "updated_at": "2024-01-15T14:30:00"
            },
            {
                "id": 2,
                "asset_id": 202,
                "asset_name": "모니터 LG 24인치",
                "asset_number": "MN-2020-002",
                "disposal_type": "매각",
                "reason": "업그레이드",
                "disposal_date": "2024-02-01",
                "disposal_method": "중고업체 매각",
                "disposal_cost": -30000,
                "approval_status": "승인대기",
                "approver": None,
                "approval_date": None,
                "notes": "신형 모니터 도입으로 인한 매각",
                "created_at": "2024-01-25T10:15:00",
                "updated_at": "2024-01-25T10:15:00"
            },
            {
                "id": 3,
                "asset_id": 203,
                "asset_name": "프린터 HP LaserJet",
                "asset_number": "PR-2018-003",
                "disposal_type": "기증",
                "reason": "기능 정상, 불필요",
                "disposal_date": "2024-02-10",
                "disposal_method": "지역 학교 기증",
                "disposal_cost": 0,
                "approval_status": "승인완료",
                "approver": "이과장",
                "approval_date": "2024-02-05",
                "notes": "지역사회 기여 목적 기증",
                "created_at": "2024-01-30T11:20:00",
                "updated_at": "2024-02-10T16:45:00"
            },
            {
                "id": 4,
                "asset_id": 204,
                "asset_name": "서버 Dell PowerEdge",
                "asset_number": "SV-2017-004",
                "disposal_type": "폐기",
                "reason": "고장",
                "disposal_date": None,
                "disposal_method": "전문업체 위탁",
                "disposal_cost": 100000,
                "approval_status": "검토중",
                "approver": None,
                "approval_date": None,
                "notes": "메인보드 고장으로 수리 불가",
                "created_at": "2024-02-15T13:30:00",
                "updated_at": "2024-02-15T13:30:00"
            }
        ]
        
        self._disposal_statistics = {
            "total_disposals": 45,
            "pending_approvals": 8,
            "completed_disposals": 37,
            "total_cost_saved": 450000,
            "disposal_by_type": {
                "폐기": 25,
                "매각": 12,
                "기증": 8
            },
            "monthly_disposal_count": 12,
            "avg_disposal_cost": 75000
        }
    
    def reset_for_testing(self):
        """테스트용 데이터 리셋"""
        self._disposals = []
        self._disposal_statistics = {}
        DisposalData._initialized = False
        self._initialize_data()
    
    # ==================== 기본 CRUD 메서드 ====================
    
    def get_all_disposals(self) -> List[Dict[str, Any]]:
        """모든 폐기 목록 조회"""
        return self._disposals.copy()
    
    def get_disposal_by_id(self, disposal_id: int) -> Optional[Dict[str, Any]]:
        """ID로 폐기 조회"""
        return next((disposal for disposal in self._disposals if disposal["id"] == disposal_id), None)
    
    def add_disposal(self, disposal_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 폐기 추가"""
        new_id = max(disposal["id"] for disposal in self._disposals) + 1 if self._disposals else 1
        disposal_data["id"] = new_id
        disposal_data["created_at"] = datetime.now().isoformat()
        disposal_data["updated_at"] = datetime.now().isoformat()
        self._disposals.append(disposal_data)
        return disposal_data
    
    def update_disposal(self, disposal_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """폐기 정보 업데이트"""
        for i, disposal in enumerate(self._disposals):
            if disposal["id"] == disposal_id:
                updated_disposal = disposal.copy()
                updated_disposal.update(update_data)
                updated_disposal["updated_at"] = datetime.now().isoformat()
                self._disposals[i] = updated_disposal
                return updated_disposal
        return None
    
    def delete_disposal(self, disposal_id: int) -> bool:
        """폐기 삭제"""
        for i, disposal in enumerate(self._disposals):
            if disposal["id"] == disposal_id:
                del self._disposals[i]
                return True
        return False
    
    def get_disposal_statistics(self) -> Dict[str, Any]:
        """폐기 통계 조회"""
        return self._disposal_statistics.copy()
    
    # ==================== 필터링 및 검색 메서드 ====================
    
    def get_disposals_with_pagination(self, page: int, per_page: int, **filters) -> Dict[str, Any]:
        """페이지네이션이 적용된 폐기 목록 조회"""
        filtered_disposals = self._apply_filters(self._disposals, filters)
        
        total_items = len(filtered_disposals)
        total_pages = (total_items + per_page - 1) // per_page if total_items > 0 else 1
        start_index = (page - 1) * per_page
        end_index = start_index + per_page
        
        return {
            "disposals": filtered_disposals[start_index:end_index],
            "pagination": {
                "current_page": page,
                "per_page": per_page,
                "total_items": total_items,
                "total_pages": total_pages,
                "has_prev": page > 1,
                "has_next": page < total_pages
            },
            "current_date": datetime.now().isoformat()
        }
    
    def get_disposals_by_status(self, status: str) -> List[Dict[str, Any]]:
        """상태별 폐기 목록 조회"""
        return [disposal for disposal in self._disposals if disposal.get("approval_status") == status]
    
    def get_disposals_by_type(self, disposal_type: str) -> List[Dict[str, Any]]:
        """유형별 폐기 목록 조회"""
        return [disposal for disposal in self._disposals if disposal.get("disposal_type") == disposal_type]
    
    def get_disposals_by_date_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """날짜 범위별 폐기 목록 조회"""
        return [
            disposal for disposal in self._disposals 
            if disposal.get("disposal_date") and start_date <= disposal["disposal_date"] <= end_date
        ]
    
    def get_pending_approvals(self) -> List[Dict[str, Any]]:
        """승인 대기 중인 폐기 목록 조회"""
        return [
            disposal for disposal in self._disposals 
            if disposal.get("approval_status") in ["승인대기", "검토중"]
        ]
    
    def get_completed_disposals(self) -> List[Dict[str, Any]]:
        """완료된 폐기 목록 조회"""
        return [
            disposal for disposal in self._disposals 
            if disposal.get("approval_status") == "승인완료" and disposal.get("disposal_date")
        ]
    
    # ==================== 유틸리티 메서드 ====================
    
    def _apply_filters(self, disposals: List[Dict[str, Any]], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """필터 적용"""
        filtered = disposals.copy()
        
        if filters.get("approval_status"):
            filtered = [disposal for disposal in filtered if disposal.get("approval_status") == filters["approval_status"]]
        
        if filters.get("disposal_type"):
            filtered = [disposal for disposal in filtered if disposal.get("disposal_type") == filters["disposal_type"]]
        
        if filters.get("reason"):
            filtered = [disposal for disposal in filtered if disposal.get("reason") == filters["reason"]]
        
        if filters.get("start_date") and filters.get("end_date"):
            start_date = filters["start_date"]
            end_date = filters["end_date"]
            filtered = [
                disposal for disposal in filtered
                if disposal.get("disposal_date") and start_date <= disposal["disposal_date"] <= end_date
            ]
        
        return filtered
    
    def search_disposals(self, keyword: str) -> List[Dict[str, Any]]:
        """키워드로 폐기 검색"""
        if not keyword:
            return self._disposals.copy()
        
        keyword_lower = keyword.lower()
        results = []
        
        for disposal in self._disposals:
            # 자산명, 자산번호, 폐기사유, 승인자에서 검색
            searchable_fields = [
                disposal.get("asset_name", ""),
                disposal.get("asset_number", ""),
                disposal.get("reason", ""),
                disposal.get("approver", ""),
                disposal.get("disposal_method", "")
            ]
            
            if any(keyword_lower in str(field).lower() for field in searchable_fields):
                results.append(disposal)
        
        return results 