"""
카테고리 Repository 클래스
카테고리 데이터의 CRUD 작업과 계층 구조 관리를 담당합니다.

Classes:
    - CategoryRepository: 카테고리 데이터 관리를 위한 Repository 클래스
"""
from typing import List, Dict, Optional, Any
from datetime import datetime
from ..base_repository import BaseRepository
from .category_data import CategoryData


class CategoryRepository(BaseRepository):
    """
    카테고리 데이터 관리를 위한 Repository 클래스
    
    계층 구조를 가진 카테고리의 생성, 조회, 수정, 삭제와
    트리 구조 관련 작업을 처리합니다.
    """
    
    def __init__(self):
        """CategoryRepository 초기화"""
        super().__init__()
        self._category_data = CategoryData()
        self._load_data()
    
    def _validate_data(self, data: Dict[str, Any], is_update: bool = False) -> None:
        """
        카테고리 데이터 유효성 검증
        
        Args:
            data: 검증할 카테고리 데이터
            is_update: 업데이트 작업 여부
            
        Raises:
            ValueError: 유효하지 않은 데이터인 경우
        """
        # 필수 필드 검증
        required_fields = ['name']
        if not is_update:
            required_fields.extend(['code'])
        
        for field in required_fields:
            if field not in data or not data[field]:
                raise ValueError(f"필수 필드 '{field}'가 누락되었습니다.")
        
        # 이름 길이 검증
        if len(data['name']) > 50:
            raise ValueError("카테고리 이름은 50자를 초과할 수 없습니다.")
        
        # 코드 유효성 검증 (업데이트가 아닌 경우)
        if not is_update and 'code' in data:
            if len(data['code']) > 20:
                raise ValueError("카테고리 코드는 20자를 초과할 수 없습니다.")
            
            # 코드 중복 검증
            existing = next((item for item in self._data if item['code'] == data['code']), None)
            if existing:
                raise ValueError(f"카테고리 코드 '{data['code']}'가 이미 존재합니다.")
        
        # 부모 카테고리 검증
        if 'parent_id' in data and data['parent_id'] is not None:
            parent = self.get_by_id(data['parent_id'])
            if not parent:
                raise ValueError(f"부모 카테고리 ID '{data['parent_id']}'를 찾을 수 없습니다.")
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 카테고리 데이터 로드
        
        Returns:
            샘플 카테고리 데이터 리스트
        """
        return self._category_data.get_categories()
    
    def _load_data(self) -> None:
        """데이터 로드 및 초기화"""
        self._data = self._load_sample_data()
        self._next_id = max(item['id'] for item in self._data) + 1 if self._data else 1
    
    # ==================== 계층 구조 관련 메서드 ====================
    
    def get_root_categories(self) -> List[Dict[str, Any]]:
        """
        최상위 카테고리(부모가 없는) 목록 조회
        
        Returns:
            최상위 카테고리 리스트
        """
        return [item for item in self._data if item['parent_id'] is None]
    
    def get_children(self, parent_id: int) -> List[Dict[str, Any]]:
        """
        특정 카테고리의 직계 하위 카테고리 조회
        
        Args:
            parent_id: 부모 카테고리 ID
            
        Returns:
            하위 카테고리 리스트
        """
        children = [item for item in self._data if item['parent_id'] == parent_id]
        return sorted(children, key=lambda x: x.get('sort_order', 0))
    
    def get_descendants(self, parent_id: int) -> List[Dict[str, Any]]:
        """
        특정 카테고리의 모든 하위 카테고리 조회 (재귀적)
        
        Args:
            parent_id: 부모 카테고리 ID
            
        Returns:
            모든 하위 카테고리 리스트
        """
        descendants = []
        direct_children = self.get_children(parent_id)
        
        for child in direct_children:
            descendants.append(child)
            descendants.extend(self.get_descendants(child['id']))
        
        return descendants
    
    def get_ancestors(self, category_id: int) -> List[Dict[str, Any]]:
        """
        특정 카테고리의 모든 상위 카테고리 조회
        
        Args:
            category_id: 카테고리 ID
            
        Returns:
            상위 카테고리 리스트 (루트부터 순서대로)
        """
        ancestors = []
        current = self.get_by_id(category_id)
        
        while current and current['parent_id'] is not None:
            parent = self.get_by_id(current['parent_id'])
            if parent:
                ancestors.insert(0, parent)
                current = parent
            else:
                break
        
        return ancestors
    
    def get_tree_structure(self) -> List[Dict[str, Any]]:
        """
        전체 카테고리를 트리 구조로 조회
        
        Returns:
            트리 구조의 카테고리 데이터
        """
        def build_tree(parent_id: Optional[int] = None) -> List[Dict[str, Any]]:
            children = self.get_children(parent_id) if parent_id else self.get_root_categories()
            tree = []
            
            for child in children:
                child_copy = child.copy()
                child_copy['children'] = build_tree(child['id'])
                tree.append(child_copy)
            
            return tree
        
        return build_tree()
    
    def get_by_level(self, level: int) -> List[Dict[str, Any]]:
        """
        특정 레벨의 카테고리 조회
        
        Args:
            level: 조회할 레벨 (1부터 시작)
            
        Returns:
            해당 레벨의 카테고리 리스트
        """
        return [item for item in self._data if item['level'] == level]
    
    def get_max_level(self) -> int:
        """
        카테고리 트리의 최대 레벨 조회
        
        Returns:
            최대 레벨
        """
        return max(item['level'] for item in self._data) if self._data else 0
    
    # ==================== CRUD 오버라이드 ====================
    
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        새 카테고리 생성
        
        Args:
            data: 생성할 카테고리 데이터
            
        Returns:
            생성된 카테고리
        """
        # 부모 카테고리 정보 기반으로 level과 path 자동 설정
        if 'parent_id' in data and data['parent_id'] is not None:
            parent = self.get_by_id(data['parent_id'])
            if parent:
                data['level'] = parent['level'] + 1
                data['path'] = f"{parent['path']}/{data['name']}"
            else:
                data['level'] = 1
                data['path'] = data['name']
        else:
            data['level'] = 1
            data['path'] = data['name']
        
        # sort_order 자동 설정
        if 'sort_order' not in data:
            siblings = self.get_children(data.get('parent_id'))
            data['sort_order'] = len(siblings) + 1
        
        # 기본값 설정
        data.setdefault('is_active', True)
        data.setdefault('description', '')
        
        return super().create(data)
    
    def update(self, item_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        카테고리 수정
        
        Args:
            item_id: 수정할 카테고리 ID
            data: 수정할 데이터
            
        Returns:
            수정된 카테고리 또는 None
        """
        # 이름이 변경되면 path도 업데이트
        if 'name' in data:
            category = self.get_by_id(item_id)
            if category:
                self._update_paths_recursive(item_id, data['name'])
        
        return super().update(item_id, data)
    
    def delete(self, item_id: int) -> bool:
        """
        카테고리 삭제 (하위 카테고리가 있으면 삭제 불가)
        
        Args:
            item_id: 삭제할 카테고리 ID
            
        Returns:
            삭제 성공 여부
        """
        # 하위 카테고리 존재 확인
        children = self.get_children(item_id)
        if children:
            raise ValueError("하위 카테고리가 있는 카테고리는 삭제할 수 없습니다.")
        
        return super().delete(item_id)
    
    # ==================== 유틸리티 메서드 ====================
    
    def _update_paths_recursive(self, category_id: int, new_name: str) -> None:
        """
        카테고리와 모든 하위 카테고리의 path 업데이트
        
        Args:
            category_id: 업데이트할 카테고리 ID
            new_name: 새로운 이름
        """
        category = self.get_by_id(category_id)
        if not category:
            return
        
        # 새로운 path 계산
        if category['parent_id'] is not None:
            parent = self.get_by_id(category['parent_id'])
            new_path = f"{parent['path']}/{new_name}" if parent else new_name
        else:
            new_path = new_name
        
        # 현재 카테고리 path 업데이트
        old_path = category['path']
        category['path'] = new_path
        
        # 모든 하위 카테고리의 path 업데이트
        for item in self._data:
            if item['path'].startswith(f"{old_path}/"):
                item['path'] = item['path'].replace(old_path, new_path, 1)
    
    def move_category(self, category_id: int, new_parent_id: Optional[int]) -> bool:
        """
        카테고리를 다른 부모로 이동
        
        Args:
            category_id: 이동할 카테고리 ID
            new_parent_id: 새로운 부모 카테고리 ID (None이면 최상위로)
            
        Returns:
            이동 성공 여부
        """
        category = self.get_by_id(category_id)
        if not category:
            return False
        
        # 순환 참조 검사
        if new_parent_id is not None:
            ancestors = [ancestor['id'] for ancestor in self.get_ancestors(new_parent_id)]
            if category_id in ancestors:
                raise ValueError("순환 참조가 발생합니다.")
        
        # 이동 실행
        update_data = {'parent_id': new_parent_id}
        
        # 새로운 level과 path 계산
        if new_parent_id is not None:
            parent = self.get_by_id(new_parent_id)
            if parent:
                update_data['level'] = parent['level'] + 1
                update_data['path'] = f"{parent['path']}/{category['name']}"
        else:
            update_data['level'] = 1
            update_data['path'] = category['name']
        
        # 업데이트 실행
        result = self.update(category_id, update_data)
        
        # 모든 하위 카테고리의 level과 path 재계산
        self._recalculate_descendants(category_id)
        
        return result is not None
    
    def _recalculate_descendants(self, parent_id: int) -> None:
        """
        하위 카테고리들의 level과 path 재계산
        
        Args:
            parent_id: 부모 카테고리 ID
        """
        parent = self.get_by_id(parent_id)
        if not parent:
            return
        
        children = self.get_children(parent_id)
        for child in children:
            new_level = parent['level'] + 1
            new_path = f"{parent['path']}/{child['name']}"
            
            child['level'] = new_level
            child['path'] = new_path
            child['updated_at'] = datetime.now().isoformat()
            
            # 재귀적으로 하위 카테고리들도 업데이트
            self._recalculate_descendants(child['id'])
    
    def get_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        """
        코드로 카테고리 조회
        
        Args:
            code: 카테고리 코드
            
        Returns:
            해당 카테고리 또는 None
        """
        return next((item for item in self._data if item['code'] == code), None)
    
    def search_by_path(self, path_keyword: str) -> List[Dict[str, Any]]:
        """
        경로 키워드로 카테고리 검색
        
        Args:
            path_keyword: 경로에서 검색할 키워드
            
        Returns:
            검색 결과 리스트
        """
        keyword_lower = path_keyword.lower()
        return [item for item in self._data if keyword_lower in item['path'].lower()]


# 싱글톤 인스턴스 생성
category_repository = CategoryRepository() 