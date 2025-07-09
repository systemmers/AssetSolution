"""
Asset CRUD Service - 자산 기본 CRUD 비즈니스 로직
자산의 생성, 조회, 수정, 삭제 등 기본적인 CRUD 작업을 담당

Classes:
    - AssetCrudService: 자산 CRUD 관련 비즈니스 로직
"""
from typing import Dict, Optional, Any, Tuple
from ...repositories.asset.asset_repository import asset_repository
from ...utils.constants import validate_asset_data


class AssetCrudService:
    """자산 CRUD 비즈니스 로직을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        self.repository = asset_repository
    
    def get_asset_detail(self, asset_id: int) -> Optional[Dict[str, Any]]:
        """
        자산 상세 정보를 조회
        
        Args:
            asset_id: 자산 ID
            
        Returns:
            자산 상세 정보 또는 None
        """
        return self.repository.get_asset_by_id(asset_id)
    
    def create_asset(self, asset_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        새 자산을 생성
        
        Args:
            asset_data: 자산 데이터
            
        Returns:
            생성된 자산 정보
        """
        # 비즈니스 로직 검증 (공통 유틸리티 사용)
        validated_data = validate_asset_data(asset_data)
        
        # Repository를 통해 생성
        return self.repository.create_asset(validated_data)
    
    def update_asset(self, asset_id: int, asset_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        자산 정보를 업데이트
        
        Args:
            asset_id: 자산 ID
            asset_data: 업데이트할 데이터
            
        Returns:
            업데이트된 자산 정보 또는 None
        """
        # 자산 존재 여부 확인
        existing_asset = self.repository.get_asset_by_id(asset_id)
        if not existing_asset:
            return None
        
        # 비즈니스 로직 검증 (공통 유틸리티 사용)
        validated_data = validate_asset_data(asset_data, is_update=True)
        
        # Repository를 통해 업데이트
        return self.repository.update_asset(asset_id, validated_data)
    
    def delete_asset(self, asset_id: int) -> bool:
        """
        자산을 삭제
        
        Args:
            asset_id: 자산 ID
            
        Returns:
            삭제 성공 여부
        """
        # 자산 존재 여부 확인
        existing_asset = self.repository.get_asset_by_id(asset_id)
        if not existing_asset:
            return False
        
        # 삭제 가능 여부 비즈니스 로직 검증
        if not self._can_delete_asset(existing_asset):
            return False
        
        # Repository를 통해 삭제
        return self.repository.delete_asset(asset_id)
    
    def get_form_data(self) -> Dict[str, Any]:
        """
        자산 등록/수정 폼에 필요한 데이터 조회
        """
        return {
            'asset_types': self.repository.get_asset_types(),
            'asset_statuses': self.repository.get_asset_statuses(),
            'locations': self.repository.get_locations(),
            'departments': self.repository.get_departments(),
            'users': self.repository.get_users()
        }
    
    def validate_asset_data(self, asset_data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        자산 데이터 유효성 검사
        """
        # 필수 필드 검사
        required_fields = ['name', 'type_id', 'status_id', 'department_id']
        for field in required_fields:
            if not asset_data.get(field):
                return False, f"{field}는 필수 입력 항목입니다."
        
        # 자산 번호 중복 검사 (신규 생성 시)
        if 'asset_number' in asset_data and asset_data['asset_number']:
            existing_assets = self.repository.get_all_assets()
            for asset in existing_assets:
                if (asset['asset_number'] == asset_data['asset_number'] and 
                    asset.get('id') != asset_data.get('id')):
                    return False, "이미 사용중인 자산 번호입니다."
        
        return True, "유효한 데이터입니다."
    
    def _validate_asset_data(self, asset_data: Dict[str, Any], is_update: bool = False) -> Dict[str, Any]:
        """
        자산 데이터 검증 및 변환
        (DEPRECATED: 공통 유틸리티 함수 validate_asset_data 사용 권장)
        """
        # 공통 유틸리티 함수로 위임
        return validate_asset_data(asset_data, is_update)
    
    def _can_delete_asset(self, asset: Dict[str, Any]) -> bool:
        """
        자산 삭제 가능 여부 확인
        
        Args:
            asset: 자산 정보
            
        Returns:
            삭제 가능 여부
        """
        # 사용 중인 자산은 삭제 불가
        if asset.get('status') == 'in_use':
            return False
        
        # 추가 비즈니스 룰 검증 가능
        return True 