"""
반납 관리 서비스 모듈
자산 반납 관련 핵심 비즈니스 로직 처리

Classes:
    - ReturnService: 반납 처리, 승인 워크플로우, 알림 등 반납 관련 서비스 로직
"""
from typing import List, Dict, Optional, Any
from datetime import datetime, date


class ReturnService:
    """
    자산 반납 관리 서비스 클래스
    Repository와 Controller 사이의 반납 관련 비즈니스 로직 계층
    """
    
    def __init__(self):
        """Service 초기화 및 Repository 의존성 주입"""
        from ...repositories import operations_repository, notification_repository
        self.operations_repo = operations_repository
        self.notification_repo = notification_repository
    
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

    def get_return_workflows_detailed(self, include_timeline=False, include_comments=False):
        """상세 정보가 포함된 반납 워크플로우 목록 조회"""
        try:
            workflows = self.get_return_workflows()
            
            for workflow in workflows:
                if include_timeline:
                    workflow['timeline'] = self._get_workflow_timeline(workflow['workflow_id'])
                
                if include_comments:
                    workflow['comments'] = self._get_workflow_comments(workflow['workflow_id'])
            
            return workflows
            
        except Exception as e:
            print(f"상세 반납 워크플로우 조회 오류: {e}")
            return []

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
                'updated_by': approver_id,
                'comments': comments
            }
        except Exception as e:
            print(f"워크플로우 상태 업데이트 오류: {e}")
            raise

    def _send_workflow_notification(self, workflow_id, action, approver_id):
        """워크플로우 알림 발송"""
        try:
            # 실제 구현에서는 알림 시스템으로 메시지 발송
            print(f"워크플로우 {workflow_id} {action} 알림 발송 - 승인자: {approver_id}")
        except Exception as e:
            print(f"워크플로우 알림 발송 오류: {e}")

    def _get_workflow_timeline(self, workflow_id):
        """워크플로우 타임라인 조회"""
        try:
            # 실제 구현에서는 데이터베이스에서 타임라인 정보 조회
            return [
                {
                    'step': '신청',
                    'timestamp': '2024-12-15T09:00:00Z',
                    'actor': '김개발',
                    'status': 'completed'
                },
                {
                    'step': '부서장 승인',
                    'timestamp': '2024-12-15T09:30:00Z',
                    'actor': '김부장',
                    'status': 'pending'
                }
            ]
        except Exception as e:
            print(f"워크플로우 타임라인 조회 오류: {e}")
            return []

    def _get_workflow_comments(self, workflow_id):
        """워크플로우 코멘트 조회"""
        try:
            # 실제 구현에서는 데이터베이스에서 코멘트 정보 조회
            return [
                {
                    'id': 1,
                    'author': '김개발',
                    'content': '업무용 노트북 반납 요청합니다.',
                    'timestamp': '2024-12-15T09:00:00Z'
                }
            ]
        except Exception as e:
            print(f"워크플로우 코멘트 조회 오류: {e}")
            return [] 