"""
Notification 도메인 Mock 데이터 관리 - 알림 규칙 데이터
알림 규칙 설정 데이터를 관리합니다.

Classes:
    - NotificationRulesData: 알림 규칙 Mock 데이터 싱글톤 클래스
"""
from typing import List, Dict, Any
from datetime import datetime


class NotificationRulesData:
    """
    알림 규칙 Mock 데이터 싱글톤 클래스
    알림 규칙 설정 데이터를 관리합니다.
    """
    
    _instance = None
    _rules = None
    
    def __new__(cls):
        """싱글톤 패턴 구현"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """NotificationRulesData 초기화"""
        if self._rules is None:
            self._rules = self._load_sample_data()
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 알림 규칙 데이터 로드
        4개 규칙: 반납 연체, 승인 요청, 반납 예정, 정기점검
        
        Returns:
            샘플 알림 규칙 데이터 리스트
        """
        return [
            {
                'id': 1,
                'name': '반납 연체 알림',
                'description': '반납 예정일이 지난 경우 자동 알림',
                'trigger_condition': 'overdue_return',
                'notification_type': 'email_and_system',
                'recipients': ['borrower', 'manager'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            },
            {
                'id': 2,
                'name': '승인 요청 알림',
                'description': '반납 승인 요청시 담당자에게 알림',
                'trigger_condition': 'approval_request',
                'notification_type': 'system',
                'recipients': ['approver'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            },
            {
                'id': 3,
                'name': '반납 예정 알림',
                'description': '반납 예정일 1일 전 사용자에게 알림',
                'trigger_condition': 'return_reminder',
                'notification_type': 'email_and_system',
                'recipients': ['borrower'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            },
            {
                'id': 4,
                'name': '정기점검 알림',
                'description': '자산 정기점검 시기에 관리자에게 알림',
                'trigger_condition': 'maintenance_required',
                'notification_type': 'system',
                'recipients': ['admin'],
                'is_active': False,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-06-15T00:00:00Z'
            },
            {
                'id': 5,
                'name': '자산 이관 알림',
                'description': '자산 이관 발생시 관련자에게 알림',
                'trigger_condition': 'asset_transfer',
                'notification_type': 'email_and_system',
                'recipients': ['transferer', 'receiver', 'manager'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            },
            {
                'id': 6,
                'name': '보증 만료 알림',
                'description': '자산 보증 기간 만료 30일 전 관리자에게 알림',
                'trigger_condition': 'warranty_expiry',
                'notification_type': 'email_and_system',
                'recipients': ['admin', 'manager'],
                'is_active': True,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-01T00:00:00Z'
            }
        ]
    
    def get_rules(self) -> List[Dict[str, Any]]:
        """
        알림 규칙 데이터 조회
        
        Returns:
            알림 규칙 데이터 리스트
        """
        return self._rules.copy()
    
    def get_rules_count(self) -> int:
        """
        알림 규칙 총 개수 조회
        
        Returns:
            알림 규칙 개수
        """
        return len(self._rules)
    
    def get_active_rules_count(self) -> int:
        """
        활성 알림 규칙 개수 조회
        
        Returns:
            활성 알림 규칙 개수
        """
        return len([rule for rule in self._rules if rule['is_active']])
    
    def get_trigger_conditions(self) -> List[str]:
        """
        트리거 조건 목록 조회
        
        Returns:
            트리거 조건 목록
        """
        return list(set(rule['trigger_condition'] for rule in self._rules))
    
    def get_notification_types(self) -> List[str]:
        """
        알림 타입 목록 조회
        
        Returns:
            알림 타입 목록
        """
        return list(set(rule['notification_type'] for rule in self._rules))
    
    def get_recipient_types(self) -> List[str]:
        """
        수신자 타입 목록 조회
        
        Returns:
            수신자 타입 목록 (중복 제거)
        """
        recipients = []
        for rule in self._rules:
            recipients.extend(rule['recipients'])
        return list(set(recipients)) 