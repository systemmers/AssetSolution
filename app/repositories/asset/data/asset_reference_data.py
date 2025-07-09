"""
Asset 도메인 Mock 데이터 관리 - 참조 데이터
위치, 부서, 사용자 등 참조 데이터를 관리합니다.

Classes:
    - AssetReferenceData: 참조 Mock 데이터 싱글톤 클래스
"""
from typing import List, Dict, Any


class AssetReferenceData:
    """
    참조 Mock 데이터 싱글톤 클래스
    위치, 부서, 사용자 데이터를 관리합니다.
    """
    
    _instance = None
    _data = None
    
    def __new__(cls):
        """싱글톤 패턴 구현"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """AssetReferenceData 초기화"""
        if self._data is None:
            self._data = self._load_sample_data()
    
    def _load_sample_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        샘플 참조 데이터 로드
        
        Returns:
            참조 데이터 딕셔너리
        """
        # Repository import 먼저 수행
        from ...user import user_repository
        from ...settings import settings_repository
        
        # 위치 데이터 - settings_repository 사용
        locations = settings_repository.get_all_locations()
        
        # 부서 데이터 - user_repository 사용
        departments = user_repository.get_all_departments()
        
        # 사용자 데이터 - user_repository 사용
        users = user_repository.get_all_users()
        
        return {
            'locations': locations,
            'departments': departments,
            'users': users
        }
    
    def get_locations(self) -> List[Dict[str, Any]]:
        """위치 데이터 조회"""
        return self._data['locations'].copy()
    
    def get_departments(self) -> List[Dict[str, Any]]:
        """부서 데이터 조회"""
        return self._data['departments'].copy()
    
    def get_users(self) -> List[Dict[str, Any]]:
        """사용자 데이터 조회"""
        return self._data['users'].copy()
    
    def get_location_by_id(self, location_id: int) -> Dict[str, Any]:
        """ID로 위치 조회"""
        return next((loc for loc in self._data['locations'] if loc['id'] == location_id), None)
    
    def get_department_by_id(self, department_id: int) -> Dict[str, Any]:
        """ID로 부서 조회"""
        return next((dept for dept in self._data['departments'] if dept['id'] == department_id), None)
    
    def get_user_by_id(self, user_id: int) -> Dict[str, Any]:
        """ID로 사용자 조회"""
        return next((user for user in self._data['users'] if user['id'] == user_id), None)
    
    def get_users_by_department(self, department_id: int) -> List[Dict[str, Any]]:
        """부서별 사용자 조회"""
        return [user for user in self._data['users'] if user.get('department_id') == department_id]
    
    def get_active_locations(self) -> List[Dict[str, Any]]:
        """활성 위치 조회"""
        return [loc for loc in self._data['locations'] if loc['is_active']]
    
    def get_active_departments(self) -> List[Dict[str, Any]]:
        """활성 부서 조회"""
        return [dept for dept in self._data['departments'] if dept['is_active']]
    
    def get_active_users(self) -> List[Dict[str, Any]]:
        """활성 사용자 조회"""
        return [user for user in self._data['users'] if user['is_active']]
    
    def get_location_count(self) -> int:
        """총 위치 개수 조회"""
        return len(self._data['locations'])
    
    def get_department_count(self) -> int:
        """총 부서 개수 조회"""
        return len(self._data['departments'])
    
    def get_user_count(self) -> int:
        """총 사용자 개수 조회"""
        return len(self._data['users'])
    
    def get_department_distribution(self) -> Dict[str, int]:
        """부서별 사용자 분포 조회"""
        distribution = {}
        for user in self._data['users']:
            if 'department_id' in user and user['department_id']:
                dept = self.get_department_by_id(user['department_id'])
                if dept:
                    dept_name = dept['name']
                    distribution[dept_name] = distribution.get(dept_name, 0) + 1
        return distribution 