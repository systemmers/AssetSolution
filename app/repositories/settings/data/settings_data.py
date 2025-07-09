"""
# 코드 인덱스:
# 1. 설정 데이터 클래스 (SettingsData)
# 2. 자산 유형 데이터 (SAMPLE_ASSET_TYPES)
# 3. 자산 상태 데이터 (SAMPLE_ASSET_STATUSES) 
# 4. 위치 데이터 (SAMPLE_LOCATIONS)
# 5. 부서 데이터 (SAMPLE_DEPARTMENTS)
# 6. 감가상각 방법 데이터 (SAMPLE_DEPRECIATION_METHODS)
# 7. 데이터 접근 메서드들

Settings Data 클래스
시스템 설정 관련 데이터를 관리합니다.
"""

class SettingsData:
    """
    시스템 설정 관련 데이터를 관리하는 싱글톤 클래스
    """
    
    def __init__(self):
        """설정 데이터 초기화"""
        self._sample_asset_types = [
            {"id": 1, "code": "HW", "name": "하드웨어", "description": "컴퓨터, 모니터 등의 물리적 장비", "is_active": True},
            {"id": 2, "code": "SW", "name": "소프트웨어", "description": "설치된 프로그램 및 라이센스", "is_active": True},
            {"id": 3, "code": "NW", "name": "네트워크 장비", "description": "라우터, 스위치 등 네트워크 관련 장비", "is_active": True},
        ]
        
        self._sample_asset_statuses = [
            {"id": 1, "code": "USE", "name": "사용중", "description": "현재 사용중인 자산", "is_active": True},
            {"id": 2, "code": "RPR", "name": "수리중", "description": "고장으로 수리중인 자산", "is_active": True},
            {"id": 3, "code": "DSP", "name": "폐기예정", "description": "곧 폐기될 예정인 자산", "is_active": True},
        ]
        
        self._sample_locations = [
            {"id": 1, "code": "HQ3F", "name": "본사 3층", "description": "본사 건물 3층", "parent_id": None, "is_active": True},
            {"id": 2, "code": "HQ4F", "name": "본사 4층", "description": "본사 건물 4층", "parent_id": None, "is_active": True},
            {"id": 3, "code": "BR1", "name": "지사 1층", "description": "지사 건물 1층", "parent_id": None, "is_active": True},
        ]
        
        self._sample_departments = [
            {"id": 1, "code": "DEV", "name": "개발팀", "description": "소프트웨어 개발", "parent_id": None, "is_active": True},
            {"id": 2, "code": "HR", "name": "인사팀", "description": "인사 관리", "parent_id": None, "is_active": True},
            {"id": 3, "code": "MKT", "name": "마케팅팀", "description": "제품 마케팅", "parent_id": None, "is_active": True},
        ]
        
        self._sample_depreciation_methods = [
            {"id": 1, "name": "정액법", "description": "매년 동일한 금액을 감가상각하는 방법"},
            {"id": 2, "name": "정률법", "description": "매년 일정한 비율로 감가상각하는 방법"},
        ]
    
    def get_all_asset_types(self):
        """모든 자산 유형 데이터 반환"""
        return self._sample_asset_types.copy()
    
    def get_asset_type_by_id(self, type_id):
        """ID로 자산 유형 검색"""
        return next((asset_type for asset_type in self._sample_asset_types if asset_type['id'] == type_id), None)
    
    def get_asset_type_by_code(self, code):
        """코드로 자산 유형 검색"""
        return next((asset_type for asset_type in self._sample_asset_types if asset_type['code'] == code), None)
    
    def get_all_asset_statuses(self):
        """모든 자산 상태 데이터 반환"""
        return self._sample_asset_statuses.copy()
    
    def get_asset_status_by_id(self, status_id):
        """ID로 자산 상태 검색"""
        return next((status for status in self._sample_asset_statuses if status['id'] == status_id), None)
    
    def get_asset_status_by_code(self, code):
        """코드로 자산 상태 검색"""
        return next((status for status in self._sample_asset_statuses if status['code'] == code), None)
    
    def get_all_locations(self):
        """모든 위치 데이터 반환"""
        return self._sample_locations.copy()
    
    def get_location_by_id(self, location_id):
        """ID로 위치 검색"""
        return next((location for location in self._sample_locations if location['id'] == location_id), None)
    
    def get_location_by_code(self, code):
        """코드로 위치 검색"""
        return next((location for location in self._sample_locations if location['code'] == code), None)
    
    def get_all_departments(self):
        """모든 부서 데이터 반환"""
        return self._sample_departments.copy()
    
    def get_department_by_id(self, dept_id):
        """ID로 부서 검색"""
        return next((dept for dept in self._sample_departments if dept['id'] == dept_id), None)
    
    def get_department_by_code(self, code):
        """코드로 부서 검색"""
        return next((dept for dept in self._sample_departments if dept['code'] == code), None)
    
    def get_all_depreciation_methods(self):
        """모든 감가상각 방법 데이터 반환"""
        return self._sample_depreciation_methods.copy()
    
    def get_depreciation_method_by_id(self, method_id):
        """ID로 감가상각 방법 검색"""
        return next((method for method in self._sample_depreciation_methods if method['id'] == method_id), None)
    
    def add_asset_type(self, asset_type_data):
        """새 자산 유형 추가 (메모리 상에서만)"""
        # 새 ID 생성
        max_id = max([at['id'] for at in self._sample_asset_types]) if self._sample_asset_types else 0
        asset_type_data['id'] = max_id + 1
        
        # 기본값 설정
        asset_type_data.setdefault('is_active', True)
        
        self._sample_asset_types.append(asset_type_data)
        return asset_type_data
    
    def update_asset_type(self, type_id, update_data):
        """자산 유형 정보 수정 (메모리 상에서만)"""
        asset_type = self.get_asset_type_by_id(type_id)
        if asset_type:
            asset_type.update(update_data)
            return asset_type
        return None
    
    def delete_asset_type(self, type_id):
        """자산 유형 삭제 (메모리 상에서만)"""
        asset_type = self.get_asset_type_by_id(type_id)
        if asset_type:
            self._sample_asset_types.remove(asset_type)
            return True
        return False
    
    def add_asset_status(self, status_data):
        """새 자산 상태 추가 (메모리 상에서만)"""
        # 새 ID 생성
        max_id = max([s['id'] for s in self._sample_asset_statuses]) if self._sample_asset_statuses else 0
        status_data['id'] = max_id + 1
        
        # 기본값 설정
        status_data.setdefault('is_active', True)
        
        self._sample_asset_statuses.append(status_data)
        return status_data
    
    def add_location(self, location_data):
        """새 위치 추가 (메모리 상에서만)"""
        # 새 ID 생성
        max_id = max([l['id'] for l in self._sample_locations]) if self._sample_locations else 0
        location_data['id'] = max_id + 1
        
        # 기본값 설정
        location_data.setdefault('is_active', True)
        location_data.setdefault('parent_id', None)
        
        self._sample_locations.append(location_data)
        return location_data
    
    def add_department(self, dept_data):
        """새 부서 추가 (메모리 상에서만)"""
        # 새 ID 생성
        max_id = max([d['id'] for d in self._sample_departments]) if self._sample_departments else 0
        dept_data['id'] = max_id + 1
        
        # 기본값 설정
        dept_data.setdefault('is_active', True)
        dept_data.setdefault('parent_id', None)
        
        self._sample_departments.append(dept_data)
        return dept_data
    
    def add_depreciation_method(self, method_data):
        """새 감가상각 방법 추가 (메모리 상에서만)"""
        # 새 ID 생성
        max_id = max([m['id'] for m in self._sample_depreciation_methods]) if self._sample_depreciation_methods else 0
        method_data['id'] = max_id + 1
        
        self._sample_depreciation_methods.append(method_data)
        return method_data
    
    def get_active_asset_types(self):
        """활성 자산 유형 목록 조회"""
        return [at for at in self._sample_asset_types if at['is_active']]
    
    def get_active_asset_statuses(self):
        """활성 자산 상태 목록 조회"""
        return [s for s in self._sample_asset_statuses if s['is_active']]
    
    def get_active_locations(self):
        """활성 위치 목록 조회"""
        return [l for l in self._sample_locations if l['is_active']]
    
    def get_active_departments(self):
        """활성 부서 목록 조회"""
        return [d for d in self._sample_departments if d['is_active']]

# 싱글톤 인스턴스 생성
settings_data = SettingsData() 