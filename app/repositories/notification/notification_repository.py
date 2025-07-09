"""
NotificationRepository - 알림 데이터 접근 계층
알림, 알림 규칙, 알림 템플릿 관련 Mock 데이터를 관리하며, 향후 데이터베이스 연동 시 이 클래스만 수정하면 됨

Classes:
    - NotificationRepository: 알림 데이터 관리를 위한 Repository 클래스
"""
from datetime import datetime
from typing import List, Dict, Optional, Any
from ..base_repository import BaseRepository
from .data.notification_data import NotificationData
from .data.notification_rules_data import NotificationRulesData
from .data.notification_templates_data import NotificationTemplatesData


class NotificationRepository(BaseRepository):
    """알림 데이터 접근을 담당하는 Repository 클래스"""
    
    def __init__(self):
        """Repository 초기화 및 Mock 데이터 로드"""
        super().__init__()
        self._notification_data = NotificationData()
        self._rules_data = NotificationRulesData()
        self._templates_data = NotificationTemplatesData()
        self._load_data()
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 알림 데이터 로드
        
        Returns:
            샘플 알림 데이터 리스트
        """
        return self._notification_data.get_notifications()
    
    def _validate_data(self, data: Dict[str, Any], is_update: bool = False) -> None:
        """
        알림 데이터 유효성 검증
        
        Args:
            data: 검증할 데이터
            is_update: 업데이트 작업 여부
            
        Raises:
            ValueError: 유효하지 않은 데이터인 경우
        """
        # 필수 필드 검증 (생성 시만)
        if not is_update:
            required_fields = ['type', 'title', 'message', 'recipient_id', 'recipient_name']
            for field in required_fields:
                if field not in data or not data[field]:
                    raise ValueError(f"필수 필드 '{field}'가 누락되었습니다.")
        
        # 유효한 알림 타입 검증
        valid_types = [
            'return_overdue', 'approval_pending', 'return_reminder', 
            'maintenance_required', 'asset_transfer', 'warranty_expiry'
        ]
        if 'type' in data and data['type'] not in valid_types:
            raise ValueError(f"유효하지 않은 알림 타입입니다: {data['type']}")
        
        # 우선순위 검증
        valid_priorities = ['low', 'medium', 'high']
        if 'priority' in data and data['priority'] not in valid_priorities:
            raise ValueError(f"유효하지 않은 우선순위입니다: {data['priority']}")
        
        # recipient_id 검증
        if 'recipient_id' in data:
            if not isinstance(data['recipient_id'], int) or data['recipient_id'] <= 0:
                raise ValueError("recipient_id는 양의 정수여야 합니다.")
    
    def _load_data(self) -> None:
        """데이터 로드 및 초기화"""
        # 알림 데이터 로드
        self._notifications = self._load_sample_data()
        # 알림 규칙 데이터 로드
        self._notification_rules = self._rules_data.get_rules()
        # 알림 템플릿 데이터 로드
        self._notification_templates = self._templates_data.get_templates()
        
        # 기본 데이터 설정
        self._data = self._notifications
        self._next_id = max(item['id'] for item in self._notifications) + 1 if self._notifications else 1
    
    # ==================== 알림 관리 메서드 ====================
    
    def get_return_notifications(self, include_read=True, include_pending=True, limit=100):
        """
        반납 알림 목록 조회
        
        Args:
            include_read: 읽은 알림 포함 여부
            include_pending: 승인 대기 알림 포함 여부
            limit: 조회 제한 수
            
        Returns:
            필터링된 알림 목록
        """
        try:
            # Mock 알림 데이터 복사
            filtered_notifications = self._notifications.copy()
            
            # 읽음 상태 필터 적용
            if not include_read:
                filtered_notifications = [n for n in filtered_notifications if not n['is_read']]
            
            # 승인 대기 필터 적용
            if not include_pending:
                filtered_notifications = [n for n in filtered_notifications if n['type'] != 'approval_pending']
            
            # 제한 적용
            filtered_notifications = filtered_notifications[:limit]
            
            return filtered_notifications
            
        except Exception as e:
            print(f"반납 알림 목록 조회 오류: {e}")
            raise
    
    def get_all_notifications(self):
        """
        모든 알림 목록 조회
        
        Returns:
            전체 알림 목록
        """
        return self._notifications.copy()
    
    def get_notification_by_id(self, notification_id):
        """
        ID로 특정 알림 조회
        
        Args:
            notification_id: 알림 ID
            
        Returns:
            알림 정보 또는 None
        """
        return next((n for n in self._notifications if n['id'] == notification_id), None)
    
    def mark_notification_read(self, notification_id):
        """
        알림 읽음 처리
        
        Args:
            notification_id: 알림 ID
            
        Returns:
            처리 결과
        """
        try:
            for notification in self._notifications:
                if notification['id'] == notification_id:
                    notification['is_read'] = True
                    notification['read_at'] = datetime.now().isoformat()
                    return {
                        'success': True,
                        'message': '알림을 읽음으로 처리했습니다.'
                    }
            
            return {
                'success': False,
                'message': '해당 알림을 찾을 수 없습니다.'
            }
            
        except Exception as e:
            print(f"알림 읽음 처리 오류: {e}")
            return {
                'success': False,
                'message': f'읽음 처리 중 오류가 발생했습니다: {str(e)}'
            }
    
    def delete_notification(self, notification_id):
        """
        알림 삭제
        
        Args:
            notification_id: 알림 ID
            
        Returns:
            삭제 결과
        """
        try:
            for i, notification in enumerate(self._notifications):
                if notification['id'] == notification_id:
                    del self._notifications[i]
                    return {
                        'success': True,
                        'message': '알림을 삭제했습니다.'
                    }
            
            return {
                'success': False,
                'message': '해당 알림을 찾을 수 없습니다.'
            }
            
        except Exception as e:
            print(f"알림 삭제 오류: {e}")
            return {
                'success': False,
                'message': f'알림 삭제 중 오류가 발생했습니다: {str(e)}'
            }
    
    # ==================== 알림 규칙 관리 메서드 ====================
    
    def get_notification_rules(self):
        """
        알림 규칙 목록 조회
        
        Returns:
            알림 규칙 목록
        """
        try:
            return self._notification_rules.copy()
        except Exception as e:
            print(f"알림 규칙 조회 오류: {e}")
            raise
    
    def get_notification_rule_by_id(self, rule_id):
        """
        ID로 특정 알림 규칙 조회
        
        Args:
            rule_id: 규칙 ID
            
        Returns:
            알림 규칙 정보 또는 None
        """
        return next((r for r in self._notification_rules if r['id'] == rule_id), None)
    
    def create_notification_rule(self, rule_data):
        """
        알림 규칙 생성
        
        Args:
            rule_data: 규칙 데이터
            
        Returns:
            생성 결과
        """
        try:
            # 새 규칙 ID 생성
            rule_id = max([rule['id'] for rule in self._notification_rules], default=0) + 1
            
            new_rule = {
                'id': rule_id,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
                **rule_data
            }
            
            self._notification_rules.append(new_rule)
            
            return {
                'success': True,
                'rule_id': rule_id,
                'message': '알림 규칙이 생성되었습니다.'
            }
            
        except Exception as e:
            print(f"알림 규칙 생성 오류: {e}")
            return {
                'success': False,
                'message': f'알림 규칙 생성 중 오류가 발생했습니다: {str(e)}'
            }
    
    def update_notification_rule(self, rule_id, rule_data):
        """
        알림 규칙 수정
        
        Args:
            rule_id: 규칙 ID
            rule_data: 수정할 데이터
            
        Returns:
            수정 결과
        """
        try:
            for i, rule in enumerate(self._notification_rules):
                if rule['id'] == rule_id:
                    updated_rule = {
                        **rule,
                        **rule_data,
                        'updated_at': datetime.now().isoformat()
                    }
                    self._notification_rules[i] = updated_rule
                    
                    return {
                        'success': True,
                        'message': '알림 규칙이 수정되었습니다.'
                    }
            
            return {
                'success': False,
                'message': '해당 알림 규칙을 찾을 수 없습니다.'
            }
            
        except Exception as e:
            print(f"알림 규칙 수정 오류: {e}")
            return {
                'success': False,
                'message': f'알림 규칙 수정 중 오류가 발생했습니다: {str(e)}'
            }
    
    # ==================== 알림 템플릿 관리 메서드 ====================
    
    def get_notification_templates(self):
        """
        알림 템플릿 목록 조회
        
        Returns:
            알림 템플릿 목록
        """
        try:
            return self._notification_templates.copy()
        except Exception as e:
            print(f"알림 템플릿 조회 오류: {e}")
            raise
    
    def get_notification_template_by_id(self, template_id):
        """
        ID로 특정 알림 템플릿 조회
        
        Args:
            template_id: 템플릿 ID
            
        Returns:
            알림 템플릿 정보 또는 None
        """
        return next((t for t in self._notification_templates if t['id'] == template_id), None)
    
    def create_notification_template(self, template_data):
        """
        알림 템플릿 생성
        
        Args:
            template_data: 템플릿 데이터
            
        Returns:
            생성 결과
        """
        try:
            # 새 템플릿 ID 생성
            template_id = max([template['id'] for template in self._notification_templates], default=0) + 1
            
            new_template = {
                'id': template_id,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
                **template_data
            }
            
            self._notification_templates.append(new_template)
            
            return {
                'success': True,
                'template_id': template_id,
                'message': '알림 템플릿이 생성되었습니다.'
            }
            
        except Exception as e:
            print(f"알림 템플릿 생성 오류: {e}")
            return {
                'success': False,
                'message': f'알림 템플릿 생성 중 오류가 발생했습니다: {str(e)}'
            }
    
    def update_notification_template(self, template_id, template_data):
        """
        알림 템플릿 수정
        
        Args:
            template_id: 템플릿 ID
            template_data: 수정할 데이터
            
        Returns:
            수정 결과
        """
        try:
            for i, template in enumerate(self._notification_templates):
                if template['id'] == template_id:
                    updated_template = {
                        **template,
                        **template_data,
                        'updated_at': datetime.now().isoformat()
                    }
                    self._notification_templates[i] = updated_template
                    
                    return {
                        'success': True,
                        'message': '알림 템플릿이 수정되었습니다.'
                    }
            
            return {
                'success': False,
                'message': '해당 알림 템플릿을 찾을 수 없습니다.'
            }
            
        except Exception as e:
            print(f"알림 템플릿 수정 오류: {e}")
            return {
                'success': False,
                'message': f'알림 템플릿 수정 중 오류가 발생했습니다: {str(e)}'
            } 


# 싱글톤 인스턴스 생성
notification_repository = NotificationRepository() 