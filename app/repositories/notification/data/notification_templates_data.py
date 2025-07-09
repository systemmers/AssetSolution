"""
Notification 도메인 Mock 데이터 관리 - 알림 템플릿 데이터
알림 템플릿 설정 데이터를 관리합니다.

Classes:
    - NotificationTemplatesData: 알림 템플릿 Mock 데이터 싱글톤 클래스
"""
from typing import List, Dict, Any
from datetime import datetime


class NotificationTemplatesData:
    """
    알림 템플릿 Mock 데이터 싱글톤 클래스
    알림 템플릿 설정 데이터를 관리합니다.
    """
    
    _instance = None
    _templates = None
    
    def __new__(cls):
        """싱글톤 패턴 구현"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """NotificationTemplatesData 초기화"""
        if self._templates is None:
            self._templates = self._load_sample_data()
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 알림 템플릿 데이터 로드
        6개 템플릿: 반납 연체, 승인 요청, 반납 예정, 정기점검, 자산 이관, 보증 만료
        
        Returns:
            샘플 알림 템플릿 데이터 리스트
        """
        return [
            {
                'id': 1,
                'name': '반납 연체 템플릿',
                'subject': '자산 반납 연체 알림',
                'content': '{user_name}님의 {asset_name} 반납이 {overdue_days}일 연체되었습니다.',
                'type': 'overdue_notification',
                'variables': ['user_name', 'asset_name', 'overdue_days'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            },
            {
                'id': 2,
                'name': '승인 요청 템플릿',
                'subject': '반납 승인 요청',
                'content': '{requester_name}님이 {asset_name} 반납 승인을 요청했습니다.',
                'type': 'approval_request',
                'variables': ['requester_name', 'asset_name'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            },
            {
                'id': 3,
                'name': '반납 예정 템플릿',
                'subject': '자산 반납 예정 안내',
                'content': '{user_name}님, {asset_name}의 반납 예정일이 {due_date}입니다.',
                'type': 'return_reminder',
                'variables': ['user_name', 'asset_name', 'due_date'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            },
            {
                'id': 4,
                'name': '정기점검 템플릿',
                'subject': '자산 정기점검 안내',
                'content': '{asset_name}의 정기점검이 필요합니다. 점검 예정일: {maintenance_date}',
                'type': 'maintenance_required',
                'variables': ['asset_name', 'maintenance_date'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            },
            {
                'id': 5,
                'name': '자산 이관 템플릿',
                'subject': '자산 이관 완료 알림',
                'content': '{asset_name}이(가) {from_department}에서 {to_department}로 이관되었습니다. 이관자: {transferer_name}',
                'type': 'asset_transfer',
                'variables': ['asset_name', 'from_department', 'to_department', 'transferer_name'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            },
            {
                'id': 6,
                'name': '보증 만료 템플릿',
                'subject': '자산 보증 기간 만료 예정 안내',
                'content': '{asset_name}의 보증 기간이 {days_remaining}일 후 만료됩니다. 제조사: {manufacturer}, 구매일: {purchase_date}',
                'type': 'warranty_expiry',
                'variables': ['asset_name', 'days_remaining', 'manufacturer', 'purchase_date'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            },
            {
                'id': 7,
                'name': '자산 상태 변경 템플릿',
                'subject': '자산 상태 변경 알림',
                'content': '{asset_name}의 상태가 {previous_status}에서 {current_status}로 변경되었습니다. 변경자: {modifier_name}',
                'type': 'status_change',
                'variables': ['asset_name', 'previous_status', 'current_status', 'modifier_name'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            },
            {
                'id': 8,
                'name': '대여 승인 템플릿',
                'subject': '자산 대여 승인 완료',
                'content': '{user_name}님의 {asset_name} 대여가 승인되었습니다. 대여 기간: {loan_period}, 담당자: {approver_name}',
                'type': 'loan_approval',
                'variables': ['user_name', 'asset_name', 'loan_period', 'approver_name'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            }
        ]
    
    def get_templates(self) -> List[Dict[str, Any]]:
        """
        알림 템플릿 데이터 조회
        
        Returns:
            알림 템플릿 데이터 리스트
        """
        return self._templates.copy()
    
    def get_templates_count(self) -> int:
        """
        알림 템플릿 총 개수 조회
        
        Returns:
            알림 템플릿 개수
        """
        return len(self._templates)
    
    def get_active_templates_count(self) -> int:
        """
        활성 알림 템플릿 개수 조회
        
        Returns:
            활성 알림 템플릿 개수
        """
        return len([template for template in self._templates if template['is_active']])
    
    def get_template_types(self) -> List[str]:
        """
        템플릿 타입 목록 조회
        
        Returns:
            템플릿 타입 목록
        """
        return list(set(template['type'] for template in self._templates))
    
    def get_all_variables(self) -> List[str]:
        """
        모든 템플릿에서 사용되는 변수 목록 조회
        
        Returns:
            변수 목록 (중복 제거)
        """
        variables = []
        for template in self._templates:
            variables.extend(template['variables'])
        return list(set(variables))
    
    def get_template_by_type(self, template_type: str) -> Dict[str, Any]:
        """
        타입별 템플릿 조회
        
        Args:
            template_type: 템플릿 타입
            
        Returns:
            해당 타입의 템플릿 또는 None
        """
        return next((template for template in self._templates if template['type'] == template_type), None) 