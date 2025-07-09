"""
알림 관리 서비스 모듈
운영 관련 알림 처리 및 관리 비즈니스 로직

Classes:
    - NotificationService: 반납 알림, 규칙 관리 등 알림 관련 서비스 로직
"""
from typing import List, Dict, Optional, Any
from datetime import datetime, date


class NotificationService:
    """
    알림 관리 서비스 클래스
    Repository와 Controller 사이의 알림 관련 비즈니스 로직 계층
    """
    
    def __init__(self):
        """Service 초기화 및 Repository 의존성 주입"""
        from ...repositories import notification_repository, operations_repository
        self.notification_repo = notification_repository
        self.operations_repo = operations_repository
    
    def get_return_notifications(self, include_read=True, include_pending=True, limit=100):
        """반납 알림 목록 조회"""
        try:
            notifications = self.notification_repo.get_return_notifications(
                include_read=include_read,
                include_pending=include_pending,
                limit=limit
            )
            
            # 비즈니스 로직: 알림 우선순위 및 긴급도 계산
            current_date = datetime.utcnow().date()
            for notification in notifications:
                if notification.get('due_date'):
                    days_until_due = (notification['due_date'] - current_date).days
                    if days_until_due < 0:
                        notification['urgency'] = 'overdue'
                        notification['urgency_text'] = f'{abs(days_until_due)}일 지연'
                    elif days_until_due <= 1:
                        notification['urgency'] = 'urgent'
                        notification['urgency_text'] = '긴급'
                    elif days_until_due <= 3:
                        notification['urgency'] = 'high'
                        notification['urgency_text'] = '높음'
                    else:
                        notification['urgency'] = 'normal'
                        notification['urgency_text'] = '보통'
            
            return notifications
            
        except Exception as e:
            print(f"반납 알림 조회 오류: {e}")
            return []
    
    def get_notification_rules(self):
        """알림 규칙 목록 조회"""
        try:
            return self.notification_repo.get_notification_rules()
        except Exception as e:
            print(f"알림 규칙 조회 오류: {e}")
            return []
    
    def get_notification_templates(self):
        """알림 템플릿 목록 조회"""
        try:
            return self.notification_repo.get_notification_templates()
        except Exception as e:
            print(f"알림 템플릿 조회 오류: {e}")
            return []
    
    def mark_notification_read(self, notification_id):
        """알림을 읽음으로 표시"""
        try:
            return self.notification_repo.mark_notification_read(notification_id)
        except Exception as e:
            print(f"알림 읽음 처리 오류: {e}")
            return False
    
    def delete_notification(self, notification_id):
        """알림 삭제"""
        try:
            return self.notification_repo.delete_notification(notification_id)
        except Exception as e:
            print(f"알림 삭제 오류: {e}")
            return False
    
    def create_notification_rule(self, rule_data):
        """알림 규칙 생성"""
        try:
            # 비즈니스 로직: 규칙 유효성 검증
            if not self._validate_notification_rule(rule_data):
                return {'success': False, 'message': '유효하지 않은 규칙입니다.'}
            
            return self.notification_repo.create_notification_rule(rule_data)
        except Exception as e:
            print(f"알림 규칙 생성 오류: {e}")
            return {'success': False, 'message': '규칙 생성 중 오류가 발생했습니다.'}
    
    def update_notification_rule(self, rule_id, rule_data):
        """알림 규칙 수정"""
        try:
            # 비즈니스 로직: 규칙 유효성 검증
            if not self._validate_notification_rule(rule_data):
                return {'success': False, 'message': '유효하지 않은 규칙입니다.'}
            
            return self.notification_repo.update_notification_rule(rule_id, rule_data)
        except Exception as e:
            print(f"알림 규칙 수정 오류: {e}")
            return {'success': False, 'message': '규칙 수정 중 오류가 발생했습니다.'}
    
    def create_notification_template(self, template_data):
        """알림 템플릿 생성"""
        try:
            # 비즈니스 로직: 템플릿 유효성 검증
            if not self._validate_notification_template(template_data):
                return {'success': False, 'message': '유효하지 않은 템플릿입니다.'}
            
            return self.notification_repo.create_notification_template(template_data)
        except Exception as e:
            print(f"알림 템플릿 생성 오류: {e}")
            return {'success': False, 'message': '템플릿 생성 중 오류가 발생했습니다.'}
    
    def update_notification_template(self, template_id, template_data):
        """알림 템플릿 수정"""
        try:
            # 비즈니스 로직: 템플릿 유효성 검증
            if not self._validate_notification_template(template_data):
                return {'success': False, 'message': '유효하지 않은 템플릿입니다.'}
            
            return self.notification_repo.update_notification_template(template_id, template_data)
        except Exception as e:
            print(f"알림 템플릿 수정 오류: {e}")
            return {'success': False, 'message': '템플릿 수정 중 오류가 발생했습니다.'}
    
    def _validate_notification_rule(self, rule_data):
        """알림 규칙 유효성 검증"""
        required_fields = ['name', 'condition', 'action']
        return all(field in rule_data for field in required_fields)
    
    def _validate_notification_template(self, template_data):
        """알림 템플릿 유효성 검증"""
        required_fields = ['name', 'subject', 'content']
        return all(field in template_data for field in required_fields) 