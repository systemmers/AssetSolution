"""
Notification 도메인 Mock 데이터 관리 - 알림 데이터
시스템 알림 데이터를 관리합니다.

Classes:
    - NotificationData: 알림 Mock 데이터 싱글톤 클래스
"""
from typing import List, Dict, Any
from datetime import datetime


class NotificationData:
    """
    알림 Mock 데이터 싱글톤 클래스
    시스템 알림 데이터를 관리합니다.
    """
    
    _instance = None
    _notifications = None
    
    def __new__(cls):
        """싱글톤 패턴 구현"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """NotificationData 초기화"""
        if self._notifications is None:
            self._notifications = self._load_sample_data()
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 알림 데이터 로드
        4개 유형: 반납 연체, 승인 대기, 반납 예정, 정기점검
        
        Returns:
            샘플 알림 데이터 리스트
        """
        return [
            {
                'id': 1,
                'type': 'return_overdue',
                'title': '반납 연체 알림',
                'message': '김개발님의 노트북 반납이 3일 연체되었습니다.',
                'recipient_id': 1,
                'recipient_name': '김개발',
                'asset_id': 'ASSET-001',
                'asset_name': '노트북 Dell XPS 13',
                'is_read': False,
                'priority': 'high',
                'created_at': '2024-12-21T09:00:00Z',
                'read_at': None
            },
            {
                'id': 2,
                'type': 'approval_pending',
                'title': '승인 대기 알림',
                'message': '이마케팅님의 프로젝터 반납 승인이 대기중입니다.',
                'recipient_id': 2,
                'recipient_name': '김부장',
                'asset_id': 'ASSET-002',
                'asset_name': '프로젝터 Epson EB-X41',
                'is_read': True,
                'priority': 'medium',
                'created_at': '2024-12-20T14:30:00Z',
                'read_at': '2024-12-20T15:00:00Z'
            },
            {
                'id': 3,
                'type': 'return_reminder',
                'title': '반납 예정 알림',
                'message': '박디자인님의 태블릿 반납 예정일이 내일입니다.',
                'recipient_id': 3,
                'recipient_name': '박디자인',
                'asset_id': 'ASSET-003',
                'asset_name': '태블릿 iPad Pro 12.9',
                'is_read': False,
                'priority': 'medium',
                'created_at': '2024-12-21T16:00:00Z',
                'read_at': None
            },
            {
                'id': 4,
                'type': 'maintenance_required',
                'title': '정기점검 알림',
                'message': '카메라 Canon EOS R5의 정기점검이 필요합니다.',
                'recipient_id': 4,
                'recipient_name': '관리자',
                'asset_id': 'ASSET-004',
                'asset_name': '카메라 Canon EOS R5',
                'is_read': True,
                'priority': 'low',
                'created_at': '2024-12-19T10:00:00Z',
                'read_at': '2024-12-19T14:30:00Z'
            },
            {
                'id': 5,
                'type': 'asset_transfer',
                'title': '자산 이관 알림',
                'message': '최신기님의 모니터가 개발팀으로 이관되었습니다.',
                'recipient_id': 5,
                'recipient_name': '최신기',
                'asset_id': 'ASSET-005',
                'asset_name': '모니터 Samsung Odyssey G7',
                'is_read': False,
                'priority': 'medium',
                'created_at': '2024-12-21T11:30:00Z',
                'read_at': None
            },
            {
                'id': 6,
                'type': 'warranty_expiry',
                'title': '보증 만료 알림',
                'message': '서버 HP ProLiant의 보증 기간이 30일 후 만료됩니다.',
                'recipient_id': 4,
                'recipient_name': '관리자',
                'asset_id': 'ASSET-006',
                'asset_name': '서버 HP ProLiant DL380',
                'is_read': False,
                'priority': 'high',
                'created_at': '2024-12-21T08:00:00Z',
                'read_at': None
            }
        ]
    
    def get_notifications(self) -> List[Dict[str, Any]]:
        """
        알림 데이터 조회
        
        Returns:
            알림 데이터 리스트
        """
        return self._notifications.copy()
    
    def get_notification_count(self) -> int:
        """
        알림 총 개수 조회
        
        Returns:
            알림 개수
        """
        return len(self._notifications)
    
    def get_unread_count(self) -> int:
        """
        읽지 않은 알림 개수 조회
        
        Returns:
            읽지 않은 알림 개수
        """
        return len([notif for notif in self._notifications if not notif['is_read']])
    
    def get_notification_types(self) -> List[str]:
        """
        알림 타입 목록 조회
        
        Returns:
            알림 타입 목록
        """
        return list(set(notif['type'] for notif in self._notifications))
    
    def get_priority_distribution(self) -> Dict[str, int]:
        """
        우선순위별 분포 조회
        
        Returns:
            우선순위별 개수
        """
        priorities = {}
        for notif in self._notifications:
            priority = notif['priority']
            priorities[priority] = priorities.get(priority, 0) + 1
        return priorities 