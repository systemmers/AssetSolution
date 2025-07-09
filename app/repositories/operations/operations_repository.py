"""
Operations Repository Facade 모듈
기존 API 100% 호환성을 유지하면서 내부적으로 도메인별 Repository를 사용

Classes:
    - OperationsRepository: Facade 패턴으로 구현된 운영 관리 Repository
"""
from datetime import datetime
from typing import List, Dict, Optional, Tuple

# 도메인별 Repository import
from .loan_repository import LoanRepository
from .disposal_repository import DisposalRepository
from .allocation_repository import AllocationRepository
from .lifecycle_repository import LifecycleRepository
from .upgrade_repository import UpgradeRepository
from .operations_data import OperationsData
from .history_repository import OperationHistoryRepository


class OperationsRepository:
    """
    자산 운영 관리 Repository Facade 클래스
    기존 API 100% 호환성을 유지하면서 내부적으로 도메인별 Repository 사용
    """

    
    def __init__(self):
        """Repository 초기화 및 도메인 Repository 인스턴스 생성"""
        # 도메인별 Repository 인스턴스 생성
        self.loan_repo = LoanRepository()
        self.disposal_repo = DisposalRepository()
        self.allocation_repo = AllocationRepository()
        self.lifecycle_repo = LifecycleRepository()
        self.upgrade_repo = UpgradeRepository()
        self.history_repo = OperationHistoryRepository()
        
        # 마스터 데이터 인스턴스 생성
        self.master_data = OperationsData()
        
        # 기존 API 호환성을 위한 속성 매핑
        self.loans = self.loan_repo.loans
        self.disposals = self.disposal_repo.disposals
        self.allocations = self.allocation_repo.allocations
        self.lifecycles = self.lifecycle_repo.lifecycles
        self.upgrades = self.upgrade_repo.upgrades
        
        # 마스터 데이터 속성 매핑 (기존 호환성)
        self.loan_status = self.master_data.get_loan_statuses()
        self.disposal_reasons = self.master_data.get_disposal_reasons()
        self.allocation_requesters = self.master_data.get_allocation_requesters()
        self.allocation_assets = self.master_data.get_allocation_assets()
        self.allocation_types = self.master_data.get_allocation_types()
        self.allocation_statuses = self.master_data.get_allocation_statuses()
        self.allocation_request_titles = self.master_data.get_allocation_request_titles()
        self.disposal_planning_statuses = self.master_data.get_disposal_planning_statuses()
        self.disposal_plans = self.master_data.get_disposal_plans()
    

    
    # ==================== LOAN CRUD 메서드 (Facade 패턴) ====================
    
    def get_all_loans(self, status: str = None, user_id: int = None, 
                     department: str = None) -> List[Dict]:
        """대여 목록 조회 (필터링 포함) - 도메인 Repository로 위임"""
        return self.loan_repo.get_all_loans(status, user_id, department)
    
    def get_loan_by_id(self, loan_id: int) -> Optional[Dict]:
        """대여 ID로 특정 대여 정보 조회 - 도메인 Repository로 위임"""
        return self.loan_repo.get_loan_by_id(loan_id)
    
    def get_loans_with_pagination(self, page: int = 1, per_page: int = 10, 
                                 status: str = None, user_id: int = None, 
                                 department: str = None) -> Tuple[List[Dict], int, int, int]:
        """페이지네이션을 포함한 대여 목록 조회 - 도메인 Repository로 위임"""
        return self.loan_repo.get_loans_with_pagination(page, per_page, status, user_id, department)
    
    def get_returned_loans(self) -> List[Dict]:
        """반납 완료된 대여 목록 조회 - 도메인 Repository로 위임"""
        return self.loan_repo.get_returned_loans()
    
    # ==================== DISPOSAL CRUD 메서드 (Facade 패턴) ====================
    
    def get_all_disposals(self) -> List[Dict]:
        """전체 폐기 목록 조회 - 도메인 Repository로 위임"""
        return self.disposal_repo.get_all_disposals()
    
    def get_disposal_by_id(self, disposal_id: int) -> Optional[Dict]:
        """폐기 ID로 특정 폐기 정보 조회 - 도메인 Repository로 위임"""
        return self.disposal_repo.get_disposal_by_id(disposal_id)
    
    # ==================== 마스터 데이터 조회 메서드 (기존과 동일) ====================
    
    def get_loan_statuses(self) -> List[Dict]:
        """대여 상태 마스터 데이터 조회"""
        return self.master_data.get_loan_statuses()
    
    def get_disposal_reasons(self) -> List[Dict]:
        """폐기 사유 마스터 데이터 조회"""
        return self.master_data.get_disposal_reasons()
    
    # ==================== 통계 메서드 (Facade 패턴) ====================
    
    def get_operations_statistics(self) -> Dict:
        """운영 관련 통계 정보 조회 - 도메인 Repository들로부터 수집"""
        # 대여 상태별 통계
        loan_stats = {}
        for status in self.loan_status:
            count = len([l for l in self.loans if l['status_id'] == status['id']])
            loan_stats[status['name']] = count
        
        # 폐기 상태별 통계
        disposal_stats = {}
        for reason in self.disposal_reasons:
            count = len([d for d in self.disposals if d.get('reason_id') == reason['id']])
            disposal_stats[reason['name']] = count
        
        return {
            'total_loans': len(self.loans),
            'active_loans': len([l for l in self.loans if l['status_id'] == 3]),
            'returned_loans': len([l for l in self.loans if l['status_id'] == 4]),
            'overdue_loans': len([l for l in self.loans if l['status_id'] == 5]),
            'total_disposals': len(self.disposals),
            'loan_by_status': loan_stats,
            'disposal_by_reason': disposal_stats
        }
    
    # ==================== 이력 조회 메서드 (HistoryRepository로 위임) ====================
    
    def get_operation_history(self, asset_id: str = None, user_name: str = None, 
                             operation_type: str = None, status: str = None,
                             start_date: str = None, end_date: str = None) -> List[Dict]:
        """자산 운영 이력 종합 조회 - HistoryRepository로 위임"""
        return self.history_repo.get_operation_history(asset_id, user_name, operation_type, status, start_date, end_date)
    
    def get_history_detail_by_id(self, history_id: str) -> Optional[Dict]:
        """이력 상세 정보 조회 - HistoryRepository로 위임"""
        return self.history_repo.get_history_detail_by_id(history_id)
    
    def get_history_statistics(self, history_records: List[Dict] = None) -> Dict:
        """이력 통계 정보 조회 - HistoryRepository로 위임"""
        return self.history_repo.get_history_statistics(history_records)
    
    def get_detailed_statistics(self) -> Dict:
        """상세 통계 정보 조회 - 템플릿 호환성을 위한 구조 수정"""
        # 기본 운영 통계
        basic_stats = self.get_operations_statistics()
        
        # 전체 이력 가져오기
        all_history = self.get_operation_history()
        history_stats = self.get_history_statistics(all_history)
        
        # 월별 통계 (최근 6개월)
        monthly_stats = {}
        current_date = datetime.now()
        
        for i in range(6):
            month_date = datetime(current_date.year, current_date.month - i, 1) if current_date.month - i > 0 else datetime(current_date.year - 1, 12 + current_date.month - i, 1)
            month_key = month_date.strftime('%Y-%m')
            monthly_stats[month_key] = {
                'loans': 0,
                'returns': 0,
                'disposals': 0
            }
        
        # 월별 데이터 집계
        for record in all_history:
            if record['operation_date']:
                try:
                    # operation_date가 이미 datetime 객체인지 확인
                    if isinstance(record['operation_date'], datetime):
                        record_date = record['operation_date']
                    else:
                        record_date = datetime.strptime(record['operation_date'], '%Y-%m-%d %H:%M')
                    
                    month_key = record_date.strftime('%Y-%m')
                    if month_key in monthly_stats:
                        if record['operation_type'] == '대여':
                            monthly_stats[month_key]['loans'] += 1
                        elif record['operation_type'] == '반납':
                            monthly_stats[month_key]['returns'] += 1
                        elif record['operation_type'] == '폐기':
                            monthly_stats[month_key]['disposals'] += 1
                except (ValueError, TypeError):
                    continue
        
        # 자산별 활용도 통계
        asset_usage = {}
        for loan in self.loans:
            asset_name = loan['asset_name']
            if asset_name not in asset_usage:
                asset_usage[asset_name] = {
                    'total_loans': 0,
                    'active_loans': 0,
                    'overdue_loans': 0,
                    'utilization_rate': 0
                }
            
            asset_usage[asset_name]['total_loans'] += 1
            if loan['status_id'] == 3:  # 대여중
                asset_usage[asset_name]['active_loans'] += 1
            elif loan['status_id'] == 5:  # 연체
                asset_usage[asset_name]['overdue_loans'] += 1
        
        # 활용도 계산
        for asset_name, stats in asset_usage.items():
            if stats['total_loans'] > 0:
                stats['utilization_rate'] = (stats['active_loans'] / stats['total_loans']) * 100
        
        # 상위 활용 자산 (상위 10개)
        top_assets = sorted(asset_usage.items(), 
                          key=lambda x: x[1]['total_loans'], 
                          reverse=True)[:10]
        
        # 부서별 활용도 데이터
        dept_usage = {}
        for loan in self.loans:
            dept = loan.get('user_department', '기타')
            if dept not in dept_usage:
                dept_usage[dept] = 0
            dept_usage[dept] += 1
        
        department_utilization = [
            {'label': dept, 'value': count} 
            for dept, count in dept_usage.items()
        ]
        
        # 템플릿에서 기대하는 구조로 데이터 반환
        return {
            'basic_statistics': basic_stats,
            'history_statistics': history_stats,
            'monthly_statistics': monthly_stats,
            'asset_usage': asset_usage,
            'top_assets': dict(top_assets),
            'summary_stats': {
                'monthly_loans': sum(stats['loans'] for stats in monthly_stats.values()),
                'monthly_returns': sum(stats['returns'] for stats in monthly_stats.values()),
                'overdue_returns': len([l for l in self.loans if l['status_id'] == 5]),
                'total_operations': len(all_history),
                'average_utilization_rate': sum(stats['utilization_rate'] for stats in asset_usage.values()) / len(asset_usage) if asset_usage else 0,
                'active_assets': len([stats for stats in asset_usage.values() if stats['active_loans'] > 0])
            },
            'asset_utilization_top10': [
                {
                    'asset_name': asset_name,
                    'utilization_rate': stats['utilization_rate'],
                    'total_loans': stats['total_loans']
                }
                for asset_name, stats in top_assets
            ],
            'department_utilization': department_utilization,
            'summary': {
                'total_operations': len(all_history),
                'most_active_department': max(history_stats['by_department'].items(), key=lambda x: x[1])[0] if history_stats['by_department'] else '없음',
                'most_common_operation': max(history_stats['by_operation_type'].items(), key=lambda x: x[1])[0] if history_stats['by_operation_type'] else '없음'
            }
        }
    
    # ==================== 폐기 계획 관련 메서드 (DisposalRepository로 위임) ====================
    
    def get_all_disposal_plans(self, status: str = None) -> List[Dict]:
        """폐기 계획 목록 조회 - DisposalRepository로 위임"""
        return self.disposal_repo.get_all_disposal_plans(status)
    
    def get_disposal_plan_by_id(self, plan_id: int) -> Optional[Dict]:
        """폐기 계획 ID로 조회 - DisposalRepository로 위임"""
        return self.disposal_repo.get_disposal_plan_by_id(plan_id)
    
    def get_disposal_plans_with_pagination(self, page: int = 1, per_page: int = 10, 
                                         status: str = None, disposal_type: str = None, 
                                         department: str = None) -> Tuple[List[Dict], int, int, int]:
        """폐기 계획 페이지네이션 조회 - DisposalRepository로 위임"""
        return self.disposal_repo.get_disposal_plans_with_pagination(page, per_page, status, disposal_type, department)
    
    def create_disposal_plan(self, plan_data: Dict) -> Dict:
        """폐기 계획 생성 - DisposalRepository로 위임"""
        return self.disposal_repo.create_disposal_plan(plan_data)
    
    def update_disposal_plan(self, plan_id: int, plan_data: Dict) -> Optional[Dict]:
        """폐기 계획 수정 - DisposalRepository로 위임"""
        return self.disposal_repo.update_disposal_plan(plan_id, plan_data)
    
    def delete_disposal_plan(self, plan_id: int) -> bool:
        """폐기 계획 삭제 - DisposalRepository로 위임"""
        return self.disposal_repo.delete_disposal_plan(plan_id)
    
    def approve_disposal_plan(self, plan_id: int, approver: str) -> Optional[Dict]:
        """폐기 계획 승인 - DisposalRepository로 위임"""
        return self.disposal_repo.approve_disposal_plan(plan_id, approver)
    
    def schedule_disposal_plan(self, plan_id: int) -> Optional[Dict]:
        """폐기 계획 일정 확정 - DisposalRepository로 위임"""
        return self.disposal_repo.schedule_disposal_plan(plan_id)
    
    def complete_disposal_plan(self, plan_id: int) -> Optional[Dict]:
        """폐기 계획 완료 - DisposalRepository로 위임"""
        return self.disposal_repo.complete_disposal_plan(plan_id)
    
    def get_disposal_planning_statistics(self) -> Dict:
        """폐기 계획 통계 - DisposalRepository로 위임"""
        return self.disposal_repo.get_disposal_planning_statistics()
    
    def get_disposal_planning_statuses(self) -> List[Dict]:
        """폐기 계획 상태 마스터 데이터 조회"""
        return self.master_data.get_disposal_planning_statuses()

    # ==================== 지급 요청 관련 메서드 (기존과 동일) ====================
    
    def get_allocation_requests_data(self) -> List[Dict]:
        """
        지급 요청 목록 데이터 생성 (원본 로직 사용)
        
        Returns:
            지급 요청 목록 (datetime 객체 포함)
        """
        from datetime import datetime, timedelta
        import random
        
        # Mock 지급 요청 데이터 생성 (원본과 동일한 로직)
        allocation_requests = []
        
        # 15개 지급 요청 생성
        for i in range(15):
            requester = random.choice(self.allocation_requesters)
            asset = random.choice(self.allocation_assets)
            allocation_type = random.choice(self.allocation_types)
            status = random.choice(self.allocation_statuses)
            
            # 날짜 생성 (datetime 객체로 생성)
            request_date = datetime.now() - timedelta(days=random.randint(1, 30))
            allocation_date = None
            if status['status'] in ['allocated', 'returned']:
                allocation_date = request_date + timedelta(days=random.randint(1, 7))
            
            # 다중 유형 여부 (20% 확률)
            is_multi_type = random.random() < 0.2
            
            request = {
                'id': i + 1,
                'request_number': f'AL-2024-{str(i+1).zfill(3)}',
                'request_title': random.choice(self.allocation_request_titles),
                'asset_name': asset['name'],
                'asset_number': asset['number'],
                'allocation_type': allocation_type['type'],
                'type_color': allocation_type['color'],
                'requester_name': requester['name'],
                'department': requester['department'],
                'request_date': request_date,  # datetime 객체
                'allocation_date': allocation_date,  # datetime 객체 또는 None
                'status': status['status'],
                'status_name': status['name'],
                'is_multi_type': is_multi_type
            }
            
            allocation_requests.append(request)
        
        # 최신 요청 순으로 정렬
        allocation_requests.sort(key=lambda x: x['request_date'], reverse=True)
        
        return allocation_requests
    
    def get_allocation_requesters(self) -> List[Dict]:
        """지급 요청자 목록 조회"""
        return self.master_data.get_allocation_requesters()
    
    def get_allocation_assets(self) -> List[Dict]:
        """지급 요청용 자산 목록 조회"""
        return self.master_data.get_allocation_assets()
    
    def get_allocation_types(self) -> List[Dict]:
        """지급 유형 목록 조회"""
        return self.master_data.get_allocation_types()
    
    def get_allocation_statuses(self) -> List[Dict]:
        """지급 요청 상태 목록 조회"""
        return self.master_data.get_allocation_statuses()
    
    def get_allocation_request_titles(self) -> List[str]:
        """지급 요청 제목 템플릿 조회"""
        return self.master_data.get_allocation_request_titles() 

    # ==================== 업그레이드 관련 메서드 (Facade 패턴) ====================
    
    def get_all_upgrade_plans(self, status: str = None, upgrade_type: str = None, 
                             department: str = None) -> List[Dict]:
        """업그레이드 계획 목록 조회 - UpgradeRepository로 위임"""
        return self.upgrade_repo._load_sample_data()
    
    def get_upgrade_plan_by_id(self, plan_id: int) -> Optional[Dict]:
        """업그레이드 계획 ID로 조회 - UpgradeRepository로 위임"""
        return self.upgrade_repo.get_upgrade_by_id(plan_id)
    
    def get_upgrade_plans_with_pagination(self, page: int = 1, per_page: int = 10, 
                                        status: str = None, upgrade_type: str = None, 
                                        department: str = None) -> Tuple[List[Dict], int, int, int]:
        """페이지네이션된 업그레이드 계획 목록 - UpgradeRepository로 완전 위임"""
        return self.upgrade_repo.get_plans_with_pagination(page, per_page, status, upgrade_type, department)
    
    def get_upgrade_plans_statistics(self) -> Dict:
        """업그레이드 계획 통계 - UpgradeRepository로 위임"""
        return self.upgrade_repo.get_statistics()
    
    def get_upgrade_statuses(self) -> List[Dict]:
        """업그레이드 상태 마스터 데이터 조회 - UpgradeRepository로 위임"""
        # 기본 상태 데이터 반환 (도메인 Repository에 해당 메서드가 없으므로)
        return [
            {"id": 1, "code": "PLANNED", "name": "계획됨", "description": "업그레이드 계획 수립"},
            {"id": 2, "code": "SCHEDULED", "name": "예정됨", "description": "업그레이드 일정 확정"},
            {"id": 3, "code": "IN_PROGRESS", "name": "진행중", "description": "업그레이드 진행중"},
            {"id": 4, "code": "COMPLETED", "name": "완료됨", "description": "업그레이드 완료"},
            {"id": 5, "code": "CANCELLED", "name": "취소됨", "description": "업그레이드 취소"}
        ]
    
    # ==================== 생명주기 관련 메서드 (Facade 패턴) ====================
    
    def get_all_lifecycle_events(self, asset_id: int = None, event_type: str = None, 
                                department: str = None, start_date: str = None, 
                                end_date: str = None) -> List[Dict]:
        """생명주기 이벤트 목록 조회 - LifecycleRepository로 위임"""
        return self.lifecycle_repo._load_sample_data()
    
    def get_lifecycle_events_by_asset(self, asset_id: int) -> List[Dict]:
        """자산별 생명주기 이벤트 조회 - LifecycleRepository로 위임"""
        return self.lifecycle_repo.get_by_id(asset_id) or []
    
    def get_lifecycle_events_with_pagination(self, page: int = 1, per_page: int = 10, 
                                           asset_id: int = None, event_type: str = None, 
                                           department: str = None) -> Tuple[List[Dict], int, int, int]:
        """
        페이지네이션된 생명주기 이벤트 목록 - LifecycleRepository 사용
            
        Returns:
            (생명주기이벤트목록, 현재페이지, 총페이지수, 총항목수)
        """
        return self.lifecycle_repo.get_events_with_pagination(page, per_page, asset_id, event_type, department)
    
    def get_lifecycle_statistics(self) -> Dict:
        """
        생명주기 통계 - LifecycleRepository로 위임하고 템플릿 호환성 확보
        """
        # 기본 통계 정보 조회
        base_stats = self.lifecycle_repo.get_statistics()
        
        # 템플릿에서 기대하는 추가 키들을 안전한 기본값으로 설정
        base_stats['type_stats'] = base_stats.get('by_event_type', {})
        base_stats['monthly_stats'] = base_stats.get('monthly_data', [])
        
        # 누락된 키들을 안전한 기본값으로 설정
        if 'this_month_events' not in base_stats:
            base_stats['this_month_events'] = 0
        if 'recent_events' not in base_stats:
            base_stats['recent_events'] = 0
        if 'total_costs_formatted' not in base_stats:
            total_cost = base_stats.get('total_related_cost', 0)
            base_stats['total_costs_formatted'] = f"{total_cost:,}원" if total_cost else "0원"
        
        return base_stats
    
    def get_lifecycle_event_types(self) -> List[Dict]:
        """
        생명주기 이벤트 유형 마스터 데이터 조회 - LifecycleRepository 사용
        
        Returns:
            이벤트 유형 목록
        """
        return self.lifecycle_repo.get_event_types()
    
    def get_lifecycle_departments(self) -> List[Dict]:
        """
        생명주기 관련 부서 목록 - LifecycleRepository 사용
        """
        return self.lifecycle_repo.get_departments()

    def get_lifecycle_event_by_id(self, event_id: int) -> Optional[Dict]:
        """생명주기 이벤트 ID로 조회 - LifecycleRepository로 위임"""
        return self.lifecycle_repo.get_by_id(event_id) 


# 싱글톤 인스턴스 생성
operations_repository = OperationsRepository() 