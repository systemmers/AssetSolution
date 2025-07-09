"""
지급 관리 서비스 모듈
자산 지급 요청 및 관리 비즈니스 로직

Classes:
    - AllocationService: 지급 요청, 승인, 관리 등 지급 관련 서비스 로직
"""
from typing import List, Dict, Optional, Any
from datetime import datetime, date


class AllocationService:
    """
    자산 지급 관리 서비스 클래스
    Repository와 Controller 사이의 지급 관련 비즈니스 로직 계층
    """
    
    def __init__(self):
        """Service 초기화 및 Repository 의존성 주입"""
        from ...repositories import operations_repository, asset_repository
        self.operations_repo = operations_repository
        self.asset_repo = asset_repository
    
    def get_allocation_requests_data(self) -> List[Dict]:
        """
        지급 요청 목록 데이터 조회 (Repository 호출)
        
        Returns:
            지급 요청 목록
        """
        try:
            return self.operations_repo.get_allocation_requests_data()
        except Exception as e:
            print(f"지급 요청 목록 조회 오류: {e}")
            raise 
    
    def get_allocation_statistics(self) -> Dict[str, Any]:
        """
        지급 통계 정보 조회
        
        Returns:
            지급 관련 통계 정보
        """
        try:
            # Repository에서 지급 요청 데이터 조회
            allocation_requests = self.get_allocation_requests_data()
            
            # 비즈니스 로직: 통계 계산
            total_requests = len(allocation_requests)
            approved_requests = len([r for r in allocation_requests if r.get('status') == 'approved'])
            pending_requests = len([r for r in allocation_requests if r.get('status') == 'pending'])
            rejected_requests = len([r for r in allocation_requests if r.get('status') == 'rejected'])
            
            # 부서별 요청 통계
            department_stats = {}
            for request in allocation_requests:
                dept = request.get('department', '기타')
                department_stats[dept] = department_stats.get(dept, 0) + 1
            
            return {
                'total_requests': total_requests,
                'approved_requests': approved_requests,
                'pending_requests': pending_requests,
                'rejected_requests': rejected_requests,
                'approval_rate': round((approved_requests / total_requests * 100), 1) if total_requests > 0 else 0,
                'department_stats': department_stats,
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"지급 통계 조회 오류: {e}")
            return {
                'total_requests': 0,
                'approved_requests': 0,
                'pending_requests': 0,
                'rejected_requests': 0,
                'approval_rate': 0,
                'department_stats': {},
                'last_updated': datetime.now().isoformat()
            }
    
    def submit_allocation_request(self, asset_id: int, requester_id: int, 
                                department: str, purpose: str, 
                                expected_allocation_date: date = None) -> Dict[str, Any]:
        """
        지급 신청 제출
        
        Args:
            asset_id: 자산 ID
            requester_id: 신청자 ID
            department: 부서
            purpose: 지급 목적
            expected_allocation_date: 예상 지급일
            
        Returns:
            처리 결과 딕셔너리
        """
        try:
            # 비즈니스 로직: 신청 유효성 검증
            validation_result = self._validate_allocation_request(
                asset_id, requester_id, department, purpose
            )
            
            if not validation_result['valid']:
                return {
                    'success': False,
                    'message': validation_result['message']
                }
            
            # 신청 데이터 생성
            allocation_request = {
                'asset_id': asset_id,
                'requester_id': requester_id,
                'department': department,
                'purpose': purpose,
                'expected_allocation_date': expected_allocation_date or datetime.utcnow().date(),
                'status': 'pending',
                'created_at': datetime.utcnow().isoformat(),
                'request_type': 'allocation'
            }
            
            # 실제 구현에서는 Repository를 통해 데이터베이스에 저장
            request_id = f"AL-{datetime.now().strftime('%Y%m%d')}-{requester_id}-{asset_id}"
            
            return {
                'success': True,
                'request_id': request_id,
                'message': '지급 신청이 성공적으로 제출되었습니다.',
                'next_step': '부서장 승인 대기'
            }
            
        except Exception as e:
            print(f"지급 신청 제출 오류: {e}")
            return {
                'success': False,
                'message': '지급 신청 처리 중 오류가 발생했습니다.'
            }
    
    def approve_allocation_request(self, request_id: str, approver_id: int, 
                                 comments: str = '') -> Dict[str, Any]:
        """
        지급 신청 승인
        
        Args:
            request_id: 신청 ID
            approver_id: 승인자 ID
            comments: 승인 의견
            
        Returns:
            처리 결과 딕셔너리
        """
        try:
            # 실제 구현에서는 Repository를 통해 상태 업데이트
            result = {
                'success': True,
                'request_id': request_id,
                'status': 'approved',
                'approved_by': approver_id,
                'approved_at': datetime.now().isoformat(),
                'comments': comments,
                'message': '지급 신청이 승인되었습니다.'
            }
            
            return result
            
        except Exception as e:
            print(f"지급 신청 승인 오류: {e}")
            return {
                'success': False,
                'message': '승인 처리 중 오류가 발생했습니다.'
            }
    
    def reject_allocation_request(self, request_id: str, approver_id: int, 
                                reason: str) -> Dict[str, Any]:
        """
        지급 신청 거부
        
        Args:
            request_id: 신청 ID
            approver_id: 승인자 ID
            reason: 거부 사유
            
        Returns:
            처리 결과 딕셔너리
        """
        try:
            # 실제 구현에서는 Repository를 통해 상태 업데이트
            result = {
                'success': True,
                'request_id': request_id,
                'status': 'rejected',
                'rejected_by': approver_id,
                'rejected_at': datetime.now().isoformat(),
                'rejection_reason': reason,
                'message': '지급 신청이 거부되었습니다.'
            }
            
            return result
            
        except Exception as e:
            print(f"지급 신청 거부 오류: {e}")
            return {
                'success': False,
                'message': '거부 처리 중 오류가 발생했습니다.'
            }
    
    def _validate_allocation_request(self, asset_id: int, requester_id: int, 
                                   department: str, purpose: str) -> Dict[str, Any]:
        """
        지급 신청 유효성 검증
        
        Args:
            asset_id: 자산 ID
            requester_id: 신청자 ID
            department: 부서
            purpose: 지급 목적
            
        Returns:
            유효성 검증 결과
        """
        if not asset_id or asset_id <= 0:
            return {'valid': False, 'message': '유효하지 않은 자산 ID입니다.'}
        
        if not requester_id or requester_id <= 0:
            return {'valid': False, 'message': '유효하지 않은 신청자 ID입니다.'}
        
        if not department or department.strip() == '':
            return {'valid': False, 'message': '부서를 입력해주세요.'}
        
        if not purpose or purpose.strip() == '':
            return {'valid': False, 'message': '지급 목적을 입력해주세요.'}
        
        # 추가 비즈니스 로직 검증
        # - 자산 상태 확인 (사용 가능 여부)
        # - 신청자 권한 확인
        # - 부서별 지급 한도 확인 등
        
        return {'valid': True, 'message': '유효한 신청입니다.'} 