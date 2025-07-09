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
        # 위치 데이터
        locations = [
            {"id": 1, "code": "HQ3F", "name": "본사 3층", "description": "본사 건물 3층", "parent_id": None, "is_active": True},
            {"id": 2, "code": "HQ4F", "name": "본사 4층", "description": "본사 건물 4층", "parent_id": None, "is_active": True},
            {"id": 3, "code": "BR1", "name": "지사 1층", "description": "지사 건물 1층", "parent_id": None, "is_active": True},
            {"id": 4, "code": "HQ1F", "name": "본사 1층", "description": "본사 건물 1층 - 로비 및 회의실", "parent_id": None, "is_active": True},
            {"id": 5, "code": "HQ2F", "name": "본사 2층", "description": "본사 건물 2층 - 업무공간", "parent_id": None, "is_active": True},
            {"id": 6, "code": "HQB1F", "name": "본사 지하1층", "description": "본사 건물 지하1층 - 창고", "parent_id": None, "is_active": True},
        ]
        
        # 부서 데이터
        departments = [
            {"id": 1, "code": "DEV", "name": "개발팀", "description": "소프트웨어 개발", "parent_id": None, "is_active": True},
            {"id": 2, "code": "HR", "name": "인사팀", "description": "인사 관리", "parent_id": None, "is_active": True},
            {"id": 3, "code": "MKT", "name": "마케팅팀", "description": "제품 마케팅", "parent_id": None, "is_active": True},
            {"id": 4, "code": "FIN", "name": "재무팀", "description": "재무 관리 및 회계", "parent_id": None, "is_active": True},
            {"id": 5, "code": "SALES", "name": "영업팀", "description": "제품 영업 및 고객 관리", "parent_id": None, "is_active": True},
            {"id": 6, "code": "IT", "name": "IT팀", "description": "IT 인프라 관리", "parent_id": None, "is_active": True},
            {"id": 7, "code": "ADMIN", "name": "총무팀", "description": "일반 총무 업무", "parent_id": None, "is_active": True},
        ]
        
        # 사용자 데이터
        users = [
            {"id": 1, "username": "admin", "name": "관리자", "email": "admin@example.com", "department_id": 6, "is_active": True},
            {"id": 2, "username": "user1", "name": "홍길동", "email": "user1@example.com", "department_id": 1, "is_active": True},
            {"id": 3, "username": "user2", "name": "김철수", "email": "user2@example.com", "department_id": 5, "is_active": True},
            {"id": 4, "username": "dev_kim", "name": "김개발", "email": "kim.dev@example.com", "department_id": 1, "is_active": True},
            {"id": 5, "username": "hr_park", "name": "박인사", "email": "park.hr@example.com", "department_id": 2, "is_active": True},
            {"id": 6, "username": "mkt_lee", "name": "이마케팅", "email": "lee.mkt@example.com", "department_id": 3, "is_active": True},
            {"id": 7, "username": "fin_choi", "name": "최재무", "email": "choi.fin@example.com", "department_id": 4, "is_active": True},
            {"id": 8, "username": "sales_jung", "name": "정영업", "email": "jung.sales@example.com", "department_id": 5, "is_active": True},
            {"id": 9, "username": "it_kang", "name": "강IT", "email": "kang.it@example.com", "department_id": 6, "is_active": True},
            {"id": 10, "username": "admin_yoon", "name": "윤총무", "email": "yoon.admin@example.com", "department_id": 7, "is_active": True},
        ]
        
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