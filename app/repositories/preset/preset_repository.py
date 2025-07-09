"""
프리셋 Repository 클래스
카테고리 프리셋 데이터의 CRUD 작업과 프리셋 관리를 담당합니다.

Classes:
    - PresetRepository: 프리셋 데이터 관리를 위한 Repository 클래스
"""
from typing import List, Dict, Optional, Any
from datetime import datetime
import json
from ..base_repository import BaseRepository
from .preset_data import PresetData


class PresetRepository(BaseRepository):
    """
    프리셋 데이터 관리를 위한 Repository 클래스
    
    카테고리 구조의 프리셋 생성, 조회, 수정, 삭제와
    프리셋 적용 및 공유 기능을 처리합니다.
    """
    
    def __init__(self):
        """PresetRepository 초기화"""
        super().__init__()
        self._preset_data = PresetData()
        self._load_data()
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 프리셋 데이터 로드
        
        Returns:
            샘플 프리셋 데이터 리스트
        """
        return self._preset_data.get_presets()
    
    def _validate_data(self, data: Dict[str, Any], is_update: bool = False) -> None:
        """
        프리셋 데이터 유효성 검증
        
        Args:
            data: 검증할 프리셋 데이터
            is_update: 업데이트 작업 여부
            
        Raises:
            ValueError: 유효하지 않은 데이터인 경우
        """
        # 필수 필드 검증
        required_fields = ['name', 'preset_type']
        if not is_update:
            required_fields.extend(['category_structure'])
        
        for field in required_fields:
            if field not in data or not data[field]:
                raise ValueError(f"필수 필드 '{field}'가 누락되었습니다.")
        
        # 이름 길이 검증
        if len(data['name']) > 100:
            raise ValueError("프리셋 이름은 100자를 초과할 수 없습니다.")
        
        # 설명 길이 검증
        if 'description' in data and data['description'] and len(data['description']) > 500:
            raise ValueError("프리셋 설명은 500자를 초과할 수 없습니다.")
        
        # 프리셋 타입 검증
        valid_types = ['category', 'field', 'workflow']
        if data['preset_type'] not in valid_types:
            raise ValueError(f"프리셋 타입은 {valid_types} 중 하나여야 합니다.")
        
        # 카테고리 구조 검증
        if 'category_structure' in data and data['category_structure']:
            self._validate_category_structure(data['category_structure'])
        
        # 이름 중복 검증 (같은 타입 내에서)
        if not is_update:
            existing = next((item for item in self._data 
                           if item['name'] == data['name'] and item['preset_type'] == data['preset_type']), None)
            if existing:
                raise ValueError(f"프리셋 이름 '{data['name']}'이 이미 존재합니다.")
    
    def _validate_category_structure(self, structure: Dict[str, Any]) -> None:
        """
        카테고리 구조 유효성 검증
        
        Args:
            structure: 검증할 카테고리 구조
            
        Raises:
            ValueError: 유효하지 않은 구조인 경우
        """
        if 'categories' not in structure or not isinstance(structure['categories'], list):
            raise ValueError("카테고리 구조에 'categories' 배열이 필요합니다.")
        
        # 재귀적으로 카테고리 검증
        def validate_category(category: Dict[str, Any], expected_level: int = 1) -> None:
            required_fields = ['id', 'name', 'code', 'level']
            for field in required_fields:
                if field not in category:
                    raise ValueError(f"카테고리에 필수 필드 '{field}'가 누락되었습니다.")
            
            if category['level'] != expected_level:
                raise ValueError(f"카테고리 레벨이 일치하지 않습니다. 예상: {expected_level}, 실제: {category['level']}")
            
            if 'children' in category and isinstance(category['children'], list):
                for child in category['children']:
                    validate_category(child, expected_level + 1)
        
        for category in structure['categories']:
            validate_category(category)
    
    def _load_data(self) -> None:
        """데이터 로드 및 초기화"""
        self._data = self._load_sample_data()
        self._next_id = max(item['id'] for item in self._data) + 1 if self._data else 1
    
    # ==================== 프리셋 관련 메서드 ====================
    
    def get_by_type(self, preset_type: str) -> List[Dict[str, Any]]:
        """
        타입별 프리셋 조회
        
        Args:
            preset_type: 프리셋 타입
            
        Returns:
            해당 타입의 프리셋 리스트
        """
        return [item for item in self._data if item['preset_type'] == preset_type]
    
    def get_default_presets(self) -> List[Dict[str, Any]]:
        """
        기본 프리셋 조회
        
        Returns:
            기본 프리셋 리스트
        """
        return [item for item in self._data if item.get('is_default', False)]
    
    def get_shared_presets(self) -> List[Dict[str, Any]]:
        """
        공유 프리셋 조회
        
        Returns:
            공유 프리셋 리스트
        """
        return [item for item in self._data if item.get('is_shared', False)]
    
    def get_user_presets(self, user_id: str) -> List[Dict[str, Any]]:
        """
        특정 사용자의 프리셋 조회
        
        Args:
            user_id: 사용자 ID
            
        Returns:
            사용자 프리셋 리스트
        """
        return [item for item in self._data if item.get('created_by') == user_id]
    
    def clone_preset(self, preset_id: int, new_name: str, user_id: str) -> Dict[str, Any]:
        """
        프리셋 복제
        
        Args:
            preset_id: 복제할 프리셋 ID
            new_name: 새 프리셋 이름
            user_id: 생성할 사용자 ID
            
        Returns:
            복제된 프리셋
            
        Raises:
            ValueError: 원본 프리셋을 찾을 수 없는 경우
        """
        original = self.get_by_id(preset_id)
        if not original:
            raise ValueError(f"프리셋 ID '{preset_id}'를 찾을 수 없습니다.")
        
        # 복제 데이터 생성
        clone_data = {
            'name': new_name,
            'description': f"'{original['name']}'에서 복제됨",
            'preset_type': original['preset_type'],
            'category_structure': json.loads(json.dumps(original['category_structure'])),  # 깊은 복사
            'is_default': False,
            'is_shared': False,
            'created_by': user_id,
            'usage_count': 0,
            'last_applied': None
        }
        
        return self.create(clone_data)
    
    def apply_preset(self, preset_id: int) -> Dict[str, Any]:
        """
        프리셋 적용 (사용 횟수 증가)
        
        Args:
            preset_id: 적용할 프리셋 ID
            
        Returns:
            업데이트된 프리셋
            
        Raises:
            ValueError: 프리셋을 찾을 수 없는 경우
        """
        preset = self.get_by_id(preset_id)
        if not preset:
            raise ValueError(f"프리셋 ID '{preset_id}'를 찾을 수 없습니다.")
        
        update_data = {
            'usage_count': preset.get('usage_count', 0) + 1,
            'last_applied': datetime.now().isoformat()
        }
        
        return self.update(preset_id, update_data)
    
    def share_preset(self, preset_id: int, is_shared: bool = True) -> Dict[str, Any]:
        """
        프리셋 공유 설정
        
        Args:
            preset_id: 프리셋 ID
            is_shared: 공유 여부
            
        Returns:
            업데이트된 프리셋
        """
        return self.update(preset_id, {'is_shared': is_shared})
    
    def get_popular_presets(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        인기 프리셋 조회 (사용 횟수 기준)
        
        Args:
            limit: 조회할 개수
            
        Returns:
            인기 프리셋 리스트
        """
        sorted_presets = sorted(
            self._data,
            key=lambda x: x.get('usage_count', 0),
            reverse=True
        )
        return sorted_presets[:limit]
    
    def get_recent_presets(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        최근 생성된 프리셋 조회
        
        Args:
            limit: 조회할 개수
            
        Returns:
            최근 프리셋 리스트
        """
        sorted_presets = sorted(
            self._data,
            key=lambda x: x.get('created_at', ''),
            reverse=True
        )
        return sorted_presets[:limit]
    
    # ==================== CRUD 오버라이드 ====================
    
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        새 프리셋 생성
        
        Args:
            data: 생성할 프리셋 데이터
            
        Returns:
            생성된 프리셋
        """
        # 기본값 설정
        data.setdefault('is_default', False)
        data.setdefault('is_shared', False)
        data.setdefault('usage_count', 0)
        data.setdefault('last_applied', None)
        data.setdefault('description', '')
        
        return super().create(data)
    
    def delete(self, item_id: int) -> bool:
        """
        프리셋 삭제 (기본 프리셋은 삭제 불가)
        
        Args:
            item_id: 삭제할 프리셋 ID
            
        Returns:
            삭제 성공 여부
        """
        preset = self.get_by_id(item_id)
        if preset and preset.get('is_default', False):
            raise ValueError("기본 프리셋은 삭제할 수 없습니다.")
        
        return super().delete(item_id)
    
    # ==================== 검색 및 필터링 ====================
    
    def search_presets(self, keyword: str, preset_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        프리셋 검색
        
        Args:
            keyword: 검색 키워드
            preset_type: 프리셋 타입 필터
            
        Returns:
            검색 결과 리스트
        """
        if not keyword:
            return self.get_by_type(preset_type) if preset_type else self._data.copy()
        
        keyword_lower = keyword.lower()
        results = []
        
        for preset in self._data:
            # 타입 필터링
            if preset_type and preset['preset_type'] != preset_type:
                continue
            
            # 키워드 검색 (이름, 설명에서)
            if (keyword_lower in preset['name'].lower() or 
                keyword_lower in preset.get('description', '').lower()):
                results.append(preset)
        
        return results
    
    def filter_presets(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        프리셋 필터링
        
        Args:
            filters: 필터 조건
                - preset_type: 프리셋 타입
                - is_default: 기본 프리셋 여부
                - is_shared: 공유 프리셋 여부
                - created_by: 생성자
                - min_usage: 최소 사용 횟수
                
        Returns:
            필터링된 프리셋 리스트
        """
        filtered_data = self._data.copy()
        
        for field, value in filters.items():
            if value is None or value == '':
                continue
            
            if field == 'min_usage':
                filtered_data = [
                    item for item in filtered_data 
                    if item.get('usage_count', 0) >= value
                ]
            else:
                filtered_data = [
                    item for item in filtered_data 
                    if field in item and item[field] == value
                ]
        
        return filtered_data
    
    # ==================== 통계 및 분석 ====================
    
    def get_preset_statistics(self) -> Dict[str, Any]:
        """
        프리셋 통계 정보 조회
        
        Returns:
            통계 정보 딕셔너리
        """
        total_presets = len(self._data)
        preset_types = {}
        total_usage = 0
        
        for preset in self._data:
            # 타입별 개수
            preset_type = preset['preset_type']
            preset_types[preset_type] = preset_types.get(preset_type, 0) + 1
            
            # 총 사용 횟수
            total_usage += preset.get('usage_count', 0)
        
        return {
            'total_presets': total_presets,
            'preset_types': preset_types,
            'total_usage': total_usage,
            'average_usage': total_usage / total_presets if total_presets > 0 else 0,
            'default_presets': len([p for p in self._data if p.get('is_default', False)]),
            'shared_presets': len([p for p in self._data if p.get('is_shared', False)])
        }


# 싱글톤 인스턴스 생성
preset_repository = PresetRepository() 