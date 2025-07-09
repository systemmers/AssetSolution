"""
폐기 계획 관련 Mock 데이터 관리
싱글톤 패턴을 적용하여 메모리 효율성 확보

Classes:
    - DisposalDataPlans: 폐기 계획 관련 Mock 데이터 관리 (싱글톤)
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta


class DisposalDataPlans:
    """
    폐기 계획 관련 Mock 데이터 관리 (싱글톤)
    
    애플리케이션 생명주기 동안 일관된 폐기 계획 데이터를 제공합니다.
    DB 전환 시 이 클래스는 제거 예정입니다.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not DisposalDataPlans._initialized:
            self._initialize_data()
            DisposalDataPlans._initialized = True
    
    def _initialize_data(self):
        """초기 데이터 설정"""
        self._disposal_plans = [
            {
                "id": 1,
                "plan_name": "2024년 1분기 IT장비 폐기 계획",
                "description": "노후화된 서버 및 네트워크 장비 정리",
                "planned_date": "2024-03-31",
                "status": "계획중",
                "total_assets": 15,
                "estimated_cost": 750000,
                "responsible_person": "김부장",
                "department": "IT팀",
                "approval_required": True,
                "environmental_impact": "저",
                "notes": "환경친화적 폐기 업체 선정 필요",
                "created_at": "2024-01-10T09:00:00",
                "updated_at": "2024-01-10T09:00:00"
            },
            {
                "id": 2,
                "plan_name": "사무용 가구 정리 계획",
                "description": "사무실 리모델링에 따른 기존 가구 정리",
                "planned_date": "2024-04-15",
                "status": "승인대기",
                "total_assets": 25,
                "estimated_cost": 300000,
                "responsible_person": "이과장",
                "department": "총무팀",
                "approval_required": True,
                "environmental_impact": "중",
                "notes": "일부 가구는 기증 검토",
                "created_at": "2024-02-01T10:30:00",
                "updated_at": "2024-02-05T14:20:00"
            },
            {
                "id": 3,
                "plan_name": "연구개발 장비 갱신 계획",
                "description": "R&D 부서 측정 장비 교체 및 폐기",
                "planned_date": "2024-05-30",
                "status": "승인완료",
                "total_assets": 8,
                "estimated_cost": 1200000,
                "responsible_person": "박연구원",
                "department": "R&D팀",
                "approval_required": True,
                "environmental_impact": "고",
                "notes": "정밀 장비로 전문 폐기 업체 필요",
                "created_at": "2024-01-25T11:00:00",
                "updated_at": "2024-02-10T16:45:00"
            }
        ]
        
        self._plan_statistics = {
            "total_plans": 12,
            "pending_plans": 5,
            "approved_plans": 4,
            "completed_plans": 3,
            "total_estimated_cost": 3500000,
            "total_planned_assets": 89,
            "by_department": {
                "IT팀": 4,
                "총무팀": 3,
                "R&D팀": 2,
                "영업팀": 2,
                "기타": 1
            }
        }
    
    def reset_for_testing(self):
        """테스트용 데이터 리셋"""
        self._disposal_plans = []
        self._plan_statistics = {}
        DisposalDataPlans._initialized = False
        self._initialize_data()
    
    # ==================== 기본 CRUD 메서드 ====================
    
    def get_all_plans(self) -> List[Dict[str, Any]]:
        """모든 폐기 계획 목록 조회"""
        return self._disposal_plans.copy()
    
    def get_plan_by_id(self, plan_id: int) -> Optional[Dict[str, Any]]:
        """ID로 폐기 계획 조회"""
        return next((plan for plan in self._disposal_plans if plan["id"] == plan_id), None)
    
    def add_plan(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 폐기 계획 추가"""
        new_id = max(plan["id"] for plan in self._disposal_plans) + 1 if self._disposal_plans else 1
        plan_data["id"] = new_id
        plan_data["created_at"] = datetime.now().isoformat()
        plan_data["updated_at"] = datetime.now().isoformat()
        self._disposal_plans.append(plan_data)
        return plan_data
    
    def update_plan(self, plan_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """폐기 계획 정보 업데이트"""
        for i, plan in enumerate(self._disposal_plans):
            if plan["id"] == plan_id:
                updated_plan = plan.copy()
                updated_plan.update(update_data)
                updated_plan["updated_at"] = datetime.now().isoformat()
                self._disposal_plans[i] = updated_plan
                return updated_plan
        return None
    
    def delete_plan(self, plan_id: int) -> bool:
        """폐기 계획 삭제"""
        for i, plan in enumerate(self._disposal_plans):
            if plan["id"] == plan_id:
                del self._disposal_plans[i]
                return True
        return False
    
    def get_plan_statistics(self) -> Dict[str, Any]:
        """폐기 계획 통계 조회"""
        return self._plan_statistics.copy()
    
    # ==================== 필터링 및 검색 메서드 ====================
    
    def get_plans_by_status(self, status: str) -> List[Dict[str, Any]]:
        """상태별 폐기 계획 목록 조회"""
        return [plan for plan in self._disposal_plans if plan.get("status") == status]
    
    def get_plans_by_department(self, department: str) -> List[Dict[str, Any]]:
        """부서별 폐기 계획 목록 조회"""
        return [plan for plan in self._disposal_plans if plan.get("department") == department]
    
    def get_upcoming_plans(self, days: int = 30) -> List[Dict[str, Any]]:
        """예정된 폐기 계획 목록 조회"""
        target_date = (datetime.now() + timedelta(days=days)).date()
        upcoming = []
        
        for plan in self._disposal_plans:
            if plan.get("planned_date"):
                try:
                    planned_date = datetime.fromisoformat(plan["planned_date"]).date()
                    if planned_date <= target_date:
                        plan_copy = plan.copy()
                        plan_copy["days_until_execution"] = (planned_date - datetime.now().date()).days
                        upcoming.append(plan_copy)
                except (ValueError, TypeError):
                    continue
        
        return upcoming
    
    def get_pending_approvals(self) -> List[Dict[str, Any]]:
        """승인 대기 중인 폐기 계획 목록 조회"""
        return [
            plan for plan in self._disposal_plans 
            if plan.get("status") in ["승인대기", "검토중"] and plan.get("approval_required")
        ] 