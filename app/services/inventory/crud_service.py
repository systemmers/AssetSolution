"""
InventoryCrudService - 자산실사 CRUD 서비스
자산실사의 생성, 수정, 삭제, 조회 등 기본 CRUD 작업을 담당
"""
from typing import Dict, Optional, Any
from datetime import datetime
from ...repositories.inventory.inventory_repository import inventory_repository


class InventoryCrudService:
    """자산실사 CRUD 작업을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        self.repository = inventory_repository
    
    def get_inventory_detail(self, inventory_id: int) -> Dict[str, Any]:
        """자산실사 상세 정보 조회"""
        try:
            # 기본 자산실사 정보 조회
            inventory = self.repository.get_inventory_by_id(inventory_id)
            if not inventory:
                raise Exception(f"ID {inventory_id}에 해당하는 자산실사를 찾을 수 없습니다.")
            
            # 상세 정보 조회
            details = self.repository.get_inventory_details(str(inventory_id))
            
            # 불일치 정보 조회
            discrepancies = self.repository.get_discrepancies(inventory_id)
            
            return {
                'inventory': inventory,
                'details': details,
                'discrepancies': discrepancies
            }
        except Exception as e:
            raise Exception(f"자산실사 상세 정보 조회 중 오류 발생: {str(e)}")
    
    def create_inventory(self, inventory_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 자산실사 생성"""
        validated_data = self._validate_inventory_data(inventory_data)
        return self.repository.create_inventory(validated_data)
    
    def update_inventory(self, inventory_id: int, inventory_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """자산실사 정보 업데이트"""
        existing_inventory = self.repository.get_inventory_by_id(inventory_id)
        if not existing_inventory:
            return None
        
        validated_data = self._validate_inventory_data(inventory_data, is_update=True)
        return self.repository.update_inventory(inventory_id, validated_data)
    
    def delete_inventory(self, inventory_id: int) -> bool:
        """자산실사 삭제"""
        existing_inventory = self.repository.get_inventory_by_id(inventory_id)
        if not existing_inventory:
            return False
        
        if not self._can_delete_inventory(existing_inventory):
            return False
        
        return self.repository.delete_inventory(inventory_id)
    
    def get_form_data(self) -> Dict[str, Any]:
        """자산실사 등록/수정 폼에 필요한 데이터 조회"""
        return {
            'inventory_types': [
                {'value': 'annual', 'name': '연차실사'},
                {'value': 'quarterly', 'name': '분기실사'},
                {'value': 'monthly', 'name': '월차실사'},
                {'value': 'spot', 'name': '특별실사'}
            ],
            'inventory_statuses': [
                {'value': 'planned', 'name': '계획됨'},
                {'value': 'in_progress', 'name': '진행중'},
                {'value': 'completed', 'name': '완료'},
                {'value': 'cancelled', 'name': '취소됨'}
            ],
            'departments': [
                {'value': 'all', 'name': '전체'},
                {'value': 'development', 'name': '개발팀'},
                {'value': 'hr', 'name': '인사팀'},
                {'value': 'marketing', 'name': '마케팅팀'},
                {'value': 'sales', 'name': '영업팀'}
            ]
        }
    
    def _validate_inventory_data(self, inventory_data: Dict[str, Any], is_update: bool = False) -> Dict[str, Any]:
        """자산실사 데이터 검증 및 변환"""
        validated_data = inventory_data.copy()
        
        if not is_update:
            required_fields = ['name', 'start_date', 'end_date']
            for field in required_fields:
                if not validated_data.get(field):
                    raise ValueError(f"{field}는 필수 입력 항목입니다.")
        
        date_fields = ['start_date', 'end_date']
        for field in date_fields:
            if validated_data.get(field):
                try:
                    datetime.strptime(validated_data[field], '%Y-%m-%d')
                except ValueError:
                    raise ValueError(f"{field}는 YYYY-MM-DD 형식이어야 합니다.")
        
        return validated_data
    
    def _can_delete_inventory(self, inventory: Dict[str, Any]) -> bool:
        """자산실사 삭제 가능 여부 확인"""
        if inventory.get('status') in ['in_progress', 'completed']:
            return False
        return True


# 싱글톤 인스턴스 생성
inventory_crud_service = InventoryCrudService() 