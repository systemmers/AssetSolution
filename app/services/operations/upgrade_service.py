"""
업그레이드 관리 서비스 모듈
자산 업그레이드 계획 및 관리 비즈니스 로직

Classes:
    - UpgradeService: 업그레이드 계획, 분석, 통계 등 업그레이드 관련 서비스 로직
"""
from typing import List, Dict, Optional, Any
from datetime import datetime, date


class UpgradeService:
    """
    업그레이드 관리 서비스 클래스
    Repository와 Controller 사이의 업그레이드 관련 비즈니스 로직 계층
    """
    
    def __init__(self):
        """Service 초기화 및 Repository 의존성 주입"""
        from ...repositories import operations_repository, asset_repository
        self.operations_repo = operations_repository
        self.asset_repo = asset_repository
    
    def get_upgrade_management_data(self, page: int = 1, per_page: int = 10, 
                                  status: str = None, upgrade_type: str = None, 
                                  department: str = None) -> Dict:
        """
        업그레이드 관리 메인 페이지 데이터 조회 (필터링 및 페이지네이션 포함)
        
        Args:
            page: 페이지 번호
            per_page: 페이지당 항목 수
            status: 상태 필터 (planned, approved, in_progress, completed, cancelled)
            upgrade_type: 업그레이드 유형 필터 (replacement, enhancement, migration)
            department: 부서 필터
            
        Returns:
            업그레이드 계획 목록과 통계가 포함된 딕셔너리
        """
        try:
            # Repository에서 데이터 조회
            plans, current_page, total_pages, total_items = self.operations_repo.get_upgrade_plans_with_pagination(
                page=page,
                per_page=per_page,
                status=status,
                upgrade_type=upgrade_type,
                department=department
            )
            
            # 비즈니스 로직: 진행률 계산 및 상태 정보 추가
            current_date = datetime.utcnow().date()
            for plan in plans:
                # 안전한 날짜 처리
                planned_date = plan.get('planned_date')
                if planned_date:
                    if hasattr(planned_date, 'strftime'):
                        plan['planned_date_formatted'] = planned_date.strftime('%Y-%m-%d')
                        # D-Day 계산
                        if plan['status'] in ['planned', 'approved']:
                            days_remaining = (planned_date - current_date).days
                            plan['days_remaining'] = days_remaining
                            if days_remaining <= 0:
                                plan['is_overdue'] = True
                            elif days_remaining <= 7:
                                plan['is_urgent'] = True
                        else:
                            plan['days_remaining'] = None
                    elif isinstance(planned_date, str):
                        plan['planned_date_formatted'] = planned_date
                    else:
                        plan['planned_date_formatted'] = str(planned_date)
                
                # 예산 사용률 계산
                if plan.get('budget') and plan.get('actual_cost'):
                    plan['budget_utilization'] = round((plan['actual_cost'] / plan['budget'] * 100), 1)
                else:
                    plan['budget_utilization'] = 0
                
                # 승인일 포맷팅
                approved_date = plan.get('approved_date')
                if approved_date and hasattr(approved_date, 'strftime'):
                    plan['approved_date_formatted'] = approved_date.strftime('%Y-%m-%d')
                elif isinstance(approved_date, str):
                    plan['approved_date_formatted'] = approved_date
                
                # 우선순위 표시
                priority_colors = {
                    'high': 'danger',
                    'medium': 'warning', 
                    'low': 'info'
                }
                plan['priority_color'] = priority_colors.get(plan.get('priority', 'medium'), 'info')
            
            # 통계 정보 조회
            statistics = self.get_upgrade_plans_statistics()
            
            # 필터 옵션 조회
            statuses = self.operations_repo.get_upgrade_statuses()
            upgrade_types = [
                {'code': 'replacement', 'name': '교체'},
                {'code': 'enhancement', 'name': '업그레이드'},
                {'code': 'migration', 'name': '이전/전환'}
            ]
            
            return {
                'upgrade_plans': plans,
                'pagination': {
                    'current_page': current_page,
                    'total_pages': total_pages,
                    'total_items': total_items,
                    'per_page': per_page,
                    'has_prev': current_page > 1,
                    'has_next': current_page < total_pages
                },
                'statistics': statistics,
                'filter_options': {
                    'statuses': statuses,
                    'upgrade_types': upgrade_types
                },
                'current_date': current_date
            }
            
        except Exception as e:
            print(f"업그레이드 관리 데이터 조회 오류: {e}")
            raise
    
    def get_upgrade_plan_details(self, plan_id: int) -> Optional[Dict]:
        """
        업그레이드 계획 상세 정보 조회 (비즈니스 로직 적용)
        
        Args:
            plan_id: 업그레이드 계획 ID
            
        Returns:
            업그레이드 계획 상세 정보 또는 None
        """
        try:
            plan = self.operations_repo.get_upgrade_plan_by_id(plan_id)
            
            if not plan:
                return None
            
            # 안전한 데이터 처리를 위한 기본값 설정
            safe_plan = {}
            for key, value in plan.items():
                # None이나 undefined 값을 안전한 기본값으로 변환
                if value is None:
                    if key in ['budget', 'actual_cost', 'progress_percentage']:
                        safe_plan[key] = 0
                    elif key in ['status', 'upgrade_type', 'department', 'priority']:
                        safe_plan[key] = 'unknown'
                    elif key in ['current_specs', 'target_specs']:
                        safe_plan[key] = {}
                    else:
                        safe_plan[key] = ''
                else:
                    safe_plan[key] = value
            
            plan = safe_plan
            current_date = datetime.utcnow().date()
            
            # 안전한 날짜 처리 및 추가 정보 계산
            planned_date = plan.get('planned_date')
            if planned_date:
                try:
                    if hasattr(planned_date, 'strftime'):
                        plan['planned_date_formatted'] = planned_date.strftime('%Y-%m-%d')
                        
                        # 진행 상태에 따른 날짜 정보
                        if plan.get('status') in ['planned', 'approved']:
                            days_remaining = (planned_date - current_date).days
                            plan['days_remaining'] = days_remaining
                            plan['is_overdue'] = days_remaining <= 0
                            plan['is_urgent'] = 0 < days_remaining <= 7
                        elif plan.get('status') == 'completed':
                            # 완료된 경우 실제 소요 기간 계산
                            created_at = plan.get('created_at')
                            if created_at and hasattr(created_at, 'date'):
                                completion_days = (planned_date - created_at.date()).days
                                plan['completion_days'] = max(0, completion_days)
                    else:
                        plan['planned_date_formatted'] = str(planned_date) if planned_date else ''
                except Exception:
                    plan['planned_date_formatted'] = ''
            else:
                plan['planned_date_formatted'] = ''
            
            # 예산 분석 (안전한 숫자 처리)
            try:
                budget = float(plan.get('budget', 0))
                actual_cost = float(plan.get('actual_cost', 0))
                
                plan['budget'] = budget
                plan['actual_cost'] = actual_cost
                
                if budget > 0:
                    utilization = round((actual_cost / budget * 100), 1)
                    plan['budget_utilization'] = max(0, min(utilization, 999.9))  # 최대값 제한
                    plan['budget_remaining'] = budget - actual_cost
                    plan['is_over_budget'] = actual_cost > budget
                    if actual_cost > budget:
                        plan['budget_overrun'] = actual_cost - budget
                else:
                    plan['budget_utilization'] = 0
                    plan['budget_remaining'] = 0
                    plan['is_over_budget'] = False
            except (ValueError, TypeError):
                plan['budget'] = 0
                plan['actual_cost'] = 0
                plan['budget_utilization'] = 0
                plan['budget_remaining'] = 0
                plan['is_over_budget'] = False
            
            # 승인 정보 포맷팅 (안전한 날짜 처리)
            approved_date = plan.get('approved_date')
            if approved_date:
                try:
                    if hasattr(approved_date, 'strftime'):
                        plan['approved_date_formatted'] = approved_date.strftime('%Y-%m-%d')
                    else:
                        plan['approved_date_formatted'] = str(approved_date)
                except Exception:
                    plan['approved_date_formatted'] = ''
            else:
                plan['approved_date_formatted'] = ''
            
            created_at = plan.get('created_at')
            if created_at:
                try:
                    if hasattr(created_at, 'strftime'):
                        plan['created_at_formatted'] = created_at.strftime('%Y-%m-%d %H:%M')
                    else:
                        plan['created_at_formatted'] = str(created_at)
                except Exception:
                    plan['created_at_formatted'] = ''
            else:
                plan['created_at_formatted'] = ''
            
            # 스펙 비교 정보 추가 (안전한 딕셔너리 처리)
            current_specs = plan.get('current_specs', {})
            target_specs = plan.get('target_specs', {})
            
            if not isinstance(current_specs, dict):
                current_specs = {}
            if not isinstance(target_specs, dict):
                target_specs = {}
            
            plan['spec_improvements'] = self._analyze_spec_improvements(current_specs, target_specs)
            
            # 우선순위 색상 설정
            priority_colors = {
                'high': 'danger',
                'medium': 'warning', 
                'low': 'info'
            }
            plan['priority_color'] = priority_colors.get(plan.get('priority', 'medium'), 'secondary')
            
            return plan
            
        except Exception as e:
            print(f"업그레이드 계획 상세 조회 오류: {e}")
            # 오류 발생 시 None 반환하여 404 처리가 되도록 함
            return None
    
    def get_upgrade_plans_statistics(self) -> Dict:
        """
        업그레이드 계획 통계 정보 조회
        
        Returns:
            업그레이드 계획 통계 정보
        """
        try:
            statistics = self.operations_repo.get_upgrade_plans_statistics()
            
            # 안전한 기본값 설정
            if not statistics or not isinstance(statistics, dict):
                statistics = {
                    'total_plans': 0,
                    'status_stats': {},
                    'type_stats': {},
                    'budget_stats': {'total_budget': 0, 'actual_costs': 0},
                    'department_stats': {}
                }
            
            # 비즈니스 로직: 추가 통계 계산
            current_date = datetime.utcnow().date()
            
            try:
                all_plans = self.operations_repo.get_all_upgrade_plans()
                if not all_plans:
                    all_plans = []
            except Exception:
                all_plans = []
            
            # 긴급 업그레이드 계획 (7일 이내) - 안전한 처리
            urgent_plans = []
            try:
                for plan in all_plans:
                    if not plan or not isinstance(plan, dict):
                        continue
                        
                    status = plan.get('status', '')
                    if status in ['planned', 'approved']:
                        planned_date = plan.get('planned_date')
                        if planned_date and hasattr(planned_date, 'strftime'):
                            try:
                                days_remaining = (planned_date - current_date).days
                                if 0 <= days_remaining <= 7:
                                    urgent_plans.append(plan)
                            except Exception:
                                continue
            except Exception:
                pass
            
            statistics['urgent_plans'] = len(urgent_plans)
            
            # 이번 달 완료 예정 계획 - 안전한 처리
            this_month_plans = []
            try:
                for plan in all_plans:
                    if not plan or not isinstance(plan, dict):
                        continue
                        
                    status = plan.get('status', '')
                    if status in ['planned', 'approved', 'in_progress']:
                        planned_date = plan.get('planned_date')
                        if planned_date and hasattr(planned_date, 'month'):
                            try:
                                if (planned_date.year == current_date.year and 
                                    planned_date.month == current_date.month):
                                    this_month_plans.append(plan)
                            except Exception:
                                continue
            except Exception:
                pass
            
            statistics['this_month_plans'] = len(this_month_plans)
            
            # 예산 효율성 분석 - 안전한 숫자 처리
            try:
                budget_stats = statistics.get('budget_stats', {})
                if not isinstance(budget_stats, dict):
                    budget_stats = {}
                
                total_budget = float(budget_stats.get('total_budget', 0))
                actual_costs = float(budget_stats.get('actual_costs', 0))
                
                if total_budget > 0:
                    budget_efficiency = ((total_budget - actual_costs) / total_budget * 100)
                    statistics['budget_efficiency'] = max(0, min(round(budget_efficiency, 1), 100))
                else:
                    statistics['budget_efficiency'] = 0
            except (ValueError, TypeError, ZeroDivisionError):
                statistics['budget_efficiency'] = 0
            
            # 타입별 통계 안전성 확보
            if not isinstance(statistics.get('type_stats'), dict):
                statistics['type_stats'] = {
                    'replacement': 0,
                    'enhancement': 0,
                    'migration': 0
                }
            
            # 상태별 통계 안전성 확보
            if not isinstance(statistics.get('status_stats'), dict):
                statistics['status_stats'] = {
                    'planned': {'count': 0, 'name': '계획됨'},
                    'approved': {'count': 0, 'name': '승인됨'},
                    'in_progress': {'count': 0, 'name': '진행중'},
                    'completed': {'count': 0, 'name': '완료됨'},
                    'cancelled': {'count': 0, 'name': '취소됨'}
                }
            
            return statistics
            
        except Exception as e:
            print(f"업그레이드 계획 통계 조회 오류: {e}")
            # 오류 발생 시 안전한 기본값 반환
            return {
                'total_plans': 0,
                'urgent_plans': 0,
                'this_month_plans': 0,
                'budget_efficiency': 0,
                'type_stats': {
                    'replacement': 0,
                    'enhancement': 0,
                    'migration': 0
                },
                'status_stats': {
                    'planned': {'count': 0, 'name': '계획됨'},
                    'approved': {'count': 0, 'name': '승인됨'},
                    'in_progress': {'count': 0, 'name': '진행중'},
                    'completed': {'count': 0, 'name': '완료됨'},
                    'cancelled': {'count': 0, 'name': '취소됨'}
                },
                'budget_stats': {
                    'total_budget': 0,
                    'actual_costs': 0
                },
                'department_stats': {}
            }
    
    def _analyze_spec_improvements(self, current_specs: Dict, target_specs: Dict) -> List[Dict]:
        """
        스펙 개선사항 분석
        
        Args:
            current_specs: 현재 스펙
            target_specs: 목표 스펙
            
        Returns:
            개선사항 목록
        """
        improvements = []
        
        for key in target_specs:
            if key in current_specs:
                current_value = str(current_specs[key])
                target_value = str(target_specs[key])
                
                if current_value != target_value:
                    improvements.append({
                        'spec_name': key,
                        'current_value': current_value,
                        'target_value': target_value,
                        'improvement_type': 'upgrade'
                    })
            else:
                improvements.append({
                    'spec_name': key,
                    'current_value': '없음',
                    'target_value': str(target_specs[key]),
                    'improvement_type': 'addition'
                })
        
        return improvements 