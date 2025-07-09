"""
# 코드 인덱스:
# 1. SoftwareRepository 클래스 정의
# 2. 소프트웨어 조회 메서드들
# 3. 소프트웨어 검색 메서드들
# 4. 카테고리 및 라이선스 관련 메서드들
# 5. 소프트웨어 생성/수정/삭제 메서드들

Software Repository
소프트웨어 관련 비즈니스 로직을 관리합니다.
"""

from ..base_repository import BaseRepository
from .data.software_data import software_data

class SoftwareRepository(BaseRepository):
    """
    소프트웨어 관련 데이터와 비즈니스 로직을 관리하는 Repository
    """
    
    def __init__(self):
        super().__init__()
        self.data = software_data
    
    def _load_sample_data(self):
        """BaseRepository 추상 메서드 구현"""
        return self.data.get_all_software()
    
    def _validate_data(self, data, is_update=False):
        """BaseRepository 추상 메서드 구현"""
        if not is_update:
            if not data.get('name'):
                raise ValueError('소프트웨어 이름은 필수입니다.')
            if not data.get('category_id'):
                raise ValueError('카테고리는 필수입니다.')
            if not data.get('license_type'):
                raise ValueError('라이선스 타입은 필수입니다.')
    
    def get_all_software(self):
        """모든 소프트웨어 목록 조회"""
        return self.data.get_all_software()
    
    def get_software_by_id(self, software_id):
        """ID로 소프트웨어 조회"""
        return self.data.get_software_by_id(software_id)
    
    def get_software_by_name(self, name):
        """이름으로 소프트웨어 조회"""
        return self.data.get_software_by_name(name)
    
    def get_software_by_category(self, category):
        """카테고리별 소프트웨어 목록 조회"""
        return self.data.get_software_by_category(category)
    
    def get_popular_software(self, category=None, limit=5):
        """인기 소프트웨어 목록 조회"""
        popular_list = self.data.get_popular_software(category)
        # 이름순 정렬 후 제한
        popular_list.sort(key=lambda x: x['name'])
        return popular_list[:limit] if limit else popular_list
    
    def search_software(self, query, category=None, limit=10):
        """소프트웨어 검색"""
        results = self.data.search_software(query, category)
        return results[:limit] if limit else results
    
    def get_software_categories(self):
        """소프트웨어 카테고리 목록 조회"""
        return self.data.get_software_categories()
    
    def get_license_types(self):
        """라이선스 타입 목록 조회"""
        return self.data.get_license_types()
    
    def create_software(self, software_data_dict):
        """새 소프트웨어 생성"""
        # 이름 중복 확인
        if self.data.get_software_by_name(software_data_dict.get('name')):
            raise ValueError('이미 존재하는 소프트웨어 이름입니다.')
        
        return self.data.add_software(software_data_dict)
    
    def update_software(self, software_id, update_data_dict):
        """소프트웨어 정보 수정"""
        # 소프트웨어 존재 확인
        existing_software = self.data.get_software_by_id(software_id)
        if not existing_software:
            raise ValueError('해당 소프트웨어를 찾을 수 없습니다.')
        
        # 이름 중복 확인 (본인 제외)
        if 'name' in update_data_dict:
            name_software = self.data.get_software_by_name(update_data_dict['name'])
            if name_software and name_software['id'] != software_id:
                raise ValueError('이미 존재하는 소프트웨어 이름입니다.')
        
        return self.data.update_software(software_id, update_data_dict)
    
    def delete_software(self, software_id):
        """소프트웨어 삭제"""
        return self.data.delete_software(software_id)
    
    def get_software_by_license_type(self, license_type):
        """라이선스 타입별 소프트웨어 목록 조회"""
        all_software = self.data.get_all_software()
        return [s for s in all_software if s['license_type'] == license_type]
    
    def get_free_software(self):
        """무료 소프트웨어 목록 조회"""
        return self.get_software_by_license_type('free')
    
    def get_commercial_software(self):
        """상용 소프트웨어 목록 조회"""
        return self.get_software_by_license_type('commercial')
    
    def get_subscription_software(self):
        """구독형 소프트웨어 목록 조회"""
        return self.get_software_by_license_type('subscription')
    
    def get_software_statistics(self):
        """소프트웨어 통계 정보 조회"""
        all_software = self.data.get_all_software()
        categories = self.data.get_software_categories()
        license_types = self.data.get_license_types()
        
        stats = {
            'total_count': len(all_software),
            'popular_count': len([s for s in all_software if s['is_popular']]),
            'category_stats': {},
            'license_stats': {}
        }
        
        # 카테고리별 통계
        for category in categories:
            category_software = self.get_software_by_category(category['id'])
            stats['category_stats'][category['id']] = {
                'name': category['name'],
                'count': len(category_software)
            }
        
        # 라이선스별 통계
        for license_type in license_types:
            license_software = self.get_software_by_license_type(license_type['id'])
            stats['license_stats'][license_type['id']] = {
                'name': license_type['name'],
                'count': len(license_software)
            }
        
        return stats
    
    def get_software_suggestions(self, category=None, limit=3):
        """소프트웨어 추천 목록 (인기 소프트웨어 기반)"""
        return self.get_popular_software(category, limit)
    
    def is_software_name_available(self, name):
        """소프트웨어 이름 사용 가능 여부 확인"""
        return self.data.get_software_by_name(name) is None
    
    def get_software_form_options(self):
        """폼에서 사용할 옵션 데이터 조회"""
        return {
            'categories': self.get_software_categories(),
            'license_types': self.get_license_types()
        }

# 싱글톤 인스턴스 생성
software_repository = SoftwareRepository() 