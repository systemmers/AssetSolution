"""
폐기 도메인 Repository 클래스
기존 operations_repository.py와 100% 호환되는 API 제공

Classes:
    - DisposalRepository: 폐기 도메인의 데이터 액세스 및 비즈니스 로직 처리
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from .data.disposal_data import DisposalData


class DisposalRepository:
    """
    폐기 도메인 Repository 클래스
    
    BaseRepository를 상속받아 폐기 관련 데이터 액세스와 
    비즈니스 로직을 처리합니다.
    """
    
    def __init__(self):
        """DisposalRepository 초기화"""
        self.data_source = DisposalData()  # 싱글톤 인스턴스
        # 기존 operations_repository와 동일한 속성 제공
        self.disposals = self.data_source._disposals
        
        # Disposal Planning 데이터 초기화
        self.disposal_plans = self._initialize_disposal_plans()
    
    def _initialize_disposal_plans(self) -> List[Dict]:
        """폐기 계획 Mock 데이터 초기화"""
        return [
            {
                'id': 1,
                'plan_name': '노후 PC 일괄 폐기',
                'planned_date': '2024-12-20',
                'asset_count': 15,
                'total_estimated_value': 750000,
                'department': '개발팀',
                'disposal_type': '일반폐기',
                'status': 'pending',
                'created_by': '김관리자',
                'created_date': '2024-12-15',
                'notes': '5년 이상 노후 PC 일괄 폐기 예정'
            },
            {
                'id': 2,
                'plan_name': '모니터 교체 폐기',
                'planned_date': '2024-12-25',
                'asset_count': 8,
                'total_estimated_value': 400000,
                'department': '마케팅팀',
                'disposal_type': '재활용',
                'status': 'approved',
                'created_by': '이관리자',
                'created_date': '2024-12-10',
                'approved_by': '박부장',
                'approved_date': '2024-12-12',
                'notes': '4K 모니터로 교체에 따른 기존 모니터 폐기'
            }
        ]
    
    # ==================== 기존 operations_repository.py와 동일한 API ====================
    
    def get_all_disposals(self) -> List[Dict]:
        """전체 폐기 목록 조회 - 기존과 동일한 시그니처"""
        return self.data_source.get_all_disposals()
    
    def get_disposal_by_id(self, disposal_id: int) -> Optional[Dict]:
        """ID로 폐기 조회 - 기존과 동일한 시그니처"""
        return self.data_source.get_disposal_by_id(disposal_id)
    
    # ==================== Disposal Planning CRUD 메서드 ====================
    
    def get_all_disposal_plans(self, status: str = None) -> List[Dict]:
        """폐기 계획 목록 조회"""
        if status:
            return [plan for plan in self.disposal_plans if plan['status'] == status]
        return self.disposal_plans.copy()
    
    def get_disposal_plan_by_id(self, plan_id: int) -> Optional[Dict]:
        """폐기 계획 ID로 조회"""
        for plan in self.disposal_plans:
            if plan['id'] == plan_id:
                return plan.copy()
        return None
    
    def get_disposal_plans_with_pagination(self, page: int = 1, per_page: int = 10, 
                                         status: str = None, disposal_type: str = None, 
                                         department: str = None) -> Tuple[List[Dict], int, int, int]:
        """폐기 계획 페이지네이션 조회"""
        # 필터링
        filtered_plans = self.disposal_plans.copy()
        
        if status:
            filtered_plans = [p for p in filtered_plans if p['status'] == status]
        if disposal_type:
            filtered_plans = [p for p in filtered_plans if p['disposal_type'] == disposal_type]
        if department:
            filtered_plans = [p for p in filtered_plans if p['department'] == department]
        
        # 페이지네이션
        total_count = len(filtered_plans)
        total_pages = (total_count + per_page - 1) // per_page
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        paginated_plans = filtered_plans[start_idx:end_idx]
        
        return paginated_plans, page, total_pages, total_count
    
    def create_disposal_plan(self, plan_data: Dict) -> Dict:
        """폐기 계획 생성"""
        new_id = max([p['id'] for p in self.disposal_plans], default=0) + 1
        
        new_plan = {
            'id': new_id,
            'plan_name': plan_data.get('plan_name', ''),
            'planned_date': plan_data.get('planned_date', ''),
            'asset_count': plan_data.get('asset_count', 0),
            'total_estimated_value': plan_data.get('total_estimated_value', 0),
            'department': plan_data.get('department', ''),
            'disposal_type': plan_data.get('disposal_type', '일반폐기'),
            'status': 'pending',
            'created_by': plan_data.get('created_by', ''),
            'created_date': datetime.now().strftime('%Y-%m-%d'),
            'notes': plan_data.get('notes', '')
        }
        
        self.disposal_plans.append(new_plan)
        return new_plan.copy()
    
    def update_disposal_plan(self, plan_id: int, plan_data: Dict) -> Optional[Dict]:
        """폐기 계획 수정"""
        for i, plan in enumerate(self.disposal_plans):
            if plan['id'] == plan_id:
                # 상태가 pending인 경우만 수정 가능
                if plan['status'] != 'pending':
                    return None
                
                # 수정 가능한 필드만 업데이트
                updatable_fields = ['plan_name', 'planned_date', 'asset_count', 
                                  'total_estimated_value', 'disposal_type', 'notes']
                for field in updatable_fields:
                    if field in plan_data:
                        plan[field] = plan_data[field]
                
                plan['updated_date'] = datetime.now().strftime('%Y-%m-%d')
                return plan.copy()
        
        return None
    
    def delete_disposal_plan(self, plan_id: int) -> bool:
        """폐기 계획 삭제"""
        for i, plan in enumerate(self.disposal_plans):
            if plan['id'] == plan_id:
                # pending 상태인 경우만 삭제 가능
                if plan['status'] == 'pending':
                    del self.disposal_plans[i]
                    return True
                return False
        return False
    
    def approve_disposal_plan(self, plan_id: int, approver: str) -> Optional[Dict]:
        """폐기 계획 승인"""
        for plan in self.disposal_plans:
            if plan['id'] == plan_id and plan['status'] == 'pending':
                plan['status'] = 'approved'
                plan['approved_by'] = approver
                plan['approved_date'] = datetime.now().strftime('%Y-%m-%d')
                return plan.copy()
        return None
    
    def schedule_disposal_plan(self, plan_id: int) -> Optional[Dict]:
        """폐기 계획 일정 확정"""
        for plan in self.disposal_plans:
            if plan['id'] == plan_id and plan['status'] == 'approved':
                plan['status'] = 'scheduled'
                plan['scheduled_date'] = datetime.now().strftime('%Y-%m-%d')
                return plan.copy()
        return None
    
    def complete_disposal_plan(self, plan_id: int) -> Optional[Dict]:
        """폐기 계획 완료"""
        for plan in self.disposal_plans:
            if plan['id'] == plan_id and plan['status'] == 'scheduled':
                plan['status'] = 'completed'
                plan['completed_date'] = datetime.now().strftime('%Y-%m-%d')
                return plan.copy()
        return None
    
    def get_disposal_planning_statistics(self) -> Dict:
        """폐기 계획 통계"""
        # 상태별 통계
        status_stats = {}
        for plan in self.disposal_plans:
            status = plan['status']
            status_stats[status] = status_stats.get(status, 0) + 1
        
        # 유형별 통계
        type_stats = {}
        disposal_types = ['일반폐기', '재활용', '기증', '판매']
        for dtype in disposal_types:
            count = len([p for p in self.disposal_plans if p['disposal_type'] == dtype])
            type_stats[dtype] = count
        
        # 부서별 통계
        dept_stats = {}
        for plan in self.disposal_plans:
            dept = plan.get('department', '기타')
            dept_stats[dept] = dept_stats.get(dept, 0) + 1
        
        # 총 예상 가치
        total_estimated_value = sum(p.get('total_estimated_value', 0) for p in self.disposal_plans)
        
        return {
            'total_plans': len(self.disposal_plans),
            'by_status': status_stats,
            'by_type': type_stats,
            'by_department': dept_stats,
            'total_estimated_value': total_estimated_value,
            'pending_approvals': len([p for p in self.disposal_plans if p['status'] == 'pending']),
            'scheduled_disposals': len([p for p in self.disposal_plans if p['status'] == 'scheduled'])
        }
    
    # ==================== 추가 유틸리티 메서드 (기존 호환성 유지) ====================
    
    def get_disposals_with_pagination(self, page: int = 1, per_page: int = 10, **filters) -> Dict[str, Any]:
        """
        페이지네이션이 적용된 폐기 목록 조회
        
        Args:
            page: 페이지 번호
            per_page: 페이지당 항목 수
            **filters: 필터 조건
            
        Returns:
            페이지네이션된 폐기 목록과 메타데이터
        """
        return self.data_source.get_disposals_with_pagination(page, per_page, **filters)
    
    def get_disposals_by_status(self, status: str) -> List[Dict[str, Any]]:
        """
        상태별 폐기 목록 조회
        
        Args:
            status: 승인 상태
            
        Returns:
            해당 상태의 폐기 목록
        """
        return self.data_source.get_disposals_by_status(status)
    
    def get_disposals_by_type(self, disposal_type: str) -> List[Dict[str, Any]]:
        """
        유형별 폐기 목록 조회
        
        Args:
            disposal_type: 폐기 유형
            
        Returns:
            해당 유형의 폐기 목록
        """
        return self.data_source.get_disposals_by_type(disposal_type)
    
    def get_disposals_by_date_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        날짜 범위별 폐기 목록 조회
        
        Args:
            start_date: 시작 날짜 (YYYY-MM-DD)
            end_date: 종료 날짜 (YYYY-MM-DD)
            
        Returns:
            해당 기간의 폐기 목록
        """
        return self.data_source.get_disposals_by_date_range(start_date, end_date)
    
    def get_pending_approvals(self) -> List[Dict[str, Any]]:
        """
        승인 대기 중인 폐기 목록 조회
        
        Returns:
            승인 대기 중인 폐기 목록
        """
        return self.data_source.get_pending_approvals()
    
    def get_completed_disposals(self) -> List[Dict[str, Any]]:
        """
        완료된 폐기 목록 조회
        
        Returns:
            완료된 폐기 목록
        """
        return self.data_source.get_completed_disposals()
    
    def search_disposals(self, keyword: str) -> List[Dict[str, Any]]:
        """
        키워드로 폐기 검색
        
        Args:
            keyword: 검색 키워드
            
        Returns:
            검색 결과 목록
        """
        return self.data_source.search_disposals(keyword)
    
    # ==================== 단순한 유틸리티 메서드 (기존 수준 유지) ====================
    
    def get_disposal_cost_summary(self) -> Dict:
        """폐기 비용 요약 정보 - 기존 수준의 단순한 로직"""
        all_disposals = self.get_all_disposals()
        completed_disposals = [d for d in all_disposals if d.get('approval_status') == '승인완료']
        
        total_cost = sum(d.get('disposal_cost', 0) for d in completed_disposals)
        
        return {
            'total_disposals': len(completed_disposals),
            'total_cost': total_cost,
            'avg_cost_per_disposal': total_cost / len(completed_disposals) if completed_disposals else 0
        } 