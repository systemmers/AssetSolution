"""
# 코드 인덱스:
# 1. SettingsRepository 클래스 정의
# 2. 자산 유형 관련 메서드들
# 3. 자산 상태 관련 메서드들
# 4. 위치 관련 메서드들
# 5. 부서 관련 메서드들
# 6. 감가상각 방법 관련 메서드들

Settings Repository
시스템 설정 관련 비즈니스 로직을 관리합니다.
"""

from ..base_repository import BaseRepository
from .data.settings_data import settings_data

class SettingsRepository(BaseRepository):
    """
    시스템 설정 관련 데이터와 비즈니스 로직을 관리하는 Repository
    """
    
    def __init__(self):
        super().__init__()
        self.data = settings_data
    
    def _load_sample_data(self):
        """BaseRepository 추상 메서드 구현"""
        return self.data.get_all_asset_types()
    
    def _validate_data(self, data, is_update=False):
        """BaseRepository 추상 메서드 구현"""
        if not is_update:
            if not data.get('name'):
                raise ValueError('이름은 필수입니다.')
            if not data.get('code'):
                raise ValueError('코드는 필수입니다.')
    
    # 자산 유형 관련 메서드들
    def get_all_asset_types(self):
        """모든 자산 유형 목록 조회"""
        return self.data.get_all_asset_types()
    
    def get_active_asset_types(self):
        """활성 자산 유형 목록 조회"""
        return self.data.get_active_asset_types()
    
    def get_asset_type_by_id(self, type_id):
        """ID로 자산 유형 조회"""
        return self.data.get_asset_type_by_id(type_id)
    
    def get_asset_type_by_code(self, code):
        """코드로 자산 유형 조회"""
        return self.data.get_asset_type_by_code(code)
    
    def create_asset_type(self, asset_type_data):
        """새 자산 유형 생성"""
        # 코드 중복 확인
        if self.data.get_asset_type_by_code(asset_type_data.get('code')):
            raise ValueError('이미 존재하는 자산 유형 코드입니다.')
        
        return self.data.add_asset_type(asset_type_data)
    
    def update_asset_type(self, type_id, update_data):
        """자산 유형 정보 수정"""
        # 자산 유형 존재 확인
        existing_type = self.data.get_asset_type_by_id(type_id)
        if not existing_type:
            raise ValueError('해당 자산 유형을 찾을 수 없습니다.')
        
        # 코드 중복 확인 (본인 제외)
        if 'code' in update_data:
            code_type = self.data.get_asset_type_by_code(update_data['code'])
            if code_type and code_type['id'] != type_id:
                raise ValueError('이미 존재하는 자산 유형 코드입니다.')
        
        return self.data.update_asset_type(type_id, update_data)
    
    def delete_asset_type(self, type_id):
        """자산 유형 삭제"""
        return self.data.delete_asset_type(type_id)
    
    # 자산 상태 관련 메서드들
    def get_all_asset_statuses(self):
        """모든 자산 상태 목록 조회"""
        return self.data.get_all_asset_statuses()
    
    def get_active_asset_statuses(self):
        """활성 자산 상태 목록 조회"""
        return self.data.get_active_asset_statuses()
    
    def get_asset_status_by_id(self, status_id):
        """ID로 자산 상태 조회"""
        return self.data.get_asset_status_by_id(status_id)
    
    def get_asset_status_by_code(self, code):
        """코드로 자산 상태 조회"""
        return self.data.get_asset_status_by_code(code)
    
    def create_asset_status(self, status_data):
        """새 자산 상태 생성"""
        # 코드 중복 확인
        if self.data.get_asset_status_by_code(status_data.get('code')):
            raise ValueError('이미 존재하는 자산 상태 코드입니다.')
        
        return self.data.add_asset_status(status_data)
    
    # 위치 관련 메서드들
    def get_all_locations(self):
        """모든 위치 목록 조회"""
        return self.data.get_all_locations()
    
    def get_active_locations(self):
        """활성 위치 목록 조회"""
        return self.data.get_active_locations()
    
    def get_location_by_id(self, location_id):
        """ID로 위치 조회"""
        return self.data.get_location_by_id(location_id)
    
    def get_location_by_code(self, code):
        """코드로 위치 조회"""
        return self.data.get_location_by_code(code)
    
    def create_location(self, location_data):
        """새 위치 생성"""
        # 코드 중복 확인
        if self.data.get_location_by_code(location_data.get('code')):
            raise ValueError('이미 존재하는 위치 코드입니다.')
        
        return self.data.add_location(location_data)
    
    # 부서 관련 메서드들
    def get_all_departments(self):
        """모든 부서 목록 조회"""
        return self.data.get_all_departments()
    
    def get_active_departments(self):
        """활성 부서 목록 조회"""
        return self.data.get_active_departments()
    
    def get_department_by_id(self, dept_id):
        """ID로 부서 조회"""
        return self.data.get_department_by_id(dept_id)
    
    def get_department_by_code(self, code):
        """코드로 부서 조회"""
        return self.data.get_department_by_code(code)
    
    def create_department(self, dept_data):
        """새 부서 생성"""
        # 코드 중복 확인
        if self.data.get_department_by_code(dept_data.get('code')):
            raise ValueError('이미 존재하는 부서 코드입니다.')
        
        return self.data.add_department(dept_data)
    
    # 감가상각 방법 관련 메서드들
    def get_all_depreciation_methods(self):
        """모든 감가상각 방법 목록 조회"""
        return self.data.get_all_depreciation_methods()
    
    def get_depreciation_method_by_id(self, method_id):
        """ID로 감가상각 방법 조회"""
        return self.data.get_depreciation_method_by_id(method_id)
    
    def create_depreciation_method(self, method_data):
        """새 감가상각 방법 생성"""
        return self.data.add_depreciation_method(method_data)
    
    # 통합 조회 메서드들
    def get_master_data(self):
        """모든 마스터 데이터를 한번에 조회"""
        return {
            'asset_types': self.get_active_asset_types(),
            'asset_statuses': self.get_active_asset_statuses(),
            'locations': self.get_active_locations(),
            'departments': self.get_active_departments(),
            'depreciation_methods': self.get_all_depreciation_methods()
        }
    
    def get_form_options(self):
        """폼에서 사용할 옵션 데이터 조회"""
        return {
            'asset_types': [{'value': at['id'], 'text': at['name']} for at in self.get_active_asset_types()],
            'asset_statuses': [{'value': s['id'], 'text': s['name']} for s in self.get_active_asset_statuses()],
            'locations': [{'value': l['id'], 'text': l['name']} for l in self.get_active_locations()],
            'departments': [{'value': d['id'], 'text': d['name']} for d in self.get_active_departments()],
            'depreciation_methods': [{'value': m['id'], 'text': m['name']} for m in self.get_all_depreciation_methods()]
        }
    
    def is_asset_type_code_available(self, code):
        """자산 유형 코드 사용 가능 여부 확인"""
        return self.data.get_asset_type_by_code(code) is None
    
    def is_asset_status_code_available(self, code):
        """자산 상태 코드 사용 가능 여부 확인"""
        return self.data.get_asset_status_by_code(code) is None
    
    def is_location_code_available(self, code):
        """위치 코드 사용 가능 여부 확인"""
        return self.data.get_location_by_code(code) is None
    
    def is_department_code_available(self, code):
        """부서 코드 사용 가능 여부 확인"""
        return self.data.get_department_by_code(code) is None

# 싱글톤 인스턴스 생성
settings_repository = SettingsRepository() 