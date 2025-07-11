"""
소프트웨어 모델
Software model for asset management system

# 소프트웨어 모델
# 소프트웨어 라이선스
# 소프트웨어 버전
# 소프트웨어 카테고리
# 소프트웨어 개발사
# 소프트웨어 설명
# 소프트웨어 인기도

"""

# software_repository를 통한 소프트웨어 데이터 관리
from ..repositories.software import software_repository

class SoftwareService:
    """소프트웨어 서비스 클래스"""
    
    @staticmethod
    def search_software(query, category=None, limit=10):
        """
        소프트웨어 검색
        
        Args:
            query (str): 검색어
            category (str): 카테고리 필터
            limit (int): 결과 제한 수
            
        Returns:
            list: 검색 결과 소프트웨어 목록
        """
        return software_repository.search_software(query, category, limit)
    
    @staticmethod
    def get_popular_software(category=None, limit=5):
        """
        인기 소프트웨어 목록 반환
        
        Args:
            category (str): 카테고리 필터
            limit (int): 결과 제한 수
            
        Returns:
            list: 인기 소프트웨어 목록
        """
        return software_repository.get_popular_software(category, limit)
    
    @staticmethod
    def get_software_categories():
        """
        소프트웨어 카테고리 목록 반환
        
        Returns:
            list: 카테고리 목록
        """
        return software_repository.get_software_categories() 