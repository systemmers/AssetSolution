"""
업그레이드 관련 Mock 데이터 관리
싱글톤 패턴을 적용하여 메모리 효율성 확보

Classes:
    - UpgradeData: 업그레이드 관련 Mock 데이터 관리 (싱글톤)
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta


class UpgradeData:
    """
    업그레이드 관련 Mock 데이터 관리 (싱글톤)
    
    애플리케이션 생명주기 동안 일관된 업그레이드 데이터를 제공합니다.
    DB 전환 시 이 클래스는 제거 예정입니다.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not UpgradeData._initialized:
            self._initialize_data()
            UpgradeData._initialized = True
    
    def _initialize_data(self):
        """초기 데이터 설정 - 원본 operations_repository.py와 동일한 구조"""
        from datetime import datetime
        
        self._upgrades = [
            {
                "id": 1,
                "asset_id": 101,
                "asset_name": "노후 서버 Dell PowerEdge R720",
                "asset_number": "SV-2019-001",
                "upgrade_type": "replacement",
                "upgrade_type_display": "교체",
                "planned_date": datetime.strptime("2025-03-15", "%Y-%m-%d").date(),
                "budget": 5000000,
                "actual_cost": None,
                "status": "planned",
                "status_id": 1,
                "progress_percentage": 0,
                "department": "IT팀",
                "reason": "성능 향상 및 보안 강화",
                "priority": "high",
                "created_by": "김IT팀장",
                "created_at": datetime.strptime("2024-12-15 14:30:00", "%Y-%m-%d %H:%M:%S"),
                "approved_by": None,
                "approved_date": None
            },
            {
                "id": 2,
                "asset_id": 102,
                "asset_name": "개발팀 워크스테이션 10대",
                "asset_number": "WS-2020-001~010",
                "upgrade_type": "enhancement",
                "upgrade_type_display": "업그레이드",
                "planned_date": datetime.strptime("2025-02-20", "%Y-%m-%d").date(),
                "budget": 8000000,
                "actual_cost": None,
                "status": "planned",
                "status_id": 1,
                "progress_percentage": 0,
                "department": "개발팀",
                "reason": "개발 환경 성능 향상",
                "priority": "medium",
                "created_by": "박개발팀장",
                "created_at": datetime.strptime("2024-12-18 10:15:00", "%Y-%m-%d %H:%M:%S"),
                "approved_by": None,
                "approved_date": None
            },
            {
                "id": 4,
                "asset_id": 104,
                "asset_name": "프린터 서버",
                "asset_number": "PS-2018-001",
                "upgrade_type": "replacement",
                "upgrade_type_display": "교체",
                "planned_date": datetime.strptime("2025-01-30", "%Y-%m-%d").date(),
                "budget": 800000,
                "actual_cost": None,
                "status": "approved",
                "status_id": 2,
                "progress_percentage": 15,
                "department": "총무팀",
                "reason": "인쇄 서비스 안정성 향상",
                "priority": "medium",
                "created_by": "최총무팀장",
                "created_at": datetime.strptime("2024-12-10 11:20:00", "%Y-%m-%d %H:%M:%S"),
                "approved_by": "김이사",
                "approved_date": datetime.strptime("2024-12-22", "%Y-%m-%d").date()
            }
        ]
        
        self._upgrade_statistics = {
            "total_upgrades": 3,
            "completed_upgrades": 0,
            "in_progress_upgrades": 0,
            "planned_upgrades": 2,
            "approved_upgrades": 1,
            "total_budget": 13800000,
            "avg_progress": 5,
            "by_type": {
                "replacement": 2,
                "enhancement": 1
            },
            "by_department": {
                "IT팀": 1,
                "개발팀": 1,
                "총무팀": 1
            },
            "by_priority": {
                "high": 1,
                "medium": 2,
                "low": 0
            }
        }
    
    def reset_for_testing(self):
        """테스트용 데이터 리셋"""
        self._upgrades = []
        self._upgrade_statistics = {}
        UpgradeData._initialized = False
        self._initialize_data()
    
    # ==================== 기본 CRUD 메서드 ====================
    
    def get_all_upgrades(self) -> List[Dict[str, Any]]:
        """모든 업그레이드 목록 조회"""
        return self._upgrades.copy()
    
    def get_upgrade_by_id(self, upgrade_id: int) -> Optional[Dict[str, Any]]:
        """ID로 업그레이드 조회"""
        return next((upgrade for upgrade in self._upgrades if upgrade["id"] == upgrade_id), None)
    
    def add_upgrade(self, upgrade_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 업그레이드 추가"""
        new_id = max(upgrade["id"] for upgrade in self._upgrades) + 1 if self._upgrades else 1
        upgrade_data["id"] = new_id
        upgrade_data["created_at"] = datetime.now().isoformat()
        upgrade_data["updated_at"] = datetime.now().isoformat()
        self._upgrades.append(upgrade_data)
        return upgrade_data
    
    def update_upgrade(self, upgrade_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """업그레이드 정보 업데이트"""
        for i, upgrade in enumerate(self._upgrades):
            if upgrade["id"] == upgrade_id:
                updated_upgrade = upgrade.copy()
                updated_upgrade.update(update_data)
                updated_upgrade["updated_at"] = datetime.now().isoformat()
                self._upgrades[i] = updated_upgrade
                return updated_upgrade
        return None
    
    def delete_upgrade(self, upgrade_id: int) -> bool:
        """업그레이드 삭제"""
        for i, upgrade in enumerate(self._upgrades):
            if upgrade["id"] == upgrade_id:
                del self._upgrades[i]
                return True
        return False
    
    def get_upgrade_statistics(self) -> Dict[str, Any]:
        """업그레이드 통계 조회"""
        return self._upgrade_statistics.copy()
    
    # ==================== 필터링 및 검색 메서드 ====================
    
    def get_upgrades_by_status(self, status: str) -> List[Dict[str, Any]]:
        """상태별 업그레이드 목록 조회"""
        return [upgrade for upgrade in self._upgrades if upgrade.get("status") == status]
    
    def get_upgrades_by_type(self, upgrade_type: str) -> List[Dict[str, Any]]:
        """유형별 업그레이드 목록 조회"""
        return [upgrade for upgrade in self._upgrades if upgrade.get("upgrade_type") == upgrade_type]
    
    def get_upgrades_by_date_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """날짜 범위별 업그레이드 목록 조회"""
        return [
            upgrade for upgrade in self._upgrades 
            if upgrade.get("upgrade_date") and start_date <= upgrade["upgrade_date"] <= end_date
        ]
    
    def get_upcoming_upgrades(self, days: int = 7) -> List[Dict[str, Any]]:
        """예정된 업그레이드 목록 조회"""
        target_date = (datetime.now() + timedelta(days=days)).date()
        upcoming = []
        
        for upgrade in self._upgrades:
            if upgrade.get("status") in ["예정", "진행중"] and upgrade.get("upgrade_date"):
                try:
                    upgrade_date = datetime.fromisoformat(upgrade["upgrade_date"]).date()
                    if upgrade_date <= target_date:
                        upgrade_copy = upgrade.copy()
                        upgrade_copy["days_until_upgrade"] = (upgrade_date - datetime.now().date()).days
                        upcoming.append(upgrade_copy)
                except (ValueError, TypeError):
                    continue
        
        return upcoming 