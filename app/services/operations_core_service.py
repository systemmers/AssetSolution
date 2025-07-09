"""
Operations Core Service 모듈
자산 운영 관리 핵심 비즈니스 로직 처리

Classes:
    - OperationsCoreService: 대여, 반납, 폐기 등 핵심 서비스 로직
"""
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, date


class OperationsCoreService:
    """
    자산 운영 관리 핵심 서비스 클래스
    Repository와 Controller 사이의 비즈니스 로직 계층
    """
    
    def __init__(self):
        """Service 초기화 및 Repository 의존성 주입"""
        from ..repositories import operations_repository, asset_repository, notification_repository
        from .operations.allocation_service import AllocationService
        from .operations.loan_service import LoanService
        from .operations.return_service import ReturnService
        from .operations.disposal_service import DisposalService
        from .operations.notification_service import NotificationService
        from .operations.upgrade_service import UpgradeService
        from .operations.lifecycle_service import LifecycleService
        self.operations_repo = operations_repository
        self.asset_repo = asset_repository
        self.notification_repo = notification_repository
        self.allocation_service = AllocationService()
        self.loan_service = LoanService()
        self.return_service = ReturnService()
        self.disposal_service = DisposalService()
        self.notification_service = NotificationService()
        self.upgrade_service = UpgradeService()
        self.lifecycle_service = LifecycleService()
    
    # ==================== 대여 관리 서비스 ====================
    
    def get_loan_list_with_filters(self, page: int = 1, per_page: int = 10, 
                                  status: str = None, user_id: str = None, 
                                  department: str = None) -> Dict:
        """필터링과 페이지네이션을 적용한 대여 목록 조회 (LoanService로 delegate)"""
        return self.loan_service.get_loan_list_with_filters(page, per_page, status, user_id, department)
    
    def get_loan_detail(self, loan_id: int) -> Optional[Dict]:
        """대여 상세 정보 조회 (LoanService로 delegate)"""
        return self.loan_service.get_loan_detail(loan_id)
    
    def validate_loan_request(self, asset_id: int, user_id: int, 
                             expected_return_date: date) -> Tuple[bool, str]:
        """대여 신청 유효성 검증 (LoanService로 delegate)"""
        return self.loan_service.validate_loan_request(asset_id, user_id, expected_return_date)
    
    # ==================== 반납 관리 서비스 ====================
    
    def get_return_history(self) -> List[Dict]:
        """반납 이력 조회 (ReturnService로 delegate)"""
        return self.return_service.get_return_history()
    
    def get_return_approval_stats(self):
        """반납 승인 통계 조회 (ReturnService로 delegate)"""
        return self.return_service.get_return_approval_stats()

    def get_return_workflows(self, status='', department='', urgency='', search=''):
        """반납 워크플로우 목록 조회 (ReturnService로 delegate)"""
        return self.return_service.get_return_workflows(status, department, urgency, search)

    def get_return_workflow_detail(self, workflow_id):
        """반납 워크플로우 상세 정보 조회 (ReturnService로 delegate)"""
        return self.return_service.get_return_workflow_detail(workflow_id)

    def approve_return_workflow(self, workflow_id, approver_id, comments=''):
        """반납 워크플로우 승인 (ReturnService로 delegate)"""
        return self.return_service.approve_return_workflow(workflow_id, approver_id, comments)

    def reject_return_workflow(self, workflow_id, approver_id, reason):
        """반납 워크플로우 거부 (ReturnService로 delegate)"""
        return self.return_service.reject_return_workflow(workflow_id, approver_id, reason)

    def bulk_approve_return_workflows(self, workflow_ids, approver_id, comments=''):
        """반납 워크플로우 일괄 승인 (ReturnService로 delegate)"""
        return self.return_service.bulk_approve_return_workflows(workflow_ids, approver_id, comments)
    
    # ==================== 폐기 관리 서비스 ====================
    
    def get_disposal_list(self) -> List[Dict]:
        """폐기 목록 조회 (DisposalService로 delegate)"""
        return self.disposal_service.get_disposal_list()
    
    def get_disposal_detail(self, disposal_id: int) -> Optional[Dict]:
        """폐기 상세 정보 조회 (DisposalService로 delegate)"""
        return self.disposal_service.get_disposal_detail(disposal_id)
    
    # ==================== 대시보드 및 통계 ====================
    
    def get_operations_dashboard_data(self) -> Dict:
        """
        운영 대시보드 데이터 조회
        
        Returns:
            대시보드에 필요한 종합 통계 정보
        """
        statistics = self.operations_repo.get_operations_statistics()
        
        # 비즈니스 로직: 추가 분석 정보
        monthly_stats = self._calculate_monthly_loan_stats()
        department_stats = self._calculate_department_loan_stats()
        
        dashboard_data = {
            **statistics,
            'monthly_loan_trends': monthly_stats,
            'department_loan_distribution': department_stats,
            'performance_indicators': {
                'avg_loan_period': statistics.get('avg_loan_period', 0),
                'on_time_return_rate': statistics.get('on_time_return_rate', 0),
                'asset_utilization_rate': statistics.get('asset_utilization_rate', 0)
            }
        }
        
        return dashboard_data
    
    def _calculate_monthly_loan_stats(self) -> List[Dict]:
        """월별 대여 통계 계산"""
        # 간단한 월별 집계 (실제로는 더 정교한 로직 필요)
        monthly_data = []
        current_month = datetime.now().month
        
        for i in range(6):  # 최근 6개월
            month = (current_month - i - 1) % 12 + 1
            monthly_data.append({
                'month': f"{month}월",
                'loan_count': 10 + i * 2,  # 샘플 데이터
                'return_count': 8 + i * 2,
                'overdue_count': 1 if i % 2 == 0 else 0
            })
        
        return list(reversed(monthly_data))
    
    def _calculate_department_loan_stats(self) -> Dict:
        """부서별 대여 통계 계산"""
        return {
            'development': {'count': 15, 'percentage': 45},
            'hr': {'count': 8, 'percentage': 24},
            'marketing': {'count': 6, 'percentage': 18},
            'sales': {'count': 4, 'percentage': 13}
        }
    
    # ==================== 유틸리티 메서드 ====================
    
    def get_loan_status_options(self) -> List[Dict]:
        """대여 상태 옵션 목록 반환"""
        return self.operations_repo.get_loan_statuses()

    def get_disposal_reason_options(self) -> List[Dict]:
        """폐기 사유 옵션 목록 반환"""
        return self.operations_repo.get_disposal_reasons()
    
    # ==================== 이력 조회 서비스 ====================
    
    def get_operation_history(self, asset_id: str = None, user_name: str = None, 
                             operation_type: str = None, status: str = None,
                             start_date: str = None, end_date: str = None) -> Dict:
        """
        자산 운영 이력 종합 조회
        
        Args:
            asset_id: 자산 ID 필터
            user_name: 사용자명 필터
            operation_type: 작업 유형 필터
            status: 상태 필터
            start_date: 시작일 필터
            end_date: 종료일 필터
            
        Returns:
            이력 레코드와 통계 정보
        """
        # Mock 데이터 생성 (실제로는 Repository에서 조회)
        history_records = [
            {
                'id': 'H001',
                'operation_date': '2024-12-28 14:30',
                'asset_id': 'AST-001',
                'asset_name': 'Dell 노트북',
                'operation_type': '대여',
                'user_name': '홍길동',
                'user_department': '개발팀',
                'department': 'IT개발팀',
                'status': '완료',
                'notes': '정상 대여 처리'
            },
            {
                'id': 'H002',
                'operation_date': '2024-12-27 10:15',
                'asset_id': 'AST-003',
                'asset_name': 'HP 프린터',
                'operation_type': '반납',
                'user_name': '김영수',
                'user_department': '마케팅팀',
                'department': '마케팅팀',
                'status': '완료',
                'notes': '정상 작동 확인'
            },
            {
                'id': 'H003',
                'operation_date': '2024-12-26 16:45',
                'asset_id': 'AST-007',
                'asset_name': '모니터',
                'operation_type': '수리',
                'user_name': '박민수',
                'user_department': 'IT팀',
                'department': 'IT지원팀',
                'status': '진행중',
                'notes': '화면 깜빡임 문제'
            },
            {
                'id': 'H004',
                'operation_date': '2024-12-25 09:00',
                'asset_id': 'AST-010',
                'asset_name': '구형 PC',
                'operation_type': '폐기',
                'user_name': '관리자',
                'user_department': 'IT팀',
                'department': 'IT지원팀',
                'status': '승인대기',
                'notes': '내용연수 만료'
            },
            {
                'id': 'H005',
                'operation_date': '2024-12-24 15:20',
                'asset_id': 'AST-005',
                'asset_name': 'iPad',
                'operation_type': '이관',
                'user_name': '이철수',
                'user_department': '영업팀',
                'department': '영업팀',
                'status': '완료',
                'notes': '부서 이동에 따른 이관'
            }
        ]
        
        # 필터링 로직 적용
        filtered_records = history_records
        
        if asset_id:
            filtered_records = [r for r in filtered_records 
                              if asset_id.lower() in r['asset_id'].lower() or 
                                 asset_id.lower() in r['asset_name'].lower()]
        
        if user_name:
            filtered_records = [r for r in filtered_records 
                              if user_name.lower() in r['user_name'].lower() or 
                                 user_name.lower() in r['department'].lower()]
        
        if operation_type:
            filtered_records = [r for r in filtered_records 
                              if r['operation_type'] == operation_type]
        
        if status:
            filtered_records = [r for r in filtered_records 
                              if r['status'] == status]
        
        # 통계 계산
        stats = {
            'total_records': len(filtered_records),
            'completed_records': len([r for r in filtered_records if r['status'] == '완료']),
            'in_progress_records': len([r for r in filtered_records if r['status'] == '진행중']),
            'problem_records': len([r for r in filtered_records if r['status'] in ['지연', '승인대기', '문제']])
        }
        
        return {
            'records': filtered_records,
            'stats': stats
        }
    
    # ==================== 통계 및 보고서 서비스 ====================
    
    def get_operations_statistics(self) -> Dict:
        """
        운영 통계 종합 데이터 조회
        
        Returns:
            통계 데이터와 차트 정보
        """
        # Mock 데이터 생성 (실제로는 Repository에서 조회)
        return {
            'summary_stats': {
                'monthly_loans': 145,
                'monthly_returns': 132,
                'overdue_returns': 23,
                'average_utilization_rate': 78.5,
                'monthly_loan_growth': 12,
                'monthly_return_growth': 8,
                'overdue_change': 5,
                'utilization_growth': 2.3
            },
            'monthly_trends': [
                {'month': '7월', 'loans': 120, 'returns': 115, 'overdue': 18},
                {'month': '8월', 'loans': 135, 'returns': 128, 'overdue': 20},
                {'month': '9월', 'loans': 142, 'returns': 140, 'overdue': 15},
                {'month': '10월', 'loans': 138, 'returns': 135, 'overdue': 22},
                {'month': '11월', 'loans': 129, 'returns': 125, 'overdue': 18},
                {'month': '12월', 'loans': 145, 'returns': 132, 'overdue': 23}
            ],
            'department_utilization': [
                {'department': 'IT개발팀', 'value': 35, 'color': '#007bff'},
                {'department': '마케팅팀', 'value': 25, 'color': '#28a745'},
                {'department': '영업팀', 'value': 22, 'color': '#17a2b8'},
                {'department': '기타', 'value': 18, 'color': '#ffc107'}
            ],
            'asset_utilization_top10': [
                {'asset_name': 'Dell 노트북 (AST-001)', 'loan_count': 24, 'utilization_rate': 92, 'avg_loan_period': 12},
                {'asset_name': 'iPad Pro (AST-005)', 'loan_count': 18, 'utilization_rate': 85, 'avg_loan_period': 8},
                {'asset_name': 'HP 프린터 (AST-003)', 'loan_count': 16, 'utilization_rate': 78, 'avg_loan_period': 5},
                {'asset_name': '삼성 모니터 (AST-007)', 'loan_count': 14, 'utilization_rate': 72, 'avg_loan_period': 15},
                {'asset_name': '무선 마우스 (AST-012)', 'loan_count': 12, 'utilization_rate': 65, 'avg_loan_period': 3}
            ],
            'user_activity_top10': [
                {'user_name': '홍길동', 'department': 'IT개발팀', 'loan_count': 28, 'reliability': 'A급'},
                {'user_name': '김영수', 'department': '마케팅팀', 'loan_count': 22, 'reliability': 'A급'},
                {'user_name': '박민수', 'department': 'IT지원팀', 'loan_count': 19, 'reliability': 'B급'},
                {'user_name': '이철수', 'department': '영업팀', 'loan_count': 15, 'reliability': 'C급'},
                {'user_name': '정미경', 'department': '인사팀', 'loan_count': 12, 'reliability': 'A급'}
            ]
        }
    
    def generate_operations_report(self, report_type: str, start_date: str = None, 
                                  end_date: str = None, include_sections: List[str] = None) -> Dict:
        """
        운영 보고서 생성
        
        Args:
            report_type: 보고서 유형 (monthly, quarterly, yearly, custom)
            start_date: 시작일
            end_date: 종료일
            include_sections: 포함할 섹션 목록
            
        Returns:
            생성된 보고서 정보
        """
        import uuid
        
        # 보고서 ID 생성
        report_id = str(uuid.uuid4())
        
        # 실제로는 데이터베이스에 저장하거나 파일로 생성
        # 여기서는 Mock 응답
        return {
            'report_id': report_id,
            'status': 'generated',
            'download_ready': True
        }
    
    def export_report(self, report_id: str, format_type: str) -> str:
        """
        보고서 파일 내보내기
        
        Args:
            report_id: 보고서 ID
            format_type: 파일 형식 (excel, pdf)
            
        Returns:
            파일 경로
        """
        import os
        from pathlib import Path
        
        # 실제 구현에서는 실제 파일 생성 로직 필요
        temp_dir = Path("temp_reports")
        temp_dir.mkdir(exist_ok=True)
        
        if format_type == 'excel':
            file_path = temp_dir / f"operations_report_{report_id}.xlsx"
        elif format_type == 'pdf':
            file_path = temp_dir / f"operations_report_{report_id}.pdf"
        else:
            raise ValueError("Unsupported format type")
        
        # Mock 파일 생성
        file_path.touch()
        
        return str(file_path)

    def get_disposal_planning_data(self) -> List[Dict]:
        """
        처분 계획 데이터 조회 (Repository에서 데이터 가져오기)
        
        Returns:
            처분 계획 목록
        """
        # Repository에서 폐기 계획 데이터 조회
        disposal_plans = self.operations_repo.get_all_disposal_plans()
        
        # 날짜 포맷팅 (JavaScript에서 사용하기 위해)
        # 안전한 날짜 포맷팅 처리
        for plan in disposal_plans:
            # planned_date 안전 처리
            if plan.get('planned_date'):
                if hasattr(plan['planned_date'], 'strftime'):
                    # date 객체는 그대로 유지 (템플릿에서 타입 체크)
                    pass
                elif isinstance(plan['planned_date'], str):
                    # 이미 문자열인 경우 그대로 유지
                    pass
                else:
                    # 기타 타입인 경우 문자열로 변환
                    plan['planned_date'] = str(plan['planned_date'])
            
            # approved_date 안전 처리
            if plan.get('approved_date'):
                if hasattr(plan['approved_date'], 'strftime'):
                    # date 객체는 그대로 유지
                    pass
                elif isinstance(plan['approved_date'], str):
                    # 이미 문자열인 경우 그대로 유지
                    pass
                else:
                    plan['approved_date'] = str(plan['approved_date'])
            
            # created_at 처리
            if plan.get('created_at'):
                if hasattr(plan['created_at'], 'strftime'):
                    plan['created_at'] = plan['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                elif isinstance(plan['created_at'], str):
                    # 이미 문자열인 경우 그대로 유지
                    pass
                else:
                    plan['created_at'] = str(plan['created_at'])
        
        return disposal_plans

    def get_disposal_planning_data_by_status(self, status: str = None, page: int = 1, per_page: int = 10) -> Dict:
        """
        상태별 폐기 계획 데이터 조회 (페이지네이션 포함)
        
        Args:
            status: 상태 필터 (pending, approved, scheduled, completed)
            page: 페이지 번호
            per_page: 페이지당 항목 수
            
        Returns:
            폐기 계획 목록과 페이지네이션 정보
        """
        # Repository에서 상태별 데이터 조회
        disposal_plans, current_page, total_pages, total_items = self.operations_repo.get_disposal_plans_with_pagination(
            page=page,
            per_page=per_page,
            status=status
        )
        
        # 날짜 포맷팅 (JavaScript에서 사용하기 위해)
        for plan in disposal_plans:
            if plan.get('planned_date'):
                # date 객체를 문자열로 변환
                if hasattr(plan['planned_date'], 'strftime'):
                    plan['planned_date'] = plan['planned_date'].strftime('%Y-%m-%d')
            if plan.get('approved_date'):
                # date 객체를 문자열로 변환
                if hasattr(plan['approved_date'], 'strftime'):
                    plan['approved_date'] = plan['approved_date'].strftime('%Y-%m-%d')
            if plan.get('created_at'):
                # datetime 객체를 문자열로 변환
                if hasattr(plan['created_at'], 'strftime'):
                    plan['created_at'] = plan['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        
        # JavaScript 호환을 위해 camelCase로 변환
        converted_plans = []
        for plan in disposal_plans:
            converted_plan = {
                'id': plan['id'],
                'assetName': plan['asset_name'],
                'assetCode': plan['asset_number'],
                'assetId': plan['asset_id'],
                'disposalType': plan['disposal_type'],
                'plannedDate': plan['planned_date'],
                'estimatedValue': plan['estimated_value'],
                'status': plan['status'],
                'progress': plan['progress_percentage'],
                'reason': plan['reason'],
                'description': plan['description'],
                'approver': plan['approver'],
                'approvedDate': plan['approved_date'],
                'requester': plan['created_by'],
                'requestDate': plan['created_at'],
                'department': plan['department'],
                'currentLocation': '본사 1층',  # 임시 위치 정보
                'priority': 'normal'  # 임시 우선순위
            }
            converted_plans.append(converted_plan)
        
        return {
            'data': converted_plans,  # JavaScript에서 data.data로 접근할 수 있도록 'data'로 변경
            'pagination': {
                'current_page': current_page,
                'total_pages': total_pages,
                'total': total_items,  # total_items -> total로 변경 (JavaScript 호환)
                'per_page': per_page,
                'has_prev': current_page > 1,
                'has_next': current_page < total_pages
            }
        }

    def get_disposal_planning_statistics(self) -> Dict:
        """
        폐기 계획 통계 정보 조회
        
        Returns:
            폐기 계획 통계 정보
        """
        return self.operations_repo.get_disposal_planning_statistics()

    def get_allocation_requests_data(self) -> List[Dict]:
        """지급 요청 목록 데이터 조회 (AllocationService로 delegate)"""
        return self.allocation_service.get_allocation_requests_data() 

    # ==================== 대여 관리 메서드 (신규 추가) ====================
    
    def get_loans_data(self, status: str = None, department: str = None, 
                      user_name: str = None, page: int = 1, per_page: int = 10) -> Dict[str, Any]:
        """
        대여 목록 데이터 조회 (페이지네이션 포함)
        
        Args:
            status: 대여 상태 필터
            department: 부서 필터
            user_name: 사용자명 필터
            page: 페이지 번호
            per_page: 페이지당 항목 수
        
        Returns:
            대여 목록과 페이지네이션 정보
        """
        try:
            # Repository에서 페이지네이션된 대여 목록 조회
            loans, current_page, total_pages, total_items = self.operations_repo.get_loans_with_pagination(
                page=page,
                per_page=per_page,
                status=status,
                department=department
            )
            
            # 사용자명 필터링 (Repository에서 지원하지 않으므로 Service에서 처리)
            if user_name:
                loans = [loan for loan in loans if user_name.lower() in loan.get('user_name', '').lower()]
            
            # JavaScript 호환 형태로 변환
            converted_loans = []
            for loan in loans:
                # 상태를 영문에서 한글로 변환
                status_mapping = {
                    '대여중': 'active',
                    '반납 완료': 'returned', 
                    '반납 지연': 'overdue',
                    '승인 대기': 'pending'
                }
                
                converted_loan = {
                    'id': loan['id'],
                    'asset_name': loan['asset_name'],
                    'user_name': loan['user_name'],
                    'department': loan['department'],
                    'start_date': loan['loan_date'].strftime('%Y-%m-%d') if hasattr(loan['loan_date'], 'strftime') else str(loan['loan_date']),
                    'end_date': loan['expected_return_date'].strftime('%Y-%m-%d') if hasattr(loan['expected_return_date'], 'strftime') else str(loan['expected_return_date']),
                    'status': status_mapping.get(loan['status'], loan['status']),
                    'purpose': loan.get('remarks', ''),
                    'asset_number': loan.get('asset_number', ''),
                    'actual_return_date': loan['actual_return_date'].strftime('%Y-%m-%d') if loan.get('actual_return_date') and hasattr(loan['actual_return_date'], 'strftime') else None
                }
                converted_loans.append(converted_loan)
            
            return {
                'loans': converted_loans,
                'pagination': {
                    'current_page': current_page,
                    'total_pages': total_pages,
                    'total_items': total_items,
                    'per_page': per_page,
                    'has_prev': current_page > 1,
                    'has_next': current_page < total_pages
                }
            }
            
        except Exception as e:
            print(f"대여 목록 조회 중 오류: {str(e)}")
            return {
                'loans': [],
                'pagination': {
                    'current_page': 1,
                    'total_pages': 1,
                    'total_items': 0,
                    'per_page': per_page,
                    'has_prev': False,
                    'has_next': False
                }
            }
    
    def get_loan_detail(self, loan_id: int) -> Optional[Dict[str, Any]]:
        """
        대여 상세 정보 조회
        
        Args:
            loan_id: 대여 ID
            
        Returns:
            대여 상세 정보 또는 None
        """
        try:
            # Repository에서 대여 정보 조회
            loan = self.operations_repo.get_loan_by_id(loan_id)
            
            if not loan:
                return None
            
            # JavaScript 호환 형태로 변환하여 반환
            return {
                'id': loan['id'],
                'asset_id': loan['asset_id'],
                'asset_name': loan['asset_name'],
                'asset_number': loan['asset_number'],
                'user_id': loan['user_id'],
                'user_name': loan['user_name'],
                'department': loan['department'],
                'loan_date': loan['loan_date'].strftime('%Y-%m-%d') if hasattr(loan['loan_date'], 'strftime') else str(loan['loan_date']),
                'expected_return_date': loan['expected_return_date'].strftime('%Y-%m-%d') if hasattr(loan['expected_return_date'], 'strftime') else str(loan['expected_return_date']),
                'actual_return_date': loan['actual_return_date'].strftime('%Y-%m-%d') if loan.get('actual_return_date') and hasattr(loan['actual_return_date'], 'strftime') else None,
                'status': loan['status'],
                'remarks': loan.get('remarks', ''),
                'created_by': loan.get('created_by'),
                'created_at': loan['created_at'].strftime('%Y-%m-%d %H:%M:%S') if hasattr(loan['created_at'], 'strftime') else str(loan['created_at'])
            }
            
        except Exception as e:
            print(f"대여 상세 정보 조회 중 오류: {str(e)}")
            return None
    
    def get_loan_statistics(self) -> Dict[str, Any]:
        """
        대여 통계 정보 조회
        
        Returns:
            대여 통계 정보
        """
        try:
            # Repository에서 전체 대여 목록 조회
            all_loans = self.operations_repo.get_all_loans()
            
            # 상태별 통계 계산
            active_count = len([l for l in all_loans if l['status'] == '대여중'])
            returned_count = len([l for l in all_loans if l['status'] == '반납 완료'])
            overdue_count = len([l for l in all_loans if l['status'] == '반납 지연'])
            pending_count = len([l for l in all_loans if l['status'] == '승인 대기'])
            
            # 부서별 통계
            department_stats = {}
            for loan in all_loans:
                dept = loan.get('department', '기타')
                department_stats[dept] = department_stats.get(dept, 0) + 1
            
            # 월별 대여 통계 (간단히 현재 월 기준)
            from datetime import datetime
            current_month_loans = [l for l in all_loans 
                                 if hasattr(l['loan_date'], 'month') and l['loan_date'].month == datetime.now().month]
            
            return {
                'total_loans': len(all_loans),
                'active_loans': active_count,
                'returned_loans': returned_count,
                'overdue_loans': overdue_count,
                'pending_loans': pending_count,
                'department_stats': department_stats,
                'current_month_loans': len(current_month_loans),
                'return_rate': round((returned_count / len(all_loans) * 100), 1) if all_loans else 0,
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"대여 통계 조회 중 오류: {str(e)}")
            return {
                'total_loans': 0,
                'active_loans': 0,
                'returned_loans': 0,
                'overdue_loans': 0,
                'pending_loans': 0,
                'department_stats': {},
                'current_month_loans': 0,
                'return_rate': 0,
                'last_updated': datetime.now().isoformat()
            }

    # ==================== 반납 관리 메서드 (신규 추가) ====================
    
    def get_active_loans_data(self, asset_code: str = None, asset_name: str = None, 
                             borrower: str = None, department: str = None) -> List[Dict[str, Any]]:
        """
        현재 대여 중인 자산 목록 조회 (반납용)
        
        Args:
            asset_code: 자산 코드 필터
            asset_name: 자산명 필터
            borrower: 대여자 필터
            department: 부서 필터
            
        Returns:
            현재 대여 중인 자산 목록 (JavaScript 호환 형태)
        """
        try:
            # Repository에서 대여 중인 자산들만 조회
            active_loans = self.operations_repo.get_all_loans(status='대여중')
            
            # 필터링 적용
            if asset_code:
                active_loans = [loan for loan in active_loans if asset_code.lower() in loan.get('asset_number', '').lower()]
            
            if asset_name:
                active_loans = [loan for loan in active_loans if asset_name.lower() in loan.get('asset_name', '').lower()]
            
            if borrower:
                active_loans = [loan for loan in active_loans if borrower.lower() in loan.get('user_name', '').lower()]
            
            if department:
                active_loans = [loan for loan in active_loans if department.lower() in loan.get('department', '').lower()]
            
            # JavaScript 호환 형태로 변환 (return_form.js에 맞는 필드명)
            converted_loans = []
            for loan in active_loans:
                converted_loan = {
                    'id': loan['id'],
                    'assetCode': loan.get('asset_number', ''),
                    'assetName': loan['asset_name'],
                    'borrower': loan['user_name'],
                    'department': loan['department'],
                    'loanDate': loan['loan_date'].strftime('%Y-%m-%d') if hasattr(loan['loan_date'], 'strftime') else str(loan['loan_date']),
                    'dueDate': loan['expected_return_date'].strftime('%Y-%m-%d') if hasattr(loan['expected_return_date'], 'strftime') else str(loan['expected_return_date']),
                    'image': '/static/img/assets/default-asset.jpg'  # 기본 이미지 설정
                }
                converted_loans.append(converted_loan)
            
            return converted_loans
            
        except Exception as e:
            print(f"대여 중인 자산 목록 조회 중 오류: {str(e)}")
            return []

    # ===========================================
    # 새로 추가된 API 지원 메서드들
    # ===========================================

    def search_assets(self, search_query='', category_id=None, status=None, location=None):
        """자산 검색 서비스 (Repository 호출)"""
        try:
            return self.asset_repo.search_assets_for_operations(
                search_query=search_query,
                category_id=category_id,
                status=status,
                location=location
            )
        except Exception as e:
            print(f"자산 검색 오류: {e}")
            raise

    def submit_disposal_request(self, asset_id, disposal_reason, disposal_type, 
                               estimated_value=None, disposal_date=None, notes='', 
                               attachments=None, requester_id=None):
        """폐기 신청 서비스"""
        try:
            # 자산 존재 확인 (실제로는 Repository에서 확인)
            if not self._validate_asset_exists(asset_id):
                return {
                    'success': False,
                    'message': '해당 자산을 찾을 수 없습니다.'
                }
            
            # 폐기 가능 상태 확인
            if not self._validate_disposal_eligibility(asset_id):
                return {
                    'success': False,
                    'message': '현재 대여중인 자산은 폐기 신청할 수 없습니다.'
                }
            
            # 새 폐기 신청 ID 생성 (실제로는 DB에서 자동 생성)
            disposal_id = f"DISP-{datetime.now().strftime('%Y%m%d')}-{len(self.operations_repo.disposals) + 1:03d}"
            
            # 폐기 신청 데이터 생성
            disposal_request = {
                'id': disposal_id,
                'asset_id': asset_id,
                'requester_id': requester_id,
                'disposal_reason': disposal_reason,
                'disposal_type': disposal_type,
                'estimated_value': estimated_value,
                'disposal_date': disposal_date,
                'notes': notes,
                'attachments': attachments or [],
                'status': 'pending',
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            # 실제로는 Repository를 통해 DB에 저장
            # self.operations_repo.create_disposal_request(disposal_request)
            
            return {
                'success': True,
                'disposal_id': disposal_id,
                'message': '폐기 신청이 성공적으로 제출되었습니다.'
            }
            
        except Exception as e:
            print(f"폐기 신청 오류: {e}")
            return {
                'success': False,
                'message': f'폐기 신청 처리 중 오류가 발생했습니다: {str(e)}'
            }

    def _validate_asset_exists(self, asset_id):
        """자산 존재 확인"""
        # 실제로는 Repository에서 확인
        return True  # 임시로 항상 True 반환

    def _validate_disposal_eligibility(self, asset_id):
        """폐기 가능 상태 확인"""
        # 실제로는 Repository에서 대여 상태 확인
        active_loans = [l for l in self.operations_repo.loans 
                       if l['asset_id'] == asset_id and l['status_id'] == 3]
        return len(active_loans) == 0

    def get_return_workflows_detailed(self, include_timeline=False, include_comments=False):
        """상세한 반납 워크플로우 목록 조회"""
        try:
            raw_workflows = self.get_return_workflows()
            
            # JavaScript 호환 형태로 변환
            converted_workflows = []
            for workflow in raw_workflows:
                converted_workflow = {
                    'id': workflow['id'],
                    'assetName': workflow['asset_name'],
                    'assetCode': workflow['asset_code'], 
                    'requester': workflow['requester_name'],
                    'department': workflow['department'],
                    'status': workflow['current_step'],  # current_step → status
                    'urgency': workflow['urgency'],
                    'progress': workflow['progress'],
                    'comments': workflow['comments'],
                    'requestDate': workflow['request_date'],  # 문자열 그대로 (JS에서 변환)
                    'currentApprover': workflow['assigned_approver_name'],
                    'reason': workflow.get('comments', ''),
                    # 타임라인과 댓글 추가
                    'timeline': self._get_workflow_timeline(workflow['id']) if include_timeline else [],
                    'comments_list': self._get_workflow_comments(workflow['id']) if include_comments else []
                }
                converted_workflows.append(converted_workflow)
            
            return converted_workflows
            
        except Exception as e:
            print(f"상세 워크플로우 목록 조회 오류: {e}")
            raise

    def _get_workflow_timeline(self, workflow_id):
        """워크플로우 타임라인 조회"""
        return [
            {
                'step': 'requested',
                'timestamp': '2024-12-15T09:00:00Z',
                'actor': '김개발',
                'action': '반납 요청 제출'
            },
            {
                'step': 'dept_approval',
                'timestamp': '2024-12-15T09:05:00Z',
                'actor': 'System',
                'action': '부서장 승인 대기 상태로 변경'
            }
        ]

    def _get_workflow_comments(self, workflow_id):
        """워크플로우 댓글 조회"""
        return [
            {
                'id': 1,
                'author': '김개발',
                'content': '업무 완료로 인한 반납 요청입니다.',
                'timestamp': '2024-12-15T09:00:00Z'
            }
        ]

    def get_dashboard_statistics(self):
        """대시보드 통계 데이터 조회"""
        try:
            return {
                'total_assets': 150,
                'available_assets': 89,
                'on_loan_assets': 45,
                'maintenance_assets': 12,
                'disposal_pending': 4,
                'total_loans_this_month': 23,
                'total_returns_this_month': 18,
                'overdue_returns': 3,
                'approval_pending': 7,
                'monthly_trends': {
                    'loans': [15, 18, 23, 19, 21, 23],
                    'returns': [12, 16, 18, 17, 19, 18],
                    'months': ['7월', '8월', '9월', '10월', '11월', '12월']
                },
                'department_usage': {
                    '개발팀': 35,
                    '마케팅팀': 28,
                    '디자인팀': 22,
                    '영업팀': 15
                }
            }
        except Exception as e:
            print(f"대시보드 통계 조회 오류: {e}")
            raise

    def get_dashboard_notifications(self):
        """대시보드 알림 데이터 조회"""
        try:
            return {
                'urgent_notifications': [
                    {
                        'id': 1,
                        'type': 'overdue',
                        'title': '연체된 반납 3건',
                        'message': '반납 예정일이 지난 자산이 3건 있습니다.',
                        'timestamp': '2024-12-21T10:30:00Z',
                        'priority': 'high'
                    },
                    {
                        'id': 2,
                        'type': 'approval',
                        'title': '승인 대기 7건',
                        'message': '반납 승인 대기중인 요청이 7건 있습니다.',
                        'timestamp': '2024-12-21T09:15:00Z',
                        'priority': 'medium'
                    }
                ],
                'recent_activities': [
                    {
                        'id': 1,
                        'type': 'loan',
                        'description': '김개발님이 노트북을 대여했습니다.',
                        'timestamp': '2024-12-21T11:00:00Z'
                    },
                    {
                        'id': 2,
                        'type': 'return',
                        'description': '이마케팅님이 프로젝터를 반납했습니다.',
                        'timestamp': '2024-12-21T10:45:00Z'
                    }
                ],
                'system_alerts': [
                    {
                        'id': 1,
                        'type': 'maintenance',
                        'message': '시스템 정기 점검이 예정되어 있습니다.',
                        'scheduled_date': '2024-12-25T02:00:00Z'
                    }
                ]
            }
        except Exception as e:
            print(f"대시보드 알림 조회 오류: {e}")
            raise

    def get_dashboard_chart_data(self):
        """대시보드 차트 데이터 조회"""
        try:
            return {
                'asset_status_chart': {
                    'labels': ['사용가능', '대여중', '점검중', '폐기대기'],
                    'data': [89, 45, 12, 4]
                },
                'monthly_usage_chart': {
                    'labels': ['7월', '8월', '9월', '10월', '11월', '12월'],
                    'datasets': [
                        {
                            'label': '대여',
                            'data': [15, 18, 23, 19, 21, 23],
                            'backgroundColor': 'rgba(54, 162, 235, 0.2)',
                            'borderColor': 'rgba(54, 162, 235, 1)'
                        },
                        {
                            'label': '반납',
                            'data': [12, 16, 18, 17, 19, 18],
                            'backgroundColor': 'rgba(75, 192, 192, 0.2)',
                            'borderColor': 'rgba(75, 192, 192, 1)'
                        }
                    ]
                },
                'department_usage_chart': {
                    'labels': ['개발팀', '마케팅팀', '디자인팀', '영업팀'],
                    'data': [35, 28, 22, 15]
                },
                'performance_metrics': {
                    'on_time_return_rate': 87,
                    'asset_utilization_rate': 73,
                    'approval_efficiency': 92
                }
            }
        except Exception as e:
            print(f"대시보드 차트 데이터 조회 오류: {e}")
            raise

    # ===========================================
    # 알림 관리 메서드들
    # ===========================================

    def get_return_notifications(self, include_read=True, include_pending=True, limit=100):
        """반납 알림 목록 조회 (NotificationService로 delegate)"""
        return self.notification_service.get_return_notifications(include_read, include_pending, limit)

    def get_notification_rules(self):
        """알림 규칙 목록 조회 (NotificationService로 delegate)"""
        return self.notification_service.get_notification_rules()

    def get_notification_templates(self):
        """알림 템플릿 목록 조회 (NotificationService로 delegate)"""
        return self.notification_service.get_notification_templates()

    def mark_notification_read(self, notification_id):
        """알림 읽음 처리 (NotificationService로 delegate)"""
        return self.notification_service.mark_notification_read(notification_id)

    def delete_notification(self, notification_id):
        """알림 삭제 (NotificationService로 delegate)"""
        return self.notification_service.delete_notification(notification_id)

    def create_notification_rule(self, rule_data):
        """알림 규칙 생성 (NotificationService로 delegate)"""
        return self.notification_service.create_notification_rule(rule_data)

    def update_notification_rule(self, rule_id, rule_data):
        """알림 규칙 수정 (NotificationService로 delegate)"""
        return self.notification_service.update_notification_rule(rule_id, rule_data)

    def create_notification_template(self, template_data):
        """알림 템플릿 생성 (NotificationService로 delegate)"""
        return self.notification_service.create_notification_template(template_data)

    def update_notification_template(self, template_id, template_data):
        """알림 템플릿 수정 (NotificationService로 delegate)"""
        return self.notification_service.update_notification_template(template_id, template_data)

    # ==================== 업그레이드 관리 서비스 ====================
    
    def get_upgrade_management_data(self, page: int = 1, per_page: int = 10, 
                                  status: str = None, upgrade_type: str = None, 
                                  department: str = None) -> Dict:
        """업그레이드 관리 데이터 조회 (UpgradeService로 delegate)"""
        return self.upgrade_service.get_upgrade_management_data(page, per_page, status, upgrade_type, department)
    
    def get_upgrade_plan_details(self, plan_id: int) -> Optional[Dict]:
        """업그레이드 계획 상세 정보 조회 (UpgradeService로 delegate)"""
        return self.upgrade_service.get_upgrade_plan_details(plan_id)
    
    def get_upgrade_plans_statistics(self) -> Dict:
        """업그레이드 계획 통계 정보 조회 (UpgradeService로 delegate)"""
        return self.upgrade_service.get_upgrade_plans_statistics()
    

    
    # ==================== 생명주기 추적 서비스 ====================
    
    def get_lifecycle_tracking_data(self, page: int = 1, per_page: int = 10,
                                  asset_id: int = None, event_type: str = None,
                                  department: str = None, start_date: str = None,
                                  end_date: str = None) -> Dict:
        """생명주기 추적 데이터 조회 (LifecycleService로 delegate)"""
        return self.lifecycle_service.get_lifecycle_tracking_data(page, per_page, asset_id, event_type, department, start_date, end_date)
    
    def get_asset_lifecycle_timeline(self, asset_id: int) -> Dict:
        """자산 생명주기 타임라인 조회 (LifecycleService로 delegate)"""
        return self.lifecycle_service.get_asset_lifecycle_timeline(asset_id)
    
    def get_lifecycle_statistics(self) -> Dict:
        """생명주기 통계 정보 조회 (LifecycleService로 delegate)"""
        return self.lifecycle_service.get_lifecycle_statistics()
    


    def get_lifecycle_event_details(self, event_id: int) -> Optional[Dict]:
        """생명주기 이벤트 상세 정보 조회 (LifecycleService로 delegate)"""
        return self.lifecycle_service.get_lifecycle_event_details(event_id)


# 전역 서비스 인스턴스 생성
operations_core_service = OperationsCoreService()
