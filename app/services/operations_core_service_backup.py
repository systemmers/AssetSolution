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
        self.operations_repo = operations_repository
        self.asset_repo = asset_repository
        self.notification_repo = notification_repository
    
    # ==================== 대여 관리 서비스 ====================
    
    def get_loan_list_with_filters(self, page: int = 1, per_page: int = 10, 
                                  status: str = None, user_id: str = None, 
                                  department: str = None) -> Dict:
        """
        필터링과 페이지네이션을 적용한 대여 목록 조회
        
        Args:
            page: 페이지 번호
            per_page: 페이지당 항목 수
            status: 대여 상태 필터
            user_id: 사용자 ID 필터 (문자열)
            department: 부서 필터
            
        Returns:
            대여 목록과 페이지네이션 정보가 포함된 딕셔너리
        """
        # 사용자 ID 변환 처리
        user_id_int = None
        if user_id:
            try:
                user_id_int = int(user_id)
            except (ValueError, TypeError):
                user_id_int = None
        
        # Repository에서 데이터 조회
        loans, current_page, total_pages, total_items = self.operations_repo.get_loans_with_pagination(
            page=page,
            per_page=per_page,
            status=status if status else None,
            user_id=user_id_int,
            department=department if department else None
        )
        
        # 비즈니스 로직: 연체 상태 확인 및 업데이트
        current_date = datetime.utcnow().date()
        for loan in loans:
            if (loan['status_id'] == 3 and  # 대여중인 상태
                loan['expected_return_date'] and 
                loan['expected_return_date'] < current_date):
                loan['is_overdue'] = True
                loan['overdue_days'] = (current_date - loan['expected_return_date']).days
            else:
                loan['is_overdue'] = False
                loan['overdue_days'] = 0
        
        return {
            'loans': loans,
            'pagination': {
                'current_page': current_page,
                'total_pages': total_pages,
                'total_items': total_items,
                'per_page': per_page,
                'has_prev': current_page > 1,
                'has_next': current_page < total_pages
            },
            'current_date': current_date
        }
    
    def get_loan_detail(self, loan_id: int) -> Optional[Dict]:
        """
        대여 상세 정보 조회 (비즈니스 로직 적용)
        
        Args:
            loan_id: 대여 ID
            
        Returns:
            대여 상세 정보 또는 None
        """
        loan = self.operations_repo.get_loan_by_id(loan_id)
        
        if loan:
            # 비즈니스 로직: 추가 정보 계산
            current_date = datetime.utcnow().date()
            
            # 연체 정보 계산
            if (loan['status_id'] == 3 and  # 대여중
                loan['expected_return_date'] and 
                loan['expected_return_date'] < current_date):
                loan['is_overdue'] = True
                loan['overdue_days'] = (current_date - loan['expected_return_date']).days
            else:
                loan['is_overdue'] = False
                loan['overdue_days'] = 0
            
            # 대여 기간 계산
            if loan['loan_date']:
                if loan['actual_return_date']:
                    loan['actual_loan_period'] = (loan['actual_return_date'] - loan['loan_date']).days
                else:
                    loan['current_loan_period'] = (current_date - loan['loan_date']).days
                
                if loan['expected_return_date']:
                    loan['expected_loan_period'] = (loan['expected_return_date'] - loan['loan_date']).days
        
        return loan
    
    def validate_loan_request(self, asset_id: int, user_id: int, 
                             expected_return_date: date) -> Tuple[bool, str]:
        """
        대여 신청 유효성 검증
        
        Args:
            asset_id: 자산 ID
            user_id: 사용자 ID
            expected_return_date: 예상 반납일
            
        Returns:
            (유효성 여부, 메시지)
        """
        # 날짜 유효성 검증
        if expected_return_date <= datetime.utcnow().date():
            return False, "반납 예정일은 오늘보다 이후여야 합니다"
        
        # 자산 중복 대여 검증
        active_loans = [l for l in self.operations_repo.loans 
                       if l['asset_id'] == asset_id and l['status_id'] == 3]
        if active_loans:
            return False, "해당 자산은 이미 대여중입니다"
        
        # 사용자 대여 한도 검증 (1인 최대 5개)
        user_active_loans = [l for l in self.operations_repo.loans 
                           if l['user_id'] == user_id and l['status_id'] == 3]
        if len(user_active_loans) >= 5:
            return False, "사용자당 최대 5개까지 대여가능합니다."
        
        return True, "대여가능합니다."
    
    # ==================== 반납 관리 서비스 ====================
    
    def get_return_history(self) -> List[Dict]:
        """
        반납 이력 조회 (비즈니스 로직 적용)
        
        Returns:
            반납 이력 목록 (추가 정보 포함)
        """
        returns = self.operations_repo.get_returned_loans()
        
        # 비즈니스 로직: 반납 성과 정보 추가
        for return_item in returns:
            if (return_item['loan_date'] and 
                return_item['actual_return_date'] and 
                return_item['expected_return_date']):
                
                # 실제 대여 기간
                actual_period = (return_item['actual_return_date'] - return_item['loan_date']).days
                return_item['actual_loan_period'] = actual_period
                
                # 예정 대여 기간
                expected_period = (return_item['expected_return_date'] - return_item['loan_date']).days
                return_item['expected_loan_period'] = expected_period
                
                # 조기/연체 반납 여부
                if return_item['actual_return_date'] < return_item['expected_return_date']:
                    return_item['return_status'] = 'early'
                    return_item['return_diff_days'] = (return_item['expected_return_date'] - return_item['actual_return_date']).days
                elif return_item['actual_return_date'] > return_item['expected_return_date']:
                    return_item['return_status'] = 'late'
                    return_item['return_diff_days'] = (return_item['actual_return_date'] - return_item['expected_return_date']).days
                else:
                    return_item['return_status'] = 'on_time'
                    return_item['return_diff_days'] = 0
        
        return returns
    
    def get_return_approval_stats(self):
        """반납 승인 통계 조회"""
        try:
            # 실제 구현에서는 데이터베이스에서 조회
            return {
                'total_pending': 4,
                'dept_approval': 2,
                'asset_manager_approval': 1,
                'final_approval': 1,
                'today_processed': 5,
                'overdue': 1,
                'avg_processing_time': 24  # 시간
            }
        except Exception as e:
            print(f"반납 승인 통계 조회 오류: {e}")
            raise

    def get_return_workflows(self, status='', department='', urgency='', search=''):
        """반납 워크플로우 목록 조회"""
        try:
            # 모의 워크플로우 데이터
            workflows = [
                {
                    'id': 'WF-001',
                    'workflow_id': 'WF-001',
                    'asset_id': 'ASSET-001',
                    'asset_name': '노트북 Dell XPS 13',
                    'asset_code': 'IT-NB-2023-001',
                    'requester_id': 'USER-001',
                    'requester_name': '김개발',
                    'department': '개발팀',
                    'current_step': 'dept_approval',
                    'current_step_name': '부서장 승인 대기',
                    'assigned_approver': 1,
                    'assigned_approver_name': '김부장',
                    'request_date': '2024-12-15',
                    'urgency': 'normal',
                    'progress': 25,
                    'comments': '업무용 노트북 반납 요청',
                    'status': 'active',
                    'metadata': {
                        'category': 'IT장비',
                        'serial_number': 'DXP13-2023-001',
                        'condition': 'good'
                    }
                },
                {
                    'id': 'WF-002',
                    'workflow_id': 'WF-002',
                    'asset_id': 'ASSET-002',
                    'asset_name': '프로젝터 Epson EB-X41',
                    'asset_code': 'OF-PJ-2022-005',
                    'requester_id': 'USER-002',
                    'requester_name': '이마케팅',
                    'department': '마케팅팀',
                    'current_step': 'asset_manager_approval',
                    'current_step_name': '자산관리자 승인 대기',
                    'assigned_approver': 2,
                    'assigned_approver_name': '이관리자',
                    'request_date': '2024-12-14',
                    'urgency': 'high',
                    'progress': 50,
                    'comments': '프레젠테이션 완료 후 반납',
                    'status': 'active',
                    'metadata': {
                        'category': '사무기기',
                        'serial_number': 'EPX41-2022-005',
                        'condition': 'excellent'
                    }
                },
                {
                    'id': 'WF-003',
                    'workflow_id': 'WF-003',
                    'asset_id': 'ASSET-003',
                    'asset_name': '태블릿 iPad Pro 12.9',
                    'asset_code': 'IT-TB-2023-008',
                    'requester_id': 'USER-003',
                    'requester_name': '박디자인',
                    'department': '디자인팀',
                    'current_step': 'final_approval',
                    'current_step_name': '최종 승인 대기',
                    'assigned_approver': 3,
                    'assigned_approver_name': '박이사',
                    'request_date': '2024-12-13',
                    'urgency': 'normal',
                    'progress': 75,
                    'comments': '디자인 작업 완료로 인한 반납',
                    'status': 'active',
                    'metadata': {
                        'category': 'IT장비',
                        'serial_number': 'IPP129-2023-008',
                        'condition': 'good'
                    }
                },
                {
                    'id': 'WF-004',
                    'workflow_id': 'WF-004',
                    'asset_id': 'ASSET-004',
                    'asset_name': '카메라 Canon EOS R5',
                    'asset_code': 'MD-CM-2023-002',
                    'requester_id': 'USER-004',
                    'requester_name': '최촬영',
                    'department': '마케팅팀',
                    'current_step': 'dept_approval',
                    'current_step_name': '부서장 승인 대기',
                    'assigned_approver': 4,
                    'assigned_approver_name': '최팀장',
                    'request_date': '2024-12-16',
                    'urgency': 'low',
                    'progress': 25,
                    'comments': '제품 촬영 완료',
                    'status': 'active',
                    'metadata': {
                        'category': '촬영장비',
                        'serial_number': 'CEOSR5-2023-002',
                        'condition': 'excellent'
                    }
                }
            ]

            # 필터 적용
            filtered_workflows = workflows
            
            if status:
                filtered_workflows = [w for w in filtered_workflows if w['current_step'] == status]
            
            if department:
                filtered_workflows = [w for w in filtered_workflows if w['department'] == department]
            
            if urgency:
                filtered_workflows = [w for w in filtered_workflows if w['urgency'] == urgency]
            
            if search:
                search_lower = search.lower()
                filtered_workflows = [w for w in filtered_workflows 
                                    if search_lower in w['asset_name'].lower() or 
                                       search_lower in w['requester_name'].lower() or
                                       search_lower in w['asset_code'].lower()]

            return filtered_workflows

        except Exception as e:
            print(f"반납 워크플로우 목록 조회 오류: {e}")
            raise

    def get_return_workflow_detail(self, workflow_id):
        """반납 워크플로우 상세 정보 조회"""
        try:
            # 모의 워크플로우 상세 데이터
            workflow_details = {
                'WF-001': {
                    'id': 'WF-001',
                    'return_request_id': 'REQ-001',
                    'asset_id': 'ASSET-001',
                    'requester_id': 'USER-001',
                    'current_step': 'dept_approval',
                    'status': 'active',
                    'created_at': '2024-12-15T09:00:00Z',
                    'updated_at': '2024-12-15T09:00:00Z',
                    'steps': [
                        {
                            'step_id': 'requested',
                            'status': 'completed',
                            'completed_at': '2024-12-15T09:00:00Z',
                            'completed_by': 'USER-001',
                            'action': 'request_submitted',
                            'comments': '업무용 노트북 반납 요청'
                        },
                        {
                            'step_id': 'dept_approval',
                            'status': 'pending',
                            'started_at': '2024-12-15T09:00:00Z',
                            'assigned_to': 1,
                            'action': 'step_started'
                        }
                    ],
                    'metadata': {
                        'asset_name': '노트북 Dell XPS 13',
                        'requester_name': '김개발',
                        'department': '개발팀',
                        'urgency': 'normal'
                    }
                }
            }

            return workflow_details.get(workflow_id)

        except Exception as e:
            print(f"반납 워크플로우 상세 조회 오류: {e}")
            raise

    def approve_return_workflow(self, workflow_id, approver_id, comments=''):
        """반납 워크플로우 승인"""
        try:
            # 실제 구현에서는 데이터베이스 업데이트 및 워크플로우 진행
            print(f"워크플로우 {workflow_id} 승인 처리 - 승인자: {approver_id}, 의견: {comments}")
            
            # 승인 권한 확인
            if not self._check_approval_permission(workflow_id, approver_id):
                return {
                    'success': False,
                    'message': '승인 권한이 없습니다.'
                }

            # 워크플로우 상태 업데이트
            updated_workflow = self._update_workflow_status(workflow_id, 'approved', approver_id, comments)
            
            # 알림 발송
            self._send_workflow_notification(workflow_id, 'approved', approver_id)

            return {
                'success': True,
                'workflow': updated_workflow,
                'message': '승인이 완료되었습니다.'
            }

        except Exception as e:
            print(f"반납 워크플로우 승인 오류: {e}")
            return {
                'success': False,
                'message': '승인 처리 중 오류가 발생했습니다.'
            }

    def reject_return_workflow(self, workflow_id, approver_id, reason):
        """반납 워크플로우 거부"""
        try:
            # 실제 구현에서는 데이터베이스 업데이트
            print(f"워크플로우 {workflow_id} 거부 처리 - 승인자: {approver_id}, 사유: {reason}")
            
            # 승인 권한 확인
            if not self._check_approval_permission(workflow_id, approver_id):
                return {
                    'success': False,
                    'message': '거부 권한이 없습니다.'
                }

            # 워크플로우 상태 업데이트
            updated_workflow = self._update_workflow_status(workflow_id, 'rejected', approver_id, reason)
            
            # 알림 발송
            self._send_workflow_notification(workflow_id, 'rejected', approver_id)

            return {
                'success': True,
                'workflow': updated_workflow,
                'message': '거부가 완료되었습니다.'
            }

        except Exception as e:
            print(f"반납 워크플로우 거부 오류: {e}")
            return {
                'success': False,
                'message': '거부 처리 중 오류가 발생했습니다.'
            }

    def bulk_approve_return_workflows(self, workflow_ids, approver_id, comments=''):
        """반납 워크플로우 일괄 승인"""
        try:
            success_count = 0
            error_count = 0
            errors = []

            for workflow_id in workflow_ids:
                try:
                    result = self.approve_return_workflow(workflow_id, approver_id, comments)
                    if result['success']:
                        success_count += 1
                    else:
                        error_count += 1
                        errors.append({
                            'workflow_id': workflow_id,
                            'error': result['message']
                        })
                except Exception as e:
                    error_count += 1
                    errors.append({
                        'workflow_id': workflow_id,
                        'error': str(e)
                    })

            return {
                'success_count': success_count,
                'error_count': error_count,
                'errors': errors
            }

        except Exception as e:
            print(f"반납 워크플로우 일괄 승인 오류: {e}")
            raise

    def _check_approval_permission(self, workflow_id, approver_id):
        """승인 권한 확인"""
        try:
            # 실제 구현에서는 데이터베이스에서 워크플로우와 승인자 정보 확인
            # 현재는 모의 권한 확인
            return True
        except Exception as e:
            print(f"승인 권한 확인 오류: {e}")
            return False

    def _update_workflow_status(self, workflow_id, action, approver_id, comments):
        """워크플로우 상태 업데이트"""
        try:
            # 실제 구현에서는 데이터베이스 업데이트
            # 현재는 모의 업데이트
            return {
                'id': workflow_id,
                'status': action,
                'updated_at': datetime.now().isoformat(),
                'last_action': {
                    'action': action,
                    'approver_id': approver_id,
                    'comments': comments,
                    'timestamp': datetime.now().isoformat()
                }
            }
        except Exception as e:
            print(f"워크플로우 상태 업데이트 오류: {e}")
            raise

    def _send_workflow_notification(self, workflow_id, action, approver_id):
        """워크플로우 알림 발송"""
        try:
            # 실제 구현에서는 이메일, 푸시 알림 등 발송
            print(f"워크플로우 {workflow_id} {action} 알림 발송 - 승인자: {approver_id}")
        except Exception as e:
            print(f"워크플로우 알림 발송 오류: {e}")
    
    # ==================== 폐기 관리 서비스 ====================
    
    def get_disposal_list(self) -> List[Dict]:
        """
        폐기 목록 조회 (비즈니스 로직 적용)
        
        Returns:
            폐기 목록 (추가 정보 포함)
        """
        disposals = self.operations_repo.get_all_disposals()
        
        # 비즈니스 로직: 폐기 상태 정보 추가
        current_date = datetime.utcnow().date()
        for disposal in disposals:
            # 폐기 후 경과 일수 계산
            if disposal.get('disposal_date'):
                try:
                    # disposal_date가 문자열인 경우 date 객체로 변환
                    if isinstance(disposal['disposal_date'], str):
                        disposal_date = datetime.strptime(disposal['disposal_date'], '%Y-%m-%d').date()
                    else:
                        disposal_date = disposal['disposal_date']
                    disposal['days_since_disposal'] = (current_date - disposal_date).days
                except (ValueError, TypeError):
                    # 변환 실패 시 기본값 설정
                    disposal['days_since_disposal'] = 0
            
            # 승인 처리 시간 계산
            if disposal.get('approved_date') and disposal.get('created_at'):
                try:
                    # created_at이 문자열인 경우 변환, 이미 date 객체인 경우 그대로 사용
                    if isinstance(disposal['created_at'], str):
                        created_date = datetime.fromisoformat(disposal['created_at']).date()
                    elif hasattr(disposal['created_at'], 'date'):
                        created_date = disposal['created_at'].date()
                    else:
                        created_date = disposal['created_at']
                    
                    disposal['approval_processing_days'] = (disposal['approved_date'] - created_date).days
                except (ValueError, TypeError):
                    # 변환 실패 시 기본값 설정
                    disposal['approval_processing_days'] = 0
        
        return disposals
    
    def get_disposal_detail(self, disposal_id: int) -> Optional[Dict]:
        """
        폐기 상세 정보 조회
        
        Args:
            disposal_id: 폐기 ID
            
        Returns:
            폐기 상세 정보 또는 None
        """
        return self.operations_repo.get_disposal_by_id(disposal_id)
    
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
        """지급 요청 목록 데이터 조회 (Repository 호출)"""
        try:
            return self.operations_repo.get_allocation_requests_data()
        except Exception as e:
            print(f"지급 요청 목록 조회 오류: {e}")
            raise 

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
        """반납 알림 목록 조회 (Repository 호출)"""
        try:
            # Repository에서 원본 데이터 조회
            raw_notifications = self.notification_repo.get_return_notifications(
                include_read=include_read,
                include_pending=include_pending,
                limit=limit
            )
            
            # JavaScript 호환 형태로 변환
            converted_notifications = []
            for notification in raw_notifications:
                converted_notification = {
                    'id': notification['id'],
                    'type': notification['type'],
                    'title': notification['title'],
                    'content': notification['message'],  # message → content
                    'recipient': notification['recipient_name'],  # recipient_name → recipient
                    'sender': 'System',  # 기본값 설정
                    'channel': 'system',  # 기본값 설정
                    'priority': notification['priority'],
                    'status': 'read' if notification['is_read'] else 'pending',  # is_read → status
                    'createdAt': notification['created_at'],  # created_at → createdAt
                    'readAt': notification['read_at'],  # read_at → readAt
                    'relatedAsset': notification.get('asset_name', ''),  # asset_name → relatedAsset
                    'workflowId': notification.get('asset_id', '')  # asset_id → workflowId (임시)
                }
                converted_notifications.append(converted_notification)
            
            return converted_notifications
            
        except Exception as e:
            print(f"반납 알림 목록 조회 오류: {e}")
            raise

    def get_notification_rules(self):
        """알림 규칙 목록 조회 (Repository 호출)"""
        try:
            # Repository에서 원본 데이터 조회
            raw_rules = self.notification_repo.get_notification_rules()
            
            # JavaScript 호환 형태로 변환
            converted_rules = []
            for rule in raw_rules:
                converted_rule = {
                    'id': rule['id'],
                    'name': rule['name'],
                    'type': rule.get('notification_type', 'system'),  # notification_type → type
                    'trigger': rule.get('trigger_condition', 'immediate'),  # trigger_condition → trigger
                    'priority': 'medium',  # 기본값 설정
                    'channels': rule.get('recipients', ['system']),  # recipients → channels (임시)
                    'active': rule['is_active'],  # is_active → active
                    'lastTriggered': None,  # 기본값 설정
                    'createdAt': rule['created_at'],
                    'updatedAt': rule['updated_at']
                }
                converted_rules.append(converted_rule)
            
            return converted_rules
            
        except Exception as e:
            print(f"알림 규칙 조회 오류: {e}")
            raise

    def get_notification_templates(self):
        """알림 템플릿 목록 조회 (Repository 호출)"""
        try:
            # Repository에서 원본 데이터 조회
            raw_templates = self.notification_repo.get_notification_templates()
            
            # JavaScript 호환 형태로 변환
            converted_templates = []
            for template in raw_templates:
                converted_template = {
                    'id': template['id'],
                    'name': template['name'],
                    'type': template['type'],
                    'subject': template['subject'],
                    'content': template['content'],
                    'variables': template.get('variables', []),
                    'active': template['is_active'],  # is_active → active
                    'lastUsed': None,  # 기본값 설정
                    'createdAt': template['created_at'],
                    'updatedAt': template['updated_at']
                }
                converted_templates.append(converted_template)
            
            return converted_templates
            
        except Exception as e:
            print(f"알림 템플릿 조회 오류: {e}")
            raise

    def mark_notification_read(self, notification_id):
        """알림 읽음 처리 (Repository 호출)"""
        try:
            return self.notification_repo.mark_notification_read(notification_id)
        except Exception as e:
            print(f"알림 읽음 처리 오류: {e}")
            return {
                'success': False,
                'message': f'읽음 처리 중 오류가 발생했습니다: {str(e)}'
            }

    def delete_notification(self, notification_id):
        """알림 삭제 (Repository 호출)"""
        try:
            return self.notification_repo.delete_notification(notification_id)
        except Exception as e:
            print(f"알림 삭제 오류: {e}")
            return {
                'success': False,
                'message': f'알림 삭제 중 오류가 발생했습니다: {str(e)}'
            }

    def create_notification_rule(self, rule_data):
        """알림 규칙 생성 (Repository 호출)"""
        try:
            return self.notification_repo.create_notification_rule(rule_data)
        except Exception as e:
            print(f"알림 규칙 생성 오류: {e}")
            return {
                'success': False,
                'message': f'알림 규칙 생성 중 오류가 발생했습니다: {str(e)}'
            }

    def update_notification_rule(self, rule_id, rule_data):
        """알림 규칙 수정 (Repository 호출)"""
        try:
            return self.notification_repo.update_notification_rule(rule_id, rule_data)
        except Exception as e:
            print(f"알림 규칙 수정 오류: {e}")
            return {
                'success': False,
                'message': f'알림 규칙 수정 중 오류가 발생했습니다: {str(e)}'
            }

    def create_notification_template(self, template_data):
        """알림 템플릿 생성 (Repository 호출)"""
        try:
            return self.notification_repo.create_notification_template(template_data)
        except Exception as e:
            print(f"알림 템플릿 생성 오류: {e}")
            return {
                'success': False,
                'message': f'알림 템플릿 생성 중 오류가 발생했습니다: {str(e)}'
            }

    def update_notification_template(self, template_id, template_data):
        """알림 템플릿 수정 (Repository 호출)"""
        try:
            return self.notification_repo.update_template(template_id, template_data)
        except Exception as e:
            print(f"알림 템플릿 수정 오류: {e}")
            return {
                'success': False,
                'message': f'알림 템플릿 수정 중 오류가 발생했습니다: {str(e)}'
            }

    # ==================== 업그레이드 관리 서비스 ====================
    
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
    
    # ==================== 생명주기 추적 서비스 ====================
    
    def get_lifecycle_tracking_data(self, page: int = 1, per_page: int = 10,
                                  asset_id: int = None, event_type: str = None,
                                  department: str = None, start_date: str = None,
                                  end_date: str = None) -> Dict:
        """
        생명주기 추적 메인 페이지 데이터 조회 (필터링 및 페이지네이션 포함)
        
        Args:
            page: 페이지 번호
            per_page: 페이지당 항목 수
            asset_id: 자산 ID 필터
            event_type: 이벤트 유형 필터
            department: 부서 필터
            start_date: 시작일 필터 (YYYY-MM-DD)
            end_date: 종료일 필터 (YYYY-MM-DD)
            
        Returns:
            생명주기 이벤트 목록과 통계가 포함된 딕셔너리
        """
        try:
            # Repository에서 데이터 조회
            events, current_page, total_pages, total_items = self.operations_repo.get_lifecycle_events_with_pagination(
                page=page,
                per_page=per_page,
                asset_id=asset_id,
                event_type=event_type,
                department=department
            )
            
            # 날짜 필터링이 있는 경우 별도 처리
            if start_date or end_date:
                all_events = self.operations_repo.get_all_lifecycle_events(
                    asset_id=asset_id,
                    event_type=event_type,
                    department=department,
                    start_date=start_date,
                    end_date=end_date
                )
                
                # 페이지네이션 재계산
                total_items = len(all_events)
                total_pages = (total_items + per_page - 1) // per_page if total_items > 0 else 1
                
                if page > total_pages and total_pages > 0:
                    page = total_pages
                
                start_idx = (page - 1) * per_page
                end_idx = min(start_idx + per_page, total_items)
                events = all_events[start_idx:end_idx] if all_events else []
                current_page = page
            
            # 비즈니스 로직: 이벤트 정보 enrichment
            for event in events:
                                 # 안전한 날짜 처리
                 event_date = event.get('event_date')
                 if event_date:
                     if hasattr(event_date, 'strftime'):
                         event['event_date_formatted'] = event_date.strftime('%Y-%m-%d')
                         # 이벤트 경과 시간 계산
                         current_date = datetime.utcnow().date()
                         days_ago = (current_date - event_date).days
                         event['days_ago'] = days_ago
                         
                         if days_ago == 0:
                             event['time_ago_text'] = '오늘'
                         elif days_ago == 1:
                             event['time_ago_text'] = '어제'
                         elif days_ago < 30:
                             event['time_ago_text'] = f'{days_ago}일 전'
                         elif days_ago < 365:
                             months_ago = days_ago // 30
                             event['time_ago_text'] = f'{months_ago}개월 전'
                         else:
                             years_ago = days_ago // 365
                             event['time_ago_text'] = f'{years_ago}년 전'
                     elif isinstance(event_date, str):
                         event['event_date_formatted'] = event_date
                     else:
                         event['event_date_formatted'] = str(event_date)
                 
                 # 생성일시 포맷팅
                 created_at = event.get('created_at')
                 if created_at and hasattr(created_at, 'strftime'):
                     event['created_at_formatted'] = created_at.strftime('%Y-%m-%d %H:%M')
                 
                 # 이벤트 유형별 색상 및 아이콘
                 event_type_info = self._get_event_type_info(event.get('event_type'))
                 event.update(event_type_info)
                 
                 # 비용 포맷팅
                 related_cost = event.get('related_cost', 0)
                 if related_cost:
                     event['related_cost_formatted'] = f"{related_cost:,}원"
                 else:
                     event['related_cost_formatted'] = "-"
            
            # 통계 정보 조회
            statistics = self.get_lifecycle_statistics()
            
            # 필터 옵션 조회
            event_types = self.operations_repo.get_lifecycle_event_types()
            
            return {
                'lifecycle_events': events,
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
                    'event_types': event_types
                }
            }
            
        except Exception as e:
            print(f"생명주기 추적 데이터 조회 오류: {e}")
            raise
    
    def get_asset_lifecycle_timeline(self, asset_id: int) -> Dict:
        """
        특정 자산의 생명주기 타임라인 조회
        
        Args:
            asset_id: 자산 ID
            
        Returns:
            자산의 생명주기 타임라인 정보
        """
        try:
            events = self.operations_repo.get_lifecycle_events_by_asset(asset_id)
            
            if not events:
                return {
                    'asset_id': asset_id,
                    'timeline_events': [],
                    'summary': {
                        'total_events': 0,
                        'first_event_date': None,
                        'last_event_date': None,
                        'total_cost': 0,
                        'asset_age_days': 0
                    }
                }
            
            # 타임라인 이벤트 처리
            timeline_events = []
            total_cost = 0
            
            for event in events:
                # 안전한 날짜 처리
                event_date = event.get('event_date')
                if event_date and hasattr(event_date, 'strftime'):
                    event['event_date_formatted'] = event_date.strftime('%Y-%m-%d')
                
                # 이벤트 유형 정보 추가
                event_type_info = self._get_event_type_info(event.get('event_type'))
                event.update(event_type_info)
                
                # 비용 누적
                cost = event.get('related_cost', 0)
                total_cost += cost
                event['cumulative_cost'] = total_cost
                
                if cost:
                    event['related_cost_formatted'] = f"{cost:,}원"
                else:
                    event['related_cost_formatted'] = "-"
                
                timeline_events.append(event)
            
            # 요약 정보 계산
            first_event = events[0] if events else None
            last_event = events[-1] if events else None
            
            first_event_date = None
            last_event_date = None
            asset_age_days = 0
            
            if first_event:
                first_date = first_event.get('event_date')
                if first_date and hasattr(first_date, 'strftime'):
                    first_event_date = first_date.strftime('%Y-%m-%d')
                    # 자산 연령 계산
                    current_date = datetime.utcnow().date()
                    asset_age_days = (current_date - first_date).days
            
            if last_event:
                last_date = last_event.get('event_date')
                if last_date and hasattr(last_date, 'strftime'):
                    last_event_date = last_date.strftime('%Y-%m-%d')
            
            # 자산 기본 정보 (첫 번째 이벤트에서 추출)
            asset_info = {
                'asset_id': asset_id,
                'asset_name': first_event.get('asset_name', f'자산 ID {asset_id}'),
                'asset_number': first_event.get('asset_number', 'N/A')
            } if first_event else {
                'asset_id': asset_id,
                'asset_name': f'자산 ID {asset_id}',
                'asset_number': 'N/A'
            }
            
            return {
                'asset_info': asset_info,
                'timeline_events': timeline_events,
                'summary': {
                    'total_events': len(events),
                    'first_event_date': first_event_date,
                    'last_event_date': last_event_date,
                    'total_cost': total_cost,
                    'total_cost_formatted': f"{total_cost:,}원" if total_cost else "0원",
                    'asset_age_days': asset_age_days,
                    'asset_age_text': self._format_age_text(asset_age_days)
                }
            }
            
        except Exception as e:
            print(f"자산 생명주기 타임라인 조회 오류: {e}")
            raise
    
    def get_lifecycle_statistics(self) -> Dict:
        """
        생명주기 통계 정보 조회
        
        Returns:
            생명주기 통계 정보
        """
        try:
            statistics = self.operations_repo.get_lifecycle_statistics()
            
            # 비즈니스 로직: 추가 통계 계산
            all_events = self.operations_repo.get_all_lifecycle_events()
            current_date = datetime.utcnow().date()
            
            # 이번 달 이벤트 수
            this_month_events = []
            for event in all_events:
                event_date = event.get('event_date')
                if event_date and hasattr(event_date, 'month'):
                    if (event_date.year == current_date.year and 
                        event_date.month == current_date.month):
                        this_month_events.append(event)
            
            statistics['this_month_events'] = len(this_month_events)
            
            # 최근 활동 (7일 이내)
            recent_events = []
            for event in all_events:
                event_date = event.get('event_date')
                if event_date and hasattr(event_date, 'strftime'):
                    days_ago = (current_date - event_date).days
                    if 0 <= days_ago <= 7:
                        recent_events.append(event)
            
            statistics['recent_events'] = len(recent_events)
            
            # 평균 이벤트 비용
            cost_stats = statistics.get('cost_stats', {})
            total_costs = cost_stats.get('total_costs', 0)
            total_events = statistics.get('total_events', 0)
            
            if total_events > 0:
                avg_cost = total_costs / total_events
                statistics['average_event_cost'] = round(avg_cost, 0)
            else:
                statistics['average_event_cost'] = 0
            
            # 비용 통계 포맷팅
            if total_costs:
                statistics['total_costs_formatted'] = f"{total_costs:,}원"
            else:
                statistics['total_costs_formatted'] = "0원"
            
            return statistics
            
        except Exception as e:
            print(f"생명주기 통계 조회 오류: {e}")
            raise
    
    def _get_event_type_info(self, event_type: str) -> Dict:
        """
        이벤트 유형별 색상 및 아이콘 정보 반환
        
        Args:
            event_type: 이벤트 유형
            
        Returns:
            색상 및 아이콘 정보
        """
        event_type_map = {
            'acquisition': {
                'color': 'success',
                'icon': 'fas fa-shopping-cart',
                'bg_color': 'bg-success'
            },
            'deployment': {
                'color': 'info',
                'icon': 'fas fa-rocket',
                'bg_color': 'bg-info'
            },
            'maintenance': {
                'color': 'warning',
                'icon': 'fas fa-tools',
                'bg_color': 'bg-warning'
            },
            'upgrade': {
                'color': 'primary',
                'icon': 'fas fa-arrow-up',
                'bg_color': 'bg-primary'
            },
            'incident': {
                'color': 'danger',
                'icon': 'fas fa-exclamation-triangle',
                'bg_color': 'bg-danger'
            },
            'evaluation': {
                'color': 'secondary',
                'icon': 'fas fa-clipboard-check',
                'bg_color': 'bg-secondary'
            },
            'disposal': {
                'color': 'dark',
                'icon': 'fas fa-trash',
                'bg_color': 'bg-dark'
            }
        }
        
        return event_type_map.get(event_type, {
            'color': 'secondary',
            'icon': 'fas fa-circle',
            'bg_color': 'bg-secondary'
        })
    
    def _format_age_text(self, days: int) -> str:
        """
        자산 연령을 읽기 쉬운 텍스트로 변환
        
        Args:
            days: 일수
            
        Returns:
            포맷된 연령 텍스트
        """
        if days < 30:
            return f"{days}일"
        elif days < 365:
            months = days // 30
            return f"{months}개월"
        else:
            years = days // 365
            remaining_months = (days % 365) // 30
            if remaining_months > 0:
                return f"{years}년 {remaining_months}개월"
            else:
                return f"{years}년"

    def get_lifecycle_event_details(self, event_id: int) -> Optional[Dict]:
        """
        생명주기 이벤트 개별 상세 정보 조회
        
        Args:
            event_id: 이벤트 ID
            
        Returns:
            이벤트 상세 정보 또는 None
        """
        try:
            event = self.operations_repo.get_lifecycle_event_by_id(event_id)
            
            if not event:
                return None
            
            # 안전한 데이터 처리를 위한 복사본 생성
            safe_event = {}
            for key, value in event.items():
                # None 값을 안전한 기본값으로 변환
                if value is None:
                    if key in ['related_cost']:
                        safe_event[key] = 0
                    elif key in ['id', 'asset_id']:
                        safe_event[key] = 0
                    else:
                        safe_event[key] = ''
                else:
                    safe_event[key] = value
            
            # 비즈니스 로직: 날짜 포맷팅 및 추가 정보
            event_date = safe_event.get('event_date')
            if event_date and hasattr(event_date, 'strftime'):
                safe_event['event_date_formatted'] = event_date.strftime('%Y-%m-%d')
                
                # 이벤트 경과 시간 계산
                current_date = datetime.utcnow().date()
                days_ago = (current_date - event_date).days
                safe_event['days_ago'] = days_ago
                
                if days_ago == 0:
                    safe_event['time_ago_text'] = '오늘'
                elif days_ago == 1:
                    safe_event['time_ago_text'] = '어제'
                elif days_ago < 30:
                    safe_event['time_ago_text'] = f'{days_ago}일 전'
                elif days_ago < 365:
                    months_ago = days_ago // 30
                    safe_event['time_ago_text'] = f'{months_ago}개월 전'
                else:
                    years_ago = days_ago // 365
                    safe_event['time_ago_text'] = f'{years_ago}년 전'
            
            # 생성일시 포맷팅
            created_at = safe_event.get('created_at')
            if created_at and hasattr(created_at, 'strftime'):
                safe_event['created_at_formatted'] = created_at.strftime('%Y-%m-%d %H:%M')
            
            # 이벤트 유형별 색상 및 아이콘
            event_type_info = self._get_event_type_info(safe_event.get('event_type'))
            safe_event.update(event_type_info)
            
            # 비용 포맷팅
            related_cost = safe_event.get('related_cost', 0)
            if related_cost and related_cost > 0:
                safe_event['related_cost_formatted'] = f"{related_cost:,}원"
            else:
                safe_event['related_cost_formatted'] = "-"
            
            return safe_event
            
        except Exception as e:
            print(f"생명주기 이벤트 상세 정보 조회 오류 (ID: {event_id}): {e}")
            return None
